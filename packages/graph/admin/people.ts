import { _GraphQueryable, graphInvokableFactory, _GraphInstance, graphGet, _GraphCollection } from "../graphqueryable.js";
import { defaultPath, updateable, IUpdateable, addable, getById, IAddable, deleteable, IDeleteable } from "../decorators.js";

//need grpah types for people, pronouns

@defaultPath("people")
export class _PeopleAdmin extends _GraphInstance<any> {
    public get pronounSettings(): Promise<IPronounSettings> {
        return graphGet(PronounSettings(this));
    }
}

export interface IPeopleAdmin extends _PeopleAdmin {}
export const PeopleAdmin = graphInvokableFactory<IPeopleAdmin>(_PeopleAdmin);

/**
 * People Pronoun Settings
 */
@defaultPath("pronouns")
@updateable()
export class _PronounSettings extends _GraphInstance<any> { }
export interface IPronounSettings extends _PronounSettings, IUpdateable<boolean> { }
export const PronounSettings = graphInvokableFactory<IPronounSettings>(_PronounSettings);


/**
 * Profilecard Property
 */
@defaultPath("profileCardProperty")
@deleteable()
@updateable()
export class _ProfileCardProperty extends _GraphInstance<any> { }
export interface IProfileCardProperty extends _ProfileCardProperty, IDeleteable, IUpdateable<IProfileCardProperty> { }
export const ProfileCardProperty = graphInvokableFactory<IProfileCardProperty>(_ProfileCardProperty);


/**
 * Profilecard properties
 */
@defaultPath("profileCardProperties")
@getById(ProfileCardProperty)
@addable()
export class _ProfileCardProperties extends _GraphCollection<any> { }
export interface IProfileCardProperties extends _ProfileCardProperties, IAddable<IProfileCardProperty> { }
export const ProfileCardProperties = graphInvokableFactory<IProfileCardProperties>(_ProfileCardProperties);

