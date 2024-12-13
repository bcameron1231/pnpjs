import { addable, defaultPath, deleteable, getById, IAddable, IDeleteable, IGetById, IUpdateable, updateable } from "../decorators.js";
import { _AzureAICollection, _AzureAIInstance, AzureAIInvokableFactory } from "../azureaiqueryable.js";

/**
 * Assistant
 */
@deleteable()
@updateable()
export class _Assistant extends _AzureAIInstance<IAssistantType> {}
export interface IAssistant extends _Assistant, IUpdateable<ICreateUpdateAssistantType>, IDeleteable { }
export const Assistant = AzureAIInvokableFactory<IAssistant>(_Assistant);

/**
 * Assistants
 */
@defaultPath("assistants")
@getById(Assistant)
@addable()
export class _Assistants extends _AzureAICollection<IAssistantType[]> {}
export interface IAssistants extends _Assistants, IGetById<IAssistant>, IAddable<ICreateUpdateAssistantType> { }
export const Assistants = AzureAIInvokableFactory<IAssistants>(_Assistants);

export interface IAssistantType {
    id: string;
    object?: string;
    created_at?: number;
    name?: string | null;
    description?: string | null;
    model?: string;
    instructions?: string | null;
    tools?: ITool[];
    metadata?: Record<string, string>;
    temperature?: number | null;
    top_p?: number | null;
    response_format?: string | IResponseFormat;
    tool_resources?: Record<string, any>;
  }
  
  export interface ITool {
    type: "code_interpreter" | "function";
    description: string;
  }
  
  export interface IResponseFormat {
    type: "json_object";
  }

  export interface ICreateUpdateAssistantType extends Pick<IAssistantType, "model"|"name"|"description"|"instructions"|"tools"|"metadata"|"temperature"|"top_p"|"response_format"|"tool_resources"> {}
  