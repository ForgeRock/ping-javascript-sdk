# @forgerock/oidc-client

A generic, modern, and type-safe OpenID Connect (OIDC) client library for JavaScript and TypeScript. Built with `effect-ts`, it provides a robust and functional approach to interact with any OIDC-compliant identity provider.

## Features

- **OIDC Compliant**: Works with any standard OpenID Connect identity provider.
- **Functional & Type-Safe**: Built with `effect-ts` to provide a predictable, functional API with strong type safety and robust error handling. Promises returned by this library do not throw; instead, they resolve to either a success or an error object.
- **Background Token Acquisition**: Supports background authorization via hidden iframes or the `pi.flow` response mode for a seamless user experience without full-page redirects.
- **Extensible Middleware**: Intercept and modify outgoing requests using a flexible middleware pipeline.
- **Configurable Storage**: Persist tokens in `localStorage`, `sessionStorage`, or a custom storage implementation.
- **Configurable Logging**: Integrates with a flexible logger to provide detailed insights for debugging.

## Installation

```bash
pnpm add @forgerock/oidc-client
# or
npm install @forgerock/oidc-client
# or
yarn add @forgerock/oidc-client
```

## API Usage

### 1. Initialization

First, initialize the OIDC client by calling the `oidc` factory function with your configuration.

```typescript
import { oidc } from '@forgerock/oidc-client';
import type {
  OidcConfig,
  RequestMiddleware,
  CustomLogger,
  StorageConfig,
} from '@forgerock/oidc-client/types';

// 1. Define the core OIDC configuration
const config: OidcConfig = {
  clientId: 'my-client-id',
  redirectUri: 'https://app.example.com/callback',
  scope: 'openid profile email',
  serverConfig: {
    wellknown: 'https://idp.example.com/.well-known/openid-configuration',
  },
};

// 2. (Optional) Define request middleware
const myMiddleware: RequestMiddleware[] = [
  (req, action, next) => {
    console.log(`OIDC Middleware: Intercepting action - ${action.type}`);
    req.headers.set('X-Custom-Header', 'my-value');
    next();
  },
];

// 3. (Optional) Define a custom logger
const myLogger: CustomLogger = {
  log: (message) => console.log(`CUSTOM: ${message}`),
  error: (message) => console.error(`CUSTOM: ${message}`),
  warn: (message) => console.warn(`CUSTOM: ${message}`),
  debug: (message) => console.debug(`CUSTOM: ${message}`),
};

// 4. (Optional) Define custom storage
const myStorage: StorageConfig = {
  type: 'sessionStorage', // or 'localStorage', or 'custom'
  name: 'my-app-tokens',
};

// 5. Initialize the client
const oidcClient = await oidc({
  config,
  requestMiddleware: myMiddleware,
  logger: {
    level: 'debug',
    custom: myLogger,
  },
  storage: myStorage,
});

if ('error' in oidcClient) {
  throw new Error(`OIDC client initialization failed: ${oidcClient.error}`);
}
```

### 2. Authorization

The client supports two primary ways to authorize the user: a full-page redirect or a background flow.

#### Full-Page Redirect

Generate the authorization URL and redirect the user.

```typescript
// Get the authorization URL
const authUrl = await oidcClient.authorize.url();

if (typeof authUrl === 'string') {
  // Redirect the user to the authorization server
  window.location.href = authUrl;
} else {
  console.error('Failed to create authorization URL:', authUrl.error);
}
```

#### Background Authorization

Attempt to get an authorization code without a full-page redirect using a hidden iframe or `pi.flow`.

```typescript
const authResponse = await oidcClient.authorize.background();

if ('code' in authResponse) {
  console.log('Background authorization successful!');
  // Proceed to exchange the code for tokens
  exchangeTokens(authResponse.code, authResponse.state);
} else {
  console.error('Background authorization failed:', authResponse.error_description);
  // Fallback to a full-page redirect if needed
  if (authResponse.redirectUrl) {
    window.location.href = authResponse.redirectUrl;
  }
}
```

### 3. Token Exchange

After a successful authorization, exchange the `code` for tokens.

```typescript
async function exchangeTokens(code: string, state: string) {
  const tokens = await oidcClient.token.exchange(code, state);

  if ('accessToken' in tokens) {
    console.log('Tokens exchanged successfully:', tokens);
    // Tokens are automatically stored in the configured storage
  } else {
    console.error('Token exchange failed:', tokens.message);
  }
}
```

### 4. Token Management

#### Get Tokens

Retrieve tokens from storage. This method can also handle background renewal.

```typescript
// Get existing tokens
const tokens = await oidcClient.token.get();
if (tokens && 'accessToken' in tokens) {
  console.log('Found tokens:', tokens);
} else {
  console.log('No tokens found.');
}

// Get tokens, and renew in the background if they are expired or close to expiring
const freshTokens = await oidcClient.token.get({ backgroundRenew: true });
if (freshTokens && 'accessToken' in freshTokens) {
  console.log('Got fresh tokens:', freshTokens);
} else {
  console.error('Failed to get or renew tokens:', freshTokens);
}
```

#### Revoke Tokens

Revoke the access token and remove it from storage.

```typescript
const revokeResult = await oidcClient.token.revoke();

if (revokeResult && 'error' in revokeResult) {
  console.error('Token revocation failed:', revokeResult);
} else {
  console.log('Token revoked successfully.');
}
```

### 5. User Management

#### Get User Info

Fetch user information from the `userinfo_endpoint`.

```typescript
const userInfo = await oidcClient.user.info();

if (userInfo && 'sub' in userInfo) {
  console.log('User info:', userInfo);
} else {
  console.error('Failed to fetch user info:', userInfo);
}
```

#### Logout

Log the user out by revoking tokens and, if configured, ending the session at the provider.

```typescript
const logoutResult = await oidcClient.user.logout();

if (logoutResult && 'error' in logoutResult) {
  console.error('Logout failed:', logoutResult);
} else {
  console.log('User logged out successfully.');
}
```

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/oidc-client
```

## Testing

To run the unit tests for this package, run:

```bash
pnpm nx test @forgerock/oidc-client
```
