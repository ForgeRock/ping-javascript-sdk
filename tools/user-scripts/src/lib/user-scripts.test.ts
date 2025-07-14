import { describe, expect, it } from '@effect/vitest';
import { GetUsersError, UnexpectedStatus, UserService } from './user-scripts.js';
import { Effect, Layer } from 'effect';
import { HttpClient, HttpClientResponse } from '@effect/platform';

describe('deleteUser', () => {
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
  const TestLayerFail = UserService.DefaultWithoutDependencies.pipe(
    Layer.provide(TestHttpClient200),
  );

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

describe('getUsers', () => {
  const TestHttpClient = Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request) => {
      return Effect.sync(function () {
        return HttpClientResponse.fromWeb(
          request,
          new Response(
            JSON.stringify({
              _links: {
                self: {
                  href: 'http://localhost:9000/environments/123/users',
                },
              },
              _embedded: {
                users: [],
              },
              count: 0,
              size: 0,
            }),
          ),
        );
      });
    }),
  );

  const TestLayer = UserService.DefaultWithoutDependencies.pipe(Layer.provide(TestHttpClient));

  it.effect('should get users', () =>
    Effect.gen(function* () {
      const userServices = yield* UserService;

      const res = yield* userServices.getUsers(
        'http://localhost:9000',
        '123',
        'abc',
        'email',
        'wingar_helena',
      );

      expect(res).toEqual({
        _links: {
          self: {
            href: 'http://localhost:9000/environments/123/users',
          },
        },
        _embedded: {
          users: [],
        },
        count: 0,
        size: 0,
      });
    }).pipe(Effect.provide(TestLayer)),
  );
  it('should handle errors', () =>
    Effect.gen(function* () {
      const userServices = yield* UserService;

      const res = yield* Effect.flip(
        userServices.getUsers('http://localhost:9000', '123', 'abc', 'email', 'wingar_helena'),
      );

      expect(res).toBeInstanceOf(GetUsersError);
    }).pipe(Effect.provide(TestLayer)));
});
