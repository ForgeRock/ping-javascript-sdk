/**
 * Verifies consumer-facing types are re-exported from @forgerock/oidc-client/types.
 * Checked by tsc --noEmit, not executed at runtime.
 */
import type {
  // Already re-exported (regression guard)
  GenericError,
  GetAuthorizationUrlOptions,
  WellknownResponse,
  StorageConfig,
  ActionTypes,
  RequestMiddleware,
  CustomLogger,
  LogLevel,
  // Should be re-exported but is not yet
  ResponseType,
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
