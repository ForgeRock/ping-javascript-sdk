---
'@forgerock/davinci-client': minor
'@forgerock/journey-client': minor
'@forgerock/oidc-client': minor
'@forgerock/sdk-store': minor
'@forgerock/sdk-oidc': patch
---

Allow multiple SDK clients to share a single Redux store.

`davinci()`, `journey()`, and `oidc()` now accept an optional `store` option. When two clients share a store they share the OpenID Connect discovery cache, so `.well-known/openid-configuration` is fetched once instead of once per client. `davinci()` and `journey()` expose the store they create as `client.store`; applications that want to own the store themselves can build one with `createSdkStore()` from the new `@forgerock/sdk-store` package.

Omitting `store` is unchanged behaviour: the client creates its own store, exactly as before.

**Request middleware and logging are scoped per client.** Each client's `requestMiddleware` and `logger` are registered against that client alone and are resolved only by its own requests. Middleware passed to `davinci()` or `journey()` is never applied to OIDC requests (`AUTHORIZE`, `PAR`, `TOKEN_EXCHANGE`, `REVOKE`, `USER_INFO`, `END_SESSION`), and middleware passed to `oidc()` is never applied to DaVinci or Journey requests. Both options are honoured on a shared store.

**`oidc()` takes `store` as part of its options object**, alongside `config`, `requestMiddleware`, `logger`, and `storage`, consistent with every other factory in the SDK.

**One OIDC client per store.** `oidc()` mounts at a fixed key, so initialising a second OIDC client on the same store with a different `clientId` returns an `argument_error` rather than silently overwriting the first client's token state. Re-initialising with the same `clientId` is allowed and idempotent. Use a separate store per `clientId`.

Also in this release:

- New `@forgerock/sdk-store` package (`scope:sdk-effects`) holding the single canonical `wellknownApi` instance, the shared store contract (`SdkStore`, `SdkStoreHandle`, `createSdkStore`, `injectClient`), and OpenID Connect discovery helpers (`initWellknownQuery`, `isValidWellknownResponse`). Previously each client package defined its own `wellknownApi`, which meant a separate discovery cache per client.
- `oidc()` validates its arguments before attaching to a store, so a rejected call no longer leaves a caller-provided store modified.
- Passing a value that is not an SDK store to `store` returns an `argument_error` instead of throwing.
- Well-known selectors are now memoized per URL. `createWellknownSelector` previously rebuilt its selector on every call, so its cache never took effect.
- `@forgerock/sdk-oidc`: `initWellknownQuery` and `isValidWellknownResponse` move to `@forgerock/sdk-store`. Update imports if you were using them directly.
- `enforce-module-boundaries` lint rule promoted from `warn` to `error` across the repo. All packages pass.
