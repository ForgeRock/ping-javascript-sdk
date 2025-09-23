/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { GenerateAndStoreAuthUrlValues } from '@forgerock/sdk-types';
import { describe, expect, it, beforeEach } from 'vitest';
import { createAuthorizeUrl } from './authorize.effects.js';
import { getStorageKey } from './state-pkce.effects.js';

const mockSessionStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

describe('createAuthorizeUrl', () => {
  beforeEach(() => {
    if (typeof sessionStorage === 'undefined') {
      global.sessionStorage = mockSessionStorage;
    }
    sessionStorage.clear();
  });

  const mockOptions: GenerateAndStoreAuthUrlValues = {
    clientId: 'test-client',
    redirectUri: 'http://localhost:8080',
    scope: 'openid profile',
    responseType: 'code',
  };
  const baseUrl = 'https://auth.example.com/authorize';

  it('should create a valid authorization URL with all required parameters', async () => {
    const url = await createAuthorizeUrl(baseUrl, mockOptions);
    const parsedUrl = new URL(url);

    // Check the base URL
    expect(parsedUrl.origin + parsedUrl.pathname).toBe(baseUrl);

    const params = Object.fromEntries(parsedUrl.searchParams.entries());
    expect(params).toMatchObject({
      client_id: mockOptions.clientId,
      redirect_uri: mockOptions.redirectUri,
      response_type: mockOptions.responseType,
      scope: mockOptions.scope,
      code_challenge_method: 'S256',
    });
    expect(params.prompt).toBeFalsy();
    expect(params.response_mode).toBeFalsy();

    // Verify presence of dynamically generated values
    expect(params.state).toBeDefined();
    expect(params.code_challenge).toBeDefined();
  });

  it('should include optional parameters when provided', async () => {
    const prompt = 'login';
    const responseMode = 'pi.flow';
    const optionsWithOptionals: GenerateAndStoreAuthUrlValues = {
      ...mockOptions,
      prompt,
      responseMode,
    };

    const url = await createAuthorizeUrl(baseUrl, optionsWithOptionals);
    const params = new URL(url).searchParams;

    expect(params.get('prompt')).toBe(prompt);
    expect(params.get('response_mode')).toBe(responseMode);
  });

  it('should store the authorize options in session storage', async () => {
    await createAuthorizeUrl(baseUrl, mockOptions);
    const storageKey = getStorageKey(mockOptions.clientId);
    const storedData = sessionStorage.getItem(storageKey);

    const parsedOptions = JSON.parse(storedData as string);
    const serverUrl = new URL(baseUrl).origin;

    expect(storedData).toBeDefined();
    expect(parsedOptions).toMatchObject({
      ...mockOptions,
      serverConfig: { baseUrl: serverUrl },
    });
    expect(parsedOptions).toHaveProperty('state');
    expect(parsedOptions).toHaveProperty('verifier');
  });
});
