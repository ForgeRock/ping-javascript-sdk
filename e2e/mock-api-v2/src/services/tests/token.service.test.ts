import { it } from '@effect/vitest';
import { expect } from 'vitest';
import { Tokens, mockTokens } from '../tokens.service.js';
import { Effect, Layer } from 'effect';
import { mockRequest } from '../request.service.js';
import { tokenResponseBody } from '../../responses/token/token.js';

it.effect('should return tokens', () =>
  Effect.gen(function* () {
    const { getTokens } = yield* Tokens;
    const result = yield* getTokens({ cookie: 'the cookie' });

    expect(result).toEqual(tokenResponseBody);
  }).pipe(Effect.provide(Layer.provideMerge(mockTokens, mockRequest))),
);

//it.effect('should return error', () =>
//  Effect.gen(function* () {
//    const { getTokens } = yield* Tokens;
//    const result = yield* getTokens({ cookie: '12345' }).pipe(Effect.flip);
//
//    expect(result).toEqual(HttpError.unauthorized());
//  }).pipe(Effect.provide(Layer.provideMerge(mockTokens, mockRequest))),
//);
