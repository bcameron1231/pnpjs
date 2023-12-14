import { GraphFI } from "../fi.js";
import { Admin, IAdmin } from "./types.js";

export {
    Admin,
    IAdmin,
    SharePointSettings,
    ISharePointSettings,
} from "./types.js";

declare module "../fi" {
    interface GraphFI {
        readonly admin: IAdmin;
    }
}

Reflect.defineProperty(GraphFI.prototype, "admin", {
    configurable: true,
    enumerable: true,
    get: function (this: GraphFI) {
        return this.create(<any>Admin);
    },
});
