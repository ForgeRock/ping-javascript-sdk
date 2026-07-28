# @forgerock/sdk-store

Shared Redux store infrastructure and OpenID Connect discovery API for the Ping JavaScript SDK.

This is an internal building block. You do not normally install it directly — `@forgerock/oidc-client`, `@forgerock/davinci-client`, and `@forgerock/journey-client` depend on it. Install it explicitly only if your application wants to own the SDK store itself.

## Table of Contents

- [Why this package exists](#why-this-package-exists)
- [Installation](#installation)
- [Sharing a store between clients](#sharing-a-store-between-clients)
- [Well-known discovery](#well-known-discovery)
- [API Reference](#api-reference)
- [Building](#building)
- [Testing](#testing)

## Why this package exists

Every SDK client needs the authorization server's OpenID Connect discovery document. Before this package, each client package defined its own `wellknownApi` instance. Three separate RTK Query APIs meant three separate caches, so an application using more than one client fetched the same `.well-known/openid-configuration` document once per client.

This package holds the **single canonical `wellknownApi` instance**. When SDK clients share a Redux store, they share one cache entry per URL, and the discovery document is fetched exactly once.

## Installation

```bash
pnpm add @forgerock/sdk-store
```

## Sharing a store between clients

An application using more than one SDK client can have them share a single Redux store, so the discovery document is fetched once and state lives in one place. There are three ways to arrange this, and the default requires no changes at all.

### Mode 1 — implicit (default)

Each client creates its own store. Nothing is shared. This is the behaviour you get by omitting `store`, and it is what every existing application already does.

```typescript
const client = await oidc({ config });
```

### Mode 2 — one client owns the store

`davinci()` and `journey()` expose the store they created as `client.store`. Pass it to another client to attach to it. This is the common case.

```typescript
const davinciClient = await davinci({ config: davinciConfig });
const oidcClient = await oidc({ config: oidcConfig, store: davinciClient.store });
// The discovery document was fetched by davinci(); oidc() reads it from cache.
```

### Mode 3 — the application owns the store

Call `createSdkStore()` yourself when you want to control the store's lifetime, or to attach clients in an order that has no natural owner.

```typescript
import { createSdkStore } from '@forgerock/sdk-store';

const store = createSdkStore();
const davinciClient = await davinci({ config: davinciConfig, store });
const oidcClient = await oidc({ config: oidcConfig, store });
```

### What is shared, and what is not

Sharing a store shares **cached data**, not **configuration**. This distinction matters:

| Shared across clients                              | Private to each client |
| -------------------------------------------------- | ---------------------- |
| The well-known discovery cache (one fetch per URL) | `requestMiddleware`    |
| The Redux state tree and its subscribers           | `logger`               |

Each client's `requestMiddleware` and `logger` are registered under its own key on the store and are resolved only by that client's own requests. A middleware you pass to `davinci()` will never run against an OIDC token exchange, and vice versa. Pass them to the client whose requests they are meant to affect:

```typescript
const store = createSdkStore();

// Applies only to DaVinci flow requests.
await davinci({ config: davinciConfig, store, requestMiddleware: [davinciMiddleware] });

// Applies only to OIDC requests (authorize, token, revoke, userinfo, end session).
await oidc({ config: oidcConfig, store, requestMiddleware: [oidcMiddleware] });
```

### Limitations

- **One OIDC client per store.** `oidcApi` mounts at a fixed key, so two OIDC clients on one store would share a single cache slice and overwrite each other's token state. Initialising a second client with a _different_ `clientId` returns an `argument_error`; re-initialising the _same_ `clientId` is allowed and idempotent. Use a separate store per `clientId`.
- **Attaching is permanent.** A client cannot be detached from a store. Discard the store instead.

## Well-known discovery

`wellknownApi` is a standard RTK Query API. Mount its reducer and middleware, then dispatch the `configuration` endpoint with the discovery URL as the cache key.

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { wellknownApi, wellknownSelector } from '@forgerock/sdk-store';

const store = configureStore({
  reducer: { [wellknownApi.reducerPath]: wellknownApi.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(wellknownApi.middleware),
});

const url = 'https://auth.example.com/as/.well-known/openid-configuration';

// Fetches on first call; served from cache thereafter.
const { data, error } = await store.dispatch(wellknownApi.endpoints.configuration.initiate(url));

// Or read the cached value out of state at any time.
const wellknown = wellknownSelector(url, store.getState());
```

The endpoint never throws. A network failure, a non-2xx response, or a payload missing the required `issuer` / `authorization_endpoint` / `token_endpoint` fields all resolve to `{ error }`.

## API Reference

### `wellknownApi`

The canonical RTK Query API instance. `reducerPath` is `'wellknown'`.

| Member                                 | Description                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `wellknownApi.reducer`                 | Mount at `wellknownApi.reducerPath`                                                                         |
| `wellknownApi.middleware`              | Add to the store middleware chain                                                                           |
| `wellknownApi.endpoints.configuration` | `builder.query<WellknownResponse, string>` — the argument is the discovery URL and doubles as the cache key |

### `createWellknownSelector(wellknownUrl)`

Returns a memoized selector for the cached discovery document, or `undefined` if it has not been fetched.

Repeated calls with the same URL return the **same selector instance**, so memoization is shared across call sites rather than being rebuilt (and therefore always cold) on each call.

```typescript
const selectWellknown = createWellknownSelector(url);
const wellknown = selectWellknown(store.getState());

createWellknownSelector(url) === createWellknownSelector(url); // true
```

### `wellknownSelector(wellknownUrl, state)`

Convenience wrapper that resolves the selector and immediately applies it to `state`. Use this for one-off reads; use `createWellknownSelector` when you want to hold the selector.

```typescript
const wellknown = wellknownSelector(url, store.getState());
```

### `WellknownState`

The minimum state shape required by the selectors. Useful for constraining generic state types:

```typescript
function readIssuer<S extends WellknownState>(url: string, state: S) {
  return wellknownSelector(url, state)?.issuer;
}
```

## Building

```bash
pnpm nx build @forgerock/sdk-store
```

## Testing

```bash
pnpm nx test @forgerock/sdk-store
```
