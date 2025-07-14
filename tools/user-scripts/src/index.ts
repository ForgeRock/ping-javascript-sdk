import { Effect } from 'effect';
import { UserRuntime, UserService } from './lib/user-scripts.js';

export const deleteUser = (baseUrl: string, envId: string, userId: string, accessToken: string) =>
  UserRuntime.runPromise(
    UserService.pipe(
      Effect.flatMap((userService) =>
        Effect.retry(userService.deleteUser(baseUrl, envId, userId, accessToken), {
          times: 5,
        }),
      ),
    ),
  );

export const getUsers = (
  baseUrl: string,
  envId: string,
  accessToken: string,
  filterTerm: string,
  query: string,
) =>
  UserRuntime.runPromise(
    UserService.pipe(
      Effect.flatMap((userService) =>
        Effect.retry(userService.getUsers(baseUrl, envId, accessToken, filterTerm, query), {
          times: 5,
        }),
      ),
    ),
  );
