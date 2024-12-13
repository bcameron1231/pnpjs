import { TimelinePipe } from "@pnp/core";
import { DefaultParse, InjectHeaders, Queryable } from "@pnp/queryable";
import { DefaultHeaders, DefaultInit } from "@pnp/graph";
import { NodeFetchWithRetry } from "./fetch.js";

export interface IAzureAIDefaultProps {
    baseUrl?: string;
    apikey: string;
}

/**
 * Behavior for adding the default observers to the Graph queryable object
 * @param props - Specify the IAzureAIDefaultProps for configuring the object
 *  
 */
export function AzureAIDefault(props: IAzureAIDefaultProps): TimelinePipe<Queryable> {

    const { baseUrl, apikey } = {
        ...props,
    };

    return (instance: Queryable) => {

        const behaviors: TimelinePipe<any>[] = [DefaultHeaders(), DefaultInit(baseUrl), NodeFetchWithRetry(), DefaultParse(), InjectHeaders({"api-key": apikey})];

        instance.using(...behaviors);

        return instance;
    };
}
