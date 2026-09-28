/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { LegacyConfigOptions } from './legacy-config.types.js';

export type ResponseType = 'code' | 'token';

// Canonical runtime lists of the OIDC `display`/`prompt` values; the union types are
// derived from them so the allowed values live in one place — runtime validators can
// iterate the arrays while the types stay in sync. Colocated as in `am-callback.types.ts`.
export const AUTH_DISPLAY_VALUES = ['page', 'popup', 'touch', 'wap'] as const;
export const AUTH_PROMPT_VALUES = ['none', 'login', 'consent', 'select_account'] as const;

export type AuthDisplayValue = (typeof AUTH_DISPLAY_VALUES)[number];
export type AuthPromptValue = (typeof AUTH_PROMPT_VALUES)[number];

export type ResponseMode = 'fragment' | 'form_post' | 'pi.flow' | 'query';

/**
 * Options for the authorization URL
 * @param {string} clientId The client ID of the application
 * @param {string} [redirectUri] The redirect URI of the application
 * @param {ResponseType} responseType The response type of the authorization request
 * @param {string} scope The scope of the authorization request
 */
export interface GetAuthorizationUrlOptions extends LegacyConfigOptions {
  /**
   * These three properties clientid, scope, responseType are required
   * when using this type, which are not required when defining LegacyConfigOptions.
   */
  clientId: string;
  scope: string;
  responseType: ResponseType;
  redirectUri?: string;
  responseMode?: ResponseMode;
  query?: Record<string, string>;
  prompt?: AuthPromptValue;
  loginHint?: string;
  nonce?: string;
  display?: AuthDisplayValue;
  uiLocales?: string;
  acrValues?: string;
  login?: 'redirect' | 'embedded';
  state?: string;
  verifier?: string;
  successParams?: string[];
  errorParams?: string[];
}

/**
 * Generate and store PKCE values for later use
 */
export interface GenerateAndStoreAuthUrlValues extends GetAuthorizationUrlOptions {
  login?: 'redirect' | 'embedded';
  clientId: string;
  prefix?: string;
}
