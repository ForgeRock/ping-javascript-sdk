/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type * as Either from 'effect/Either';

import type { LogLevel, AuthDisplayValue, AuthPromptValue } from '@forgerock/sdk-types';

export type { OidcConfig } from '@forgerock/sdk-types';
export type { AuthDisplayValue, AuthPromptValue };

export interface UnifiedOidcConfig {
  clientId?: string;
  discoveryEndpoint: string;
  scopes?: string[];
  redirectUri?: string;
  signOutRedirectUri?: string;
  refreshThreshold?: number;
  loginHint?: string;
  nonce?: string;
  display?: AuthDisplayValue;
  prompt?: AuthPromptValue;
  uiLocales?: string;
  acrValues?: string;
  additionalParameters?: Record<string, string>;
  openId?: {
    deviceAuthorizationEndpoint?: string;
  };
}

export interface UnifiedJourneyConfig {
  serverUrl: string;
  realm?: string;
  cookieName?: string;
}

export interface UnifiedSdkConfig {
  timeout?: number;
  log?: Uppercase<LogLevel>;
  journey?: UnifiedJourneyConfig;
  oidc?: UnifiedOidcConfig;
}

export type ConfigValidationError = {
  field: string;
  message: string;
};

/**
 * A parsed result over the accumulating-error channel. Effect's `Either` is
 * `Either<Right, Left>`, so the SECOND type parameter is the error channel.
 */
export type ParseResult<A> = Either.Either<A, ConfigValidationError[]>;

/** Parses a record of unknown values into `A`. Unknown fields are silently ignored. */
export type Parser<A> = (input: Readonly<Record<string, unknown>>) => ParseResult<A>;

/** Parses a single field value (already extracted from its parent record) into `A`. */
export type FieldParser<A> = (value: unknown, fieldPath: string) => ParseResult<A>;

export type { LogLevel, JourneyClientConfig, DaVinciConfig } from '@forgerock/sdk-types';
