/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createJourneyStore } from './journey.store.js';
import { JourneyClientConfig, StepOptions } from './config.types.js';
import { journeyApi } from './journey.api.js';
import { setConfig } from './journey.slice.js';
import { createStorage } from '@forgerock/storage';
import { GenericError, callbackType, type Step } from '@forgerock/sdk-types';
import FRStep from './fr-step.js';
import RedirectCallback from './callbacks/redirect-callback.js';
import { logger as loggerFn, LogLevel, CustomLogger } from '@forgerock/sdk-logger';
import { RequestMiddleware } from '@forgerock/sdk-request-middleware';

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
    start: async (options?: StepOptions) => {
      const { data } = await store.dispatch(journeyApi.endpoints.start.initiate(options));
      return data ? new FRStep(data) : undefined;
    },

    /**
     * Submits the current Step payload to the authentication API and retrieves the next FRStep in the journey.
     * The `step` to be submitted is provided within the `options` object.
     *
     * @param options An object containing the current Step payload and optional StepOptions.
     * @returns A Promise that resolves to the next FRStep in the journey, or undefined if the journey ends.
     */
    next: async (step: Step, options?: StepOptions) => {
      const { data } = await store.dispatch(journeyApi.endpoints.next.initiate({ step, options }));
      return data ? new FRStep(data) : undefined;
    },

    redirect: async (step: FRStep) => {
      const cb = step.getCallbackOfType(callbackType.RedirectCallback) as RedirectCallback;
      if (!cb) {
        throw new Error('RedirectCallback not found on step');
      }
      const redirectUrl = cb.getRedirectUrl();
      const err = await stepStorage.set({ step: step.payload });
      if (err && (err as GenericError).type) {
        log.warn('Failed to persist step before redirect', err);
      }
      window.location.assign(redirectUrl);
    },

    resume: async (url: string, options?: StepOptions) => {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('code');
      const state = parsedUrl.searchParams.get('state');
      const form_post_entry = parsedUrl.searchParams.get('form_post_entry');
      const responsekey = parsedUrl.searchParams.get('responsekey');

      let previousStep: Step | undefined; // Declare previousStep here

      function requiresPreviousStep() {
        return (code && state) || form_post_entry || responsekey;
      }

      // Type guard for GenericError (assuming GenericError has 'error' and 'message' properties)
      function isGenericError(obj: unknown): obj is GenericError {
        return typeof obj === 'object' && obj !== null && 'error' in obj && 'message' in obj;
      }

      // Type guard for { step: FRStep }
      function isStoredStep(obj: unknown): obj is { step: Step } {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'step' in obj &&
          typeof (obj as any).step === 'object'
        );
      }

      if (requiresPreviousStep()) {
        const stored = await stepStorage.get();

        if (stored) {
          if (isGenericError(stored)) {
            // If the stored item is a GenericError, it means something went wrong during storage/retrieval
            // or the previous step was an error.
            throw new Error(`Error retrieving previous step: ${stored.message || stored.error}`);
          } else if (isStoredStep(stored)) {
            previousStep = stored.step;
          }
        }
        await stepStorage.remove();

        if (!previousStep) {
          throw new Error(
            'Error: previous step information not found in storage for resume operation.',
          );
        }
      }

      const nextOptions = {
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
        return await self.next(previousStep, nextOptions);
      } else {
        return await self.start(nextOptions);
      }
    },
  };
  return self;
}
