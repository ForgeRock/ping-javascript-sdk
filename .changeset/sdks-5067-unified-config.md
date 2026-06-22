---
'@forgerock/sdk-utilities': minor
'@forgerock/sdk-types': minor
'@forgerock/sdk-logger': patch
'@forgerock/sdk-oidc': minor
'@forgerock/oidc-client': minor
'@forgerock/journey-client': minor
'@forgerock/davinci-client': minor
---

Add unified cross-platform SDK configuration support

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
