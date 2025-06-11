/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import {
  CallbackType,
  Config,
  FRLoginFailure,
  FRLoginSuccess,
  FRStep,
  NameCallback,
  PasswordCallback,
} from '@forgerock/javascript-sdk';
import { Effect } from 'effect';
import { start, logout, checkFRStep, callNext, getTokens } from './util-effects/index.js';
import { deviceClient } from '@forgerock/device-client';

const checkForLoginSuccess = (step: FRStep | FRLoginSuccess | FRLoginFailure) => {
  if (step.type === 'LoginSuccess') {
    return Effect.succeed(step);
  } else if (step.type === 'LoginFailure') {
    return Effect.fail(new Error(`Login failed`));
  } else {
    return Effect.fail(
      new Error(`Unexpected step, expected to be in a LoginSuccess but got ${step.type}`),
    );
  }
};
/**
 * @function autoscript
 * @description Steps through an authentication journey to test device management
 * @param {function} handleDevice A function that manages the device through the device client
 * @returns {Effect.Effect<string, Error, never>} An effect to run the test
 */
export const LoginAndGetClient = Effect.gen(function* () {
  /**
   * Make sure this `un` is a real user
   * this is a manual test and requires a real tenant and a real user
   * that has devices.
   */
  const url = new URL(window.location.href);
  const un = url.searchParams.get('un') || 'devicetestuser';
  const pw = url.searchParams.get('pw') || 'password';
  const amUrl = url.searchParams.get('amUrl') || 'https://openam-sdks.forgeblocks.com/am';
  const realmPath = url.searchParams.get('realmPath') || 'alpha';
  const platformHeader = url.searchParams.get('platformHeader') === 'true' ? true : false;
  const tree = url.searchParams.get('tree') || 'selfservice';

  const config = {
    realmPath,
    tree,
    clientId: 'WebOAuthClient',
    scope: 'profile email me.read openid',
    serverConfig: {
      baseUrl: amUrl,
      timeout: 3000,
    },
  };

  yield* Effect.try(() =>
    Config.set({
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
    }),
  );
  yield* logout;

  yield* start.pipe(
    Effect.flatMap((step) => checkFRStep(step)),
    Effect.map((step) => {
      step.getCallbackOfType<NameCallback>(CallbackType.NameCallback).setName(un);
      step.getCallbackOfType<PasswordCallback>(CallbackType.PasswordCallback).setPassword(pw);
      return step;
    }),
    Effect.flatMap((step) => callNext(step)),
    /**
     * Don't explicitly need this but if the journey changes
     * maybe we dont get a LoginSuccess
     */
    Effect.flatMap((step) => checkForLoginSuccess(step)),
    Effect.flatMap(() => getTokens),
  );

  const client = deviceClient(config);
  return client;
});

export const handleError = (err: unknown) => {
  console.error(err);
  document.body.innerHTML = `<p class="Test_Failed">Test script failed: ${err}</p>`;
};
