/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createVerifier, createState } from '@forgerock/sdk-utilities';

import type {
  GenerateAndStoreAuthUrlValues,
  GetAuthorizationUrlOptions,
} from '@forgerock/sdk-types';

export function getStorageKey(clientId: string, prefix?: string) {
  return `${prefix || 'FR-SDK'}-authflow-${clientId}`;
}

/** The PKCE + state values generated for an authorization request. */
export interface AuthUrlValues extends GetAuthorizationUrlOptions {
  state: string;
  verifier: string;
}

/**
 * Pure PKCE generation — no storage side effects.
 * Returns the authorize URL options with generated state and verifier.
 * The caller is responsible for persisting these values for token exchange.
 */
export function generateAuthUrlValues(options: GenerateAndStoreAuthUrlValues): AuthUrlValues {
  const verifier = createVerifier();
  const state = createState();

  return {
    ...options,
    state,
    verifier,
  };
}

/**
 * @deprecated Use `generateAuthUrlValues` and handle storage yourself.
 * Generate PKCE values and return a closure to store them in sessionStorage.
 */
export function generateAndStoreAuthUrlValues(
  options: GenerateAndStoreAuthUrlValues,
): readonly [AuthUrlValues, () => void] {
  const authorizeUrlOptions = generateAuthUrlValues(options);
  const storageKey = getStorageKey(options.clientId, options.prefix);

  return [
    authorizeUrlOptions,
    () => globalThis.sessionStorage.setItem(storageKey, JSON.stringify(authorizeUrlOptions)),
  ] as const;
}

/**
 * @deprecated Use caller-provided stored values instead.
 * Retrieve stored authorization options from sessionStorage.
 */
export function getStoredAuthUrlValues(
  clientId: string,
  prefix?: string,
): GetAuthorizationUrlOptions {
  const storageKey = getStorageKey(clientId, prefix);
  const storedString = globalThis.sessionStorage.getItem(storageKey);
  globalThis.sessionStorage.removeItem(storageKey);

  try {
    return JSON.parse(storedString as string);
  } catch {
    throw new Error('Stored values for Auth URL could not be parsed');
  }
}
