import { addable, defaultPath, deleteable, getById, IAddable, IDeleteable, IGetById, IUpdateable, updateable } from "../decorators.js";
import { IMessages, IMessageType, Messages } from "../messages/types.js";
import { _AzureAICollection, _AzureAIInstance, AzureAIInvokableFactory } from "../azureaiqueryable.js";
import { IRuns, Runs } from "../runs/types.js";
/**
 * Thread
 */
@deleteable()
@updateable()
export class _Thread extends _AzureAIInstance<IThreadType> {

  public get messages() : IMessages{
    return Messages(this);
  }

  public get runs(): IRuns{
    return Runs(this);
  }
}
export interface IThread extends _Thread, IUpdateable<ICreateThreadType>, IDeleteable { }
export const Thread = AzureAIInvokableFactory<IThread>(_Thread);

/**
 * Threads
 */
@defaultPath("Threads")
@getById(Thread)
@addable()
export class _Threads extends _AzureAICollection<IThreadType[]> {}
export interface IThreads extends _Threads, IGetById<IThread>, IAddable<ICreateThreadType | void> { }
export const Threads = AzureAIInvokableFactory<IThreads>(_Threads);

export interface IThreadType {
    id: string;
    object?: string;
    created_at?: number;
    metadata?: Record<string, string>;
  }
  
export interface ICreateThreadType extends Pick<IThreadType, "metadata"> {
  messages?: IMessageType[];
  tool_resources?: Record<string, any>;
}

export interface IUpdateThreadType extends Pick<ICreateThreadType, "metadata"|"tool_resources"> {}
  