/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { PhoneNumberInputValue } from './collector.types.js';
import { GenericError } from './error.types.js';
import { ErrorNode, FailureNode, ContinueNode, StartNode, SuccessNode } from './node.types.js';

export type FlowNode = ContinueNode | ErrorNode | StartNode | SuccessNode | FailureNode;

export interface InternalErrorResponse {
  error: GenericError;
  type: 'internal_error';
}

export type InitFlow = () => Promise<FlowNode | InternalErrorResponse>;

export type Updater = (
  value: string | string[] | PhoneNumberInputValue,
  index?: number,
) => InternalErrorResponse | null;
export type Validator = (value: string) =>
  | string[]
  | {
      error: {
        message: string;
        type: string;
      };
      type: string;
    };
