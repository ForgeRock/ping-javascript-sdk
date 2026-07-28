# Plan: Rework `centralize-redux-stores`

**Branch:** `centralize-redux-stores`
**Base:** `493f2643a` (`chore(copyright): add sync-header-years script`)
**Status:** Decisions locked — ready to implement
**Nothing on this branch is released yet**, so every public signature below is still free to change without a breaking changeset.

---

## 1. Why we're reworking

The branch has the right idea — one `wellknownApi`, one Redux store shared across SDK clients — but three things must change before it ships.

### 1.1 OIDC token traffic is silently routed through DaVinci's request middleware

Every `oidcApi` endpoint resolves its middleware and logger from the store's thunk `extraArgument`:

```ts
// packages/oidc-client/src/lib/oidc.api.ts:45, 114, 190, 274, 317, 404, 459, 518, 568
const { requestMiddleware, logger } = api.extra as Extras;
```

On the shared path that `extra` belongs to **davinci's** store (`davinci-client/src/lib/client.store.utils.ts:66-72`). So:

- Middleware registered for DaVinci flows now executes against `AUTHORIZE`, `PAR`, `TOKEN_EXCHANGE`, `REVOKE`, `USER_INFO`, and `END_SESSION` requests. `ActionTypes` is a single flat union across all three products (`sdk-request-middleware/src/lib/request-mware.derived.ts`), so a middleware that doesn't defensively `switch (action.type)` mutates the authorization-code exchange.
- `oidc({ logger: { level: 'debug' } }, sharedStore)` is silently ignored — the store's `extra.logger` is davinci's, at davinci's level. This one isn't even warned about.

The current mitigation (`oidc-client/src/lib/client.store.ts:82-87`) is a runtime `log.warn` that _instructs_ the user into the leak:

> "Pass request middleware to the davinci() or journey() factory that owns the store."

`api.extra` as an implicit, store-wide DI channel is the root cause. The shared-store feature exposed it.

### 1.2 The cross-package contract is enforced by nothing

`InjectableStore` is declared three times — twice identically, once as a structurally weaker hand-mirror:

```ts
// davinci-client/src/lib/client.store.utils.ts:150
// journey-client/src/lib/client.store.utils.ts:442
export interface InjectableStore {
  readonly store: ReturnType<typeof configureStore<RootState>>;
  readonly rootReducer: typeof rootReducer;
  readonly dynamicMiddleware: ReturnType<typeof createDynamicMiddleware>;
}

// oidc-client/src/lib/client.store.utils.ts:21  ← weaker copy, no compile-time link
interface InjectableStore {
  readonly store: ReturnType<typeof configureStore>;
  readonly rootReducer: { inject: (api: unknown) => void };
  readonly dynamicMiddleware: { addMiddleware: (...mw: unknown[]) => void };
}
```

Producer and consumer are joined only by `as unknown as`. Rename `dynamicMiddleware` in davinci and TypeScript says nothing; `oidc()` throws `Cannot read properties of undefined` from inside a factory.

Stacked on top: `SdkStore`'s brand is fictional (`__sdkStoreBrand: symbol` exists on no runtime object), and `toSdkStore` returns `object` — a no-op cast that forces a _second_ `as SdkStore` at each call site.

```ts
// davinci-client/src/lib/client.store.utils.ts:135
export function toSdkStore(injectable: InjectableStore): object {
  return injectable as unknown as object; // InjectableStore is already assignable to object
}
// client.store.ts:120
store: toSdkStore(injectable) as SdkStore, // second cast
```

Four unchecked casts to move one object across a package boundary, in a repo whose architecture is otherwise compiler-enforced.

### 1.3 Test suite is green but proves little

`shared-store.test.ts` hand-builds a fake handle from RTK primitives (`makeSharedStore`, line 776) specifically to avoid importing davinci/journey. **Every test passes even if `davinci()`'s handle has a completely different shape** — the one thing the branch needs to prove is the one thing untested. Details in §5.

---

## 2. Decisions — all resolved

