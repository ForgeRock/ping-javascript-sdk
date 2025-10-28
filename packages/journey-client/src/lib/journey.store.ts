/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { logger as loggerFn, LogLevel, CustomLogger } from '@forgerock/sdk-logger';
import { callbackType } from '@forgerock/sdk-types';

import type { RequestMiddleware } from '@forgerock/sdk-request-middleware';
import type { GenericError, Step } from '@forgerock/sdk-types';

import { createJourneyStore } from './journey.store.utils.js';
import { journeyApi } from './journey.api.js';
import { setConfig } from './journey.slice.js';
import { createStorage } from '@forgerock/storage';
import { createJourneyObject } from './journey.utils.js';

import type { JourneyStep } from './step.utils.js';
import type { JourneyClientConfig } from './config.types.js';
import type { RedirectCallback } from './callbacks/redirect-callback.js';
import { NextOptions, StartParam, ResumeOptions } from './interfaces.js';

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
}) {
  const log = loggerFn({ level: logger?.level || 'error', custom: logger?.custom });

  const store = createJourneyStore({ requestMiddleware, logger: log, config });
  store.dispatch(setConfig(config));

  const stepStorage = createStorage<{ step: Step }>({
    type: 'sessionStorage',
    name: 'journey-step',
  });

  const self = {
    start: async (options?: StartParam) => {
      const { data } = await store.dispatch(journeyApi.endpoints.start.initiate(options));
      return data ? createJourneyObject(data) : undefined;
    },

    /**
     * Submits the current Step payload to the authentication API and retrieves the next JourneyStep in the journey.
     * The `step` to be submitted is provided within the `options` object.
     *
     * @param options An object containing the current Step payload and optional JourneyClientConfig.
     * @returns A Promise that resolves to the next JourneyStep in the journey, or undefined if the journey ends.
     */
    next: async (step: JourneyStep, options?: NextOptions) => {
      const { data } = await store.dispatch(journeyApi.endpoints.next.initiate({ step, options }));
      return data ? createJourneyObject(data) : undefined;
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
      if (err && (err as GenericError).error) {
        log.warn('Failed to persist step before redirect', err);
      }
      window.location.assign(redirectUrl);
    },

    resume: async (
      url: string,
      options?: ResumeOptions,
    ): Promise<ReturnType<typeof createJourneyObject> | undefined> => {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('code');
      const state = parsedUrl.searchParams.get('state');
      const form_post_entry = parsedUrl.searchParams.get('form_post_entry');
      const responsekey = parsedUrl.searchParams.get('responsekey');

      let previousStep: JourneyStep | undefined; // Declare previousStep here

      function requiresPreviousStep() {
        return (code && state) || form_post_entry || responsekey;
      }

      // Type guard for GenericError (assuming GenericError has 'error' and 'message' properties)
      function isGenericError(obj: unknown): obj is GenericError {
        return typeof obj === 'object' && obj !== null && 'error' in obj && 'message' in obj;
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
     * @returns A Promise that resolves when the session is successfully ended.
     */
    terminate: async (options?: { query?: Record<string, string> }) => {
      const { data } = await store.dispatch(journeyApi.endpoints.terminate.initiate(options));
      return data;
    },
  };
  return self;
}
