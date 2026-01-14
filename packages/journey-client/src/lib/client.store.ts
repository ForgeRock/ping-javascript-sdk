/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { logger as loggerFn, LogLevel, CustomLogger } from '@forgerock/sdk-logger';
import { callbackType } from '@forgerock/sdk-types';
import { isGenericError } from '@forgerock/sdk-utilities';

import type { GenericError } from '@forgerock/sdk-types';

import type { RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { Step } from '@forgerock/sdk-types';

import { createJourneyStore } from './client.store.utils.js';
import { journeyApi } from './journey.api.js';
import { setConfig } from './journey.slice.js';
import { createStorage } from '@forgerock/storage';
import { createJourneyObject } from './journey.utils.js';
import { wellknownApi } from './wellknown.api.js';
import { createWellknownError } from './wellknown.utils.js';
import { isValidWellknownUrl } from '@forgerock/sdk-utilities';
import { inferRealmFromIssuer, inferBaseUrlFromWellknown } from './wellknown.utils.js';

import type { JourneyStep } from './step.utils.js';
import type { JourneyClientConfig, InternalJourneyClientConfig } from './config.types.js';
import type { RedirectCallback } from './callbacks/redirect-callback.js';
import { NextOptions, StartParam, ResumeOptions } from './interfaces.js';
import type { JourneyLoginFailure } from './login-failure.utils.js';
import type { JourneyLoginSuccess } from './login-success.utils.js';

/** Result type for journey client methods. */
type JourneyResult =
  | JourneyStep
  | JourneyLoginSuccess
  | JourneyLoginFailure
  | GenericError
  | undefined;

/** The journey client instance returned by the `journey()` function. */
export interface JourneyClient {
  start: (options?: StartParam) => Promise<JourneyResult>;
  next: (step: JourneyStep, options?: NextOptions) => Promise<JourneyResult>;
  redirect: (step: JourneyStep) => Promise<void>;
  resume: (url: string, options?: ResumeOptions) => Promise<JourneyResult>;
  terminate: (options?: { query?: Record<string, string> }) => Promise<unknown>;
}

/**
 * Type guard to check if a value is a JourneyClient (not a GenericError).
 */
export function isJourneyClient(value: JourneyClient | GenericError): value is JourneyClient {
  return !isGenericError(value);
}

/**
 * Normalizes the serverConfig to ensure baseUrl has a trailing slash.
 * This is required for the resolve() function to work correctly with context paths like /am.
 */
function normalizeBaseUrl(baseUrl: string): string {
  if (baseUrl.charAt(baseUrl.length - 1) !== '/') {
    return baseUrl + '/';
  }
  return baseUrl;
}

/**
 * Creates a journey client for AM authentication tree/journey interactions.
 *
 * Journey-client is designed specifically for ForgeRock Access Management (AM) servers.
 * It uses AM-proprietary endpoints for callback-based authentication trees.
 *
 * @example
 * ```typescript
 * // Basic usage - baseUrl and realmPath are inferred from wellknown
 * const client = await journey({
 *   config: {
 *     serverConfig: {
 *       wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
 *     },
 *   },
 * });
 *
 * // With explicit realmPath (when inference isn't desired)
 * const client = await journey({
 *   config: {
 *     serverConfig: {
 *       wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
 *     },
 *     realmPath: 'alpha',
 *   },
 * });
 * ```
 *
 * @param options - Configuration options for the journey client
 * @param options.config - Server configuration with required wellknown URL
 * @param options.requestMiddleware - Optional middleware for request customization
 * @param options.logger - Optional logger configuration
 * @returns A journey client instance, or a GenericError if configuration fails
 */
export async function journey({
  config,
  requestMiddleware,
  logger,
}: {
  config: JourneyClientConfig;
  requestMiddleware?: RequestMiddleware[];
  logger?: {
    level: LogLevel;
    custom?: CustomLogger;
  };
}): Promise<JourneyClient | GenericError> {
  const log = loggerFn({ level: logger?.level || 'error', custom: logger?.custom });

  // Create the store first (config will be set after wellknown fetch)
  const store = createJourneyStore({ requestMiddleware, logger: log });

  const { wellknown, paths, timeout } = config.serverConfig;

  // Step 1: Validate wellknown URL
  if (!isValidWellknownUrl(wellknown)) {
    const message = `Invalid wellknown URL: ${wellknown}. URL must use HTTPS (or HTTP for localhost).`;
    const error: GenericError = {
      error: 'Invalid wellknown URL',
      message,
      type: 'wellknown_error',
    };
    log.error(message);
    return error;
  }

  // Step 2: Infer baseUrl from wellknown URL
  // This only works for ForgeRock AM URLs (looks for /oauth2/ in path)
  const resolvedBaseUrl = inferBaseUrlFromWellknown(wellknown);
  if (!resolvedBaseUrl) {
    const message =
      'Journey-client is designed for ForgeRock AM servers only. ' +
      `Unable to infer baseUrl from wellknown URL: ${wellknown}. ` +
      'The wellknown URL must contain "/oauth2/" in the path (standard AM format). ' +
      'For PingOne or other OIDC providers, use davinci-client or oidc-client instead.';
    const error: GenericError = {
      error: 'AM server required',
      message,
      type: 'wellknown_error',
    };
    log.error(message);
    return error;
  }

  // Step 3: Fetch the well-known configuration
  const { data: wellknownResponse, error: fetchError } = await store.dispatch(
    wellknownApi.endpoints.configuration.initiate(wellknown),
  );

  if (fetchError || !wellknownResponse) {
    const error = createWellknownError(fetchError);
    log.error(`${error.error}: ${error.message}`);
    return error;
  }

  // Step 4: Infer realmPath from the issuer URL if not provided
  const resolvedRealm = config.realmPath ?? inferRealmFromIssuer(wellknownResponse.issuer);

  // Step 5: Build the resolved internal configuration
  const resolvedConfig: InternalJourneyClientConfig = {
    serverConfig: {
      baseUrl: normalizeBaseUrl(resolvedBaseUrl),
      paths,
      timeout,
    },
    realmPath: resolvedRealm,
    middleware: config.middleware,
    wellknownResponse,
  };

  // Dispatch the resolved config to the store
  store.dispatch(setConfig(resolvedConfig));

  const stepStorage = createStorage<{ step: Step }>({
    type: 'sessionStorage',
    name: 'journey-step',
  });

  const self = {
    start: async (options?: StartParam) => {
      const { data } = await store.dispatch(journeyApi.endpoints.start.initiate(options));
      if (!data) {
        const error: GenericError = {
          error: 'no_response_data',
          message: 'No data received from server when starting journey',
          type: 'unknown_error',
        };
        return error;
      }
      return createJourneyObject(data);
    },

    /**
     * Submits the current Step payload to the authentication API and retrieves the next JourneyStep in the journey.
     * The `step` to be submitted is provided within the `options` object.
     *
     * @param step The current JourneyStep containing user input to submit.
     * @param options Optional configuration for the request.
     * @returns A Promise that resolves to a JourneyStep, JourneyLoginSuccess, JourneyLoginFailure, or GenericError.
     */
    next: async (step: JourneyStep, options?: NextOptions) => {
      const { data } = await store.dispatch(journeyApi.endpoints.next.initiate({ step, options }));
      if (!data) {
        const error: GenericError = {
          error: 'no_response_data',
          message: 'No data received from server when submitting step',
          type: 'unknown_error',
        };
        return error;
      }
      return createJourneyObject(data);
    },

    // TODO: Remove the actual redirect from this method and just return the URL to the caller
    redirect: async (step: JourneyStep) => {
      const cb = step.getCallbackOfType(callbackType.RedirectCallback) as RedirectCallback;
      if (!cb) {
        // TODO: Remove throwing errors from SDK and use Result types instead
        throw new Error('RedirectCallback not found on step');
      }

      const redirectUrl = cb.getRedirectUrl();
      if (!redirectUrl || typeof redirectUrl !== 'string') {
        throw new Error('Redirect URL not found on RedirectCallback');
      }

      const err = await stepStorage.set({ step: step.payload });
      if (isGenericError(err)) {
        log.warn('Failed to persist step before redirect', err);
      }
      window.location.assign(redirectUrl);
    },

    resume: async (
      url: string,
      options?: ResumeOptions,
    ): Promise<ReturnType<typeof createJourneyObject>> => {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('code');
      const state = parsedUrl.searchParams.get('state');
      const form_post_entry = parsedUrl.searchParams.get('form_post_entry');
      const responsekey = parsedUrl.searchParams.get('responsekey');

      let previousStep: JourneyStep | undefined; // Declare previousStep here

      function requiresPreviousStep() {
        return (code && state) || form_post_entry || responsekey;
      }

      // Type guard for { step: JourneyStep }
      function isStoredStep(obj: unknown): obj is { step: Step } {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'step' in obj &&
          typeof (obj as { step: Step }).step === 'object'
        );
      }

      if (requiresPreviousStep()) {
        const stored = await stepStorage.get();

        if (stored) {
          if (isGenericError(stored)) {
            // If the stored item is a GenericError, it means something went wrong during storage/retrieval
            // or the previous step was an error.
            // TODO: Remove throwing errors from SDK and use Result types instead
            throw new Error(`Error retrieving previous step: ${stored.message || stored.error}`);
          } else if (isStoredStep(stored)) {
            previousStep = createJourneyObject(stored.step) as JourneyStep;
          }
        }
        await stepStorage.remove();

        if (!previousStep) {
          throw new Error(
            'Error: previous step information not found in storage for resume operation.',
          );
        }
      }

      const resumeOptions = {
        ...options,
        query: {
          ...(options && options.query), // Spread options.query first
          ...(code && { code }),
          ...(state && { state }),
          ...(form_post_entry && { form_post_entry }),
          ...(responsekey && { responsekey }),
        },
      };

      if (previousStep) {
        return await self.next(previousStep, resumeOptions);
      } else {
        // TODO: We should better handle this type misalignment
        const startOptions = resumeOptions as StartParam;
        return await self.start(startOptions);
      }
    },

    /**
     * Ends the current authentication session by calling the `/sessions` endpoint.
     * This will invalidate the current session and clean up any server-side state.
     *
     * @param options Optional StepOptions containing query parameters.
     * @returns A Promise that resolves to void on success, or GenericError on failure.
     */
    terminate: async (options?: {
      query?: Record<string, string>;
    }): Promise<void | GenericError> => {
      const { error } = await store.dispatch(journeyApi.endpoints.terminate.initiate(options));
      if (error) {
        return {
          error: 'terminate_failed',
          message:
            'status' in error
              ? `Failed to terminate session: ${error.status}`
              : 'Failed to terminate session',
          type: 'unknown_error',
        };
      }
    },
  };
  return self;
}
