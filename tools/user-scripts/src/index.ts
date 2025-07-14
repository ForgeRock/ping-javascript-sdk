import { Effect } from 'effect';
import { UserRuntime, UserService } from './lib/user-scripts.js';

export const deleteUser = (baseUrl: string, envId: string, userId: string, accessToken: string) =>
  UserRuntime.runPromise(
    UserService.pipe(
      Effect.flatMap((userService) => userService.deleteUser(baseUrl, envId, userId, accessToken)),
    ),
  );
