# @forgerock/sdk-types

## 2.1.0

### Minor Changes

- [#684](https://github.com/ForgeRock/ping-javascript-sdk/pull/684) [`4fe7bfe`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4fe7bfeba94627eed14f787c73384aed34be80ff) Thanks [@SteinGabriel](https://github.com/SteinGabriel)! - Add unified cross-platform SDK configuration support

  New utility functions in `@forgerock/sdk-utilities` convert the cross-platform unified JSON config schema into each client's native config shape. Validation and mapping are owned entirely by the utilities layer — client factories remain typed to their existing config interfaces.

  **New in `@forgerock/sdk-utilities`:**
  - `makeOidcConfig(json)` — validates and maps unified JSON → `OidcConfig`; throws on invalid input
  - `makeJourneyConfig(json)` — validates and maps unified JSON → `JourneyClientConfig`; throws on invalid input
  - `makeDavinciConfig(json)` — validates and maps unified JSON → `DaVinciConfig`; throws on invalid input
  - `UnifiedSdkConfig`, `UnifiedOidcConfig`, `UnifiedJourneyConfig` types
  - `validateUnifiedSdkConfig` / `validateUnifiedOidcConfig` — pure validation returning `Either<T, ConfigValidationError[]>`
  - `unifiedToOidcConfig`, `unifiedToJourneyConfig`, `unifiedToDavinciConfig` — pure mappers returning `Either<T, ConfigValidationError>`
  - `AuthDisplayValue`, `AuthPromptValue` types (canonical source — shared between `OidcConfig` and `GetAuthorizationUrlOptions`)

  **Usage:**

  ```ts
  import { makeDavinciConfig } from '@forgerock/sdk-utilities';

  const client = await davinci({ config: makeDavinciConfig(unifiedJsonConfig) });
  ```

  **New in `@forgerock/sdk-types`:**
  - `OidcConfig`, `JourneyClientConfig`, `DaVinciConfig` moved here as canonical types (previously mirrored in `sdk-utilities` as `Mapped*` types)
  - `AuthDisplayValue`, `AuthPromptValue` types added (renamed from `OidcDisplayValue`/`OidcPromptValue`)
  - `GetAuthorizationUrlOptions` extended with `loginHint`, `nonce`, `display`, `uiLocales`, `acrValues`; `prompt` widened to include `'select_account'`

  **Updated in `@forgerock/sdk-logger`:**
  - `LogLevel` now re-exported from `@forgerock/sdk-types` (single source of truth); runtime behaviour unchanged

  **New in `@forgerock/sdk-oidc`:**
  - `buildAuthorizeParams` forwards all new OIDC authorize params into the URL

  **New in `@forgerock/oidc-client`:**
  - `endSession` appends `post_logout_redirect_uri` when `signOutRedirectUri` is set on config
  - Authorize URL construction forwards `loginHint`, `state`, `nonce`, `display`, `prompt`, `uiLocales`, `acrValues`, `additionalParameters` from config

  **New in `@forgerock/journey-client`:**
  - No API change — consume `makeJourneyConfig` at call-site to use unified JSON config

  **New in `@forgerock/davinci-client`:**
  - No API change — consume `makeDavinciConfig` at call-site to use unified JSON config

## 2.0.0

### Major Changes

- [#502](https://github.com/ForgeRock/ping-javascript-sdk/pull/502) [`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d) Thanks [@ryanbas21](https://github.com/ryanbas21)! - releasing version 2 of the ping javascript sdk

### Patch Changes

- [#526](https://github.com/ForgeRock/ping-javascript-sdk/pull/526) [`5a9ea40`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5a9ea4079af4698f2d7df4bb5e7b40261aece15c) Thanks [@ancheetah](https://github.com/ancheetah)! - Update READMES. Fix types and comments.

## 1.3.0

### Minor Changes

- [#468](https://github.com/ForgeRock/ping-javascript-sdk/pull/468) [`fd14ca9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/fd14ca943d3d08911846a122fc3d7b1ee8716aca) Thanks [@ancheetah](https://github.com/ancheetah)! - Adds FIDO feature module to `@forgerock/davinci-client` package

- [#412](https://github.com/ForgeRock/ping-javascript-sdk/pull/412) [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe) Thanks [@ryanbas21](https://github.com/ryanbas21)! - feat: Update SDK types
  - Updated ESLint configurations for consistent code style and linting rules.
  - Ensured compatibility with `verbatimModuleSyntax` by correcting type-only imports and module exports.

### Patch Changes

- [#363](https://github.com/ForgeRock/ping-javascript-sdk/pull/363) [`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement OIDC logout and user info request; includes type updates and global error type

## 1.2.0

### Minor Changes

- [#253](https://github.com/ForgeRock/ping-javascript-sdk/pull/253) [`04b506c`](https://github.com/ForgeRock/ping-javascript-sdk/commit/04b506c2016324dffeba3a473bfc705843ac3e41) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Adds IFrame manager package to be able to create iframes and parse search params from the iframe url.

- [#251](https://github.com/ForgeRock/ping-javascript-sdk/pull/251) [`50fd7fa`](https://github.com/ForgeRock/ping-javascript-sdk/commit/50fd7fab9f0dd893528e85cb15f1ba6fdc1fe3e8) Thanks [@ryanbas21](https://github.com/ryanbas21)! - created sdk-storage module, which includes session,local, and token storage
