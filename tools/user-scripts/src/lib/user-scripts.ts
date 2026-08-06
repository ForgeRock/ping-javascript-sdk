import { HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/unstable/http';
import { Context, Config, Data, Effect, Layer, ManagedRuntime } from 'effect';
import { NodeHttpClient } from '@effect/platform-node';
import { getUsersResponse, TokenResponse } from './schemas.js';

export class UnexpectedStatus extends Data.TaggedError('UnExpectedStatus')<{
  message: string;
  cause: string;
}> {}

export class RequiresServerUrl extends Data.TaggedError('RequiresServerUrl')<{
  message: string;
  cause: string;
}> {}

export class GetUsersError extends Data.TaggedError('GetUsersError')<{
  message: string;
  cause: string;
}> {}

export class DeleteUserError extends Data.TaggedError('DeleteUserError')<{
  message: string;
  cause: string;
}> {}

export class FailureToAcquireToken extends Data.TaggedError('FailureToAcquireToken')<{
  message: string;
  cause: string;
}> {}

export class UserService extends Context.Service<UserService>()('@users/service', {
  make: Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;
    const clientId = yield* Config.string('CLIENT_ID');
    const clientSecret = yield* Config.string('CLIENT_SECRET');
    const envId = yield* Config.string('ENV_ID');
    const AUTH_URL = yield* Config.string('AUTH_URL');
    const API_URL = yield* Config.string('API_URL');

    const tokenResponse = yield* HttpClientRequest.post(AUTH_URL).pipe(
      HttpClientRequest.setHeader('Content-Type', 'application/x-www-form-urlencoded'),
      HttpClientRequest.appendUrl(`/${envId}/as/token`),
      HttpClientRequest.setUrlParam('grant_type', 'client_credentials'),
      HttpClientRequest.setHeader('Authorization', `Basic ${btoa(`${clientId}:${clientSecret}`)}`),
      client.execute,
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(TokenResponse)),
    );

    return {
      deleteUser: (userId: string) =>
        Effect.gen(function* () {
          const response = yield* HttpClientRequest.delete(API_URL).pipe(
            HttpClientRequest.appendUrl(`/v1/environments/${envId}/users/${userId}`),
            HttpClientRequest.bearerToken(tokenResponse.access_token),
            client.execute,
            Effect.flatMap(HttpClientResponse.filterStatusOk),
            Effect.catchTag('HttpClientError', (e) =>
              Effect.fail(
                new DeleteUserError({
                  message: `Failed to delete user: ${e}`,
                  cause: e.message,
                }),
              ),
            ),
          );

          /**
           * Docs says we should expect a 204 response for success
           */
          if (response.status !== 204) {
            return yield* Effect.fail(
              new UnexpectedStatus({
                message: 'Unexpected status code',
                cause: response.status.toString(),
              }),
            );
          }

          return response;
        }),
      getUsers: (filterTerm: string, query: string) =>
        HttpClientRequest.get(API_URL).pipe(
          HttpClientRequest.setHeader('Content-Type', 'application/json'),
          HttpClientRequest.appendUrl(`/v1/environments/${envId}/users`),
          HttpClientRequest.appendUrlParam('filter', `${filterTerm} eq "${query}"`),
          HttpClientRequest.bearerToken(tokenResponse.access_token),
          client.execute,
          Effect.flatMap(HttpClientResponse.filterStatusOk),
          Effect.flatMap(HttpClientResponse.schemaBodyJson(getUsersResponse)),
        ),
    };
  }),
}) {}

export const UserRuntime = ManagedRuntime.make(
  Layer.provide(Layer.effect(UserService, UserService.make), NodeHttpClient.layerUndici),
);