| #      | Decision                             | Resolution                                                                                   |
| ------ | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| **D1** | Store ownership model                | All three modes supported; `createSdkStore()` folded into a renamed `@forgerock/sdk-store`   |
| **D2** | `requestMiddleware`/`logger` scoping | **Per-client registry** in `extraArgument`, keyed by `reducerPath`                           |
| **D3** | Public API shape                     | Options-object, key `store`. No mutual exclusion — `requestMiddleware` is honored per client |
| **D4** | Two `oidc()` clients on one store    | Detect and **error** on a second injection with a different `clientId`                       |
| **D5** | Delivery                             | Rework in place on `centralize-redux-stores`                                                 |

### D1 — Store ownership: three modes, none mandatory

The zero-config path stays zero-config.

| Mode                                   | Call shape                                                                                                  | Who owns the store                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **1 — Implicit** (existing, unchanged) | `oidc({ config })`                                                                                          | The client. Each factory builds its own store when none is passed. Default path; must behave exactly as it does today. |
| **2 — Client-owned, shared**           | `const dv = await davinci({ config });`<br>`await oidc({ config, store: dv.store })`                        | `davinci()`/`journey()`. They continue to expose a `store` handle on the returned client. **Primary sharing story.**   |
| **3 — Consumer-owned** (opt-in)        | `const store = createSdkStore();`<br>`await davinci({ config, store });`<br>`await oidc({ config, store })` | The application. Offered for consumers who want lifecycle control; never required.                                     |

- `davinci()`/`journey()` **keep** the public `store: SdkStore` field added on this branch. The api-report additions stay.
- `createSdkStore()` is an _additional_ export, not a new required step. Escape hatch, not headline.
- All three modes converge on the same `SdkStoreHandle` contract (§3), so there's one code path to test, not three.
- Mode 1 must be provably unaffected — it's the path every existing consumer is on. Regression coverage in §5.3.

**Package location:** rename `packages/sdk-effects/wellknown` → `packages/sdk-effects/store`, published as `@forgerock/sdk-store`, exporting both `wellknownApi` and `createSdkStore()`. This avoids publishing two brand-new artifacts in one release. Since `@forgerock/sdk-wellknown` has never been published, the rename costs nothing.

### D2 — Per-client `extra` registry

`extraArgument` becomes a keyed registry; each `*.api.ts` reads **only its own slot**.

```ts
// @forgerock/sdk-store
export interface ClientExtra<A extends ActionTypes = ActionTypes> {
  readonly requestMiddleware?: RequestMiddleware<A, unknown>[];
  readonly logger: ReturnType<typeof loggerFn>;
}

export interface SdkStoreExtra {
  /** Keyed by the owning api's `reducerPath`. Mutable slots, stable object identity. */
  readonly clients: Record<string, ClientExtra>;
}

/** Pure resolver used by every *.api.ts. */
export function clientExtra(extra: unknown, reducerPath: string): ClientExtra;
```

Each api file replaces `api.extra as Extras` with `clientExtra(api.extra, oidcApi.reducerPath)` — ~9 sites in `oidc.api.ts`, ~10 in `davinci.api.ts`, 3 in `journey.api.ts`. Mechanical, and it deletes three duplicated private `Extras` interfaces.

`extraArgument` is a stable object reference held by `configureStore`, so `injectClient()` filling in a new slot at injection time is visible to every subsequent request. That's what makes per-client scoping work on a store created before the second client existed.

**Consequences — this is why D3 has no mutual exclusion:**

- `oidc({ config, store, requestMiddleware })` now works _correctly_. oidc's middleware lands in the `oidc` slot and applies only to OIDC endpoints.
- The `log.warn` at `client.store.ts:82-87` is **deleted**, not hardened. The condition it warns about is no longer a problem.
- Its two tests (`'warns when requestMiddleware is passed alongside sharedStore'`, `'does not warn when...'`) are **deleted and replaced** by the inverse assertions: oidc's middleware _is_ invoked for OIDC endpoints, and is _not_ invoked for DaVinci endpoints.
- The `logger` drop is fixed for free.

### D3 — Options-object, key `store`

```ts
export async function oidc<A extends ActionTypes = ActionTypes>(input: {
  config: OidcConfig;
  requestMiddleware?: RequestMiddleware<A>[]; // honored in all three modes, per D2
  logger?: { level: LogLevel; custom?: CustomLogger };
  storage?: Partial<StorageConfig>;
  store?: SdkStore; // omit → mode 1
}): Promise<…>;
```

