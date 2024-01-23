import { _GraphCollection, _GraphInstance, graphInvokableFactory, graphPost } from "../graphqueryable.js";
import { defaultPath, getById, addable, IGetById, IAddable, updateable, IUpdateable, IDeleteable, deleteable, hasDelta, IHasDelta, IDeltaProps } from "../decorators.js";
import { Application as IApplicationType, PasswordCredential as IPasswordCredentialType, KeyCredential as IKeyCredentialType, ApplicationTemplate as IApplicationTemplateType, ApplicationServicePrincipal as IApplicationServicePrincipalType, FederatedIdentityCredential as IFederatedIdentityCredentialType } from "@microsoft/microsoft-graph-types";
import { body } from "@pnp/queryable/index.js";
import { IUsers, Users } from "../users/types.js";

/**
 * Application
 */
@updateable()
@deleteable()
export class _Application extends _GraphInstance<IApplicationType> {

    public get federatedIdentityCredentials(): IFederatedIdentityCredentials {
        return FederatedIdentityCredentials(this)
    }

    //TODO what's the best way to do this. needs to support list, add, delete
    public get owners() : IUsers {
        return Users(this);
    }

    public async addPassword(displayName: string): Promise<IPasswordCredentialType> {
        return graphPost(Application(this, "addPassword"), body({passwordCredential: {displayName}}));
    }

    public async removePassword(keyId: string): Promise<void> {
        return graphPost(Application(this, "removePassword"), body({keyId}));
    }
    
    public async addKey(credential: IAddKeyCredential): Promise<IKeyCredentialType> {
        return graphPost(Application(this, "addKey"), body(credential));
    }

    // TODO validate if this is how I want to do this?
    public async removeKey(keyId: string, proof: string): Promise<void> {
        return graphPost(Application(this, "removeKey"), body({keyId, proof}));
    }

    public async setVerifiedPublisher(verifiedPublisherId: string): Promise<void> {
        return graphPost(Application(this, "setVerifiedPublisher"), body({verifiedPublisherId}));
    }

    public async unsetVerifiedPublisher(): Promise<void> {
        return graphPost(Application(this, "unsetVerifiedPublisher"));
    }
}
export interface IApplication extends _Application, IUpdateable<IApplicationType>, IDeleteable { }
export const Application = graphInvokableFactory<IApplication>(_Application);

/**
 * Applications
 */
@defaultPath("applications")
@getById(Application)
@addable()
@hasDelta()
export class _Applications extends _GraphCollection<IApplicationType[]> { }
export interface IApplications extends _Applications, IGetById<IApplication>, IAddable<IApplicationType, IApplicationType>, IHasDelta<Omit<IDeltaProps, "token">, IApplicationType> { }
export const Applications = graphInvokableFactory<IApplications>(_Applications);    

export interface IAddKeyCredential{
    keyCredential:IKeyCredentialType;
    passwordCredential?: IPasswordCredentialType;
    proof: string;
}

/**
 * ApplicationTemplate
 */
export class _ApplicationTemplate extends _GraphInstance<IApplicationTemplateType> {

    public async instantiate(displayName: string): Promise<IApplicationServicePrincipalType> {
        return graphPost(ApplicationTemplate(this, "instanstiate"), body({displayName}));
    }
}
export interface IApplicationTemplate extends _ApplicationTemplate, IUpdateable<IApplicationTemplateType> { }
export const ApplicationTemplate = graphInvokableFactory<IApplicationTemplate>(_ApplicationTemplate);

/**
 * ApplicationTemplates
 */
@defaultPath("applicationTemplates")
@getById(ApplicationTemplate)
export class _ApplicationTemplates extends _GraphCollection<IApplicationTemplateType[]> { }
export interface IApplicationTemplates extends _ApplicationTemplates, IGetById<IApplicationTemplate> { }
export const ApplicationTemplates = graphInvokableFactory<IApplicationTemplates>(_ApplicationTemplates);

/**
 * FederatedIdentityCredential
 */
@updateable()
@deleteable()
export class _FederatedIdentityCredential extends _GraphInstance<IFederatedIdentityCredentialType> { }
export interface IFederatedIdentityCredential extends _FederatedIdentityCredential, IUpdateable<IFederatedIdentityCredentialType>, IDeleteable { }
export const FederatedIdentityCredential = graphInvokableFactory<IFederatedIdentityCredential>(_FederatedIdentityCredential);

/**
 * FederatedIdentityCredentials
 */
@defaultPath("federatedIdentityCredentials")
@getById(FederatedIdentityCredential)
@addable()
@hasDelta()
export class _FederatedIdentityCredentials extends _GraphCollection<IFederatedIdentityCredentialType[]> { }
export interface IFederatedIdentityCredentials extends _FederatedIdentityCredentials, IGetById<IFederatedIdentityCredential>, IAddable<IFederatedIdentityCredentialType, IFederatedIdentityCredentialType>, IHasDelta<Omit<IDeltaProps, "token">, IFederatedIdentityCredentialType> { }
export const FederatedIdentityCredentials = graphInvokableFactory<IFederatedIdentityCredentials>(_FederatedIdentityCredentials);