---
'@forgerock/device-client': minor
---

Removed the dependency on `@forgerock/javascript-sdk` from `device-client` and the e2e app.

**BREAKING:** The `tokenStore` config now accepts a `CustomStorageObject` (from `@forgerock/sdk-types`) instead of the legacy `TokenStoreObject`. Custom token-store implementers must adapt: `get` now returns `Promise<string | null | GenericError>` instead of `Promise<Tokens>`. Usage of the `'sessionStorage'`/`'localStorage'` string values is unaffected.
