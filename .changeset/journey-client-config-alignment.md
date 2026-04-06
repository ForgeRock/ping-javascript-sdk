---
'@forgerock/journey-client': patch
---

Extend `JourneyClientConfig` from `AsyncLegacyConfigOptions` so the same config object can be shared across journey-client, davinci-client, and oidc-client

- `clientId`, `scope`, `redirectUri`, and other inherited properties are now accepted but ignored — a warning is logged when they are provided
- `serverConfig.wellknown` remains required
