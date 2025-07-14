import { HttpClient, HttpClientRequest, HttpClientResponse } from '@effect/platform';
import { Data, Effect, ManagedRuntime } from 'effect';
import { NodeHttpClient } from '@effect/platform-node';
import { getUsersResponse } from './schemas.js';

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

export class UserService extends Effect.Service<UserService>()('@users/service', {
  dependencies: [NodeHttpClient.layerUndici],
  effect: Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;

    return {
      deleteUser: (baseUrl: string, envId: string, userId: string, accessToken: string) =>
        Effect.gen(function* () {
          const response = yield* HttpClientRequest.post(baseUrl)
            .pipe(
              HttpClientRequest.setHeader('Content-Type', 'application/json'),
              HttpClientRequest.setMethod('DELETE'),
              HttpClientRequest.appendUrl(`/environments/${envId}/users/${userId}`),
              HttpClientRequest.bearerToken(accessToken),
              client.execute,
              Effect.flatMap(HttpClientResponse.filterStatusOk),
            )
            .pipe(
              Effect.catchTag('ResponseError', (e) =>
                Effect.fail(
                  new DeleteUserError({
                    message: `Failed to delete user, error in response: ${e}`,
                    cause: e.message,
                  }),
                ),
              ),
              Effect.catchTag('RequestError', (e) =>
                Effect.fail(
                  new DeleteUserError({
                    message: `Failed to delete user, error in request: ${e}`,
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
      getUsers: (
        baseUrl: string,
        envId: string,
        accessToken: string,
        filterTerm: string,
        query: string,
      ) =>
        HttpClientRequest.get(baseUrl)
          .pipe(
            HttpClientRequest.setHeader('Content-Type', 'application/json'),
            HttpClientRequest.appendUrl(`/environments/${envId}/users`),
            HttpClientRequest.appendUrlParam('filter', `${filterTerm} eq "${query}"`),
            HttpClientRequest.bearerToken(accessToken),
            client.execute,
            Effect.flatMap(HttpClientResponse.filterStatusOk),
            Effect.flatMap(HttpClientResponse.schemaBodyJson(getUsersResponse)),
          )
          .pipe(
            Effect.catchTag('ResponseError', (e) =>
              Effect.fail(
                new GetUsersError({
                  message: `Failed to get users, error in response: ${e}`,
                  cause: e.message,
                }),
              ),
            ),
            Effect.catchTag('RequestError', (e) =>
              Effect.fail(
                new GetUsersError({
                  message: `Failed to get users, error in request: ${e}`,
                  cause: e.message,
                }),
              ),
            ),
            Effect.catchTag('ParseError', (e) =>
              Effect.fail(
                new GetUsersError({
                  message: `Failed to parse response for users: ${e}`,
                  cause: e.message,
                }),
              ),
            ),
          ),
    };
  }),
}) {}

export const UserRuntime = ManagedRuntime.make(UserService.Default);
