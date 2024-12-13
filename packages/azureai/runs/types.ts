import { addable, defaultPath, deleteable, getById, IAddable, IDeleteable, IGetById, IUpdateable, updateable } from "../decorators.js";
import { _AzureAICollection, _AzureAIInstance, AzureAIInvokableFactory } from "../azureaiqueryable.js";

/**
 * Run
 */
@deleteable()
@updateable()
export class _Run extends _AzureAIInstance<IRunType> {}
export interface IRun extends _Run, IUpdateable<IUpdateRunType>, IDeleteable { }
export const Run = AzureAIInvokableFactory<IRun>(_Run);

/**
 * Runs
 */
@defaultPath("runs")
@getById(Run)
@addable()
export class _Runs extends _AzureAICollection<IRunType[]> {}
export interface IRuns extends _Runs, IGetById<IRun>, IAddable<ICreateRunType> { }
export const Runs = AzureAIInvokableFactory<IRuns>(_Runs);

export interface IRunType {
    id: string;
    object?: string;
    created_at?: number;
    thread_id?: string;
    assistant_id?: string;
    status?:string;
    required_action?: Record<string, any>|null;
    last_error?: Record<string, any>|null;
    expires_at?: number;
    started_at?: number|null;
    failed_at?: number|null;
    completed_at?: number|null;
    model?: string;
    instructions?:string;
    tools?: []//TODO
    file_ids?: string[];
    metadata?: Record<string, string>;
    tool_choice?: Record<string, any>|string;
    max_prompt_tokens?: number|null;
    max_completion_tokens?: number|null;
    usage?: Record<string, any>|null;
    truncation_strategy?: Record<string, any>;
    response_format?:string;
  }
  
export interface ICreateRunType extends Pick<IRunType, "model"|"instructions"|"tools"|"metadata"|"max_prompt_tokens"|"max_completion_tokens"|"tool_choice"|"response_format"> {
  assistant_id: string;
  additional_instructions?: string;
  temperature?: number;
  top_p?: number;
  stream: boolean;

}

export interface IUpdateRunType extends Pick<IRunType, "metadata"> {}
  