import { AzureAIFI } from "../fi.js";
import  { Threads, IThreads } from "./types.js";

export {
    IThread,
    IThreads,
    IThreadType,
    ICreateThreadType,
    IUpdateThreadType,
    Thread,
    Threads,
} from "./types.js";

declare module "../fi" {
    interface AzureAIFI {
        readonly threads: IThreads;
    }
}

Reflect.defineProperty(AzureAIFI.prototype, "threads", {
    configurable: true,
    enumerable: true,
    get: function (this: AzureAIFI) {
        return this.create(Threads, "threads");
    },
});
