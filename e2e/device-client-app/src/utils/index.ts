import { deviceClient } from '@forgerock/device-client';
import {
  CallbackType,
  Config,
  FRAuth,
  FRLoginFailure,
  FRLoginSuccess,
  FRStep,
  NameCallback,
  PasswordCallback,
  SessionManager,
  TokenManager,
  UserManager,
} from '@forgerock/javascript-sdk';
import { Console, Effect } from 'effect';

const logout = Effect.ignore(
  Effect.tryPromise({
    try: () => SessionManager.logout(),
    catch: (err) => new Error(`Logout failed: ${err}`),
  }),
);

const start = Effect.tryPromise({
  try: () => FRAuth.start(),
  catch: (err) => new Error(`Authentication start failed: ${err}`),
}).pipe(Effect.tap((step) => Console.log('Called start', step)));

const checkFRStep = (step: FRStep | FRLoginFailure | FRLoginSuccess) =>
  Effect.try({
    try: () => {
      if (step.type == 'LoginSuccess' || step.type == 'LoginFailure') {
        throw new Error(`Unexpected step type: ${step.type}`);
      } else {
        return step;
      }
    },
    catch: (err) => new Error(`Failed to start authentication: ${err}`),
  });

const callNext = (step: FRStep) =>
  Effect.tryPromise({
    try: () => FRAuth.next(step),
    catch: (err) => new Error(`Failed to proceed to next step: ${err}`),
  }).pipe(Effect.tap((step) => Console.log('Got next step', step)));

const getTokens = Effect.tryPromise({
  try: () => TokenManager.getTokens(),
  catch: (err) => new Error(`Failed to get tokens: ${err}`),
}).pipe(Effect.tap((tokens) => Console.log('Got Tokens', tokens)));

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

export const LoginAndGetClient = Effect.gen(function* () {
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

export const getUser = Effect.tryPromise({
  try: () => UserManager.getCurrentUser() as Promise<Record<string, string>>,
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
