/**
 * Verifies consumer-facing types are re-exported from @forgerock/oidc-client/types.
 * Checked by tsc --noEmit, not executed at runtime.
 */
import type {
  ActionTypes,
  CustomLogger,
  // Already re-exported (regression guard)
  GenericError,
  GetAuthorizationUrlOptions,
  LogLevel,
  RequestMiddleware,
  // Should be re-exported but is not yet
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
