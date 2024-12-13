import { addable, defaultPath, deleteable, getById, IAddable, IDeleteable, IGetById, IUpdateable, updateable } from "../decorators.js";
import { _AzureAICollection, _AzureAIInstance, AzureAIInvokableFactory } from "../azureaiqueryable.js";

/**
 * Message
 */
@deleteable()
@updateable()
export class _Message extends _AzureAIInstance<IMessageType> {}
export interface IMessage extends _Message, IUpdateable<IUpdateMessageType>, IDeleteable { }
export const Message = AzureAIInvokableFactory<IMessage>(_Message);

/**
 * Messages
 */
@defaultPath("messages")
@getById(Message)
@addable()
export class _Messages extends _AzureAICollection<IMessageType[]> {}
export interface IMessages extends _Messages, IGetById<IMessage>, IAddable<ICreateMessageType> { }
export const Messages = AzureAIInvokableFactory<IMessages>(_Messages);

export interface IMessageType {
    id: string;
    object?: string;
    created_at?: number;
    thread_id?: string;
    role?:string;
    content?: string | [];//TODO
    assistant_id?: string|null;
    run_id?: string|null;
    file_ids?: string[];
    metadata?: Record<string, string>;
  }
  
export interface ICreateMessageType extends Pick<IMessageType, "role"|"content"|"metadata"> {
  attachments?: string[];
}

export interface IUpdateMessageType extends Pick<IMessageType, "metadata"> {}
  