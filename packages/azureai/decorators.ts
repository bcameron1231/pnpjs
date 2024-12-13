import { IAzureAIQueryable, AzureAIDelete, AzureAIPatch, AzureAIPost } from "./azureaiqueryable.js";
import { body } from "@pnp/queryable";

/**
 * Decorator used to specify the default path for Queryable objects
 *
 * @param path
 */
export function defaultPath(path: string) {

    // eslint-disable-next-line @typescript-eslint/ban-types
    return function <T extends { new(...args: any[]): {} }>(target: T) {

        return class extends target {
            constructor(...args: any[]) {
                super(args[0], args.length > 1 && args[1] !== undefined ? args[1] : path);
            }
        };
    };
}

/**
 * Adds the delete method to the tagged class
 */
export function deleteable() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function <T extends { new(...args: any[]): {} }>(target: T) {

        return class extends target {
            public delete(this: IAzureAIQueryable): Promise<void> {
                return AzureAIDelete(this);
            }
        };
    };
}

export interface IDeleteable {
    /**
     * Delete this instance
     */
    delete(): Promise<void>;
}

export interface IDeleteableWithETag {
    /**
     * Delete this instance
     */
    delete(): Promise<void>;
}

/**
 * Adds the update method to the tagged class
 */
export function updateable() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function <T extends { new(...args: any[]): {} }>(target: T) {

        return class extends target {
            public update(this: IAzureAIQueryable, props: any): Promise<T> {
                return AzureAIPatch(this, body(props));
            }
        };
    };
}

export interface IUpdateable<T = any> {
    /**
     * Update the properties of an event object
     *
     * @param props Set of properties to update
     */
    update(props: T): Promise<T>;
}

/**
 * Adds the add method to the tagged class
 */
export function addable() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function <T extends { new(...args: any[]): {} }>(target: T) {

        return class extends target {
            public add(this: IAzureAIQueryable, props: any): Promise<void> {
                return AzureAIPost(this, body(props));
            }
        };
    };
}

export interface IAddable<T = any, R = { id: string }> {
    /**
     * Adds a new item to this collection
     *
     * @param props properties used to create the new thread
     */
    add(props: T): Promise<R>;
}

/**
 * Adds the getById method to a collection
 */
export function getById<R>(factory: (...args: any[]) => R) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function <T extends { new(...args: any[]): {} }>(target: T) {

        return class extends target {
            public getById(this: IAzureAIQueryable, id: any): R {
                return factory(this, `${id}`);
            }
        };
    };
}
export interface IGetById<R = any, T = string> {
    /**
     * Adds a new item to this collection
     *
     * @param props properties used to create the new thread
     */
    getById(id: T): R;
}