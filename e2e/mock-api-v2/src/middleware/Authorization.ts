// import { Unauthorized } from '@effect/platform/HttpApiError';
// import { UserInfoTagged } from '../schemas/userinfo/userinfo.schema.js';
// import { HttpApiMiddleware, HttpApiSecurity } from '@effect/platform';
// import { Effect, Layer, Redacted } from 'effect';
//
// class Authorization extends HttpApiMiddleware.Tag<Authorization>()('Authorization', {
//   // Define the error schema for unauthorized access
//   failure: Unauthorized,
//   // Specify the resource this middleware will provide
//   provides: UserInfoTagged,
//   // Add security definitions
//   security: {
//     // ┌─── Custom name for the security definition
//     // ▼
//     myBearer: HttpApiSecurity.bearer,
//     // Additional security definitions can be added here.
//     // They will attempt to be resolved in the order they are defined.
//   },
// }) {}
//
// const AuthorizationLive = Layer.effect(
//   Authorization,
//   Effect.gen(function* () {
//     yield* Effect.log('creating Authorization middleware');
//
//     // Return the security handlers for the middleware
//     return {
//       // Define the handler for the Bearer token
//       // The Bearer token is redacted for security
//       myBearer: (bearerToken) =>
//         Effect.gen(function* () {
//           yield* Effect.log('checking bearer token', Redacted.value(bearerToken));
//
//           // Pass through bearer token for future requests?
//           return bearerToken;
//         }),
//     };
//   }),
// );
//
// export { Authorization, AuthorizationLive };
