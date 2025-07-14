import { HttpClient, HttpClientRequest } from '@effect/platform';
import { Config, Data, Effect } from 'effect';
import { CreateUserRequestBody } from './schemas.js';
import { NodeHttpClient } from '@effect/platform-node';

class UnexpectedStatus extends Data.TaggedError('UnExpectedStatus')<{
  message: string;
  cause: string;
}> {}

class RequiresServerUrl extends Data.TaggedError('RequiresServerUrl')<{
  message: string;
  cause: string;
}> {}

export class UserServer extends Effect.Service<UserServer>()('@users/service', {
  dependencies: [NodeHttpClient.layerUndici],
  effect: Effect.gen(function* () {
    const base_url = yield* Config.string('VITE_AM_URL');
    const envId = yield* Config.string('VITE_ENV_ID').pipe(Config.withDefault(''));
    const client = yield* HttpClient.HttpClient;

    if (!base_url) {
      return yield* Effect.fail(
        new RequiresServerUrl({
          message: 'Missing server url',
          cause: 'no url on process or passed to constructor',
        }),
      );
    }

    const baseRequest = HttpClientRequest.make('POST')(base_url).pipe(
      HttpClientRequest.setHeader('Content-Type', 'application/json'),
    );

    return {
      /**
       *
       * @param body This operation does not support an attribute to set the new user's password.
       * To create a user and set the password, see Import a user.
       * For information about setting a user's password after creating the new user, see Set password.
       * @param accessToken
       * @returns
       */
      createUser: (body: typeof CreateUserRequestBody.Type, accessToken: string) =>
        Effect.gen(function* () {
          const makeUser = HttpClientRequest.bodyJson(body);

          const request = baseRequest.pipe(
            HttpClientRequest.appendUrl(`/environments/${envId}/users`),
            HttpClientRequest.bearerToken(accessToken),
          );

          const req = yield* makeUser(request);

          const response = yield* client.execute(req);

          return response;
        }),
      deleteUser: (userId: string, accessToken: string) =>
        Effect.gen(function* () {
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
