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
  FRStep,
  CallbackType,
  NameCallback,
  TokenManager,
  SessionManager,
  Config,
  PasswordCallback,
} from '@forgerock/javascript-sdk';
import { deviceClient } from '@forgerock/device-client';
import { delay as rxDelay, mergeMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { DeviceClient } from './types.js';

export function autoscript(handleDevice: (client: DeviceClient) => Promise<void>) {
  const delay = 0;

  const url = new URL(window.location.href);
  const amUrl = url.searchParams.get('amUrl') || 'https://openam-sdks.forgeblocks.com/am';
  const realmPath = url.searchParams.get('realmPath') || 'alpha';
  /**
   * Make sure this `un` is a real user
   * this is a manual test and requires a real tenant and a real user
   * that has devices.
   */
  const un = url.searchParams.get('un') || 'sdkuser';
  const platformHeader = url.searchParams.get('platformHeader') === 'true' ? true : false;
  const pw = url.searchParams.get('pw') || 'password';
  const tree = url.searchParams.get('tree') || 'selfservice';

  console.log('Configure the SDK');
  Config.set({
    middleware: [
      (req, action, next) => {
        switch (action.type) {
          case 'START_AUTHENTICATE':
            if (action.payload.type === 'service' && typeof action.payload.tree === 'string') {
              console.log('Starting authentication with service');
            }
            break;
          case 'AUTHENTICATE':
            if (action.payload.type === 'service' && typeof action.payload.tree === 'string') {
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

  console.log(`${window.location.origin}/_callback/index.html`);
  try {
    SessionManager.logout();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // Do nothing
  }

  console.log('Initiate first step with `undefined`');
  // Wrapping in setTimeout to give the test time to bind listener to console.log
  setTimeout(function () {
    from(FRAuth.start())
      .pipe(
        mergeMap((step: FRStep) => {
          console.log('Set values on auth tree callbacks');
          step.getCallbackOfType<NameCallback>(CallbackType.NameCallback).setName(un);
          step.getCallbackOfType<PasswordCallback>(CallbackType.PasswordCallback).setPassword(pw);
          return FRAuth.next(step);
        }),
        rxDelay(delay),
        mergeMap(async () => {
          try {
            const tokens = await TokenManager.getTokens();
            console.log('tokens', tokens);
            return tokens;
          } catch (err) {
            console.log(err);
          }
          return false;
        }),
        rxDelay(delay),
        mergeMap(async () => {
          const client = deviceClient({
            realmPath,
            tree,
            clientId: 'WebOAuthClient',
            scope: 'profile email me.read openid',
            serverConfig: {
              baseUrl: amUrl,
              timeout: 3000,
            },
          });

          await handleDevice(client);
        }),
      )
      .subscribe({
        error: (err) => {
          console.log(`Error: ${err.message}`);
          document.body.innerHTML = `<p class="Test_Complete">${err.message}</p>`;
        },
        complete: () => {
          console.log('Test script complete');
          document.body.innerHTML = `<p class="Test_Complete">Test script complete</p>`;
        },
      });
  }, 250);
}
