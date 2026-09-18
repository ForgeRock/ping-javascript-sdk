/**
 * Verifies consumer-facing types are re-exported from @forgerock/oidc-client/types.
 * Checked by tsc --noEmit, not executed at runtime.
 */
import type {
  ActionTypes,
  BrowserStorageConfig,
  CustomLogger,
  CustomStorageConfig,
  CustomStorageObject,
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
  BrowserStorageConfig,
  CustomStorageConfig,
  CustomStorageObject,
  ActionTypes,
  RequestMiddleware,
  CustomLogger,
  LogLevel,
  ResponseType,
];
