import { TimelinePipe } from "@pnp/core";
import { errorCheck } from "@pnp/queryable";
import { IAzureAIQueryable } from "../azureaiqueryable.js";

export interface IPagedResult<T> {
    object: string;
    data: T[] | null;
    has_more: boolean;
    first_id: string;
    last_id: string;
}

/**
 * Behavior that converts results to pages when used with a collection (exposed through the paged method of AzureAICollection)
 *
 * @returns A TimelinePipe used to configure the queryable
 */
export function Paged(): TimelinePipe {

    return (instance: IAzureAIQueryable) => {

        instance.on.parse.replace(errorCheck);
        instance.on.parse(async (url: URL, response: Response, result: any): Promise<[URL, Response, any]> => {
            result = await response.json();
            return [url, response, result];
        });

        return instance;
    };
}
