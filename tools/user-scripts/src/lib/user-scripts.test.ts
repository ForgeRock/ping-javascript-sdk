// import { describe, expect, it } from '@effect/vitest';
// import { GetUsersError, UnexpectedStatus, UserService } from './user-scripts.js';
// import { ConfigProvider, Effect, Layer } from 'effect';
// import { HttpClient, HttpClientResponse } from '@effect/platform';
//
// const Config = ConfigProvider.fromMap(
//   new Map([
//     ['CLIENT_ID', '123'],
//     ['CLIENT_SECRET', '123'],
//     ['ENV_ID', '123'],
//     ['AUTH_URL', 'http://auth.localhost:9000'],
//     ['API_URL', 'http://api.localhost:9000'],
//   ]),
// );
//
// describe('deleteUser', () => {
//   class NoContentResponse extends Response {
//     constructor(status?: number) {
//       super(null, {
//         status: status || 204,
//         statusText: 'No Content',
//       });
//     }
//   }
//
//   const TestHttpClient = Layer.succeed(
//     HttpClient.HttpClient,
//     HttpClient.make((request) => {
//       return Effect.sync(function () {
//         return HttpClientResponse.fromWeb(request, new NoContentResponse());
//       });
//     }),
//   );
//   const TestHttpClient200 = Layer.succeed(
//     HttpClient.HttpClient,
//     HttpClient.make((request) => {
//       console.log(request.url);
//       if (request.url.includes('/as/token')) {
//         return Effect.sync(function () {
//           return HttpClientResponse.fromWeb(
//             request,
//             new Response(
//               JSON.stringify({ access_token: '123', token_type: 'Bearer', expires_in: 3600 }),
//             ),
//           );
//         });
//       } else if (request.url.includes('users?')) {
//         return Effect.sync(function () {
//           return new Response(
//             JSON.stringify({
//               _links: {
//                 self: {
//                   href: 'http://localhost:9000/environments/123/users',
//                 },
//               },
//               _embedded: {
//                 users: [
//                   {
//                     id: '123',
//                     username: 'test',
//                     email: 'test@test.com',
//                   },
//                 ], // empty
//               },
//               count: 0,
//               size: 0,
//             }),
//           );
//         });
//       }
//     }),
//   );
//   const TestLayer = UserService.DefaultWithoutDependencies.pipe(
//     Layer.provide(Layer.setConfigProvider(Config)),
//     Layer.provide(TestHttpClient),
//   );
//   const TestLayerFail = UserService.DefaultWithoutDependencies.pipe(
//     Layer.provide(Layer.setConfigProvider(Config)),
//     Layer.provide(TestHttpClient200),
//   );
//
//   it.effect.only('should delete a user', () =>
//     Effect.gen(function* () {
//       const userServices = yield* UserService;
//
//       const res = yield* Effect.exit(userServices.deleteUser('0123'));
//
//       expect(res).toBe(false);
//     }).pipe(Effect.provide(TestLayer), Effect.withConfigProvider(Config)),
//   );
//
//   it.effect('should fail to delete a user', () =>
//     Effect.gen(function* () {
//       const userServices = yield* UserService;
//
//       const res = yield* Effect.flip(userServices.deleteUser('userid'));
//
//       expect(res).toBeInstanceOf(UnexpectedStatus);
//     }).pipe(Effect.provide(TestLayerFail)),
//   );
// });
//
// describe('getUsers', () => {
//   const TestHttpClient = Layer.succeed(
//     HttpClient.HttpClient,
//     HttpClient.make((request) => {
//       return Effect.sync(function () {
//         return HttpClientResponse.fromWeb(
//           request,
//           new Response(
//             JSON.stringify({
//               _links: {
//                 self: {
//                   href: 'http://localhost:9000/environments/123/users',
//                 },
//               },
//               _embedded: {
//                 users: [],
//               },
//               count: 0,
//               size: 0,
//             }),
//           ),
//         );
//       });
//     }),
//   );
//
//   const TestLayer = UserService.DefaultWithoutDependencies.pipe(
//     Layer.provide(Layer.setConfigProvider(Config)),
//     Layer.provide(TestHttpClient),
//   );
//
//   it.effect('should get users', () =>
//     Effect.gen(function* () {
//       const userServices = yield* UserService;
//
//       const res = yield* userServices.getUsers('email', 'wingar_helena');
//
//       expect(res).toEqual({
//         _links: {
//           self: {
//             href: 'http://localhost:9000/environments/123/users',
//           },
//         },
//         _embedded: {
//           users: [],
//         },
//         count: 0,
//         size: 0,
//       });
//     }).pipe(Effect.provide(TestLayer)),
//   );
//
//   it('should handle errors', () =>
//     Effect.gen(function* () {
//       const userServices = yield* UserService;
//
//       const res = yield* Effect.flip(userServices.getUsers('email', 'wingar_helena'));
//
//       expect(res).toBeInstanceOf(GetUsersError);
//     }).pipe(Effect.provide(TestLayer)));
// });
