/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { ActionTypes, RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { SdkStore } from '@forgerock/sdk-store';
import type { CustomLogger, LogLevel } from '@forgerock/sdk-logger';
import type { StorageConfig } from '@forgerock/storage';

import type { OidcConfig } from './config.types.js';

/**
 * The raw, unvalidated input type — this is what public callers pass.
 * `store` is typed as `unknown` so the parser can perform a runtime
 * brand-check via `isSdkStoreHandle` before narrowing to `SdkStore`.
 */
export type RawOidcArgs<ActionType extends ActionTypes = ActionTypes> = {
  config: OidcConfig;
  requestMiddleware?: RequestMiddleware<ActionType>[];
  logger?: { level: LogLevel; custom?: CustomLogger };
  storage?: Partial<StorageConfig>;
  /**
   * An existing SDK store to attach to, so discovery caching and state are
   * shared with another client. Omit to create a store for this client alone.
   * Typed as `unknown` — the parser validates this at runtime via `isSdkStoreHandle`.
   */
  store?: unknown;
};

/**
 * The parsed, trusted type — all structural validation checks have passed.
 * The type system records the narrowed facts:
 * - `config.serverConfig.wellknown` is a non-empty string
 * - `config.clientId` is a non-empty string
 * - `store` is either a valid `SdkStore` handle or `undefined`
 */
export type ParsedOidcArgs<ActionType extends ActionTypes = ActionTypes> = {
  config: OidcConfig & {
    serverConfig: { wellknown: string };
    clientId: string;
  };
  requestMiddleware?: RequestMiddleware<ActionType>[];
  logger?: { level: LogLevel; custom?: CustomLogger };
  storage?: Partial<StorageConfig>;
  store: SdkStore | undefined;
};
