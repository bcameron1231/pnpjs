import { TimelinePipe } from "@pnp/core";
import { BrowserFetchWithRetry, DefaultParse, InjectHeaders, Queryable } from "@pnp/queryable";
import { DefaultHeaders, DefaultInit } from "./defaults.js";
import { QueryVersion } from "./queryVersion.js";

export interface IAzureAIBrowserProps {
    apiKey:string;
    apiVersion?:string;
}

export function AzureAIBrowser(props?: IAzureAIBrowserProps): TimelinePipe<Queryable> {

    const { apiKey, apiVersion } = {
        ...props,
    };

    return (instance: Queryable) => {

        instance.using(
            QueryVersion(apiVersion),
            DefaultHeaders(),
            DefaultInit(),
            BrowserFetchWithRetry(),
            DefaultParse(),
            InjectHeaders({"api-key": apiKey})
        );

        return instance;
    };
}