Consistent with every other factory in the SDK, self-documenting at the call site, and extensible. Replaces the positional second parameter currently in `api-report/oidc-client.api.md`. `davinci()` and `journey()` gain the same optional `store` input.

### D4 — Error on conflicting re-injection

`oidcApi.reducerPath` is the fixed string `'oidc'`. A second `oidc()` against the same store with a _different_ `clientId` would silently share one cache slice and clobber token state. Detect it and return a typed SDK error; document as unsupported.

Re-injecting with the **same** `clientId` stays idempotent — that's a legitimate re-init.

Namespacing per `clientId` (which would genuinely support multi-tenant and step-up auth) is explicitly out of scope. Record it as a known limitation in the READMEs.

### D5 — Rework in place

Nothing is released, so history on `centralize-redux-stores` can be rewritten freely. Single PR, single review. Phase 2 is large but behavior-preserving; the full e2e run is the safety net.

---

## 3. Target architecture

```
sdk-types/
  store.types.ts          SdkStore, SdkStoreHandle, ClientExtra, SdkStoreExtra   ← declared ONCE

sdk-effects/store/        ← renamed from sdk-effects/wellknown, published @forgerock/sdk-store
  store.effects.ts        createSdkStore(), injectClient()        ← effectful, correctly named
  store.utils.ts          clientExtra(), isSdkStoreHandle()       ← pure
  wellknown.api.ts        wellknownApi + selectors (as extracted on this branch)

davinci-client/  journey-client/  oidc-client/
  client.store.ts         factory accepts optional `store`
  client.store.effects.ts injection lives here, not in *.utils.ts
  *.api.ts                clientExtra(api.extra, thisApi.reducerPath)
```

**One contract, declared once:**

```ts
// sdk-types/src/lib/store.types.ts
export interface SdkStoreHandle<S = unknown> {
  readonly store: Store<S> & { dispatch: ThunkDispatch<S, SdkStoreExtra, UnknownAction> };
  readonly rootReducer: { inject: (slice: InjectableSlice) => void };
  readonly dynamicMiddleware: { addMiddleware: (...mw: Middleware[]) => void };
  readonly extra: SdkStoreExtra;
}

/** Public-facing alias. Structural, so no cast is needed to produce or consume it. */
export type SdkStore = SdkStoreHandle;
```

**Deleted by this change:**

- `toSdkStore` × 2, `fromSdkStore` × 3 (two of which are **already dead exports** in publishable packages)
- The three `InjectableStore` declarations
- The three private `Extras` interfaces
- The fictional `__sdkStoreBrand`
- The `requestMiddleware`-ignored `log.warn` and its two tests (obsolete under D2)
- All 4 `as unknown as` casts on the handle path, plus `store as unknown as ReturnType<typeof createClientStore>` (`oidc-client/src/lib/client.store.utils.ts:45`)
- Dead exports `JourneyStore`, `fromSdkStore` × 2

---

## 4. Implementation phases

Strict RED → GREEN → REFACTOR → GREEN. Each phase ends green and committable.

### Phase 0 — Reset

- [ ] `git switch -c centralize-redux-stores-v2` from `493f2643a`; cherry-pick what's worth keeping (the wellknown extraction, tsconfig/nx wiring, api-report regeneration).
- [ ] Baseline green: `pnpm exec nx affected -t build lint test`.

### Phase 1 — `@forgerock/sdk-store` (rename + harden)

The extraction was correct; it shipped untested and mis-versioned.

- [ ] Rename `packages/sdk-effects/wellknown` → `packages/sdk-effects/store`; package name → `@forgerock/sdk-store`; update the 3 consumer `package.json`s, all tsconfig references, root `tsconfig.json`, and the changeset.
- [ ] **RED** — `wellknown.api.test.ts`:
  - one cache entry per distinct URL; **exactly one** network call for two identical requests
  - a second distinct URL produces a second entry, not a cache hit
  - `queryFn` maps a non-2xx into `FetchBaseQueryError`, not a thrown rejection
  - `createWellknownSelector` returns `undefined` before fetch, data after
  - `wellknownSelector` returns the same reference across calls once cached
