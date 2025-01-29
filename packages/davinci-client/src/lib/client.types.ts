import { GenericError } from './error.types.js';
import { ErrorNode, FailureNode, ContinueNode, StartNode, SuccessNode } from './node.types.js';

export type FlowNode = ContinueNode | ErrorNode | StartNode | SuccessNode | FailureNode;

export interface InternalErrorResponse {
  error: GenericError;
  type: 'internal_error';
}

export type InitFlow = () => Promise<FlowNode | InternalErrorResponse>;

export type Updater = (value: string, index?: number) => InternalErrorResponse | null;
