# OIDC Client

A generic OpenID Connect (OIDC) client library for JavaScript and TypeScript, designed to work with PingOne platforms.

The oidc module follows the [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) specification and provides a simple and easy-to-use API to interact with the OIDC server. It allows you to authenticate, retrieve the access token, revoke the token, and sign out from the OIDC server.

## Table of Contents

- [Installation](#installation)
- [Initialization](#initialization)
  - [Configuration Options](#configuration-options)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [authorize](#authorize)
  - [token](#token)
  - [user](#user)
- [Usage Examples](#usage-examples)
  - [Redirect-Based Login](#redirect-based-login-authorizeurl)
  - [Background Authorization](#background-authorization-authorizebackground)
  - [Automatic Token Renewal](#automatic-token-renewal)
  - [Error Handling](#error-handling)

## Installation

```bash
pnpm add @forgerock/oidc-client
# or
npm install @forgerock/oidc-client
# or
yarn add @forgerock/oidc-client
```

## Initialization

```typescript
import { oidc } from '@forgerock/oidc-client';
import { OidcConfig, OidcClient } from '@forgerock/oidc-client/types';

const config: OidcConfig = {
  serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' },
  clientId: 'example-client-id',
  redirectUri: 'https://example-app/redirect-uri',
  scope: 'openid profile email',
};

const oidcClient: OidcClient = await oidc({ config });
```

### Configuration Options

The `oidc()` initialization function accepts the following configuration:

- **serverConfig** (required)
  - **wellknown** (required) - URL to the OIDC provider's well-known configuration endpoint
- **clientId** (required) - Your application's client ID registered with the OIDC provider
- **redirectUri** (required) - The URI where the OIDC provider will redirect after authentication
- **scope** (required) - Space-separated list of requested scopes (e.g., `'openid profile email'`)
- **storage** (optional) - Storage configuration for tokens (defaults to localStorage)
- **timeout** (optional) - Request timeout in milliseconds
- **additionalParameters** (optional) - Additional parameters to include in authorization requests

## Quick Start

Here's a minimal example to get started:

```js
import { oidc } from '@forgerock/oidc-client';

// Initialize the client
const oidcClient = await oidc({ config });

// Start authorization in the background
const authResponse = await oidcClient.authorize.background();

// Get tokens
const tokens = await oidcClient.token.exchange(authResponse.code, authResponse.state);

// Get user information
const user = await oidcClient.user.info();

// Clean up: logout and revoke tokens
await oidcClient.user.logout();
```

## API Reference

### authorize

Methods for creating and handling authorization flows.

#### `authorize.url(options?)`

Creates an authorization URL with the provided options or defaults from the configuration.

- **Parameters**: `GetAuthorizationUrlOptions` (optional)
- **Returns**: `Promise<string | GenericError>` - The authorization URL or an error

```js
const authUrl = await oidcClient.authorize.url();
```

#### `authorize.background(options?)`

Initiates the authorization process in the background, returning the authorization code and state or an error. This method handles the authorization flow without requiring user interaction.

- **Parameters**: `GetAuthorizationUrlOptions` (optional)
- **Returns**: `Promise<AuthorizationSuccess | AuthorizationError>` - An object containing `code` and `state` on success, or error details on failure

```js
const authResponse = await oidcClient.authorize.background();
```

### token

Methods for managing OAuth tokens.

#### `token.exchange(code, state, options?)`

Exchanges an authorization code for tokens using the token endpoint from the wellknown configuration. The tokens are automatically stored in the configured storage.

- **Parameters**:
  - `code` (string) - The authorization code received from the authorization server
  - `state` (string) - The state parameter from the authorization URL creation
  - `options` (`Partial<StorageConfig>`, optional) - Storage configuration for persisting tokens
- **Returns**: `Promise<OauthTokens | TokenExchangeErrorResponse | GenericError>` - The new tokens or an error

```js
const tokens = await oidcClient.token.exchange(authCode, authState);
```

#### `token.get(options?)`

Retrieves the current OAuth tokens from storage. Optionally auto-renews tokens if they are expired or if `backgroundRenew` is enabled.

- **Parameters**: `GetTokensOptions` (optional)
  - `forceRenew` - Force token renewal even if not expired
  - `backgroundRenew` - Automatically renew expired tokens
  - `authorizeOptions` - Options for authorization during renewal
  - `storageOptions` - Storage configuration options
- **Returns**: `Promise<OauthTokens | TokenExchangeErrorResponse | AuthorizationError | GenericError>` - The tokens or an error

```js
const tokens = await oidcClient.token.get();
```

#### `token.revoke()`

Revokes the access token using the revocation endpoint from the wellknown configuration. Requires an access token stored in the configured storage.

- **Parameters**: None
- **Returns**: `Promise<GenericError | RevokeSuccessResult | RevokeErrorResult>` - Confirmation of revocation or an error

```js
const response = await oidcClient.token.revoke();
```

### user

Methods for user information and session management.

#### `user.info()`

Retrieves user information using the userinfo endpoint from the wellknown configuration. Requires an access token stored in the configured storage.

- **Parameters**: None
- **Returns**: `Promise<GenericError | UserInfoResponse>` - User information object or an error

```js
const user = await oidcClient.user.info();
```

#### `user.logout()`

Logs out the user by revoking tokens and clearing the storage. Uses the end session endpoint from the wellknown configuration.

- **Parameters**: None
- **Returns**: `Promise<GenericError | LogoutSuccessResult | LogoutErrorResult>` - Confirmation of logout or an error

```js
const logoutResponse = await oidcClient.user.logout();
```

## Usage Examples

### Redirect-Based Login (`authorize.url()`)

Here's a practical example of implementing a redirect-based authentication flow. The user is redirected to the OIDC provider's login page:

```js
import { oidc } from '@forgerock/oidc-client';

// 1. Initialize the client
const oidcClient = await oidc({ config });

// 2. Generate authorization URL and redirect user to OIDC provider
const authUrl = await oidcClient.authorize.url();
if (typeof authUrl !== 'string' && 'error' in authUrl) {
  console.error('Failed to generate authorization URL:', authUrl.error);
} else {
  // Redirect to OIDC provider's login page
  window.location.assign(authUrl);
}

// After user logs in and is redirected back to your app with authorization code
// 3. Exchange authorization code for tokens
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

const tokens = await oidcClient.token.exchange(code, state);
if ('error' in tokens) {
  console.error('Failed to exchange code for tokens:', tokens.error);
}

// 4. Retrieve user information
const userInfo = await oidcClient.user.info();
if ('error' in userInfo) {
  console.error('Failed to fetch user info:', userInfo.error);
}

// 5. Later, when user wants to logout
const logoutResult = await oidcClient.user.logout();
if ('error' in logoutResult) {
  console.error('Logout failed:', logoutResult.error);
}
```

### Background Authorization (`authorize.background()`)

Here's an example of initiating the authorization process in the background without user interaction. This method returns the authorization code and state directly:

```js
import { oidc } from '@forgerock/oidc-client';

// 1. Initialize the client
const oidcClient = await oidc({ config });

// 2. Start authorization in the background
const authResponse = await oidcClient.authorize.background();
if ('error' in authResponse) {
  console.error('Background authorization failed:', authResponse.error);
} else {
  // 3. Exchange the authorization code for tokens
  const tokens = await oidcClient.token.exchange(authResponse.code, authResponse.state);
  if ('error' in tokens) {
    console.error('Failed to exchange code for tokens:', tokens.error);
  }

  // 4. Retrieve user information
  const userInfo = await oidcClient.user.info();
  if ('error' in userInfo) {
    console.error('Failed to fetch user info:', userInfo.error);
  }

  // 5. Later, when user wants to logout
  const logoutResult = await oidcClient.user.logout();
  if ('error' in logoutResult) {
    console.error('Logout failed:', logoutResult.error);
  }
}
```

### Automatic Token Renewal

Use automatic token renewal to keep the user's session valid. With the `backgroundRenew` option, this will either return valid tokens from storage if they exist or fetch new tokens if they are expired.

```js
// Get tokens with automatic renewal if expired
const tokens = await oidcClient.token.get({
  backgroundRenew: true,
});

if ('error' in tokens) {
  console.error('Failed to retrieve tokens:', tokens.error);
} else {
  console.log('Access token:', tokens.access_token);
}
```

### Error Handling

The library uses a consistent error handling pattern. All methods return either a success response or an error object. Check if the response contains an `error` property:

```js
// Pattern for handling responses
const result = await oidcClient.user.info();
if ('error' in result) {
  // Handle error case
  console.error('Error:', result.error);
  console.error('Error description:', result.error_description);
} else {
  // Handle success case
  console.log('User:', result);
}
```