- [ ] **GREEN** — fix `wellknownSelector` memoization (below).
- [ ] Packaging: `version` → `0.0.0`; add `README.md`; add the license header to `eslint.config.mjs`; fix `vite.config.ts` `cacheDir`; drop `passWithNoTests`.

`wellknownSelector` currently rebuilds its memoized selector on every call, so the cache is always cold — across 8 call sites in `oidc-client/src/lib/client.store.ts`:

```ts
// before — memoization never hits
export function wellknownSelector<S extends WellknownState>(url: string, state: S) {
  return createWellknownSelector(url)(state);
}

// after — one selector per URL
const selectorCache = new Map<string, ReturnType<typeof createWellknownSelector>>();
export function wellknownSelector<S extends WellknownState>(url: string, state: S) {
  let selector = selectorCache.get(url);
  if (!selector) {
    selector = createWellknownSelector(url);
    selectorCache.set(url, selector);
  }
  return selector(state);
}
```

**Proceeding with the `Map`** unless flagged. It's module state in a package marked `sideEffects: false`, but it's a pure cache — same input always yields the same selector, and it's unobservable from outside.

### Phase 2 — Per-client `extra` (D2)

No behavior change while standalone. Do this **before** any sharing so the sharing phase inherits correct scoping.

- [ ] **RED** — `clientExtra()` unit tests: returns the slot for a known `reducerPath`; returns an empty-middleware default for an unknown one; never returns another client's slot.
- [ ] **RED** — **the §1.1 regression test.** Per package: a middleware registered for client X is not invoked for client Y's endpoints. Must fail before the fix.
- [ ] **RED** — logger isolation: `oidc({ logger: { level: 'debug' }, store })` uses oidc's level, not the owner's.
- [ ] **GREEN** — add `SdkStoreExtra`/`ClientExtra` to `sdk-types` and `clientExtra()` to `sdk-store`; migrate all three `configureStore` calls to `extraArgument: { clients: { [thisApi.reducerPath]: { requestMiddleware, logger } } }`; replace all ~22 `api.extra as Extras` sites; delete the three private `Extras` interfaces.
- [ ] **REFACTOR** — delete the `requestMiddleware` `log.warn` and its two tests; replace with the inverse assertions.
- [ ] State-shape assertion per package: `expect(Object.keys(store.getState()).sort()).toEqual([...])`.

### Phase 3 — The shared store contract (D1, D3, §1.2)

- [ ] **RED** — a **real** cross-package integration test covering all three D1 modes (§5.1). Must fail before implementation.
- [ ] **RED** — mode-1 regression: `oidc({ config })` with no `store` builds its own store and behaves byte-identically to `main`.
- [ ] **RED** — `isSdkStoreHandle()` guard: `{}` / `null` / a plain object passed as `store` yields a typed SDK error, not a `TypeError`.
- [ ] **GREEN** — declare `SdkStoreHandle` once in `sdk-types`; add `createSdkStore()` + `injectClient()` to `sdk-store`; all three factories accept optional `store` and produce/consume the handle **structurally, with zero casts**.
- [ ] **GREEN** — D3: move `sharedStore` from positional arg into the options object as `store`. `davinci()`/`journey()` gain the same input and keep exposing `store: SdkStore`.
- [ ] **REFACTOR** — delete `toSdkStore`/`fromSdkStore`/`InjectableStore` × 3/`__sdkStoreBrand`; move injection out of `*.utils.ts` into `client.store.effects.ts` per `AGENTS.md` ("never put effectful logic in `*.utils.ts`").
- [ ] Type `createDynamicMiddleware<RootState, AppDispatch>()` so `addMiddleware` is actually checked — the untyped call is how the weak `(...mw: unknown[]) => void` mirror slipped through.

### Phase 4 — Lifecycle correctness (D4)

- [ ] **RED** — `oidc({ config: /* no wellknown */, store })` returns an error **and leaves the store unmutated**. Today injection happens at `client.store.ts:88`, before the guards at `:91` and `:98`, and RTK's `inject` is irreversible — a failed call permanently contaminates the caller's store.
- [ ] **GREEN** — validate all arguments, then inject.
- [ ] **RED/GREEN** — D4: second `oidc()` on the same store with a _different_ `clientId` returns a typed error; with the _same_ `clientId` stays idempotent.

