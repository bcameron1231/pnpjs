import { Batch, HttpRequestError } from "@pnp/odata";
import { getGUID, isUrlAbsolute, combine, mergeHeaders, hOP, Runtime, DefaultRuntime } from "@pnp/common";
import { Logger, LogLevel } from "@pnp/logging";
import { SPHttpClient } from "./sphttpclient.js";
import { ISPConfigurationPart, ISPConfigurationProps } from "./splibconfig.js";
import { toAbsoluteUrl } from "./utils/toabsoluteurl.js";

/**
 * Manages a batch of OData operations
 */
export class SPBatch extends Batch {

    constructor(private url: string, private runtime: Runtime = DefaultRuntime) {
        super();
    }

    /**
     * Parses the response from a batch request into an array of Response instances
     *
     * @param body Text body of the response from the batch request
     */
    public static ParseResponse(body: string): Response[] {

        const responses: Response[] = [];
        const header = "--batchresponse_";
        // Ex. "HTTP/1.1 500 Internal Server Error"
        const statusRegExp = new RegExp("^HTTP/[0-9.]+ +([0-9]+) +(.*)", "i");
        const lines = body.split("\n");
        let state = "batch";
        let status: number;
        let statusText: string;
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];
            switch (state) {
                case "batch":
                    if (line.substr(0, header.length) === header) {
                        state = "batchHeaders";
                    } else {
                        if (line.trim() !== "") {
                            throw Error(`Invalid response, line ${i}`);
                        }
                    }
                    break;
                case "batchHeaders":
                    if (line.trim() === "") {
                        state = "status";
                    }
                    break;
                case "status": {
                    const parts = statusRegExp.exec(line);
                    if (parts.length !== 3) {
                        throw Error(`Invalid status, line ${i}`);
                    }
                    status = parseInt(parts[1], 10);
                    statusText = parts[2];
                    state = "statusHeaders";
                    break;
                }
                case "statusHeaders":
                    if (line.trim() === "") {
                        state = "body";
                    }
                    break;
                case "body":
                    responses.push((status === 204) ? new Response() : new Response(line, { status: status, statusText: statusText }));
                    state = "batch";
                    break;
            }
        }

        if (state !== "status") {
            throw Error("Unexpected end of input");
        }

        return responses;
    }

    protected async executeImpl(): Promise<void> {

        Logger.write(`[${this.batchId}] (${(new Date()).getTime()}) Executing batch with ${this.requests.length} requests.`, LogLevel.Info);

        // if we don't have any requests, don't bother sending anything
        // this could be due to caching further upstream, or just an empty batch
        if (this.requests.length < 1) {
            Logger.write("Resolving empty batch.", LogLevel.Info);
            return;
        }

        // creating the client here allows the url to be populated for nodejs client as well as potentially
        // any other hacks needed for other types of clients. Essentially allows the absoluteRequestUrl
        // below to be correct
        const client = new SPHttpClient(this.runtime);

        // due to timing we need to get the absolute url here so we can use it for all the individual requests
        // and for sending the entire batch
        const absoluteRequestUrl = await toAbsoluteUrl(this.url, this.runtime);

        // build all the requests, send them, pipe results in order to parsers
        const batchBody: string[] = [];

        let currentChangeSetId = "";

        for (let i = 0; i < this.requests.length; i++) {
            const reqInfo = this.requests[i];

            if (reqInfo.method === "GET") {

                if (currentChangeSetId.length > 0) {
                    // end an existing change set
                    batchBody.push(`--changeset_${currentChangeSetId}--\n\n`);
                    currentChangeSetId = "";
                }

                batchBody.push(`--batch_${this.batchId}\n`);

            } else {

                if (currentChangeSetId.length < 1) {
                    // start new change set
                    currentChangeSetId = getGUID();
                    batchBody.push(`--batch_${this.batchId}\n`);
                    batchBody.push(`Content-Type: multipart/mixed; boundary="changeset_${currentChangeSetId}"\n\n`);
                }

                batchBody.push(`--changeset_${currentChangeSetId}\n`);
            }

            // common batch part prefix
            batchBody.push("Content-Type: application/http\n");
            batchBody.push("Content-Transfer-Encoding: binary\n\n");

            // these are the per-request headers
            const headers = new Headers();

            // this is the url of the individual request within the batch
            const url = isUrlAbsolute(reqInfo.url) ? reqInfo.url : combine(absoluteRequestUrl, reqInfo.url);

            Logger.write(`[${this.batchId}] (${(new Date()).getTime()}) Adding request ${reqInfo.method} ${url} to batch.`, LogLevel.Verbose);

            if (reqInfo.method !== "GET") {

                let method = reqInfo.method;

                const castHeaders: any = reqInfo.options.headers;
                if (hOP(reqInfo, "options") && hOP(reqInfo.options, "headers") && castHeaders["X-HTTP-Method"] !== undefined) {

                    method = castHeaders["X-HTTP-Method"];
                    delete castHeaders["X-HTTP-Method"];
                }

                batchBody.push(`${method} ${url} HTTP/1.1\n`);

                headers.set("Content-Type", "application/json;odata=verbose;charset=utf-8");

            } else {
                batchBody.push(`${reqInfo.method} ${url} HTTP/1.1\n`);
            }

            // merge global config headers
            mergeHeaders(headers, this.runtime.get<ISPConfigurationPart, ISPConfigurationProps>("sp")?.headers);

            // merge per-request headers
            if (reqInfo.options) {
                mergeHeaders(headers, reqInfo.options.headers);
            }

            // lastly we apply any default headers we need that may not exist
            if (!headers.has("Accept")) {
                headers.append("Accept", "application/json");
            }

            if (!headers.has("Content-Type")) {
                headers.append("Content-Type", "application/json;odata=verbose;charset=utf-8");
            }

            if (!headers.has("X-ClientService-ClientTag")) {
                headers.append("X-ClientService-ClientTag", "PnPCoreJS:@pnp-$$Version$$:batch");
            }

            // write headers into batch body
            headers.forEach((value: string, name: string) => {
                batchBody.push(`${name}: ${value}\n`);
            });

            batchBody.push("\n");

            if (reqInfo.options.body) {
                batchBody.push(`${reqInfo.options.body}\n\n`);
            }
        }

        if (currentChangeSetId.length > 0) {
            // Close the changeset
            batchBody.push(`--changeset_${currentChangeSetId}--\n\n`);
            currentChangeSetId = "";
        }

        batchBody.push(`--batch_${this.batchId}--\n`);

        const batchOptions = {
            "body": batchBody.join(""),
            "headers": {
                "Content-Type": `multipart/mixed; boundary=batch_${this.batchId}`,
            },
            "method": "POST",
        };

        Logger.write(`[${this.batchId}] (${(new Date()).getTime()}) Sending batch request.`, LogLevel.Info);

        const fetchResponse = await client.fetch(combine(absoluteRequestUrl, "/_api/$batch"), batchOptions);

        if (!fetchResponse.ok) {
            // the entire batch resulted in an error and we need to handle that better #1356
            // things consistently with the rest of the http errors
            throw (await HttpRequestError.init(fetchResponse));
        }

        const text = await fetchResponse.text();
        const responses = SPBatch.ParseResponse(text);

        if (responses.length !== this.requests.length) {
            throw Error("Could not properly parse responses to match requests in batch.");
        }

        Logger.write(`[${this.batchId}] (${(new Date()).getTime()}) Resolving batched requests.`, LogLevel.Info);

        // this structure ensures that we resolve the batched requests in the order we expect
        // using async this is not guaranteed depending on the requests
        return responses.reduce((p, response, index) => p.then(async () => {

            const request = this.requests[index];

            Logger.write(`[${request.id}] (${(new Date()).getTime()}) Resolving request in batch ${this.batchId}.`, LogLevel.Info);

            try {

                request.resolve(await request.parser.parse(response));

            } catch (e) {

                request.reject(e);
            }

        }), Promise.resolve(void (0)));
    }
}
