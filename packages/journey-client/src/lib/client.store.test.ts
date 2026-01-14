/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { afterEach, describe, expect, test, vi } from 'vitest';

import type { GenericError, Step, WellknownResponse } from '@forgerock/sdk-types';

import { journey, isJourneyClient } from './client.store.js';
import { createJourneyStep } from './step.utils.js';
import { JourneyClientConfig } from './config.types.js';

/**
 * Type guard to check if a result is a GenericError
 */
function isGenericError(result: unknown): result is GenericError {
  return typeof result === 'object' && result !== null && 'error' in result && 'type' in result;
}

// Create a singleton mock instance for storage
const mockStorageInstance = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

// Mock dependencies with side effects
vi.mock('@forgerock/storage', () => ({
  createStorage: vi.fn(() => mockStorageInstance),
}));

vi.mock('./device/device-profile.js', () => ({
  default: vi.fn(() => ({
    getProfile: vi.fn().mockResolvedValue({}),
  })),
}));

// Mock the fetch API to control responses
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Wellknown-based config (new pattern)
const mockWellknownUrl = 'https://test.com/am/oauth2/realms/root/.well-known/openid-configuration';

const mockWellknownResponse: WellknownResponse = {
  issuer: 'https://test.com/am/oauth2/realms/root',
  authorization_endpoint: 'https://test.com/am/oauth2/realms/root/authorize',
  token_endpoint: 'https://test.com/am/oauth2/realms/root/access_token',
  userinfo_endpoint: 'https://test.com/am/oauth2/realms/root/userinfo',
  jwks_uri: 'https://test.com/am/oauth2/realms/root/connect/jwk_uri',
  end_session_endpoint: 'https://test.com/am/oauth2/realms/root/connect/endSession',
  revocation_endpoint: 'https://test.com/am/oauth2/realms/root/token/revoke',
  introspection_endpoint: 'https://test.com/am/oauth2/realms/root/introspect',
};

const mockConfig: JourneyClientConfig = {
  serverConfig: {
    wellknown: mockWellknownUrl,
  },
  // realmPath will be inferred from issuer as 'root'
};

/**
 * Extracts URL from fetch input (handles both string URLs and Request objects).
 */
function getUrlFromInput(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof Request) return input.url;
  return input.toString();
}

/**
 * Helper to setup mock fetch for wellknown + journey responses
 */
function setupMockFetch(journeyResponse: Step | null = null) {
  mockFetch.mockImplementation((input: RequestInfo | URL) => {
    const url = getUrlFromInput(input);

    // Wellknown endpoint
    if (url.includes('.well-known/openid-configuration')) {
      return Promise.resolve(new Response(JSON.stringify(mockWellknownResponse)));
    }

    // Journey authenticate endpoint
    if (journeyResponse && url.includes('/authenticate')) {
      return Promise.resolve(new Response(JSON.stringify(journeyResponse)));
    }

    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });
}