### Phase 5 — Docs, packaging, e2e

- [ ] READMEs: `oidc-client`, `davinci-client`, `journey-client` — all three D1 modes with a worked example each; an explicit statement that each client owns its own middleware/logger (D2); the D4 single-`clientId`-per-store limitation. Plus the new `sdk-store` README from Phase 1.
- [ ] Rewrite the changeset: new package + three changed public signatures + per-client middleware scoping. Name the middleware/logger semantics explicitly.
- [ ] Regenerate api-reports. Expected additions: `store: SdkStore` on the davinci/journey clients (kept — mode 2), the new `store?` input on all three factories, `createSdkStore`/`clientExtra` on `sdk-store`. Nothing should be _removed_.
- [ ] E2E: one suite where a single app shares a store across davinci + oidc and asserts a single `.well-known` request over the wire. (`CLAUDE.md`: e2e is part of done unless untestable end-to-end.)
- [ ] Remove dead exports: `fromSdkStore` × 2, `JourneyStore`.
- [ ] Full CI parity: `pnpm exec nx affected -t build lint test e2e-ci`; `pnpm nx sync:check`.

---

## 5. Test plan

### 5.1 Replace the fake handle with a real one

`makeSharedStore()` (`shared-store.test.ts:776`) constructs a lookalike from RTK primitives. It cannot detect contract drift, which is the single failure mode this feature has. Every D1 mode needs a real test:

```ts
// Mode 1 — implicit (regression: the path all existing consumers are on)
await oidc({ config: oidcConfig });
expect(wellknownFetchCount).toBe(1);

// Mode 2 — client-owned, shared (primary sharing story)
const dv = await davinci({ config: davinciConfig });
await oidc({ config: oidcConfig, store: dv.store });
expect(wellknownFetchCount).toBe(1); // davinci fetched it; oidc hits cache
expect(Object.keys(dvState())).toContain('oidc');

// Mode 3 — consumer-owned (opt-in)
const store = createSdkStore();
await davinci({ config: davinciConfig, store });
await oidc({ config: oidcConfig, store });
expect(wellknownFetchCount).toBe(1);
```

Mode 2 catches contract drift between `davinci()`'s real handle and what `oidc()` consumes — the gap that makes the current suite meaningless. Mode 1 catches regressions for shipped consumers.

**Placement:** an e2e suite, so no `scope:package` → `scope:package` boundary is crossed and the assertion is made against real network traffic. If a faster unit-level version is wanted too, add `packages/integration-tests` rather than relaxing the lint rule for `*.test.ts`.

### 5.2 Fix the tests that assert nothing

| Test                                                                                 | Problem                                                                                                                                                                           | Fix                                                                                                                                              |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `'subscribe() fires when oidcApi state changes'` (:936)                              | Dispatches `{ type: 'test/action' }` — not an `oidcApi` action. Redux notifies **every** subscriber on **every** dispatch, so this passes unconditionally and the title is false. | Dispatch a real `oidcApi` action; assert on the resulting slice state.                                                                           |
| `'reuses cached wellknown response'` (:952)                                          | `expect(count).toBe(fetchesAfterOwnerInit)` is `0 === 0` if the owner's fetch silently failed.                                                                                    | `expect(count).toBe(1)`.                                                                                                                         |
| `'fetches wellknown during init'` (:900)                                             | `toBeGreaterThan(0)` — but "exactly one" is the property that matters for a dedupe feature.                                                                                       | `toBe(1)`.                                                                                                                                       |
| `'is idempotent'` (:857)                                                             | Injects three times (twice in the `not.toThrow` block, once more after).                                                                                                          | Assert 2 injections explicitly; assert cache contents unchanged, not just "didn't throw".                                                        |
| Arrange blocks (:946, :956)                                                          | Call the internal `injectIntoStore` to obtain a typed store, coupling tests to internals.                                                                                         | Go through the public factory.                                                                                                                   |
| `'warns when requestMiddleware is passed alongside sharedStore'` + its negative twin | Tests a warning that D2 makes obsolete.                                                                                                                                           | **Delete both.** Replace with: oidc's middleware _is_ invoked for OIDC endpoints on the shared path, and is _not_ invoked for DaVinci endpoints. |

