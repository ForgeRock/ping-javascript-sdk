# Goal: Centralize Redux Store Across Client Packages

## Articulated Goal

Expose an opaque `SdkStore` handle from `davinci()` and `journey()`, and allow `oidc()` to accept that handle as an optional second argument. When provided, `oidc` lazily injects its own reducers and middleware into the shared store rather than creating a new one — eliminating the dual-store problem when pairing oidc with a flow client. All existing call sites remain unchanged.

## Shared Understanding

See [`facts.md`](./facts.md) for the full list of accepted facts defining correct behavior.

## Execution Plan

See [`plan.md`](./plan.md) for the ordered steps, files touched, and verification commands.

## Done Condition

- `davinci()` and `journey()` return objects include a `store: SdkStore` property
- `oidc(opts, sharedStore?)` accepts the optional second argument and injects into it when provided
- `wellknownApi` lives in a new `@forgerock/sdk-wellknown` package imported by all three clients
- A shared store results in one wellknown cache entry and a single unified `subscribe`
- All existing call sites work without modification
- `pnpm nx run-many -t build lint test` passes across all affected packages
