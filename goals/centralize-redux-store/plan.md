# Plan: Centralize Redux Store Across Client Packages

## Solution Approach

Migrate all three stores from `configureStore` + `combineReducers` to RTK 2.0 `combineSlices`, which enables lazy reducer injection. `davinci()` and `journey()` expose an opaque `SdkStore` handle on their return object. `oidc()` accepts that handle as an optional second argument and injects its own reducers into it at init time. `wellknownApi` is extracted to a new `sdk-effects/wellknown` package so all three clients share the same RTK Query instance — critical for cache deduplication on a shared store.

## Ordered Steps

### Step 1 — Extract `wellknownApi` to `@forgerock/sdk-wellknown`

**Why first:** The shared store relies on a single `wellknownApi` instance. If each package keeps its own copy, `createApi` creates distinct RTK Query reducers with distinct internal state — sharing the store won't deduplicate the cache. This must land before any store changes.

**Files to create:**

- `packages/sdk-effects/wellknown/package.json` — follow `packages/sdk-effects/logger/package.json` as template, name `@forgerock/sdk-wellknown`
- `packages/sdk-effects/wellknown/src/index.ts` — re-exports from `lib/wellknown.api.ts`
- `packages/sdk-effects/wellknown/src/lib/wellknown.api.ts` — canonical implementation (merge `davinci-client`'s version + oidc's `wellknownSelector`/`createWellknownSelector`)
- `packages/sdk-effects/wellknown/vite.config.ts` — copy from `logger/vite.config.ts`
- `packages/sdk-effects/wellknown/project.json` — Nx project config
- `packages/sdk-effects/wellknown/tsconfig.json` / `tsconfig.lib.json` / `tsconfig.spec.json`

**Files to modify:**

- `packages/davinci-client/package.json` — add `@forgerock/sdk-wellknown: workspace:*` dep
- `packages/journey-client/package.json` — same
- `packages/oidc-client/package.json` — same
- `packages/davinci-client/src/lib/wellknown.api.ts` — delete file, update all imports to `@forgerock/sdk-wellknown`
- `packages/journey-client/src/lib/wellknown.api.ts` — delete file, update all imports
- `packages/oidc-client/src/lib/wellknown.api.ts` — delete file, update all imports (note: oidc has `wellknownSelector` — move to the shared package)

**Verification:**

```bash
pnpm nx build @forgerock/sdk-wellknown
pnpm nx build @forgerock/davinci-client
pnpm nx build @forgerock/journey-client
pnpm nx build @forgerock/oidc-client
pnpm nx test @forgerock/davinci-client
pnpm nx test @forgerock/journey-client
pnpm nx test @forgerock/oidc-client
```

---

### Step 2 — Introduce `SdkStore` opaque type in a shared location

**Files to create/modify:**

- `packages/sdk-types/src/lib/store.types.ts` — define the opaque `SdkStore` interface:

  ```ts
  // Opaque handle — consumers can pass it around but cannot access Redux internals
  export interface SdkStore {
    readonly __brand: unique symbol;
  }
  ```

  Internally, the concrete type will extend this. Consumers only ever see `SdkStore`.

- `packages/sdk-types/src/index.ts` — export `SdkStore`

**Why here:** `sdk-types` is the shared contracts layer with no runtime code. `SdkStore` is purely a type contract between the packages. Keeping it here avoids a circular dependency (davinci → sdk-types is already valid; oidc → sdk-types is already valid).

**Verification:**

```bash
pnpm nx build @forgerock/sdk-types
```

---

### Step 3 — Migrate `davinci-client` store to `combineSlices` + expose `SdkStore`

**Files to modify:**

- `packages/davinci-client/src/lib/client.store.utils.ts`:
  - Replace `configureStore` + inline `reducer: {}` with `combineSlices(configSlice, nodeSlice, davinciApi, wellknownApi).withLazyLoadedSlices<LazyLoadedSlices>()`
  - Create `const dynamicMiddleware = createDynamicMiddleware()` and add `dynamicMiddleware.middleware` to the `configureStore` middleware chain alongside `davinciApi.middleware` and `wellknownApi.middleware`
  - Attach `__dynamicMiddleware: dynamicMiddleware` to the store (or carry it alongside) so `oidc()` can call `addMiddleware` at inject time
  - Export the `rootReducer` so the store can be typed
  - Export `InjectableStore` type (internal, extends the RTK store type, carries `__dynamicMiddleware` and the `combineSlices` `.inject()` method)
- `packages/davinci-client/src/lib/client.store.ts`:
  - Add `store: store as SdkStore` to the return object of `davinci()`
  - The local `store` variable remains typed as `InjectableStore` — the cast to `SdkStore` happens only at the return boundary

