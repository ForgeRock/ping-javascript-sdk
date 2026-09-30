/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type {
  GenericError,
  GetAuthorizationUrlOptions,
  WellknownResponse,
} from '@forgerock/sdk-types';
import type { AuthPromptValue } from '@forgerock/sdk-utilities';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { AuthorizationError, OptionalAuthorizeOptions } from './authorize.request.types.js';
import type { OidcConfig } from './config.types.js';

export type ParUrlParams = {
  authorizationEndpoint: string;
  clientId: string;
  requestUri: string;
  prompt?: AuthPromptValue;
};

export function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function hasPushRequestUri(data: unknown): data is { request_uri: string } {
  return isStringRecord(data) && typeof data['request_uri'] === 'string';
}

/**
 * Resolve a single authorize option from its per-request override and its
 * client-config default.
 * @function resolveAuthorizeOption
 * @param {T | null | undefined} override - The per-request value. `null` means
 *   "explicitly unset — omit this option from the request"; `undefined` means
 *   "not specified — inherit from config"; any other value overrides config.
 * @param {T | undefined} defaultOption - The value from `OidcConfig`
 * @returns {T | undefined} The resolved value, or `undefined` when unset or
 *   unconfigured.
 * @example
 *   resolveAuthorizeOption('query', 'pi.flow')  // 'query'    — override wins
 *   resolveAuthorizeOption(null, 'pi.flow')     // undefined  — explicit unset
 *   resolveAuthorizeOption(undefined, 'query')  // 'query'    — config default
 *   resolveAuthorizeOption(undefined, undefined) // undefined — nothing set
 */
export function resolveAuthorizeOption<T>(
  override: T | undefined | null,
  defaultOption: T | undefined,
): T | undefined {
  // Explicitly unset the option
  if (override === null) {
    return undefined;
  }

  return override !== undefined ? override : defaultOption;
}

/**
 * Build options for an authorize request. Client `config` values are set as defaults
 * that can be overriden by `options`.
 *
 * The three required fields (`clientId`, `scope`, `responseType`)
 * use truthy fallbacks — an empty-string override falls through to config —
 * while the optional fields honor any defined value, including `''`.
 * @function forwardAuthorizeOptions
 * @param {OidcConfig} config - The OIDC Client configuration options
 * @param {OptionalAuthorizeOptions} [options] - The optional authorize overrides. Set an option to `null` to explicitly unset the option from the default value configured in OidcConfig.
 */
export function forwardAuthorizeOptions(
  config: OidcConfig,
  options?: OptionalAuthorizeOptions,
): GetAuthorizationUrlOptions {
  // Options required for every authorization request
  const requiredOptions = {
    clientId: options?.clientId || config.clientId,
    scope: options?.scope || config.scope || 'openid',
    responseType: options?.responseType || config.responseType || 'code',
  };

  // Optional overridable options that are shared between OidcConfig and GetAuthorizationUrlOptions
  // and get set on the authorize URL
  const optionalOptions = {
    redirectUri: resolveAuthorizeOption(options?.redirectUri, config.redirectUri),
    responseMode: resolveAuthorizeOption(options?.responseMode, config.responseMode),
    loginHint: resolveAuthorizeOption(options?.loginHint, config.loginHint),
    nonce: resolveAuthorizeOption(options?.nonce, config.nonce),
    display: resolveAuthorizeOption(options?.display, config.display),
    prompt: resolveAuthorizeOption(options?.prompt, config.prompt),
    uiLocales: resolveAuthorizeOption(options?.uiLocales, config.uiLocales),
    acrValues: resolveAuthorizeOption(options?.acrValues, config.acrValues),
    query: resolveAuthorizeOption(options?.query, config.query),
  };

  return {
    ...options, // Include options unique to OptionalAuthorizeOptions which are not derived above
    ...optionalOptions,
    ...requiredOptions,
  };
}

/**
 * Validate that a redirect URI is present whenever the resolved authorization
 * flow requires one.
 * @function validateRedirectUri
 * @param wellknown - The well-known configuration
 * @param config - The OIDC client configuration
 * @param options - Per-request overrides resolved against `config` via
 *   `resolveAuthorizeOption`.
 * @param useParFlow - Whether this request takes the PAR flow (PingAM does
 *   not support `pi.flow`, so PAR always requires a redirect URI).
 * @returns A `GenericError` describing the first violated requirement, or
 *   `null` when the request may proceed.
 */
