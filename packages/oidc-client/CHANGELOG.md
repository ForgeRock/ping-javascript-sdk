# @forgerock/oidc-client

## 2.1.0

### Minor Changes

- [#682](https://github.com/ForgeRock/ping-javascript-sdk/pull/682) [`35816b4`](https://github.com/ForgeRock/ping-javascript-sdk/commit/35816b45259e869a62ac8de8673e69df777330ef) Thanks [@vatsalparikh](https://github.com/vatsalparikh)! - Add `user.session()` method to oidc client for OIDC prompt=none session verification, with `response_type=none` and `response_type=id_token` support.

- [#633](https://github.com/ForgeRock/ping-javascript-sdk/pull/633) [`dcb54b2`](https://github.com/ForgeRock/ping-javascript-sdk/commit/dcb54b27323aef3ce5f08286b8067d53476c03cc) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Expose `subscribe` method on journey and oidc client instances, consistent with davinci-client. Allows consumers to listen for store state changes.

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

- [#631](https://github.com/ForgeRock/ping-javascript-sdk/pull/631) [`15d616d`](https://github.com/ForgeRock/ping-javascript-sdk/commit/15d616d665ed6daec7c55fdcdcfe7256972a805c) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Add support for PAR in oidc-client requests for redirect flows

### Patch Changes

- [#564](https://github.com/ForgeRock/ping-javascript-sdk/pull/564) [`15d5af3`](https://github.com/ForgeRock/ping-javascript-sdk/commit/15d5af32310174296ae1513c95168c5e8336d668) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Update interfaces and types that are missing from exports

- Updated dependencies [[`35816b4`](https://github.com/ForgeRock/ping-javascript-sdk/commit/35816b45259e869a62ac8de8673e69df777330ef), [`ec39137`](https://github.com/ForgeRock/ping-javascript-sdk/commit/ec3913769fbd1572f09fdf3fd45dcb61e84866c9), [`d849256`](https://github.com/ForgeRock/ping-javascript-sdk/commit/d849256768abea11d8e034fb982ae4220a5b7801), [`4fe7bfe`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4fe7bfeba94627eed14f787c73384aed34be80ff), [`15d616d`](https://github.com/ForgeRock/ping-javascript-sdk/commit/15d616d665ed6daec7c55fdcdcfe7256972a805c)]:
  - @forgerock/iframe-manager@2.1.0
  - @forgerock/sdk-request-middleware@2.1.0
  - @forgerock/storage@2.1.0
  - @forgerock/sdk-logger@2.1.0
  - @forgerock/sdk-oidc@2.1.0
  - @forgerock/sdk-utilities@2.1.0
  - @forgerock/sdk-types@2.1.0

## 2.0.0

### Major Changes

- [#502](https://github.com/ForgeRock/ping-javascript-sdk/pull/502) [`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d) Thanks [@ryanbas21](https://github.com/ryanbas21)! - releasing version 2 of the ping javascript sdk

### Minor Changes

- [#527](https://github.com/ForgeRock/ping-javascript-sdk/pull/527) [`bca228e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/bca228e7a9beb1991159c42a03e537c29687b6e6) Thanks [@ancheetah](https://github.com/ancheetah)! - Expose return types for clients

### Patch Changes

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

- [#526](https://github.com/ForgeRock/ping-javascript-sdk/pull/526) [`5a9ea40`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5a9ea4079af4698f2d7df4bb5e7b40261aece15c) Thanks [@ancheetah](https://github.com/ancheetah)! - Update READMES. Fix types and comments.

- Updated dependencies [[`3c63979`](https://github.com/ForgeRock/ping-javascript-sdk/commit/3c63979f83486e0914b61b6accfd5345e6eff152), [`ad81c13`](https://github.com/ForgeRock/ping-javascript-sdk/commit/ad81c13ab2b863be46a98803e48754b0e2b3746b), [`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d), [`9a8ca14`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9a8ca14e1bd4dd6c81d3f7726c888b1d4e0252fb), [`5a9ea40`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5a9ea4079af4698f2d7df4bb5e7b40261aece15c)]:
  - @forgerock/storage@2.0.0
  - @forgerock/sdk-logger@2.0.0
  - @forgerock/iframe-manager@2.0.0
  - @forgerock/sdk-oidc@2.0.0
  - @forgerock/sdk-request-middleware@2.0.0
  - @forgerock/sdk-types@2.0.0

## 1.3.0

### Minor Changes

- [#348](https://github.com/ForgeRock/ping-javascript-sdk/pull/348) [`beb349a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/beb349a9a13e7bb8fbad35bf9bda9e340545cffa) Thanks [@cerebrl](https://github.com/cerebrl)! - Implemented token exchange within OIDC Client

- [#376](https://github.com/ForgeRock/ping-javascript-sdk/pull/376) [`c48d9c8`](https://github.com/ForgeRock/ping-javascript-sdk/commit/c48d9c8ba58b59d2c29b954d34b1a3606ef4d6a1) Thanks [@ancheetah](https://github.com/ancheetah)! - Implement token `revoke` method

- [#344](https://github.com/ForgeRock/ping-javascript-sdk/pull/344) [`dc4d4bd`](https://github.com/ForgeRock/ping-javascript-sdk/commit/dc4d4bdb5aa781660de631f45b22620e400d9f4a) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement authorize functionality in oidc-client
  - Provide authorize URL method for URL creation
  - Provide background method for authorization without redirection
  - Introduce Micro from the Effect package

- [#402](https://github.com/ForgeRock/ping-javascript-sdk/pull/402) [`bdbbbd2`](https://github.com/ForgeRock/ping-javascript-sdk/commit/bdbbbd28af3f56393d12feb63d0c353ba7c89fa1) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement force renew and revoke tokens that are replaced to tokens.get method

- [#368](https://github.com/ForgeRock/ping-javascript-sdk/pull/368) [`5fe1f95`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5fe1f95667761a6a35b69e0b278e086e7cbc7e98) Thanks [@ancheetah](https://github.com/ancheetah)! - Added tests for oidc client

- [#363](https://github.com/ForgeRock/ping-javascript-sdk/pull/363) [`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement OIDC logout and user info request; includes type updates and global error type

- [#417](https://github.com/ForgeRock/ping-javascript-sdk/pull/417) [`93595d2`](https://github.com/ForgeRock/ping-javascript-sdk/commit/93595d265234cd149ff76dbac20e3e1031c3ef5f) Thanks [@ancheetah](https://github.com/ancheetah)! - - Standardizes return types on storage client and updates tests
  - Improves OIDC client where storage client methods are used

- [#378](https://github.com/ForgeRock/ping-javascript-sdk/pull/378) [`4d0ee71`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4d0ee71ad7570d63a2d7dba965e1469ffb4cff08) Thanks [@cerebrl](https://github.com/cerebrl)! - Migrate /authorize to RTK Query and improve result types

- [#369](https://github.com/ForgeRock/ping-javascript-sdk/pull/369) [`7cb0519`](https://github.com/ForgeRock/ping-javascript-sdk/commit/7cb0519b833ec8094a57cc20c4183fc4e521e132) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement token `get` method for local tokens and autorenew

### Patch Changes

- [#471](https://github.com/ForgeRock/ping-javascript-sdk/pull/471) [`ef4ab6f`](https://github.com/ForgeRock/ping-javascript-sdk/commit/ef4ab6ffb8ba3179d9fc11442986d38448a5d0f2) Thanks [@ancheetah](https://github.com/ancheetah)! - Append query params to authorization url when provided

- Updated dependencies [[`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe), [`beb349a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/beb349a9a13e7bb8fbad35bf9bda9e340545cffa), [`dc4d4bd`](https://github.com/ForgeRock/ping-javascript-sdk/commit/dc4d4bdb5aa781660de631f45b22620e400d9f4a), [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe), [`7ffa428`](https://github.com/ForgeRock/ping-javascript-sdk/commit/7ffa428b0fda63d978e181cd5c9150777d863f40), [`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c), [`93595d2`](https://github.com/ForgeRock/ping-javascript-sdk/commit/93595d265234cd149ff76dbac20e3e1031c3ef5f), [`fd14ca9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/fd14ca943d3d08911846a122fc3d7b1ee8716aca), [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe), [`ef4ab6f`](https://github.com/ForgeRock/ping-javascript-sdk/commit/ef4ab6ffb8ba3179d9fc11442986d38448a5d0f2), [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe)]:
  - @forgerock/storage@1.3.0
  - @forgerock/iframe-manager@1.3.0
  - @forgerock/sdk-oidc@1.3.0
  - @forgerock/sdk-types@1.3.0
  - @forgerock/sdk-logger@1.3.0
  - @forgerock/sdk-request-middleware@1.3.0

## 1.2.0

### Patch Changes

- [#279](https://github.com/ForgeRock/ping-javascript-sdk/pull/279) [`ad03cd5`](https://github.com/ForgeRock/ping-javascript-sdk/commit/ad03cd567ce9364880d46162a1cb787deb2f8b15) Thanks [@ryanbas21](https://github.com/ryanbas21)! - adds token-store module to newly created oidc-client for generic oidc interactions.

- Updated dependencies [[`04b506c`](https://github.com/ForgeRock/ping-javascript-sdk/commit/04b506c2016324dffeba3a473bfc705843ac3e41), [`50fd7fa`](https://github.com/ForgeRock/ping-javascript-sdk/commit/50fd7fab9f0dd893528e85cb15f1ba6fdc1fe3e8)]:
  - @forgerock/sdk-types@1.2.0
  - @forgerock/storage@1.2.0
