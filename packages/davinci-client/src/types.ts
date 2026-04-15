/* Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import 'immer'; // Side-effect needed only for getting types in workspace

export type { CustomLogger, LogLevel } from '@forgerock/sdk-logger';
export type { RequestMiddleware, ActionTypes } from '@forgerock/sdk-request-middleware';

// Config types
export type { DaVinciConfig } from './lib/config.types.js';

// DaVinci API types (request/response shapes, query params, links, etc.)
export * from './lib/davinci.types.js';

// Client types (InitFlow, Updater, Validator, NodeStates, InternalErrorResponse, etc.)
export * from './lib/client.types.js';

// Node types (ContinueNode, ErrorNode, StartNode, SuccessNode, FailureNode, Collectors, etc.)
export * from './lib/node.types.js';

// All collector types (single-value, multi-value, object-value, auto-collectors, etc.)
export * from './lib/collector.types.js';

// Fido types
export type { FidoClient } from './lib/fido/fido.js';

// Node slice and reducer exports needed to resolve DavinciClient
export {
  updateCollectorValues,
  nextCollectorValues,
  nodeCollectorReducer,
} from './lib/node.reducer.js';

// Re-export the davinci function so DavinciClient type alias can be resolved
export { davinci } from './lib/client.store.js';

import { davinci } from './lib/client.store.js';

export type DavinciClient = Awaited<ReturnType<typeof davinci>>;

/**
 * The client property of any node state.
 * Represents the parsed client-facing state from a DaVinci flow node.
 */
export type GetClient =
  | import('./lib/node.types.js').StartNode['client']
  | import('./lib/node.types.js').ContinueNode['client']
  | import('./lib/node.types.js').ErrorNode['client']
  | import('./lib/node.types.js').SuccessNode['client']
  | import('./lib/node.types.js').FailureNode['client'];
