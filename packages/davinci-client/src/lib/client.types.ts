/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { GenericError } from '@forgerock/sdk-types';

import type { PhoneNumberInputValue } from './collector.types.js';
import type { ErrorNode, FailureNode, ContinueNode, StartNode, SuccessNode } from './node.types.js';

export type FlowNode = ContinueNode | ErrorNode | StartNode | SuccessNode | FailureNode;

export interface InternalErrorResponse {
  error: Omit<GenericError, 'error'> & { message: string };
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

export type NodeStates = StartNode | ContinueNode | ErrorNode | SuccessNode | FailureNode;
