import { _GraphCollection, _GraphInstance, _GraphQueryable, graphInvokableFactory } from "../graphqueryable.js";
import { SharepointSettings as ISharePointSettingsType, ServiceAnnouncementBase as IServiceAnnouncementType, ServiceHealth as IServiceHealthType } from "@microsoft/microsoft-graph-types";
import { defaultPath, updateable, IUpdateable, getById, getByName} from "../decorators.js";

class _Admin extends _GraphQueryable<IAdmin> {}

export interface IAdmin {
    readonly sharepoint: ISharePointAdmin;
    readonly serviceAnnouncements: IServiceAccouncements;
}

export const Admin: IAdmin = <any>graphInvokableFactory(_Admin);

export class _SharePointAdmin extends _GraphInstance<ISharePointAdminType> {
    public get settings(): ISharePointSettings {
        return SharePointSettings(this);
    }
}

export interface ISharePointAdmin extends _SharePointAdmin { }
export const SharePoint = graphInvokableFactory<ISharePointAdmin>(_SharePointAdmin);

/**
 * SharePoint Tenant Settings
 */
@defaultPath("admin/sharepoint/settings")
@updateable()
export class _SharePointSettings extends _GraphInstance<ISharePointSettingsType> { }
export interface ISharePointSettings extends _SharePointSettings, IUpdateable<ISharePointSettingsType> { }
export const SharePointSettings = graphInvokableFactory<ISharePointSettings>(_SharePointSettings);

export interface ISharePointAdminType {
    readonly settings: ISharePointSettings;
}

/**
 * Tenant Service Announcements
 */
export class _ServiceAnnouncements extends _GraphInstance<IServiceAnnouncementType> {
    public get healthOverviews(): IHealthOverviews {
        return HealthOverviews(this);
    }
}

export interface IServiceAccouncements extends _ServiceAnnouncements { }
export const ServiceAnnouncements = graphInvokableFactory<IServiceAccouncements>(_ServiceAnnouncements);


export class _ServiceHealth extends _GraphInstance<IServiceHealthType> {}
export interface IServiceHealth extends _ServiceHealth { }
export const ServiceHealth = graphInvokableFactory<IServiceHealth>(_ServiceHealth);

@defaultPath("admin/serviceAnnouncement/healthOverviews")
@getByName(ServiceHealth)
export class _HealthOverviews extends _GraphCollection<IServiceHealthType> {}
export interface IHealthOverviews extends _HealthOverviews { }
export const HealthOverviews = graphInvokableFactory<IHealthOverviews>(_HealthOverviews);