- `packages/davinci-client/src/types.ts` — export `DavinciClient` type update picks up `store: SdkStore` automatically via `Awaited<ReturnType<typeof davinci>>`

**Verification:**

```bash
pnpm nx build @forgerock/davinci-client
pnpm nx test @forgerock/davinci-client
# Type check: verify DavinciClient has store: SdkStore
# Type check: verify store.dispatch / store.getState are NOT accessible on SdkStore
```

---

### Step 4 — Migrate `journey-client` store to `combineSlices` + expose `SdkStore`

Mirrors Step 3.

**Files to modify:**

- `packages/journey-client/src/lib/client.store.utils.ts` — same `combineSlices` migration
- `packages/journey-client/src/lib/client.store.ts` — add `store: store as SdkStore` to return object
- `packages/journey-client/src/types.ts` (or `index.ts`) — `JourneyClient` interface gains `store: SdkStore`

**Verification:**

```bash
pnpm nx build @forgerock/journey-client
pnpm nx test @forgerock/journey-client
```

---

### Step 5 — Migrate `oidc-client` to accept optional `SdkStore` second argument + lazy inject

**Files to modify:**

- `packages/oidc-client/src/lib/client.store.utils.ts`:
  - Keep `createClientStore` for standalone usage (no change)
  - Add `injectIntoStore(store: SdkStore): void` helper — casts back to `InjectableStore`, calls `.inject(oidcApi)` and `.inject(wellknownApi)`

- `packages/oidc-client/src/lib/client.store.ts` — `oidc()` signature becomes:

  ```ts
  export async function oidc(options: OidcOptions, sharedStore?: SdkStore);
  ```

  Inside:
  - If `sharedStore` is provided: call `injectIntoStore(sharedStore)`, use `sharedStore` as the internal store (cast to `InjectableStore`)
  - If not provided: call `createClientStore(...)` as today
  - All methods below are unchanged — they close over `store`, so the injection is transparent

- `packages/oidc-client/src/types.ts` — `OidcClient` type picks up automatically; export `SdkStore` re-export for consumer convenience

**Verification:**

```bash
pnpm nx build @forgerock/oidc-client
pnpm nx test @forgerock/oidc-client
# Integration test: create davinci() → pass client.store to oidc() → assert single wellknown fetch
```

---

### Step 6 — Write integration tests proving shared-store behavior

**Files to create/modify:**

- `packages/oidc-client/src/lib/shared-store.test.ts` (or add to existing integration test file):
  - Test: `oidc(opts, davinciClient.store)` — `wellknownApi` cache has exactly one entry, no second network call
  - Test: `store.subscribe` on davinci client fires when oidc dispatches
  - Test: `oidc(opts)` standalone still creates its own store (existing behavior)
  - Test: TypeScript compile-time: `davinciClient.store.dispatch` should be a type error

**Verification:**

```bash
pnpm nx test @forgerock/oidc-client
pnpm nx test @forgerock/davinci-client
```

---

### Step 7 — Verify full suite + type check

```bash
pnpm nx run-many -t build --no-agents
pnpm nx run-many -t lint
pnpm nx run-many -t test
pnpm tsc --noEmit  # or pnpm nx run-many -t typecheck
```

---

## Risks and Open Questions

1. **RTK Query middleware — use `createDynamicMiddleware`**: RTK Query API slices need their `.middleware` in the store's middleware chain. For lazy-injected slices like `oidcApi`, we use RTK 2.0's `createDynamicMiddleware`. The owning store (davinci/journey) registers `dynamicMiddleware.middleware` in `configureStore`; the `DynamicMiddlewareInstance` is included in the `InjectableStore` internal type. When `oidc()` injects its reducers via `combineSlices`, it also calls `store.__dynamicMiddleware.addMiddleware(oidcApi.middleware)`. No downside — this is RTK's designed use case for lazy middleware registration.

2. **`wellknownApi` selector `RootState` coupling**: `oidc-client`'s `wellknownSelector` is typed against oidc's own `RootState`. After extraction to `sdk-wellknown`, it needs a generic state type or the `wellknown` slice state shape directly. Use `wellknownApi.endpoints.configuration.select(url)` directly — it returns a state selector that only requires the `wellknown` key, not a full `RootState`.

3. **`SdkStore` cast fidelity**: The internal `InjectableStore` → `SdkStore` cast must be verifiably safe. Add a helper that asserts the store has `inject` available at runtime before accepting it in `oidc()`.

4. **Package creation friction**: Creating a new `sdk-effects/wellknown` sub-package requires Nx project registration. Check `packages/sdk-effects/logger/project.json` and `nx.json` for the exact scaffolding pattern to avoid CI graph errors.
