/* Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import 'immer'; // Side-effect needed only for getting types in workspace

import type { RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type * as collectors from './lib/collector.types.js';
import type * as config from './lib/config.types.js';
import type * as nodes from './lib/node.types.js';
import type * as client from './lib/client.types.js';
import { davinci } from './lib/client.store.js';
import { nodeSlice } from './lib/node.slice.js';

export type { CustomLogger } from '@forgerock/sdk-logger/types';

export type DaVinciConfig = config.DaVinciConfig;

export type DavinciClient = Awaited<ReturnType<typeof davinci>>;
export type Updater = client.Updater;
export type InitFlow = client.InitFlow;
export type Validator = client.Validator;
export type GetClient = ReturnType<typeof nodeSlice.selectors.selectClient>;
export type StartNode = nodes.StartNode;
export type ContinueNode = nodes.ContinueNode;
export type ErrorNode = nodes.ErrorNode;
export type SuccessNode = nodes.SuccessNode;
export type FailureNode = nodes.FailureNode;
export type NodeStates = ContinueNode | ErrorNode | StartNode | SuccessNode | FailureNode;
export type Collectors = nodes.Collectors;
export type DaVinciValidationError = nodes.DaVinciError;

export type ActionCollector<T extends collectors.ActionCollectorTypes> =
  collectors.ActionCollector<T>;
export type SingleValueCollector<T extends collectors.SingleValueCollectorTypes> =
  collectors.SingleValueCollector<T>;

export type FlowCollector = collectors.FlowCollector;
export type PasswordCollector = collectors.PasswordCollector;
export type TextCollector = collectors.TextCollector;
export type IdpCollector = collectors.IdpCollector;
export type SubmitCollector = collectors.SubmitCollector;
export type ValidatedTextCollector = collectors.ValidatedTextCollector;
export type ReadOnlyCollector = collectors.ReadOnlyCollector;
export type MultiSelectCollector = collectors.MultiSelectCollector;
export type SingleSelectCollector = collectors.SingleSelectCollector;
export type DeviceRegistrationCollector = collectors.DeviceRegistrationCollector;
export type DeviceAuthenticationCollector = collectors.DeviceAuthenticationCollector;
export type PhoneNumberCollector = collectors.PhoneNumberCollector;
export type ProtectCollector = collectors.ProtectCollector;
export type FidoRegistrationCollector = collectors.FidoRegistrationCollector;
export type FidoAuthenticationCollector = collectors.FidoAuthenticationCollector;

export type InternalErrorResponse = client.InternalErrorResponse;
export type { RequestMiddleware };
