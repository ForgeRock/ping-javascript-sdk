import { describe, expect, it } from '@effect/vitest';
import { UnexpectedStatus, UserService } from './user-scripts.js';
import { Effect, Layer } from 'effect';
import { HttpClient, HttpClientResponse } from '@effect/platform';

class NoContentResponse extends Response {
  constructor(status?: number) {
    super(null, {
      status: status || 204,
      statusText: 'No Content',
    });
  }
}

const TestHttpClient = Layer.succeed(
  HttpClient.HttpClient,
  HttpClient.make((request) => {
    return Effect.sync(function () {
      return HttpClientResponse.fromWeb(request, new NoContentResponse());
    });
  }),
);
const TestHttpClient200 = Layer.succeed(
  HttpClient.HttpClient,
  HttpClient.make((request) => {
    return Effect.sync(function () {
      return HttpClientResponse.fromWeb(request, new NoContentResponse(200));
    });
  }),
);

const TestLayer = UserService.DefaultWithoutDependencies.pipe(Layer.provide(TestHttpClient));
const TestLayerFail = UserService.DefaultWithoutDependencies.pipe(Layer.provide(TestHttpClient200));

describe('deleteUser', () => {
  it.effect('should delete a user', () =>
    Effect.gen(function* () {
      const userServices = yield* UserService;

      const res = yield* userServices.deleteUser('http://localhost:9000', '123', 'abc', 'def');

      expect(res.status).toBe(204);
    }).pipe(Effect.provide(TestLayer)),
  );

  it.effect('should fail to delete a user', () =>
    Effect.gen(function* () {
      const userServices = yield* UserService;

      const res = yield* Effect.flip(
        userServices.deleteUser('http://localhost:9000', '123', 'abc', 'def'),
      );

      expect(res).toBeInstanceOf(UnexpectedStatus);
    }).pipe(Effect.provide(TestLayerFail)),
  );
});
