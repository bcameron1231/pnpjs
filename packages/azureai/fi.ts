import { TimelinePipe } from "@pnp/core";
import { AzureAIQueryable, IAzureAIInvokableFactory, IAzureAIQueryable, AzureAIInit } from "./azureaiqueryable.js";

export class AzureAIFI {

    protected _root: IAzureAIQueryable;

    /**
     * Creates a new instance of the AzureAI FI class
     *
     * @param root Establishes a root url/configuration
     */
    constructor(root: AzureAIInit = "") {

        this._root = AzureAIQueryable(root, "openai");
    }

    /**
     * Applies one or more behaviors which will be inherited by all instances chained from this root
     *
     */
    public using(...behaviors: TimelinePipe[]): this {

        this._root.using(...behaviors);
        return this;
    }

    /**
     * Used by extending classes to create new objects directly from the root
     *
     * @param factory The factory for the type of object to create
     * @returns A configured instance of that object
     */
    protected create<T extends IAzureAIQueryable>(factory: IAzureAIInvokableFactory<T>, path?: string): T {
        return factory(this._root, path);
    }
}

export function azureAIfi(root: AzureAIInit | AzureAIFI = ""): AzureAIFI {

    if (typeof root === "object" && !Reflect.has(root, "length")) {
        root = (<any>root)._root;
    }

    return new AzureAIFI(<any>root);
}
