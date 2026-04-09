/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { GenerateAndStoreAuthUrlValues } from '@forgerock/sdk-types';
import { describe, expect, it, beforeEach } from 'vitest';
import { createAuthorizeUrl } from './authorize.effects.js';

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
    const result = await createAuthorizeUrl(baseUrl, mockOptions);
    const parsedUrl = new URL(result.url);

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

  it('should return verifier and state alongside the URL', async () => {
    const result = await createAuthorizeUrl(baseUrl, mockOptions);

    expect(result.verifier).toBeDefined();
    expect(result.state).toBeDefined();
    expect(typeof result.verifier).toBe('string');
    expect(typeof result.state).toBe('string');
    expect(result.verifier.length).toBeGreaterThan(0);
    expect(result.state.length).toBeGreaterThan(0);

    // State in URL should match the returned state
    const parsedUrl = new URL(result.url);
    expect(parsedUrl.searchParams.get('state')).toBe(result.state);
  });

  it('should include optional parameters when provided', async () => {
    const prompt = 'login';
    const responseMode = 'pi.flow';
    const optionsWithOptionals: GenerateAndStoreAuthUrlValues = {
      ...mockOptions,
      prompt,
      responseMode,
    };

    const result = await createAuthorizeUrl(baseUrl, optionsWithOptionals);
    const params = new URL(result.url).searchParams;

    expect(params.get('prompt')).toBe(prompt);
    expect(params.get('response_mode')).toBe(responseMode);
  });

  it('should include query parameters when provided', async () => {
    const queryA = 'valueA';
    const queryB = 'valueB';
    const optionsWithOptionals: GenerateAndStoreAuthUrlValues = {
      ...mockOptions,
      query: {
        queryA,
        queryB,
      },
    };

    const result = await createAuthorizeUrl(baseUrl, optionsWithOptionals);
    const params = new URL(result.url).searchParams;

    expect(params.get('queryA')).toBe(queryA);
    expect(params.get('queryB')).toBe(queryB);
  });

  it('should ensure standard config params override conflicting query params', async () => {
    const optionsWithConflict: GenerateAndStoreAuthUrlValues = {
      ...mockOptions,
      query: {
        client_id: 'malicious-client',
        custom_param: 'value',
      },
    };

    const result = await createAuthorizeUrl(baseUrl, optionsWithConflict);
    const params = new URL(result.url).searchParams;

    // Standard param should override query param
    expect(params.get('client_id')).toBe(mockOptions.clientId);
    // Custom param should be preserved
    expect(params.get('custom_param')).toBe('value');
  });

  it('should NOT store values in session storage (caller responsibility)', async () => {
    await createAuthorizeUrl(baseUrl, mockOptions);
    // createAuthorizeUrl no longer writes to sessionStorage — that's the caller's job
    expect(sessionStorage.getItem(`FR-SDK-authflow-${mockOptions.clientId}`)).toBeNull();
  });
});
