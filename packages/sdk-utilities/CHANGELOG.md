# @forgerock/sdk-utilities

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

### Patch Changes

- Updated dependencies [[`4fe7bfe`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4fe7bfeba94627eed14f787c73384aed34be80ff)]:
  - @forgerock/sdk-types@2.1.0

## 2.0.0

### Major Changes

- [#502](https://github.com/ForgeRock/ping-javascript-sdk/pull/502) [`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d) Thanks [@ryanbas21](https://github.com/ryanbas21)! - releasing version 2 of the ping javascript sdk

### Minor Changes

- [#525](https://github.com/ForgeRock/ping-javascript-sdk/pull/525) [`9a8ca14`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9a8ca14e1bd4dd6c81d3f7726c888b1d4e0252fb) Thanks [@ryanbas21](https://github.com/ryanbas21)! - ### @forgerock/journey-client

  Add well-known OIDC endpoint discovery support. The journey client can now fetch configuration from the `.well-known/openid-configuration` endpoint. The realm path can be automatically inferred from the well-known issuer URL.

  ### @forgerock/sdk-oidc

  Add shared well-known module with RTK Query API for OIDC endpoint discovery:
  - `wellknownApi` - RTK Query API for fetching well-known configuration
  - `createWellknownSelector` - Selector factory for cached well-known data
  - `createWellknownError` - Typed error creation from fetch failures
  - Re-exports pure utilities from `@forgerock/sdk-utilities`

  ### @forgerock/sdk-utilities

  Add pure well-known utilities:
  - `inferRealmFromIssuer` - Extract realm path from AM issuer URLs
  - `isValidWellknownUrl` - Validate well-known URLs (HTTPS required, HTTP allowed for localhost)

  ### @forgerock/davinci-client

  Refactored to use shared well-known module from `@forgerock/sdk-oidc`.

  ### @forgerock/oidc-client

  Refactored to use shared well-known module from `@forgerock/sdk-oidc`.

### Patch Changes

- [#510](https://github.com/ForgeRock/ping-javascript-sdk/pull/510) [`3c63979`](https://github.com/ForgeRock/ping-javascript-sdk/commit/3c63979f83486e0914b61b6accfd5345e6eff152) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Fix error handling in storage client and davinci-client
  - Add `isGenericError` type guard to sdk-utilities for runtime error validation
  - Fix storage client to properly catch errors from custom storage implementations, honoring the errors-as-values contract
  - Improve davinci-client error handling to use explicit error checks instead of try-catch

- [#526](https://github.com/ForgeRock/ping-javascript-sdk/pull/526) [`5a9ea40`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5a9ea4079af4698f2d7df4bb5e7b40261aece15c) Thanks [@ancheetah](https://github.com/ancheetah)! - Update READMES. Fix types and comments.

- Updated dependencies [[`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d), [`5a9ea40`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5a9ea4079af4698f2d7df4bb5e7b40261aece15c)]:
  - @forgerock/sdk-types@2.0.0

## 1.3.0

### Minor Changes

- [#412](https://github.com/ForgeRock/ping-javascript-sdk/pull/412) [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe) Thanks [@ryanbas21](https://github.com/ryanbas21)! - feat: Update SDK utilities
  - Inlined `REQUESTED_WITH` and `X_REQUESTED_PLATFORM` constants with literal types for better tree-shaking and type narrowing.

## 1.2.0

### Minor Changes

- [#246](https://github.com/ForgeRock/ping-javascript-sdk/pull/246) [`0d54b34`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0d54b3461443fcf5c5071a08578f2d418f066073) Thanks [@cerebrl](https://github.com/cerebrl)! - created effects type packages, logger, oidc, and request middleware
