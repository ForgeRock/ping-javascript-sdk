import {
  FRAuth,
  FRLoginFailure,
  FRLoginSuccess,
  FRStep,
  SessionManager,
  TokenManager,
  UserManager,
} from '@forgerock/javascript-sdk';
import { Console, Effect } from 'effect';

export const logout = Effect.ignore(
  Effect.tryPromise({
    try: () => SessionManager.logout(),
    catch: (err) => new Error(`Logout failed: ${err}`),
  }),
);

export const start = Effect.tryPromise({
  try: () => FRAuth.start(),
  catch: (err) => new Error(`Authentication start failed: ${err}`),
}).pipe(Effect.tap((step) => Console.log('Called start', step)));

export const checkFRStep = (step: FRStep | FRLoginFailure | FRLoginSuccess) =>
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

export const callNext = (step: FRStep) =>
  Effect.tryPromise({
    try: () => FRAuth.next(step),
    catch: (err) => new Error(`Failed to proceed to next step: ${err}`),
  }).pipe(Effect.tap((step) => Console.log('Got next step', step)));

export const getTokens = Effect.tryPromise({
  try: () => TokenManager.getTokens(),
  catch: (err) => new Error(`Failed to get tokens: ${err}`),
}).pipe(Effect.tap((tokens) => Console.log('Got Tokens', tokens)));

export const getUser = Effect.tryPromise({
  try: () => UserManager.getCurrentUser() as Promise<Record<string, string>>,
  catch: (err) => new Error(`Failed to get current user: ${err}`),
});
