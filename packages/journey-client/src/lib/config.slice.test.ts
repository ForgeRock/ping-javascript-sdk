/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { configSlice } from './config.slice.js';

import type { WellknownResponse } from '@forgerock/sdk-types';
import type { ResolvedConfig } from './config.slice.js';

function createMockWellknown(overrides: Partial<WellknownResponse> = {}): WellknownResponse {
  return {
    issuer: 'https://am.example.com/am/oauth2/alpha',
    authorization_endpoint: 'https://am.example.com/am/oauth2/alpha/authorize',
    token_endpoint: 'https://am.example.com/am/oauth2/alpha/access_token',
    userinfo_endpoint: 'https://am.example.com/am/oauth2/alpha/userinfo',
    end_session_endpoint: 'https://am.example.com/am/oauth2/alpha/connect/endSession',
    ...overrides,
  };
}

describe('journey-client config.slice', () => {
  describe('configSlice_ValidAmWellknown_SetsResolvedServerConfig', () => {
    it('should derive baseUrl and paths from a standard AM well-known response', () => {
      // Arrange
      const payload: ResolvedConfig = {
        wellknownResponse: createMockWellknown(),
      };

      // Act
      const state = configSlice.reducer(undefined, configSlice.actions.set(payload));

      // Assert
      expect(state.serverConfig).toEqual({
        baseUrl: 'https://am.example.com',
        paths: {
          authenticate: '/am/json/alpha/authenticate',
          sessions: '/am/json/alpha/sessions/',
        },
      });
      expect(state.error).toBeUndefined();
    });
  });

  describe('configSlice_NonAmIssuer_SetsError', () => {
    it('should set a GenericError when the issuer is not a ForgeRock AM issuer', () => {
      // Arrange
      const payload: ResolvedConfig = {
        wellknownResponse: createMockWellknown({
          issuer: 'https://auth.pingone.com/env-id/as',
          authorization_endpoint: 'https://auth.pingone.com/env-id/as/authorize',
        }),
      };

      // Act
      const state = configSlice.reducer(undefined, configSlice.actions.set(payload));

      // Assert
      expect(state.error).toBeDefined();
      expect(state.error?.type).toBe('wellknown_error');
      expect(state.error?.message).toContain('ForgeRock AM issuer');
    });
  });

  describe('configSlice_MissingAuthEndpoint_SetsError', () => {
    it('should set a GenericError when authorization_endpoint is empty', () => {
      // Arrange
      const payload: ResolvedConfig = {
        wellknownResponse: createMockWellknown({
          authorization_endpoint: '',
        }),
      };

      // Act
      const state = configSlice.reducer(undefined, configSlice.actions.set(payload));

      // Assert
      expect(state.error).toBeDefined();
      expect(state.error?.type).toBe('wellknown_error');
      expect(state.error?.message).toContain('authorization_endpoint');
    });
  });

  describe('configSlice_Middleware_StoresMiddleware', () => {
    it('should store the provided middleware array', () => {
      // Arrange
      const mockMiddleware = [{ type: 'test-middleware' as const }];
      const payload: ResolvedConfig = {
        wellknownResponse: createMockWellknown(),
        middleware: mockMiddleware,
      };

      // Act
      const state = configSlice.reducer(undefined, configSlice.actions.set(payload));

      // Assert
      expect(state.middleware).toEqual(mockMiddleware);
    });
  });
});
