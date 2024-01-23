import { GraphFI } from "../fi.js";
import { Applications, IApplications} from "./applications.js";


export {
    Applications,
    IApplications,
} from "./applications.js";

declare module "../fi" {
    interface GraphFI {
        readonly applications: IApplications;
        readonly servicePrincipals: any;
    }
}

Reflect.defineProperty(GraphFI.prototype, "applications", {
    configurable: true,
    enumerable: true,
    get: function (this: GraphFI) {
        return this.create(Applications);
    },
});
