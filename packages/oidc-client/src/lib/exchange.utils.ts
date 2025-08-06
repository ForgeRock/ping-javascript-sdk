import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Micro } from 'effect';

import { getStoredAuthUrlValues } from '@forgerock/sdk-oidc';

import type { GetAuthorizationUrlOptions } from '@forgerock/sdk-oidc';
import type { GenericError, WellKnownResponse } from '@forgerock/sdk-types';
import type { StorageConfig } from '@forgerock/storage';

import type { TokenExchangeResponse, TokenRequestOptions } from './exchange.types.js';
import type { TokenExchangeErrorResponse } from './exchange.types.js';
import type { OidcConfig } from './config.types.js';

export function createValuesµ(
  code: string,
  config: OidcConfig,
  state: string,
  wellknown: WellKnownResponse,
  options?: Partial<StorageConfig>,
) {
  const storedValues = getStoredAuthUrlValues(config.clientId, options?.prefix);

  return {
    code,
    config,
    state,
    storedValues,
    wellknown,
  };
}

export function handleTokenResponseµ(
  data: TokenExchangeResponse | undefined,
  error?: FetchBaseQueryError | SerializedError,
): Micro.Micro<TokenExchangeResponse, TokenExchangeErrorResponse, never> {
  if (error) {
    let message;
    if ('status' in error) {
      message = 'error' in error ? error.error : JSON.stringify(error.data);
    } else if ('message' in error) {
      message = error.message;
    }

    return Micro.fail({
      error: 'Token Exchange failure',
      message: message || 'Unknown error during token exchange',
      type: 'exchange_error',
    } as TokenExchangeErrorResponse);
  }

  if (!data) {
    return Micro.fail({
      error: 'Token Exchange failure',
      message: 'No data returned from token exchange',
      type: 'exchange_error',
    } as TokenExchangeErrorResponse);
  }

  return Micro.succeed(data);
}

export function validateValuesµ({
  code,
  config,
  state,
  storedValues,
  wellknown,
}: {
  code: string;
  config: OidcConfig;
  state: string;
  storedValues: GetAuthorizationUrlOptions;
  wellknown: { token_endpoint: string };
}) {
  if (!storedValues || storedValues.state !== state) {
    const err = {
      error: 'State mismatch',
      message:
        'The provided state does not match the stored state. This is likely due to passing in used, returned, authorize parameters.',
      type: 'state_error',
    } as GenericError;

    return Micro.fail(err as GenericError);
  }
  return Micro.succeed({
    code,
    config,
    endpoint: wellknown.token_endpoint,
    ...(storedValues.verifier && { verifier: storedValues.verifier }), // Optional PKCE
  } as TokenRequestOptions);
}
