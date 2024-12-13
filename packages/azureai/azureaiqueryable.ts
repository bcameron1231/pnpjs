import { isArray } from "@pnp/core";
import { IInvokable, Queryable, queryableFactory, op, get, post, patch, del, put } from "@pnp/queryable";
import { IPagedResult, Paged } from "./behaviors/paged.js";

export type AzureAIInit = string | IAzureAIQueryable | [IAzureAIQueryable, string];

export interface IAzureAIConstructor<T> {
    new(base: AzureAIInit, path?: string): T;
}

export type IAzureAIInvokableFactory<R extends IAzureAIQueryable> = (base: AzureAIInit, path?: string) => R & IInvokable;

export const AzureAIInvokableFactory = <R extends IAzureAIQueryable>(f: any): IAzureAIInvokableFactory<R> => {
    return queryableFactory<R>(f);
};

/**
 * Queryable Base Class
 *
 */
export class _AzureAIQueryable<GetType = any> extends Queryable<GetType> {

    protected parentUrl: string;

    /**
     * Creates a new instance of the Queryable class
     *
     * @constructor
     * @param base A string or Queryable that should form the base part of the url
     *
     */
    constructor(base: AzureAIInit, path?: string) {

        super(base, path);

        // we need to use the AzureAI implementation to handle our special encoding
        this._query = new AzureAIQueryParams();

        if (typeof base === "string") {

            this.parentUrl = base;

        } else if (isArray(base)) {

            this.parentUrl = base[0].toUrl();

        } else {

            this.parentUrl = base.toUrl();
        }
    }

    /**
     * Gets a parent for this instance as specified
     *
     * @param factory The contructor for the class to create
     */
    protected getParent<T extends IAzureAIQueryable>(
        factory: IAzureAIInvokableFactory<any>,
        path?: string,
        base: string = this.parentUrl): T {

        return factory([this, base], path);
    }
}

export interface IAzureAIQueryable<GetType = any> extends _AzureAIQueryable<GetType> { }
export const AzureAIQueryable = AzureAIInvokableFactory<IAzureAIQueryable>(_AzureAIQueryable);

/**
 * Represents a REST collection which can be filtered, paged, and selected
 *
 */
export class _AzureAICollection<GetType = any[]> extends _AzureAIQueryable<GetType> {

    /**
     * Sort order by the created_at timestamp of the objects.
     * @param ascending If false desc is appended, otherwise asc (default)
     */
    public order(ascending = true): this {
        const o = "order";
        const query = this.query.get(o)?.split(",") || [];
        query.push(`${ascending ? "asc" : "desc"}`);
        this.query.set(o, query.join(","));
        return this;
    }

    /**
     * Limits the query to only return the specified number of items
     *
     * @param top The query row limit (open ai uses limit param)
     */
    public top(top: number): this {
        this.query.set("limit", top.toString());
        return this;
    }

     /**
     * Sets the cursor to a specific item in the return set
     *
     * @param after String to set the cursor to
     */
    public after(after: string): this {
        this.query.set("after", after);
        return this;
    }

     /**
     * Sets the cursor to a specific item in the return set
     *
     * @param before String to set the cursor to
     */
     public before(before: string): this {
        this.query.set("before", before);
        return this;
    }

    public [Symbol.asyncIterator]() {

        const q = AzureAICollection(this).using(Paged());

        //apply any query params
        for (const [key, value] of this.query) {
            q.query.set(key, value);
        }

        return <AsyncIterator<GetType>>{

            _next: q,

            async next() {

                if (this._next === null) {
                    return { done: true, value: undefined };
                }

                const result: IPagedResult<any> = await this._next();

                if (result.has_more) {
                    this._next = q.after(result.last_id);
                    return { done: false, value: result.data };
                } else {
                    this._next = null;
                    return { done: false, value: result.data };
                }
            },
        };
    }
}
export interface IAzureAICollection<GetType = any[]> extends _AzureAICollection<GetType> { }
export const AzureAICollection = AzureAIInvokableFactory<IAzureAICollection>(_AzureAICollection);

/**
 * Represents an instance that can be selected
 *
 */
export class _AzureAIInstance<GetType = any> extends _AzureAIQueryable<GetType> { }
export interface IAzureAIInstance<GetType = any> extends IInvokable, IAzureAIQueryable<GetType> { }
export const AzureAIInstance = AzureAIInvokableFactory<IAzureAIInstance>(_AzureAIInstance);

export const AzureAIGet = <T = any>(o: IAzureAIQueryable<any>, init?: RequestInit): Promise<T> => {
    return op(o, get, init);
};

export const AzureAIPost = <T = any>(o: IAzureAIQueryable<any>, init?: RequestInit): Promise<T> => {
    return op(o, post, init);
};

export const AzureAIDelete = <T = any>(o: IAzureAIQueryable<any>, init?: RequestInit): Promise<T> => {
    return op(o, del, init);
};

export const AzureAIPatch = <T = any>(o: IAzureAIQueryable<any>, init?: RequestInit): Promise<T> => {
    return op(o, patch, init);
};

export const AzureAIPut = <T = any>(o: IAzureAIQueryable<any>, init?: RequestInit): Promise<T> => {
    return op(o, put, init);
};

class AzureAIQueryParams extends Map<string, string> {

    public toString(): string {

        const params = new URLSearchParams();
        const literals: string[] = [];

        for (const item of this) {

            // and here is where we add some "enhanced" parsing as we get issues.
            if (/\/any\(.*?\)/i.test(item[1])) {
                literals.push(`${item[0]}=${item[1]}`);
            } else {
                params.append(item[0], item[1]);
            }
        }

        literals.push(params.toString());

        return literals.join("&");
    }
}
