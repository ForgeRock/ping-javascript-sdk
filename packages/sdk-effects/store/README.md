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

### `createSdkStore()`

```typescript
function createSdkStore(): SdkStore;
```

Creates a Redux store that SDK clients can share. The well-known discovery slice is mounted up front; all other slices are injected lazily via `injectClient()`. Applications may call this directly when they want to own the store's lifetime; otherwise each client factory creates one on demand.

### `injectClient<S>(handle, options)`

```typescript
function injectClient<S extends object = Record<string, unknown>>(
  handle: SdkStore,
  options: InjectClientOptions,
): SdkStoreHandle<S>;
```

Attaches a client to an existing store: mounts its RTK Query API reducer and middleware, injects any additional slices, and registers the client's private configuration slot. Safe to call multiple times for the same client — RTK deduplicates reducer injection. Throws `Error` (using `INVALID_STORE_MESSAGE`) if `handle` is not a valid SDK store handle.

### `isSdkStoreHandle(value)`

```typescript
function isSdkStoreHandle(value: unknown): value is SdkStore;
```

Type guard. Returns `true` when `value` structurally matches a valid SDK store handle (i.e. it was produced by `createSdkStore()` or returned by a client factory). Used by client factories to validate caller-supplied `store` arguments before touching the store.

### `INVALID_STORE_MESSAGE`

```typescript
const INVALID_STORE_MESSAGE: string;
```

Human-readable error message emitted whenever an argument fails the `isSdkStoreHandle()` check. Exported so every client package references the same string rather than duplicating it.

### `clientExtra<Slot>(extra, reducerPath, defaults?)`

```typescript
function clientExtra<Slot extends object>(
  extra: unknown,
  reducerPath: string,
  defaults?: Partial<Slot>,
): Slot;
```

Resolves the calling client's own per-client slot from a store's thunk `extraArgument`. Runs on every request and never throws — an unrecognised `extra` yields `defaults` (or `{}`) instead of an error. When `defaults` are supplied, any slot key that is absent or `undefined` is filled from `defaults`.

### `initWellknownQuery(url)`

```typescript
function initWellknownQuery(url: string): {
  applyQuery(callback: QueryCallback): Promise<WellknownQueryResult<WellknownResponse>>;
};
```

Creates a well-known query builder for use inside an RTK Query `queryFn`. Constructs the fetch request (with `Accept: application/json`), executes it through the provided `callback`, and validates the response via `isValidWellknownResponse`. Network failures and invalid responses are both normalised to a structured `WellknownQueryError`.

```typescript
queryFn: async (url, _api, _extra, baseQuery) => {
  return initWellknownQuery(url).applyQuery(async (req) => await baseQuery(req));
};
```

### `isValidWellknownResponse(data)`

```typescript
function isValidWellknownResponse(data: unknown): data is WellknownResponse;
```

Returns `true` when `data` contains the minimum required OIDC well-known fields: `issuer`, `authorization_endpoint`, and `token_endpoint` (all strings).

### Types

#### `SdkStore`

```typescript
interface SdkStore {
  readonly store: {
    getState: () => unknown;
    dispatch: (action: never) => unknown;
    subscribe: (listener: () => void) => () => void;
  };
  readonly rootReducer: InjectableRootReducer;
  readonly dynamicMiddleware: DynamicMiddleware;
  readonly extra: SdkStoreRegistry;
}
```

State-agnostic shared Redux store contract. This is the type that travels between client packages: `davinci()` and `journey()` expose one as `client.store`; `oidc()` and `journey()` accept one as the `store` option.

#### `SdkStoreHandle<S>`

```typescript
interface SdkStoreHandle<S extends object = Record<string, unknown>> extends SdkStore {
  readonly store: Store<S, UnknownAction> & {
    dispatch: ThunkDispatch<S, SdkStoreRegistry, UnknownAction>;
  };
  readonly rootReducer: InjectableRootReducer & Reducer<S>;
}
```

Store handle with a known state shape `S`. Returned by each client's own store factory so internal code gets full typing on `getState()` and `dispatch()`. Assignable to `SdkStore` for hand-off to another client.

#### `SdkStoreRegistry`

```typescript
interface SdkStoreRegistry {
  readonly clients: Record<string, ClientSlot>;
}
```

The mutable client registry carried as the store's `extraArgument`. `configureStore` captures this by reference, so slots added after store creation are visible to every subsequent request.

#### `ClientSlot`

```typescript
interface ClientSlot {
  readonly requestMiddleware?: readonly unknown[];
  readonly logger?: unknown;
  readonly clientId?: string;
}
```

Per-client slot on a store's thunk `extraArgument`. Intentionally loose so `sdk-store` does not depend on `sdk-request-middleware` or `sdk-logger` types. Each client narrows this to its own concrete shape at the point of use.

#### `InjectClientOptions`

```typescript
interface InjectClientOptions {
  readonly api: { reducerPath: string; reducer: Reducer; middleware: Middleware };
  readonly reducerPath: string;
  readonly slices?: readonly { name: string; reducer: Reducer }[];
  readonly requestMiddleware?: readonly unknown[];
  readonly logger?: unknown;
  readonly clientId?: string;
}
```

Options passed to `injectClient()` describing the client attaching itself to a store. `api` provides the RTK Query API (its reducer and middleware are both mounted). `slices` lists any additional Redux slices the client owns. `reducerPath` is used as the registry key — normally matches `api.reducerPath`.

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
