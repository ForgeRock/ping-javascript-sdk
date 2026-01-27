---
'@forgerock/journey-client': minor
'@forgerock/sdk-oidc': minor
'@forgerock/sdk-utilities': minor
'@forgerock/davinci-client': patch
'@forgerock/oidc-client': patch
---

### @forgerock/journey-client

Add well-known OIDC endpoint discovery support. The journey client can now fetch configuration from the `.well-known/openid-configuration` endpoint:

```typescript
const client = await journey({
  serverConfig: {
    baseUrl: 'https://am.example.com/am/',
    wellknown:
      'https://am.example.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration',
  },
});
```

The realm path can be automatically inferred from the well-known issuer URL.

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
