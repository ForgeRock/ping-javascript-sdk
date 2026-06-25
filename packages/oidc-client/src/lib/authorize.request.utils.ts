/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { GetAuthorizationUrlOptions, WellknownResponse } from '@forgerock/sdk-types';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { AuthorizationError, OptionalAuthorizeOptions } from './authorize.request.types.js';
import type { OidcConfig } from './config.types.js';

export type PromptValue = 'none' | 'login' | 'consent';

export type ParUrlParams = {
  authorizationEndpoint: string;
  clientId: string;
  requestUri: string;
  prompt?: PromptValue;
};

export function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function hasPushRequestUri(data: unknown): data is { request_uri: string } {
  return isStringRecord(data) && typeof data['request_uri'] === 'string';
}

export function buildAuthorizeOptions(
  wellknown: WellknownResponse,
  config: OidcConfig,
  options?: OptionalAuthorizeOptions,
): [string, GetAuthorizationUrlOptions] {
  const isPiFlow = wellknown.response_modes_supported?.includes('pi.flow');
  return [
    wellknown.authorization_endpoint,
    {
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scope: config.scope || 'openid',
      responseType: config.responseType || 'code',
      ...(isPiFlow && { responseMode: 'pi.flow' as const }),
      ...options,
    },
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
