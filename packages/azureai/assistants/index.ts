import { AzureAIFI } from "../fi.js";
import  { Assistants, IAssistants } from "./types.js";

export {
    IAssistant,
    IAssistants,
    IAssistantType,
    ITool,
    Assistant,
    Assistants
} from "./types.js";

declare module "../fi" {
    interface AzureAIFI {
        readonly assistants: IAssistants;
    }
}

Reflect.defineProperty(AzureAIFI.prototype, "assistants", {
    configurable: true,
    enumerable: true,
    get: function (this: AzureAIFI) {
        return this.create(Assistants, "assistants");
    },
});
