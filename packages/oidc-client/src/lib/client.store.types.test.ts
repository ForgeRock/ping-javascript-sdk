/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { it, expect, describe } from 'vitest';
import { logger as loggerFn } from '@forgerock/sdk-logger';

import { parseOidcArgs } from './client.store.utils.js';
import { createClientStore } from './client.store.utils.js';

import type { OidcConfig } from './config.types.js';

const validConfig: OidcConfig = {
  clientId: 'test-client',
  redirectUri: 'https://example.com/callback.html',
  scope: 'openid profile',
  serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' },
  responseType: 'code',
};

describe('parseOidcArgs', () => {
  it('returns ParsedOidcArgs (no error) when all required fields are present', () => {
    const result = parseOidcArgs({ config: validConfig });

    expect('type' in result).toBe(false);
    if ('type' in result) return;
    expect(result.config.clientId).toBe('test-client');
    expect(result.config.serverConfig.wellknown).toBe(
      'https://example.com/.well-known/openid-configuration',
    );
    expect(result.store).toBeUndefined();
  });

  it('returns argument_error when store is a non-SDK-store object', () => {
    const result = parseOidcArgs({
      config: validConfig,
      store: { notAnSdkStore: true, dispatch: () => void 0 },
    });

    expect(result).toMatchObject({ type: 'argument_error' });
  });

  it('returns argument_error when config.serverConfig.wellknown is missing', () => {
    const result = parseOidcArgs({
      config: { ...validConfig, serverConfig: {} as OidcConfig['serverConfig'] },
    });

    expect(result).toMatchObject({
      type: 'argument_error',
      error: 'Requires a wellknown url initializing this factory.',
    });
  });

  it('returns argument_error when config.clientId is missing', () => {
    const result = parseOidcArgs({
      config: { ...validConfig, clientId: '' },
    });

    expect(result).toMatchObject({
      type: 'argument_error',
      error: 'Requires a clientId.',
    });
  });

  it('returns argument_error when clientId conflicts with the existing store', () => {
    const log = loggerFn({ level: 'error' });
    // Create a real store already registered with 'existing-client'.
    // createClientStore returns a handle that passes isSdkStoreHandle at runtime.
    const existingHandle = createClientStore({ clientId: 'existing-client', logger: log });

    const result = parseOidcArgs({
      config: { ...validConfig, clientId: 'different-client' },
      store: existingHandle,
    });

    expect(result).toMatchObject({ type: 'argument_error' });
    if ('type' in result) {
      expect(result.error).toContain('existing-client');
      expect(result.error).toContain('Use a separate store per clientId');
    }
  });
});
