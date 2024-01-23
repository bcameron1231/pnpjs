import { _GraphCollection, _GraphInstance, graphGet, graphInvokableFactory } from "../graphqueryable.js";
import { defaultPath, getById, addable, IGetById, IAddable, updateable, IUpdateable, IDeleteable, deleteable, hasDelta, IHasDelta, IDeltaProps } from "../decorators.js";
import { ServicePrincipal as IServicePrincipalType } from "@microsoft/microsoft-graph-types";
import { _DirectoryObjects } from "../directory-objects/types.js";

/**
 * ServicePrincipal
 */
@updateable()
@deleteable()
export class _ServicePrincipal extends _GraphInstance<IServicePrincipalType> {

    //TODO is this even right?
    public async createdObjects(): Promise<_DirectoryObjects> {
        return graphGet(ServicePrincipal(this, "createdObjects"));
    }

    public async ownedObjects(): Promise<_DirectoryObjects> {
        return graphGet(ServicePrincipal(this, "ownedObjects"));
    }
 }
export interface IServicePrincipal extends _ServicePrincipal, IUpdateable<IServicePrincipalType>, IDeleteable { }
export const ServicePrincipal = graphInvokableFactory<IServicePrincipal>(_ServicePrincipal);

/**
 * ServicePrincipals
 */
@defaultPath("servicePrincipals")
@getById(ServicePrincipal)
@addable()
@hasDelta()
export class _ServicePrincipals extends _GraphCollection<IServicePrincipalType[]> {
    //TODO complete Count
    //https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list?view=graph-rest-1.0&tabs=http
    public async count(): Promise<number> {
        return graphGet(ServicePrincipals(this, "$count"));
    }
 }
export interface IServicePrincipals extends _ServicePrincipals, IGetById<IServicePrincipal>, IAddable<IServicePrincipalType, IServicePrincipalType>, IHasDelta<Omit<IDeltaProps, "token">, IServicePrincipalType> { }
export const ServicePrincipals = graphInvokableFactory<IServicePrincipals>(_ServicePrincipals);    
