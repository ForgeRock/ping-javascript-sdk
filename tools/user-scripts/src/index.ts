import { Effect } from 'effect';
import { UserServer } from './lib/user-scripts.js';

export const deleteUser = (userId: string, accessToken: string) =>
  UserServer.pipe(
    Effect.flatMap((userService) => userService.deleteUser(userId, accessToken)),
    Effect.provide(UserServer.Default),
    Effect.runPromise,
  );
