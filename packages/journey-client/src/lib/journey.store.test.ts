/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { afterEach, describe, expect, test, vi } from 'vitest';

import type { Step } from '@forgerock/sdk-types';

import { journey } from './journey.store.js';
import { createJourneyStep } from './step.utils.js';
import { JourneyClientConfig } from './config.types.js';

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

const mockConfig: JourneyClientConfig = {
  serverConfig: {
    baseUrl: 'https://test.com',
  },
  realmPath: 'root',
};

describe('journey-client', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should initialize and return a client object with all methods', async () => {
    const client = await journey({ config: mockConfig });
    expect(client).toBeDefined();
    expect(client.start).toBeInstanceOf(Function);
    expect(client.next).toBeInstanceOf(Function);
    expect(client.redirect).toBeInstanceOf(Function);
    expect(client.resume).toBeInstanceOf(Function);
    expect(client.terminate).toBeInstanceOf(Function);
  });

  test('start() should fetch and return the first step', async () => {
    const mockStepResponse: Step = { authId: 'test-auth-id', callbacks: [] };
    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockStepResponse)));

    const client = await journey({ config: mockConfig });
    const step = await client.start();
    expect(step).toBeDefined();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const request = mockFetch.mock.calls[0][0] as Request;
    // TODO: This should be /journeys?_action=start, but the current implementation calls /authenticate
    expect(request.url).toBe('https://test.com/json/realms/root/authenticate');
    expect(step).toHaveProperty('type', 'Step');
    expect(step && step.payload).toEqual(mockStepResponse);
  });

  test('next() should send the current step and return the next step', async () => {
    const initialStepPayload = createJourneyStep({
      authId: 'test-auth-id',
      callbacks: [
        {
          type: callbackType.NameCallback,
          input: [{ name: 'IDToken1', value: 'test-user' }],
          output: [],
        },
      ],
    });
    const nextStepPayload = createJourneyStep({
      authId: 'test-auth-id',
      callbacks: [
        {
          type: callbackType.PasswordCallback,
          input: [{ name: 'IDToken2', value: 'test-password' }],
          output: [],
        },
      ],
    });
    const initialStep = initialStepPayload;

    mockFetch.mockResolvedValue(new Response(JSON.stringify(nextStepPayload)));

    const client = await journey({ config: mockConfig });
    const nextStep = await client.next(initialStep, {});
    expect(nextStep).toBeDefined();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const request = mockFetch.mock.calls[0][0] as Request;
    // TODO: This should be /journeys?_action=next, but the current implementation calls /authenticate
    expect(request.url).toBe('https://test.com/json/realms/root/authenticate');
    expect(request.method).toBe('POST');
    expect(await request.json()).toEqual(initialStep);
    expect(nextStep).toHaveProperty('type', 'Step');
    expect(nextStep && nextStep.payload).toEqual(nextStepPayload);
  });

  test('redirect() should store the step and call location.assign', async () => {
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

    const client = await journey({ config: mockConfig });
    await client.redirect(step);

    expect(mockStorageInstance.set).toHaveBeenCalledWith({ step: step.payload });
    expect(assignMock).toHaveBeenCalledWith('https://sso.com/redirect');

    locationSpy.mockRestore();
  });

  describe('resume()', () => {
    test('should call next() with URL params when a previous step is in storage', async () => {
      const previousStepPayload: Step = {
        callbacks: [{ type: callbackType.RedirectCallback, input: [], output: [] }],
      };
      mockStorageInstance.get.mockResolvedValue({ step: previousStepPayload });

      const nextStepPayload: Step = { authId: 'test-auth-id', callbacks: [] };
      mockFetch.mockResolvedValue(new Response(JSON.stringify(nextStepPayload)));

      const client = await journey({ config: mockConfig });
      const resumeUrl = 'https://app.com/callback?code=123&state=abc';

      const step = await client.resume(resumeUrl, {});
      expect(step).toBeDefined();

      expect(mockStorageInstance.get).toHaveBeenCalledTimes(1);
      expect(mockStorageInstance.remove).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const request = mockFetch.mock.calls[0][0] as Request;

      // TODO: This should be /journeys?_action=next, but the current implementation calls /authenticate
      const url = new URL(request.url);
      expect(url.origin + url.pathname).toBe('https://test.com/json/realms/root/authenticate');
      expect(url.searchParams.get('code')).toBe('123');
      expect(url.searchParams.get('state')).toBe('abc');

      expect(request.method).toBe('POST');
      expect(await request.json()).toEqual(previousStepPayload);
      expect(step).toHaveProperty('type', 'Step');
      expect(step && step.payload).toEqual(nextStepPayload);
    });

    test('should correctly resume with a plain Step object from storage', async () => {
      const plainStepPayload: Step = {
        callbacks: [
          { type: callbackType.TextOutputCallback, output: [{ name: 'message', value: 'Hello' }] },
        ],
        stage: 'testStage',
      };
      mockStorageInstance.get.mockResolvedValue({ step: plainStepPayload });

      const nextStepPayload: Step = { authId: 'test-auth-id', callbacks: [] };
      mockFetch.mockResolvedValue(new Response(JSON.stringify(nextStepPayload)));

      const client = await journey({ config: mockConfig });
      const resumeUrl = 'https://app.com/callback?code=123&state=abc';

      const step = await client.resume(resumeUrl, {});
      expect(step).toBeDefined();

      expect(mockStorageInstance.get).toHaveBeenCalledTimes(1);
      expect(mockStorageInstance.remove).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.method).toBe('POST');
      expect(await request.json()).toEqual(plainStepPayload); // Expect the plain payload to be sent
      expect(step).toHaveProperty('type', 'Step'); // The returned step should still be an JourneyStep instance
      expect(step && step.payload).toEqual(nextStepPayload);
    });

    test('should throw an error if a previous step is required but not found', async () => {
      mockStorageInstance.get.mockResolvedValue(undefined);

      const client = await journey({ config: mockConfig });
      const resumeUrl = 'https://app.com/callback?code=123&state=abc';

      await expect(client.resume(resumeUrl)).rejects.toThrow(
        'Error: previous step information not found in storage for resume operation.',
      );
      expect(mockStorageInstance.get).toHaveBeenCalledTimes(1);
      expect(mockStorageInstance.remove).toHaveBeenCalledTimes(1);
    });

    test('should call start() with URL params when no previous step is required', async () => {
      mockStorageInstance.get.mockResolvedValue(undefined);

      const mockStepResponse: Step = { authId: 'test-auth-id', callbacks: [] };
      mockFetch.mockResolvedValue(new Response(JSON.stringify(mockStepResponse)));

      const client = await journey({ config: mockConfig });
      const resumeUrl = 'https://app.com/callback?foo=bar';

      const step = await client.resume(resumeUrl, {});
      expect(step).toBeDefined();

      expect(mockStorageInstance.get).not.toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const request = mockFetch.mock.calls[0][0] as Request;

      // TODO: This should be /journeys?_action=start, but the current implementation calls /authenticate
      const url = new URL(request.url);
      expect(url.origin + url.pathname).toBe('https://test.com/json/realms/root/authenticate');
      expect(step).toHaveProperty('type', 'Step');
      expect(step && step.payload).toEqual(mockStepResponse);
    });
  });

  // TODO: Add tests for endSession when the test environment AbortSignal issue is resolved
  // test('endSession() should call the sessions endpoint with DELETE method', async () => {
  //   mockFetch.mockResolvedValue(new Response('', { status: 200 }));

  //   const client = await journey({ config: mockConfig });
  //   await client.endSession();

  //   expect(mockFetch).toHaveBeenCalledTimes(1);
  //   const request = mockFetch.mock.calls[0][0] as Request;
  //   expect(request.url).toBe('https://test.com/json/realms/root/sessions/');
  //   expect(request.method).toBe('DELETE');
  // });

  // test('endSession() should handle query parameters', async () => {
  //   mockFetch.mockResolvedValue(new Response('', { status: 200 }));

  //   const client = await journey({ config: mockConfig });
  //   await client.endSession({ query: { foo: 'bar' } });

  //   expect(mockFetch).toHaveBeenCalledTimes(1);
  //   const request = mockFetch.mock.calls[0][0] as Request;
  //   expect(request.url).toBe('https://test.com/json/realms/root/sessions/?foo=bar');
  //   expect(request.method).toBe('DELETE');
  // });
});
