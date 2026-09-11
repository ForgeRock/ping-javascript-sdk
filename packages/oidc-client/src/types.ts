/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
export * from './lib/client.types.js';
export * from './lib/config.types.js';
export * from './lib/authorize.request.types.js';
export * from './lib/exchange.types.js';
export * from './lib/session.types.js';
export type { PushAuthorizationResponse } from './lib/par.types.js';

export type {
  GenericError,
  GetAuthorizationUrlOptions,
  ResponseType,
  WellknownResponse,
} from '@forgerock/sdk-types';
export type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
export type { CustomLogger, LogLevel } from '@forgerock/sdk-logger';
export type { StorageConfig } from '@forgerock/storage';

// Re-export functions needed to resolve OidcClient and ClientStore type aliases
export { oidc } from './lib/client.store.js';
// RawOidcArgs is a parameter type of oidc() and must be re-exported so consumers can type call-sites
export type { RawOidcArgs } from './lib/client.store.types.js';
export { createClientStore } from './lib/client.store.utils.js';
// Referenced by createClientStore's return type, so consumers need the names.
export type { OidcRootState } from './lib/client.store.utils.js';
export { rootReducer } from './lib/client.store.utils.js';

import { oidc } from './lib/client.store.js';
export type OidcClient = Awaited<ReturnType<typeof oidc>>;