describe('journey-client', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('journey_WellknownConfig_ReturnsClientWithAllMethods', async () => {
    // Arrange
    setupMockFetch();

    // Act
    const result = await journey({ config: mockConfig });

    // Assert
    expect(isJourneyClient(result)).toBe(true);
    if (!isJourneyClient(result)) return;
    expect(result.start).toBeInstanceOf(Function);
    expect(result.next).toBeInstanceOf(Function);
    expect(result.redirect).toBeInstanceOf(Function);
    expect(result.resume).toBeInstanceOf(Function);
    expect(result.terminate).toBeInstanceOf(Function);
  });

  test('journey_InvalidWellknownUrl_ReturnsError', async () => {
    // Arrange
    const invalidConfig: JourneyClientConfig = {
      serverConfig: {
        wellknown: 'not-a-valid-url',
      },
    };

    // Act
    const result = await journey({ config: invalidConfig });

    // Assert
    expect(isJourneyClient(result)).toBe(false);
    if (isJourneyClient(result)) return;
    expect(result.error).toBe('Invalid wellknown URL');
    expect(result.type).toBe('wellknown_error');
  });

  test('journey_NonAmWellknownUrl_ReturnsAmRequiredError', async () => {
    // Arrange - PingOne URL has no /oauth2/ path
    const pingOneConfig: JourneyClientConfig = {
      serverConfig: {
        wellknown: 'https://auth.pingone.com/env-id/.well-known/openid-configuration',
      },
    };

    // Act
    const result = await journey({ config: pingOneConfig });

    // Assert
    expect(isJourneyClient(result)).toBe(false);
    if (isJourneyClient(result)) return;
    expect(result.error).toBe('AM server required');
    expect(result.type).toBe('wellknown_error');
    expect(result.message).toContain('ForgeRock AM servers only');
  });

  test('start_WellknownConfig_FetchesFirstStep', async () => {
    // Arrange
    const mockStepResponse: Step = { authId: 'test-auth-id', callbacks: [] };
    setupMockFetch(mockStepResponse);

    // Act
    const result = await journey({ config: mockConfig });
    if (!isJourneyClient(result)) throw new Error('Expected client');
    const step = await result.start();

    // Assert
    expect(step).toBeDefined();
    expect(isGenericError(step)).toBe(false);

    expect(mockFetch).toHaveBeenCalledTimes(2); // wellknown + start
    const requests = mockFetch.mock.calls.map((call) =>
      getUrlFromInput(call[0] as RequestInfo | URL),
    );
    expect(requests[0]).toContain('.well-known/openid-configuration');
    expect(requests[1]).toBe('https://test.com/am/json/realms/root/authenticate');
    expect(step).toHaveProperty('type', 'Step');
    if (step && !isGenericError(step)) {
      expect(step.payload).toEqual(mockStepResponse);
    }
  });

  test('next_WellknownConfig_SendsStepAndReturnsNext', async () => {
    // Arrange
    const initialStep = createJourneyStep({
      authId: 'test-auth-id',
      callbacks: [
        {
          type: callbackType.NameCallback,
          input: [{ name: 'IDToken1', value: 'test-user' }],
          output: [],
        },
      ],
    });
    const nextStepPayload: Step = {
      authId: 'test-auth-id',
      callbacks: [
        {
          type: callbackType.PasswordCallback,
          input: [{ name: 'IDToken2', value: 'test-password' }],
          output: [],
        },
      ],
    };
    setupMockFetch(nextStepPayload);

    // Act
    const result = await journey({ config: mockConfig });
    if (!isJourneyClient(result)) throw new Error('Expected client');
    const nextStep = await result.next(initialStep, {});

    // Assert
    expect(nextStep).toBeDefined();
    expect(isGenericError(nextStep)).toBe(false);

    expect(mockFetch).toHaveBeenCalledTimes(2); // wellknown + next
    const request = mockFetch.mock.calls[1][0] as Request;
    expect(request.url).toBe('https://test.com/am/json/realms/root/authenticate');
    expect(request.method).toBe('POST');
    expect(await request.json()).toEqual(initialStep.payload);
    expect(nextStep).toHaveProperty('type', 'Step');
    if (nextStep && !isGenericError(nextStep)) {
      expect(nextStep.payload).toEqual(nextStepPayload);
    }
  });

  test('redirect_WellknownConfig_StoresStepAndCallsLocationAssign', async () => {
    // Arrange
    const mockStepPayload: Step = {
      callbacks: [
        {
          type: callbackType.RedirectCallback,
          input: [],
          output: [{ name: 'redirectUrl', value: 'https://sso.com/redirect' }],
        },
      ],
    };
    const step = createJourneyStep(mockStepPayload);
    const assignMock = vi.fn();
    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      assign: assignMock,
    });
    setupMockFetch();

    // Act
    const result = await journey({ config: mockConfig });
    if (!isJourneyClient(result)) throw new Error('Expected client');
    await result.redirect(step);

    // Assert
    expect(mockStorageInstance.set).toHaveBeenCalledWith({ step: step.payload });
    expect(assignMock).toHaveBeenCalledWith('https://sso.com/redirect');

    locationSpy.mockRestore();
  });

  describe('resume()', () => {
    test('resume_WithPreviousStepInStorage_CallsNextWithUrlParams', async () => {
      // Arrange
      const previousStepPayload: Step = {
        callbacks: [{ type: callbackType.RedirectCallback, input: [], output: [] }],
      };
      mockStorageInstance.get.mockResolvedValue({ step: previousStepPayload });
      const nextStepPayload: Step = { authId: 'test-auth-id', callbacks: [] };
      setupMockFetch(nextStepPayload);

      // Act
      const result = await journey({ config: mockConfig });
      if (!isJourneyClient(result)) throw new Error('Expected client');
      const resumeUrl = 'https://app.com/callback?code=123&state=abc';
      const step = await result.resume(resumeUrl, {});

      // Assert
      expect(step).toBeDefined();
      expect(mockStorageInstance.get).toHaveBeenCalledTimes(1);
      expect(mockStorageInstance.remove).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(2); // wellknown + next
      const request = mockFetch.mock.calls[1][0] as Request;
      const url = new URL(request.url);
      expect(url.origin + url.pathname).toBe('https://test.com/am/json/realms/root/authenticate');
      expect(url.searchParams.get('code')).toBe('123');
      expect(url.searchParams.get('state')).toBe('abc');
      expect(request.method).toBe('POST');
      expect(await request.json()).toEqual(previousStepPayload);
      expect(step).toHaveProperty('type', 'Step');
      if (step && !isGenericError(step)) {
        expect(step.payload).toEqual(nextStepPayload);
      }
    });

    test('resume_WithPlainStepObjectInStorage_CorrectlyResumes', async () => {
      // Arrange
      const plainStepPayload: Step = {
        callbacks: [
          { type: callbackType.TextOutputCallback, output: [{ name: 'message', value: 'Hello' }] },
        ],
        stage: 'testStage',
      };
      mockStorageInstance.get.mockResolvedValue({ step: plainStepPayload });
      const nextStepPayload: Step = { authId: 'test-auth-id', callbacks: [] };
      setupMockFetch(nextStepPayload);

      // Act
      const result = await journey({ config: mockConfig });
      if (!isJourneyClient(result)) throw new Error('Expected client');
      const resumeUrl = 'https://app.com/callback?code=123&state=abc';
      const step = await result.resume(resumeUrl, {});

      // Assert
      expect(step).toBeDefined();
      expect(mockStorageInstance.get).toHaveBeenCalledTimes(1);
      expect(mockStorageInstance.remove).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const request = mockFetch.mock.calls[1][0] as Request;
      expect(request.method).toBe('POST');
      expect(await request.json()).toEqual(plainStepPayload);
      expect(step).toHaveProperty('type', 'Step');
      if (step && !isGenericError(step)) {
        expect(step.payload).toEqual(nextStepPayload);
      }
    });

    test('resume_PreviousStepRequiredButNotFound_ThrowsError', async () => {
      // Arrange
      mockStorageInstance.get.mockResolvedValue(undefined);
      setupMockFetch();

      // Act
      const result = await journey({ config: mockConfig });
      if (!isJourneyClient(result)) throw new Error('Expected client');
      const resumeUrl = 'https://app.com/callback?code=123&state=abc';

      // Assert
      await expect(result.resume(resumeUrl)).rejects.toThrow(
        'Error: previous step information not found in storage for resume operation.',
      );
      expect(mockStorageInstance.get).toHaveBeenCalledTimes(1);
      expect(mockStorageInstance.remove).toHaveBeenCalledTimes(1);
    });

    test('resume_NoPreviousStepRequired_CallsStartWithUrlParams', async () => {
      // Arrange
      mockStorageInstance.get.mockResolvedValue(undefined);
      const mockStepResponse: Step = { authId: 'test-auth-id', callbacks: [] };
      setupMockFetch(mockStepResponse);

      // Act
      const result = await journey({ config: mockConfig });
      if (!isJourneyClient(result)) throw new Error('Expected client');
      const resumeUrl = 'https://app.com/callback?foo=bar';
      const step = await result.resume(resumeUrl, {});

      // Assert
      expect(step).toBeDefined();
      expect(mockStorageInstance.get).not.toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(2); // wellknown + start
      const request = mockFetch.mock.calls[1][0] as Request;
      const url = new URL(request.url);
      expect(url.origin + url.pathname).toBe('https://test.com/am/json/realms/root/authenticate');
      expect(step).toHaveProperty('type', 'Step');
      if (step && !isGenericError(step)) {
        expect(step.payload).toEqual(mockStepResponse);
      }
    });
  });

  describe('baseUrl normalization', () => {
    test('normalizeBaseUrl_WithoutTrailingSlash_AddsSlash', async () => {
      // Arrange
      const configWithoutSlash: JourneyClientConfig = {
        serverConfig: {
          wellknown: 'http://localhost:9443/am/oauth2/realms/root/.well-known/openid-configuration',
        },
      };
      const mockStepResponse: Step = { authId: 'test-auth-id', callbacks: [] };
      mockFetch.mockImplementation((input: RequestInfo | URL) => {
        const url = getUrlFromInput(input);
        if (url.includes('.well-known')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                ...mockWellknownResponse,
                issuer: 'http://localhost:9443/am/oauth2/realms/root',
              }),
            ),
          );
        }
        return Promise.resolve(new Response(JSON.stringify(mockStepResponse)));
      });

      // Act
      const result = await journey({ config: configWithoutSlash });
      if (!isJourneyClient(result)) throw new Error('Expected client');
      await result.start();

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const request = mockFetch.mock.calls[1][0] as Request;
      expect(request.url).toBe('http://localhost:9443/am/json/realms/root/authenticate');
    });
  });

  describe('realm inference', () => {
    test('journey_WellknownWithSubrealm_InfersRealmFromIssuer', async () => {
      // Arrange
      const alphaConfig: JourneyClientConfig = {
        serverConfig: {
          wellknown:
            'https://test.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration',
        },
      };
      const mockStepResponse: Step = { authId: 'test-auth-id', callbacks: [] };
      mockFetch.mockImplementation((input: RequestInfo | URL) => {
        const url = getUrlFromInput(input);
        if (url.includes('.well-known')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                ...mockWellknownResponse,
                issuer: 'https://test.com/am/oauth2/realms/root/realms/alpha',
              }),
            ),
          );
        }
        return Promise.resolve(new Response(JSON.stringify(mockStepResponse)));
      });

      // Act
      const result = await journey({ config: alphaConfig });
      if (!isJourneyClient(result)) throw new Error('Expected client');
      await result.start();

      // Assert
      const request = mockFetch.mock.calls[1][0] as Request;
      // Realm 'alpha' is inferred from issuer; getRealmUrlPath prepends 'root' if needed
      expect(request.url).toBe('https://test.com/am/json/realms/root/realms/alpha/authenticate');
    });

    test('journey_ExplicitRealmPath_OverridesInferredRealm', async () => {
      // Arrange
      const configWithExplicitRealm: JourneyClientConfig = {
        serverConfig: {
          wellknown:
            'https://test.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration',
        },
        realmPath: 'beta', // Explicit override
      };
      const mockStepResponse: Step = { authId: 'test-auth-id', callbacks: [] };
      mockFetch.mockImplementation((input: RequestInfo | URL) => {
        const url = getUrlFromInput(input);
        if (url.includes('.well-known')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                ...mockWellknownResponse,
                issuer: 'https://test.com/am/oauth2/realms/root/realms/alpha',
              }),
            ),
          );
        }
        return Promise.resolve(new Response(JSON.stringify(mockStepResponse)));
      });

      // Act
      const result = await journey({ config: configWithExplicitRealm });
      if (!isJourneyClient(result)) throw new Error('Expected client');
      await result.start();

      // Assert
      const request = mockFetch.mock.calls[1][0] as Request;
      // Explicit realmPath 'beta' overrides inferred; getRealmUrlPath prepends 'root'
      expect(request.url).toBe('https://test.com/am/json/realms/root/realms/beta/authenticate');
    });
  });
});
