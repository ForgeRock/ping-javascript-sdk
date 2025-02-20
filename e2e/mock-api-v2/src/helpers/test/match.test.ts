import { it } from '@effect/vitest';
import { expect } from 'vitest';
import { PingRequestData, validator } from '../match.js';
import { Effect, Exit } from 'effect';
import { InvalidUsernamePassword, InvalidProtectNode } from '../../errors/index.js';

it.effect('match validation function passes username password validation', () =>
  Effect.gen(function* () {
    const body: PingRequestData = {
      username: 'testuser',
      password: 'Password',
    };
    const result = yield* validator(body);
    expect(result).toEqual(true);
  }),
);
it.effect('match validation function fails username password validation', () =>
  Effect.gen(function* () {
    const body: PingRequestData = {
      username: 'testuser',
      password: 'bad-password',
    };
    const result = yield* validator(body).pipe(Effect.exit);
    expect(result).toEqual(Exit.fail(new InvalidUsernamePassword()));
  }),
);

it.effect('match validation function passes ping protect node validaiton', () =>
  Effect.gen(function* () {
    const body: PingRequestData = {
      pingprotectsdk: '12321321980123',
    };

    const result = yield* validator(body);
    expect(result).toEqual(true);
  }),
);
it.effect('match validation function fails ping protect node validaiton', () =>
  Effect.gen(function* () {
    const body: PingRequestData = {
      pingprotectsdk: '',
    };

    const result = yield* validator(body).pipe(Effect.exit);
    expect(result).toStrictEqual(Exit.fail(new InvalidProtectNode()));
  }),
);
