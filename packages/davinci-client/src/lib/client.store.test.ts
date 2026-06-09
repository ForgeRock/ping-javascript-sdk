// @vitest-environment node
/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { davinci } from './client.store.js';
import type { DaVinciConfig } from './config.types.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TEST_WELLKNOWN_URL =
  'https://example.pingone.com/test-env/as/.well-known/openid-configuration';

const mockConfig: DaVinciConfig = {
  clientId: 'test-client-id',
  scope: 'openid profile',
  redirectUri: 'http://localhost/callback',
  serverConfig: {
    wellknown: TEST_WELLKNOWN_URL,
  },
};

const mockWellknownResponse = {
  issuer: 'https://example.pingone.com/test-env/as',
  authorization_endpoint: 'https://example.pingone.com/test-env/as/authorize',
  token_endpoint: 'https://example.pingone.com/test-env/as/token',
  userinfo_endpoint: 'https://example.pingone.com/test-env/as/userinfo',
  jwks_uri: 'https://example.pingone.com/test-env/as/jwks',
};

/**
 * Minimal DaVinci continue-node response.
 * Must have _links.next.href so handleResponse dispatches nodeSlice.next.
 */
const mockContinueResponse = {
  id: 'mock-node-id',
  interactionId: 'mock-interaction-id',
  interactionToken: 'mock-interaction-token',
  eventName: 'continue',
  form: {
    name: 'Login',
    description: '',
    components: {
      fields: [
        { type: 'TEXT', key: 'username', label: 'Username' },
        { type: 'PASSWORD', key: 'password', label: 'Password' },
        { type: 'SUBMIT_BUTTON', key: 'SIGNON', label: 'Sign On' },
      ],
    },
  },
  _links: {
    next: { href: 'https://example.pingone.com/test-env/davinci/flow/next' },
    self: { href: 'https://example.pingone.com/test-env/davinci/flow/self' },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a minimal Web Storage API stub backed by a Map.
 * createStorage() references sessionStorage/localStorage at call time,
 * so both must be present in the Node.js environment before davinci() runs.
 */
function makeStorageStub() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (i: number) => [...store.keys()][i] ?? null,
  };
}

function mockFetchImplementation() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = typeof input === 'string' ? input : (input as Request).url;

    if (url.includes('.well-known')) {
      return new Response(JSON.stringify(mockWellknownResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(mockContinueResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('davinci client — cache', () => {
  beforeEach(() => {
    // Provide browser storage APIs in the Node.js test environment
    vi.stubGlobal('localStorage', makeStorageStub());
    vi.stubGlobal('sessionStorage', makeStorageStub());
    mockFetchImplementation();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  describe('cache.getLatestResponse()', () => {
    it('returns a state_error when no flow has been started (no cache key)', async () => {
      const client = await davinci({ config: mockConfig });

      // Node is in start status — cache.key is null before any start() call
      const result = client.cache.getLatestResponse();

      expect(result).toHaveProperty('error.type', 'state_error');
    });

    it('returns the raw DaVinci response object — NOT a selector function — after start()', async () => {
      const client = await davinci({ config: mockConfig });
      await client.start();

      const result = client.cache.getLatestResponse();

      // Bug guard: unfixed code returns a selector factory (typeof === 'function')
      expect(typeof result).not.toBe('function');
      expect(result).toBeDefined();
      // RTK Query fulfilled entry: has data with the original DaVinci response
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.interactionId', 'mock-interaction-id');
      expect(result).toHaveProperty('data.id', 'mock-node-id');
    });
  });

  // -------------------------------------------------------------------------
  describe('cache.getResponseWithId()', () => {
    it('returns an argument_error when called with an empty string', async () => {
      const client = await davinci({ config: mockConfig });

      const result = client.cache.getResponseWithId('');

      expect(result).toHaveProperty('error.type', 'argument_error');
    });

    it('returns the raw DaVinci response object — NOT a selector function — for a valid request ID', async () => {
      const client = await davinci({ config: mockConfig });
      await client.start();

      const node = client.getNode();
      const requestId = node.cache?.key;
      expect(requestId).toBeDefined();

      const result = client.cache.getResponseWithId(requestId!);

      // Bug guard: unfixed code returns a selector factory (typeof === 'function')
      expect(typeof result).not.toBe('function');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('data.interactionId', 'mock-interaction-id');
    });

    it('returns a state_error for a requestId not present in cache', async () => {
      const client = await davinci({ config: mockConfig });

      const result = client.cache.getResponseWithId('non-existent-id');

      expect(result).toHaveProperty('error.type', 'state_error');
    });
  });
});
