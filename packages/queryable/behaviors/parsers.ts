import { Queryable } from "../queryable.js";
import { hOP, TimelinePipe, parseToAtob } from "@pnp/core";
import { isFunc } from "@pnp/core";

export function DefaultParse(): TimelinePipe {

    return parseBinderWithErrorCheck(async (response) => {

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if ((response.headers.has("Content-Length") && parseFloat(response.headers.get("Content-Length")!) === 0) || response.status === 204) {
            return {};
        }

        // patch to handle cases of 200 response with no or whitespace only bodies (#487 & #545)
        const txt = await response.text();
        const json = txt.replace(/\s/ig, "").length > 0 ? JSON.parse(txt) : {};
        return parseODataJSON(json);
    });
}

export function TextParse(): TimelinePipe {

    return parseBinderWithErrorCheck(r => r.text());
}

export function BlobParse(): TimelinePipe {

    return parseBinderWithErrorCheck( async (response) => {
        const content = await response.blob();

        const binaryResponseBody = parseToAtob(await content.text());
        // handle batch responses for things that are base64, like photos https://github.com/pnp/pnpjs/issues/2825
        if(binaryResponseBody){
            // Create an array buffer from the binary string
            const uint8Array = new Uint8Array(
                binaryResponseBody.split("").map(char => char.charCodeAt(0))
            );
            // Create a Blob from the array buffer
            return new Blob([uint8Array], {type:response.headers.get("Content-Type")});
        }
        return content;
    });
}

export function JSONParse(): TimelinePipe {

    return parseBinderWithErrorCheck(r => r.json());
}

export function BufferParse(): TimelinePipe {

    return parseBinderWithErrorCheck(r => isFunc(r.arrayBuffer) ? r.arrayBuffer() : (<any>r).buffer());
}

export function HeaderParse(): TimelinePipe {

    return parseBinderWithErrorCheck(async r => r.headers);
}

export function JSONHeaderParse(): TimelinePipe {

    return parseBinderWithErrorCheck(async (response) => {

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if ((response.headers.has("Content-Length") && parseFloat(response.headers.get("Content-Length")!) === 0) || response.status === 204) {
            return {};
        }

        // patch to handle cases of 200 response with no or whitespace only bodies (#487 & #545)
        const txt = await response.text();
        const json = txt.replace(/\s/ig, "").length > 0 ? JSON.parse(txt) : {};
        const all = { data: { ...parseODataJSON(json) }, headers: { ...response.headers } };
        return all;
    });
}

export async function errorCheck(url: URL, response: Response, result: any): Promise<[URL, Response, any]> {

    if (!response.ok) {
        throw await HttpRequestError.init(response);
    }

    return [url, response, result];
}

export function parseODataJSON(json: any): any {

    let result = json;

    if (hOP(json, "d")) {

        if (hOP(json.d, "results")) {

            result = json.d.results;

        } else {

            result = json.d;
        }
    } else if (hOP(json, "value")) {

        result = json.value;
    }

    return result;
}

/**
 * Provides a clean way to create new parse bindings without having to duplicate a lot of boilerplate
 * Includes errorCheck ahead of the supplied impl
 *
 * @param impl Method used to parse the response
 * @returns Queryable behavior binding function
 */
export function parseBinderWithErrorCheck(impl: (r: Response) => Promise<any>): TimelinePipe<Queryable> {

    return (instance: Queryable) => {

        // we clear anything else registered for parse
        // add error check
        // add the impl function we are supplied
        instance.on.parse.replace(errorCheck);
        instance.on.parse(async (url: URL, response: Response, result: any): Promise<[URL, Response, any]> => {

            if (response.ok && typeof result === "undefined") {
                const respClone = response.clone();

                // https://github.com/node-fetch/node-fetch?tab=readme-ov-file#custom-highwatermark
                const [implResult, raw] = await Promise.all([impl(response), respClone.text()]);
                result = implResult;
                (<any>instance).emit.rawData(raw);
            }

            return [url, response, result];
        });

        return instance;
    };
}

export class HttpRequestError extends Error {

    public isHttpRequestError = true;

    constructor(message: string, public response: Response, public status = response.status, public statusText = response.statusText) {
        super(message);
    }

    public static async init(r: Response): Promise<HttpRequestError> {
        const t = await r.clone().text();
        return new HttpRequestError(`Error making HttpClient request in queryable [${r.status}] ${r.statusText} ::> ${t}`, r);
    }
}