### 5.3 New coverage

- `@forgerock/sdk-store`: currently zero tests behind `passWithNoTests: true` (Phase 1).
- **Middleware isolation** — DaVinci middleware not invoked for `TOKEN_EXCHANGE` (Phase 2). This is the §1.1 regression test.
- **Logger isolation** — `oidc({ logger: { level: 'debug' }, store })` uses oidc's level.
- **Middleware honored on the shared path** — the inverse of the deleted warn tests.
- Failure path leaves the shared store clean (Phase 4).
- D4: conflicting `clientId` errors; matching `clientId` is idempotent.
- Invalid handle → typed SDK error, not `TypeError`.
- **Mode-1 regression suite** — every existing `oidc()`/`davinci()`/`journey()` test must pass untouched. If a test needs editing to accommodate the new `store` option, that's a signal we broke the default path.
- State-shape assertions per package, guarding the implicit `combineSlices` keying (verified correct today: `config`, `node`, `davinci`, `journeyReducer`, `wellknown` — but it's now an implicit invariant off `slice.name`, where it used to be an explicit literal map).

---

## 6. Risk register

| Risk                                                                       | Mitigation                                                                                                            |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| ~22-site `api.extra` migration touches every network call in the SDK       | Behavior-preserving by construction; RED tests first; full e2e run; Phase 2 lands as its own commit for reviewability |
| `combineSlices` reshapes published state if a `slice.name` is ever renamed | State-shape assertion test per package (Phase 2)                                                                      |
| RTK `inject` is irreversible — no teardown story                           | Phase 4 validate-before-inject; D4 errors on conflicting re-injection; documented limitation                          |
| Package rename ripples through 3 `package.json`s + all tsconfig refs       | Never published, so no consumer impact; `pnpm nx sync:check` catches missed references                                |
| Mode 1 regression for existing consumers                                   | Dedicated regression suite; "no existing test needed editing" is a DoD gate                                           |

---

## 7. What was already right on this branch

Worth preserving through the rework:

- Extracting `wellknownApi` into one canonical instance — the "single cache entry per URL" rationale in the file header is exactly the correct framing.
- `combineSlices().withLazyLoadedSlices()` + `createDynamicMiddleware()` is the idiomatic RTK 2.x mechanism. Not a homegrown `replaceReducer` hack.
- Generalizing `wellknownSelector` from a concrete `RootState` to `<S extends WellknownState>` — clean decoupling, keep it.
- Collapsing `ReturnType<ReturnType<ClientStore>['getState']>` into named `DavinciStore` / `RootState` aliases — genuinely more readable at 4 call sites.
- `sdk-types/store.types.ts` is correctly type-only per the `*.types.ts` convention.
- TS project references, root `tsconfig.json` refs, and Nx tags are wired correctly and consistently with siblings.
- The `requestMiddleware` warning shows the coupling _was_ noticed — the fix just needs to go a layer deeper.

---

## 8. Definition of done

- [ ] Zero `as unknown as` on the store-handle path
- [ ] `SdkStoreHandle` declared exactly once
- [ ] No client's `requestMiddleware` or `logger` reaches another client's endpoints, with a test proving it
- [ ] Each client's own `requestMiddleware` and `logger` work in all three modes
- [ ] All three D1 modes tested: implicit, client-owned-shared, consumer-owned
- [ ] Mode 1 byte-compatible with `main` — no existing test needed editing to keep passing
- [ ] A test that fails if `davinci()`'s real handle drifts from what `oidc()` consumes
- [ ] Injection is effectful code in `*.effects.ts`, not `*.utils.ts`
- [ ] Failed factory calls leave a shared store unmutated
- [ ] Conflicting `clientId` on one store errors; matching `clientId` is idempotent
- [ ] `@forgerock/sdk-store` has tests, a README, and a correct first version (`0.0.0`)
- [ ] Three package READMEs document all three modes, the middleware/logger semantics, and the D4 limitation
- [ ] E2E proves one `.well-known` request across two clients sharing a store
- [ ] `pnpm exec nx affected -t build lint test e2e-ci` and `pnpm nx sync:check` both green
