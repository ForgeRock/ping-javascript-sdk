/*
 *
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import { deviceClient } from '@forgerock/device-client';
import type { ConfigOptions, DeviceClient } from '@forgerock/device-client/types';
import {
  callbackType,
  journey,
  NameCallback,
  PasswordCallback,
  StepType,
} from '@forgerock/journey-client';
import type {
  JourneyClient,
  JourneyClientConfig,
  JourneyResult,
  JourneyStep,
} from '@forgerock/journey-client/types';
import { oidc } from '@forgerock/oidc-client';
import type { OidcClient, OidcConfig, UserInfoResponse } from '@forgerock/oidc-client/types';
import { Console, Effect } from 'effect';

let cachedOidcClient: OidcClient | null = null;

const oidcClientOrThrow = (): OidcClient => {
  if (!cachedOidcClient) {
    throw new Error('OIDC client not initialized');
  }
  return cachedOidcClient;
};

const checkForStep = (step: JourneyResult) =>
  Effect.try({
    try: () => {
      if (step && 'type' in step && step.type === StepType.Step) {
        return step;
      }
      throw new Error(`Unexpected step type: ${JSON.stringify(step)}`);
    },
    catch: (err) => new Error(`Failed to start authentication: ${err}`),
  });

const callNext = (client: JourneyClient, step: JourneyStep) =>
  Effect.tryPromise({
    try: () => client.next(step),
    catch: (err) => new Error(`Failed to proceed to next step: ${err}`),
  }).pipe(Effect.tap((next) => Console.log('Got next step', next)));

const checkForLoginSuccess = (result: JourneyResult) => {
  if (result && 'type' in result && result.type === StepType.LoginSuccess) {
    return Effect.succeed(result);
  } else if (result && 'type' in result && result.type === StepType.LoginFailure) {
    return Effect.fail(new Error(`Login failed`));
  } else {
    return Effect.fail(
      new Error(
        `Unexpected step, expected to be in a LoginSuccess but got ${JSON.stringify(result)}`,
      ),
    );
  }
};

export const LoginAndGetClient = Effect.gen(function* () {
  const url = new URL(window.location.href);
  const amUrl = url.searchParams.get('amUrl') || 'https://openam-sdks.forgeblocks.com/am';
  const realmPath = url.searchParams.get('realmPath') || 'alpha';
  const tree = url.searchParams.get('tree') || 'selfservice';

  /**
   * Make sure this `un` is a real user
   * this is a manual test and requires a real tenant and a real user
   * that has devices.
   */
  const un = url.searchParams.get('un') || 'devicetestuser';
  const pw = url.searchParams.get('pw') || 'password';

  const deviceConfig: ConfigOptions = {
    realmPath,
    serverConfig: {
      baseUrl: amUrl,
      timeout: 3000,
    },
  };

  const realmSegment = realmPath ? `/realms/root/realms/${realmPath}` : '';
  const wellknown = `${amUrl.replace(/\/$/, '')}/oauth2${realmSegment}/.well-known/openid-configuration`;
  const redirectUri = `${window.location.origin}/src/_callback/index.html`;

  const journeyConfig: JourneyClientConfig = {
    serverConfig: {
      wellknown,
    },
  };

  const oidcConfig: OidcConfig = {
    clientId: 'WebOAuthClient',
    scope: 'profile email me.read openid',
    redirectUri,
    serverConfig: {
      wellknown,
    },
  };

  const journeyClient = yield* Effect.tryPromise({
    try: () => journey({ config: journeyConfig }),
    catch: (err) => new Error(`Failed to initialize journey client: ${err}`),
  });

  const oidcClient = yield* Effect.tryPromise({
    try: () => oidc({ config: oidcConfig }),
    catch: (err) => new Error(`Failed to initialize OIDC client: ${err}`),
  });

  if ('error' in oidcClient) {
    return yield* Effect.fail(new Error(`Failed to initialize OIDC client: ${oidcClient.error}`));
  }

  cachedOidcClient = oidcClient;

  yield* Effect.tryPromise({
    try: () => oidcClientOrThrow().user.logout(),
    catch: (err) => new Error(`Logout failed: ${err}`),
  }).pipe(Effect.catchAll((err) => Console.warn('Logout failed, continuing:', err)));

  yield* Effect.tryPromise({
    try: () => journeyClient.start({ journey: tree }),
    catch: (err) => new Error(`Authentication start failed: ${err}`),
  }).pipe(
    Effect.tap((step) => Console.log('Called start', step)),
    Effect.flatMap((step) => checkForStep(step)),
    Effect.map((step) => {
      step.getCallbackOfType<NameCallback>(callbackType.NameCallback).setName(un);
      step.getCallbackOfType<PasswordCallback>(callbackType.PasswordCallback).setPassword(pw);

      return step;
    }),
    Effect.flatMap((step) => callNext(journeyClient, step)),
    /**
     * Don't explicitly need this but if the journey changes
     * maybe we dont get a LoginSuccess
     */
    Effect.flatMap((step) => checkForLoginSuccess(step)),
    Effect.flatMap(() =>
      Effect.tryPromise({
        try: () => oidcClientOrThrow().token.get({ backgroundRenew: true }),
        catch: (err) => new Error(`Failed to get tokens: ${err}`),
      }).pipe(Effect.tap((tokens) => Console.log('Got Tokens', tokens))),
    ),
  );

  const client: DeviceClient = deviceClient(deviceConfig);
  return client;
});

export const getUser = Effect.tryPromise({
  try: async (): Promise<UserInfoResponse> => {
    const response = await oidcClientOrThrow().user.info();
    if ('error' in response) {
      throw new Error(`Failed to get user info: ${response.error}`);
    }
    return response;
  },
  catch: (err) => new Error(`Failed to get current user: ${err}`),
});

export const handleError = (err: unknown) => {
  console.error(err);
  document.body.innerHTML = `<p class="Test_Failed">Test script failed: ${err}</p>`;
};

export const handleSuccess = () => {
  console.log('Test script complete');
  document.body.innerHTML = `<p class="Test_Complete">Test script complete</p>`;
};