export function validateRedirectUri(
  wellknown: WellknownResponse,
  config: OidcConfig,
  options?: OptionalAuthorizeOptions,
  useParFlow?: boolean,
): GenericError | null {
  const redirectUri = resolveAuthorizeOption(options?.redirectUri, config.redirectUri);

  if (useParFlow && !redirectUri) {
    // PingAM does not support pi.flow
    return {
      error: 'Redirect URI is required for PingAM PAR flow',
      type: 'argument_error',
    };
  }

  const isPiFlowRequested =
    resolveAuthorizeOption(options?.responseMode, config.responseMode) === 'pi.flow';
  const isPiFlowSupported = wellknown.response_modes_supported?.includes('pi.flow');

  if (isPiFlowRequested && !isPiFlowSupported) {
    return {
      error: 'pi.flow response mode is not supported',
      type: 'argument_error',
    };
  }

  if (!isPiFlowRequested && !redirectUri) {
    return {
      error: 'Redirect URI is required when response mode is not pi.flow',
      type: 'argument_error',
    };
  }

  return null;
}

/**
 * Get the authorization wellknown endpoint and authorization options
 * @function buildAuthorizeOptions
 * @param {WellknownResponse} wellknown - The wellknown response
 * @param {OidcConfig} config - OIDC Client configuration
 * @param {OptionalAuthorizeOptions} [options] - Optional per-request authorization options
 * @returns - An array of the authorization wellknown endpoint and authorization options
 */
export function buildAuthorizeOptions(
  wellknown: WellknownResponse,
  config: OidcConfig,
  options?: OptionalAuthorizeOptions,
): [string, GetAuthorizationUrlOptions] {
  const isPiFlowSupported = wellknown.response_modes_supported?.includes('pi.flow');
  return [
    wellknown.authorization_endpoint,
    forwardAuthorizeOptions(config, {
      ...options,
      // buildAuthorizeOptions is used for every authorizeµ request and should default to pi.flow mode
      // if no explicit response mode is requested and the server supports.
      ...(options?.responseMode === undefined && isPiFlowSupported && { responseMode: 'pi.flow' }),
    }),
  ];
}

/**
 * Type guard for RTK FetchBaseQueryError vs SerializedError.
 * FetchBaseQueryError always carries a `status` field; SerializedError does not.
 */
export function isFetchBaseQueryError(
  error: FetchBaseQueryError | SerializedError,
): error is FetchBaseQueryError {
  return 'status' in error;
}

const KNOWN_ERROR_TYPES = new Set([
  'auth_error',
  'argument_error',
  'network_error',
  'unknown_error',
  'wellknown_error',
] as const);

function isKnownErrorType(value: unknown): value is AuthorizationError['type'] {
  return typeof value === 'string' && KNOWN_ERROR_TYPES.has(value as AuthorizationError['type']);
}

/**
 * Safely narrows an unknown value to AuthorizationError shape.
 * Validates that the data has the required 'error' string field, otherwise returns
 * a default unknown error response.
 */
export function toAuthorizationError(data: unknown): AuthorizationError {
  if (isStringRecord(data)) {
    if (typeof data['error'] === 'string') {
      return {
        error: data['error'],
        error_description:
          typeof data['error_description'] === 'string' ? data['error_description'] : '',
        type: isKnownErrorType(data['type']) ? data['type'] : 'unknown_error',
        ...(typeof data['redirectUrl'] === 'string' && { redirectUrl: data['redirectUrl'] }),
      };
    }
  }
  return {
    error: 'Unknown_Error',
    error_description: 'Unexpected error response shape',
    type: 'unknown_error',
  };
}

/**
 * Constructs the slim PAR authorize URL containing only client_id and request_uri
 * (and optionally prompt). Keeping sensitive params out of the browser address bar
 * is the core security value of PAR (RFC 9126).
 */
export function buildParAuthorizeUrl({
  authorizationEndpoint,
  clientId,
  requestUri,
  prompt,
}: ParUrlParams): string {
  const url = new URL(authorizationEndpoint);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('request_uri', requestUri);
  if (prompt) url.searchParams.set('prompt', prompt);
  return url.toString();
}

/**
 * Converts an RTK Query dispatch error to a typed AuthorizationError.
 * oidc.api.ts normalizes all FetchBaseQueryErrors so that error.data always
 * contains { error, error_description, type }. SerializedErrors fall back to
 * their code/message fields.
 */
export function toDispatchError(error: FetchBaseQueryError | SerializedError): AuthorizationError {
  if (!isFetchBaseQueryError(error)) {
    return {
      error: error.code ?? 'Unknown_Error',
      error_description: error.message ?? 'An unknown error occurred during authorization',
      type: 'unknown_error',
    };
  }
  return toAuthorizationError(error.data);
}
