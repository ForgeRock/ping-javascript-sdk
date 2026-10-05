---
'@forgerock/oidc-client': minor
'@forgerock/sdk-types': minor
'@forgerock/sdk-utilities': minor
'@forgerock/davinci-client': patch
---

`redirectUri` is now optional in the OIDC client config and omitted from authorize requests when not set. Client config options (e.g. `responseMode`, `prompt`, `query`) are now forwarded to authorize requests, and per-request `authorizeOptions` accept `null` to explicitly unset a config default.
