/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Verifies consumer-facing types are re-exported from @forgerock/oidc-client/types.
 * Checked by tsc --noEmit, not executed at runtime.
 */
import type {
  ActionTypes,
  CustomLogger,
  GenericError,
  GetAuthorizationUrlOptions,
  LogLevel,
  RequestMiddleware,
  ResponseType,
  StorageConfig,
  WellknownResponse,
} from '../types.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _Assert = [
  GenericError,
  GetAuthorizationUrlOptions,
  WellknownResponse,
  StorageConfig,
  ActionTypes,
  RequestMiddleware,
  CustomLogger,
  LogLevel,
  ResponseType,
];
