/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import {
  FRAuth,
  CallbackType,
  NameCallback,
  TokenManager,
  SessionManager,
  Config,
  PasswordCallback,
} from '@forgerock/javascript-sdk';
import { deviceClient } from '@forgerock/device-client';
import { Effect } from 'effect';
import { DeviceClient } from './types.js';

/**
 * @function autoscript
 * @description Steps through an authentication journey to test device management
 * @param {function} handleDevice A function that manages the device through the device client
 * @returns {Effect.Effect<string, Error, never>} An effect to run the test
 */
export const autoscript = (
  handleDevice: (client: DeviceClient) => Effect.Effect<void, Error, never>,
) =>
  Effect.gen(function* () {
    const url = new URL(window.location.href);
    const amUrl = url.searchParams.get('amUrl') || 'https://openam-sdks.forgeblocks.com/am';
    const realmPath = url.searchParams.get('realmPath') || 'alpha';
    const platformHeader = url.searchParams.get('platformHeader') === 'true' ? true : false;
    const tree = url.searchParams.get('tree') || 'selfservice';

    /**
     * Make sure this `un` is a real user
     * this is a manual test and requires a real tenant and a real user
     * that has devices.
     */
    const un = url.searchParams.get('un') || 'devicetestuser';
    const pw = url.searchParams.get('pw') || 'password';

    // Configure the SDK
    yield* Effect.try({
      try: () => {
        Config.set({
          middleware: [
            (req, action, next) => {
              switch (action.type) {
                case 'START_AUTHENTICATE':
                  if (
                    action.payload.type === 'service' &&
                    typeof action.payload.tree === 'string'
                  ) {
                    console.log('Starting authentication with service');
                  }
                  break;
                case 'AUTHENTICATE':
                  if (
                    action.payload.type === 'service' &&
                    typeof action.payload.tree === 'string'
                  ) {
                    console.log('Continuing authentication with service');
                  }
                  break;
              }
              next();
            },
          ],
          platformHeader,
          realmPath,
          tree,
          clientId: 'WebOAuthClient',
          scope: 'profile email me.read openid',
          redirectUri: `${window.location.origin}/src/_callback/index.html`,
          serverConfig: {
            baseUrl: amUrl,
            timeout: 3000,
          },
        });
        console.log('Configured the SDK');
      },
      catch: (err) => new Error(`SDK configuration failed: ${err}`),
    });

    // Log out any user before starting auth journey
    yield* Effect.tryPromise({
      try: () => SessionManager.logout(),
      catch: (err) => new Error(`Logout failed: ${err}`),
    });

    // Start the authentication journey
    const step = yield* Effect.tryPromise({
      try: () => FRAuth.start(),
      catch: (err) => new Error(`Authentication start failed: ${err}`),
    });

    // Login with username/password
    yield* Effect.tryPromise({
      try: () => {
        if (step.type !== 'Step') {
          return Promise.reject(
            new Error('Expected a step, but received a login success or failure.'),
          );
        }

        console.log('Set values on auth tree callbacks');
        step.getCallbackOfType<NameCallback>(CallbackType.NameCallback).setName(un);
        step.getCallbackOfType<PasswordCallback>(CallbackType.PasswordCallback).setPassword(pw);
        return FRAuth.next(step);
      },
      catch: (err) => new Error(`Login failed: ${err}`),
    });

    // Get tokens
    yield* Effect.tryPromise({
      try: () => TokenManager.getTokens(),
      catch: (err) => new Error(`Failed to get tokens: ${err}`),
    });

    // Create a device client
    const client = yield* Effect.sync(() => {
      return deviceClient({
        realmPath,
        tree,
        clientId: 'WebOAuthClient',
        scope: 'profile email me.read openid',
        serverConfig: {
          baseUrl: amUrl,
          timeout: 3000,
        },
      });
    });

    // Test the device
    yield* handleDevice(client);

    // Finish autoscript
    yield* Effect.sync(() => {
      document.body.innerHTML = `<p class="Test_Complete">Test script complete</p>`;
    });

    return 'Test script complete';
  });

// Display error message
export const handleError = (err: unknown) => {
  console.error(err);
  document.body.innerHTML = `<p class="Test_Failed">Test script failed: ${err}</p>`;
};
