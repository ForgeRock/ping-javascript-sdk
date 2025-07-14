import { HttpClient, HttpClientRequest } from '@effect/platform';
import { Data, Effect, ManagedRuntime } from 'effect';
import { NodeHttpClient } from '@effect/platform-node';

export class UnexpectedStatus extends Data.TaggedError('UnExpectedStatus')<{
  message: string;
  cause: string;
}> {}

export class RequiresServerUrl extends Data.TaggedError('RequiresServerUrl')<{
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
          const baseRequest = HttpClientRequest.make('POST')(baseUrl).pipe(
            HttpClientRequest.setHeader('Content-Type', 'application/json'),
          );
          const request = baseRequest.pipe(
            HttpClientRequest.setMethod('DELETE'),
            HttpClientRequest.appendUrl(`/environments/${envId}/users/${userId}`),
            HttpClientRequest.bearerToken(accessToken),
          );

          const response = yield* client.execute(request);
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
    };
  }),
}) {}

export const UserRuntime = ManagedRuntime.make(UserService.Default);
