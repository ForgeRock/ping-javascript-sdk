# Migration Guide: Legacy JavaScript SDK to Ping SDK

This guide documents the conversion from `@forgerock/javascript-sdk` (legacy) to the newer Ping SDK packages. For the complete API-level mapping of every class, method, parameter, and return type, see [`interface_mapping.md`](./interface_mapping.md).

## Package Dependencies

| Legacy                                             | New                         | Purpose                                                            |
| -------------------------------------------------- | --------------------------- | ------------------------------------------------------------------ |
| `@forgerock/javascript-sdk` — `FRAuth` class       | `@forgerock/journey-client` | Authentication tree/journey flows                                  |
| `@forgerock/javascript-sdk` — `TokenManager` class | `@forgerock/oidc-client`    | OAuth2/OIDC token management, user info, logout                    |
| `@forgerock/javascript-sdk` — `FRDevice*` classes  | `@forgerock/device-client`  | Device profile & management (OATH, Push, WebAuthn, Bound, Profile) |
| `@forgerock/ping-protect`                          | `@forgerock/protect`        | PingOne Protect/Signals integration                                |

---

## SDK Initialization & Configuration

The legacy SDK uses a global static `Config.set()`. The new SDK uses **async factory functions** that each return an independent client instance.

| Legacy                                                                        | New                                                   | Notes                                                              |
| ----------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| `import { Config } from '@forgerock/javascript-sdk'`                          | `import { journey } from '@forgerock/journey-client'` | Journey client factory                                             |
| —                                                                             | `import { oidc } from '@forgerock/oidc-client'`       | OIDC client factory (separate package)                             |
| `Config.set({ clientId, redirectUri, scope, serverConfig, realmPath, tree })` | `const journeyClient = await journey({ config })`     | Async initialization; config per-client, not global                |
| `TokenStorage.get()`                                                          | `const tokens = await oidcClient.token.get()`         | Now part of oidcClient; check errors with `if ('error' in tokens)` |

### Wellknown Configuration

Both clients require only the OIDC wellknown endpoint URL. All other configuration (baseUrl, paths, realm) is derived automatically:

```typescript
// Shared config — both clients can use the same base config
const config = {
  serverConfig: {
    wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
  },
  clientId: 'my-app',
  redirectUri: `${window.location.origin}/callback`,
  scope: 'openid profile',
};

// Journey client — for authentication tree flows
// (accepts but ignores clientId, redirectUri, scope with a console warning)
const journeyClient = await journey({ config });

// OIDC client — for token management, user info, logout
// (requires clientId, redirectUri, scope)
const oidcClient = await oidc({ config });
```

---

## Authentication & Journey Flow

| Legacy Method                          | New Method                                  | Notes                                                              |
| -------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| `FRAuth.start({ tree: 'Login' })`      | `journeyClient.start({ journey: 'Login' })` | Tree name passed per-call via `journey` param (not in config)      |
| `FRAuth.next(step, { tree: 'Login' })` | `journeyClient.next(step)`                  | Tree is set at `start()`, not repeated on `next()`                 |
| `FRAuth.redirect(step)`                | `await journeyClient.redirect(step)`        | Now async. Step stored in `sessionStorage` (was `localStorage`)    |
| `FRAuth.resume(resumeUrl)`             | `await journeyClient.resume(resumeUrl)`     | Previous step retrieved from `sessionStorage` (was `localStorage`) |
| `SessionManager.logout()`              | `await journeyClient.terminate()`           | Ends the AM session via `/sessions` endpoint                       |

### Before/After: Login Flow

**Legacy:**

```typescript
import { FRAuth, StepType } from '@forgerock/javascript-sdk';

Config.set({
  serverConfig: { baseUrl: 'https://am.example.com/am' },
  realmPath: 'alpha',
  tree: 'Login',
});

let step = await FRAuth.start();
while (step.type === StepType.Step) {
  // ... handle callbacks ...
  step = await FRAuth.next(step);
}
if (step.type === StepType.LoginSuccess) {
  console.log('Session token:', step.getSessionToken());
}
```

**New:**

```typescript
import { journey } from '@forgerock/journey-client';

const journeyClient = await journey({
  config: {
    serverConfig: {
      wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
    },
  },
});

let result = await journeyClient.start({ journey: 'Login' });
while (result.type === 'Step') {
  // ... handle callbacks ...
  result = await journeyClient.next(result);
}
if ('error' in result) {
  console.error('Journey error:', result);
} else if (result.type === 'LoginSuccess') {
  console.log('Session token:', result.getSessionToken());
}
```

---

## User Management

| Legacy                                 | New                              | Notes                                                    |
| -------------------------------------- | -------------------------------- | -------------------------------------------------------- |
| `UserManager.getCurrentUser()`         | `await oidcClient.user.info()`   | Returns typed `UserInfoResponse` or `GenericError`       |
| `FRUser.logout({ logoutRedirectUri })` | `await oidcClient.user.logout()` | Revokes tokens + ends session. Returns structured result |

---

## Token Management & OAuth Flow

