
import { IDeleteable, IGetById, IUpdateable, defaultPath, deleteable, getById, updateable } from "../decorators.js";
import { graphInvokableFactory, _GraphCollection, _GraphInstance } from "../graphqueryable.js";
import { Permission as IPermissionType } from "@microsoft/microsoft-graph-types";

/**
 * Permission
 */
@deleteable()
@updateable()
export class _Permission extends _GraphInstance<IPermissionType> {}
export interface IPermission extends _Permission, IUpdateable<Partial<IPermissionType>>, IDeleteable { }
export const Permission = graphInvokableFactory<IPermission>(_Permission);

/**
 * Permissions
 */
@defaultPath("permissions")
@getById(Permission)
export class _Permissions extends _GraphCollection<IPermissionType[]> {}
export interface IPermissions extends _Permissions, IGetById<IPermission> { }
export const Permissions = graphInvokableFactory<IPermissions>(_Permissions);
