import { _GraphInstance, graphInvokableFactory } from "../graphqueryable.js";
import { SharepointSettings as ISharePointSettingsType } from "@microsoft/microsoft-graph-types";
import { defaultPath, updateable, IUpdateable} from "../decorators.js";

class _Admin extends _GraphInstance<IAdmin> {}

export interface IAdmin {
    readonly sharepoint: ISharePointAdmin;
}

export const Admin: IAdmin = <any>graphInvokableFactory(_Admin);

export class _SharePointAdmin extends _GraphInstance<ISharePointAdminType> {
    public get settings(): ISharePointSettings {
        return SharePointSettings(this);
    }
}

export interface ISharePointAdmin extends _SharePointAdmin { }
export const SharePoint = graphInvokableFactory<_SharePointAdmin>(_SharePointAdmin);

@defaultPath("admin/sharepoint/settings")
@updateable()
export class _SharePointSettings extends _GraphInstance<ISharePointSettingsType> { }
export interface ISharePointSettings extends _SharePointSettings, IUpdateable<ISharePointSettingsType> { }
export const SharePointSettings = graphInvokableFactory<ISharePointSettings>(_SharePointSettings);

export interface ISharePointAdminType {
    readonly settings: ISharePointSettings;
}
