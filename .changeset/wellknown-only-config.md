---
'@forgerock/journey-client': major
---

BREAKING: Unify journey-client around wellknown-only configuration

This release simplifies the configuration API by requiring the `wellknown` URL and automatically inferring `baseUrl` and `realmPath`.

## Breaking Changes

- **Removed `baseUrl` from `JourneyServerConfig`**: The `baseUrl` is now always inferred from the wellknown URL. If inference fails (non-AM server), an error is returned.
- **Removed `hasWellknownConfig` export**: This type guard is no longer needed since all configs use wellknown.

## Migration

**Before:**

```typescript
journey({
  config: {
    serverConfig: { baseUrl: 'https://am.example.com/am/' },
    realmPath: 'alpha',
  },
});
```

**After:**

```typescript
journey({
  config: {
    serverConfig: {
      wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
    },
    // realmPath is now optional - inferred from wellknown issuer
  },
});
```

## Features

- Automatic `baseUrl` inference from wellknown URL (extracts path before `/oauth2/`)
- Automatic `realmPath` inference from wellknown issuer
- Improved error messages for non-AM servers, guiding users to appropriate clients
- Updated README with comprehensive API documentation
