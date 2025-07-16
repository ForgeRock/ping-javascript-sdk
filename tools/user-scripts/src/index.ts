import { Console, Effect } from 'effect';
import { UserRuntime, UserService } from './lib/user-scripts.js';

export const deleteUser = (userId: string) =>
  UserRuntime.runPromise(
    UserService.pipe(
      Effect.flatMap((userService) =>
        Effect.retry(userService.deleteUser(userId), {
          times: 5,
        }),
      ),
    ),
  );

export const getUsers = (filterTerm: string, query: string) =>
  UserRuntime.runPromise(
    UserService.pipe(
      Effect.flatMap((userService) =>
        Effect.retry(userService.getUsers(filterTerm, query), {
          times: 5,
        }),
      ),
    ),
  );

export const getUsersAndDelete = (filterTerm: string, query: string) =>
  UserRuntime.runPromise(
    Effect.gen(function* () {
      const userService = yield* UserService;
      const users = yield* Effect.retry(userService.getUsers(filterTerm, query), {
        times: 5,
      });

      for (const user of users._embedded.users) {
        yield* Console.log(user);
        yield* userService.deleteUser(user.id);
      }
    }),
  );
