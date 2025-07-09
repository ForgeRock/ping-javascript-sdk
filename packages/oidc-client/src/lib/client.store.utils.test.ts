import { recreateAuthorizeUrl, handleAuthorize } from './client.store.utils.js';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock createAuthorizeUrl from sdk to avoid actual URL generation logic or network calls
vi.mock('@forgerock/sdk-oidc', () => {
  return {
    createAuthorizeUrl: vi
      .fn()
      .mockResolvedValue(
        'https://example.com/authorize?client_id=client_id&redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&scope=openid&state=state&response_type=code',
      ),
  };
});

// Stub the global fetch used inside handleAuthorize so it returns predictable JSON
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: async () => ({
        authorizeResponse: {
          code: 'code',
          state: 'state',
        },
      }),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('client-store utilities', () => {
  it('should handle authorize', async () => {
    const result = await handleAuthorize('https://example.com/authorize');
    expect(result).toEqual({
      code: 'code',
      state: 'state',
    });
  });

  it('should recreate authorize url', async () => {
    const result = await recreateAuthorizeUrl(
      {
        error: 'error',
        error_description: 'error_description',
        state: 'state',
      },
      'https://example.com/authorize',
      {
        clientId: 'client_id',
        redirectUri: 'https://example.com/redirect',
        scope: 'openid',
        state: 'state',
        responseType: 'code',
      },
    );
    expect(result).toEqual({
      error: 'error',
      error_description: 'error_description',
      state: 'state',
      redirectUrl:
        'https://example.com/authorize?client_id=client_id&redirect_uri=https%3A%2F%2Fexample.com%2Fredirect&scope=openid&state=state&response_type=code',
    });
  });
});