| Legacy                                                                                               | New                                                                                           | Notes                                                             |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `TokenManager.getTokens({ forceRenew: true })`                                                       | `await oidcClient.token.get({ forceRenew: true, backgroundRenew: true })`                     | Single call with auto-renewal. Returns tokens or error            |
| `OAuth2Client.getAuthCodeByIframe()` then `TokenManager.getTokens({ authorizationCode, ...params })` | `await oidcClient.authorize.background()` then `await oidcClient.token.exchange(code, state)` | Two-step when you need explicit control over authorize + exchange |
| `TokenManager.deleteTokens()`                                                                        | `await oidcClient.token.revoke()`                                                             | Revokes remotely AND deletes locally                              |
| `TokenStorage.get()`                                                                                 | `await oidcClient.token.get()`                                                                | Auto-retrieves from storage; check `'error' in tokens`            |
| `TokenStorage.set(tokens)`                                                                           | Handled automatically by `oidcClient.token.exchange()`                                        | Tokens stored after exchange                                      |
| `TokenStorage.remove()`                                                                              | `await oidcClient.token.revoke()`                                                             | Combined revoke + delete                                          |

### Token Type Change

| Legacy                                                           | New                                                                                 | Change                                                                               |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `Tokens { accessToken?, idToken?, refreshToken?, tokenExpiry? }` | `OauthTokens { accessToken, idToken, refreshToken?, expiresAt?, expiryTimestamp? }` | `accessToken` and `idToken` now required. `tokenExpiry` renamed to `expiryTimestamp` |

---

## Callback & WebAuthn

| Legacy                                                                     | New                                                                               | Notes                                       |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| `import { CallbackType } from '@forgerock/javascript-sdk'`                 | `import { callbackType } from '@forgerock/journey-client'`                        | PascalCase enum → camelCase object          |
| `CallbackType.RedirectCallback`                                            | `callbackType.RedirectCallback`                                                   | Values remain the same strings              |
| `import { FRCallback } from '@forgerock/javascript-sdk'`                   | `import { BaseCallback } from '@forgerock/journey-client/types'`                  | Base class renamed                          |
| `import { NameCallback, ... } from '@forgerock/javascript-sdk'`            | `import { NameCallback, ... } from '@forgerock/journey-client/types'`             | Same class names, different import path     |
| `import { FRWebAuthn, WebAuthnStepType } from '@forgerock/javascript-sdk'` | `import { WebAuthn, WebAuthnStepType } from '@forgerock/journey-client/webauthn'` | `FRWebAuthn` → `WebAuthn`, submodule import |

---

## Step Types

| Legacy                            | New                                 | Notes                                                 |
| --------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| `FRStep` (class instance)         | `JourneyStep` (object type)         | Cannot use `instanceof`; use `result.type === 'Step'` |
| `FRLoginSuccess` (class instance) | `JourneyLoginSuccess` (object type) | Use `result.type === 'LoginSuccess'`                  |
| `FRLoginFailure` (class instance) | `JourneyLoginFailure` (object type) | Use `result.type === 'LoginFailure'`                  |

All step methods (`getCallbackOfType`, `getDescription`, `getHeader`, `getStage`, `getSessionToken`, etc.) remain identical.

---

## HTTP Client

The legacy `HttpClient` is removed. It provided auto bearer-token injection, 401 token refresh, and policy advice handling. In the new SDK, manage tokens manually:

```typescript
const tokens = await oidcClient.token.get({ backgroundRenew: true });
if ('error' in tokens) {
  throw new Error('No valid tokens');
}

const response = await fetch('https://api.example.com/resource', {
  method: 'GET',
  headers: { Authorization: `Bearer ${tokens.accessToken}` },
});
```

---

## Error Handling Pattern

Client **initialization** (factory functions like `journey()` and `oidc()`) will **throw** when misconfigured. However, once initialized, client **methods** return error objects instead of throwing exceptions. Some `journey-client` methods may still throw in certain edge cases (known tech debt). Defensive code should handle both patterns:

| Legacy                                           | New                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `try { ... } catch (err) { console.error(err) }` | `if ('error' in result) { console.error(result.error, result.message) }` |

**Legacy:**

```typescript
try {
  const user = await UserManager.getCurrentUser();
  setUser(user);
} catch (err) {
  console.error(`Error: get current user; ${err}`);
  setUser({});
}
```

**New:**

```typescript
const user = await oidcClient.user.info();
if ('error' in user) {
  console.error('Error getting user:', user);
  setUser({});
} else {
  setUser(user);
}
```

---

## Summary of Key Changes

1. **Async-First Initialization**: SDK clients initialized asynchronously with factory functions (`journey()`, `oidc()`)
2. **Instance-Based APIs**: Methods called on client instances, not static classes
3. **Separated Packages**: Journey auth (`@forgerock/journey-client`), OIDC (`@forgerock/oidc-client`), Device (`@forgerock/device-client`), Protect (`@forgerock/protect`)
4. **Explicit Error Handling**: Response objects contain `{ error }` property instead of throwing exceptions
5. **Wellknown-Based Discovery**: Only `serverConfig.wellknown` is required; all paths derived automatically
6. **No Built-in HTTP Client**: Protected API requests require manual token retrieval and header management
7. **Config Fixed at Creation**: Per-call config overrides removed; create separate client instances for different configs

---

## Further Reference

For the complete API-level mapping (every class, method, parameter change, return type change, and behavioral note), see [`interface_mapping.md`](./interface_mapping.md).
