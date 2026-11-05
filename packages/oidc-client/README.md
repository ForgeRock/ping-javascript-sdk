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
  - [Pushed Authorization Requests (PAR)](#pushed-authorization-requests-par)
  - [Rich Authorization Requests (RAR)](#rich-authorization-requests-rar)
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
- **par** (optional) - Use Pushed Authorization Requests (PAR) for the authorization flow; omitted auto-detects from the server's well-known configuration (see [Pushed Authorization Requests (PAR)](#pushed-authorization-requests-par))
- **authorizationDetails** (optional) - Use Rich Authorization Requests (RAR) for the authorization flow. See [Rich Authorization Requests (RAR)](#rich-authorization-requests-rar).

See `OidcConfig` interface for the full list of options.

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

#### `user.session(options?)`

Checks whether the user has an active session at the AS without prompting for login (`prompt=none`).

- **Parameters**: `SessionCheckOptions` (optional)
- **Returns**: `Promise<SessionCheckSuccess | GenericError>`

```js
const session = await oidcClient.user.session();
if ('error' in session) {
  // No active session
}
```

##### `responseType: 'none'` (default)

Use when you only need to know if a session is alive — no claims are returned.

Requires a stored `id_token` to send as `id_token_hint`. Fails immediately with `no_id_token_hint` if storage is empty.

How the check runs depends on `redirectUri`:

- **With `redirectUri`** (iframe): a hidden iframe loads the authorization URL. The AS redirects to `redirectUri` on success or appends error params on failure. The `redirectUri` must be same-origin — the browser blocks cross-origin iframe content access.
- **Without `redirectUri`** (fetch): a plain GET to the authorization endpoint — no iframe. The AS returns `204` on success or `400` on failure. Use this when no same-origin callback page is available.

Returns `{ responseType: 'none' }` on success.

##### `responseType: 'id_token'`

Use when you need the user's claims back from the session. The AS issues a fresh `id_token` whose decoded claims are returned on success.

Always uses the iframe path — `redirectUri` is required. A stored `id_token` is sent as `id_token_hint` if available but is not required.

`state` and `nonce` are validated before claims are returned. If `subject` is provided, the `sub` claim must also match — otherwise any active session's claims are returned.

```js
const session = await oidcClient.user.session({
  responseType: 'id_token',
  subject: knownUserId, // optional — omit to get claims for whoever is logged in
});
if (!('error' in session)) {
  console.log(session.claims); // JWTPayload
}
```

Returns `{ responseType: 'id_token', claims: JWTPayload }` on success.

##### PingOne compatibility note

PingOne SaaS does not support `response_type=none`. Its authorization server only accepts `code`, `token`, and `id_token` as response types — `none` is not listed as an option in the [PingOne application configuration](https://docs.pingidentity.com/pingone/applications/p1_edit_application_oidc.html), the [PingOne response types reference](https://docs.pingidentity.com/pingone/applications/p1_responsetypes.html), the [PingOne Platform API reference](https://developer.pingidentity.com/pingone-api/auth/openid-connect-oauth-2.html), or the [PingOne support for response_mode options](https://developer.pingidentity.com/pingone-api/auth/auth-config-options/browserless-authentication-flow-options.html#pingone-support-for-response_mode-options).

Use `responseType: 'id_token'` when connecting to PingOne.

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

### Pushed Authorization Requests (PAR)

The client supports [Pushed Authorization Requests](https://datatracker.ietf.org/doc/html/rfc9126) (PAR, RFC 9126), an OAuth 2.0 extension that hardens the authorization flow.

In a standard flow, all authorization parameters (`redirect_uri`, `scope`, PKCE `code_challenge`, `state`, and so on) are packed into the authorize URL and pass through the browser. With PAR, the client first POSTs those parameters directly to the server's PAR endpoint, receives a short-lived `request_uri`, and then sends the browser to the authorization endpoint with only `client_id` and `request_uri` in the URL:

**Enabling PAR**

PAR is enabled with the `par` configuration option:

```js
const config = {
  serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' },
  clientId: 'example-client-id',
  redirectUri: 'https://example-app/redirect-uri',
  scope: 'openid profile email',
  par: true,
};
```

How it resolves:

- `par: true` — always use PAR
- `par: false` — never use PAR; OIDC Client initialization fails if the server's well-known configuration advertises `require_pushed_authorization_requests: true`
- `par` omitted — PAR is used automatically when the server requires it, otherwise the standard flow is used

Both `authorize.url()` and `authorize.background()` respect this setting. The `request_uri` is single-use and short-lived (typically 30–90 seconds), so the authorize navigation must complete before it expires.

### Rich Authorization Requests (RAR)

The client supports [Rich Authorization Requests](https://datatracker.ietf.org/doc/html/rfc9396) (RAR, RFC 9396), an OAuth 2.0 extension that lets the client request fine-grained, transaction-specific authorization instead of just scopes. Details are sent as the `authorization_details` request parameter — a JSON array describing _what_ the client wants to do rather than a coarse scope string.

Each detail object has a `type` string defined by the authorization server, plus the standard fields `locations`, `actions`, `datatypes`, and `privileges`. Type-specific fields the SDK doesn't model go in `additionalFields`, whose entries are flattened onto the object before the request is sent.

**Declaring authorization details**

Details can be set at initialization, so they apply to every authorization request the client makes:

```js
const config = {
  serverConfig: { wellknown: 'https://example.com/.well-known/openid-configuration' },
  clientId: 'example-client-id',
  redirectUri: 'https://example-app/redirect-uri',
  scope: 'openid profile email',
  authorizationDetails: [
    {
      type: 'payment_initiation',
      actions: ['initiate', 'status'],
      locations: ['https://example.com/payments'],
      instructedAmount: { currency: 'EUR', amount: '123.50' },
      creditorName: 'Merchant A',
    },
  ],
};
```

Type-specific fields like `instructedAmount` and `creditorName` can be passed through `additionalFields`:

```js
const config = {
  // ...other options
  authorizationDetails: [
    {
      type: 'payment_initiation',
      actions: ['initiate', 'status'],
      locations: ['https://example.com/payments'],
      additionalFields: {
        instructedAmount: { currency: 'EUR', amount: '123.50' },
        creditorName: 'Merchant A',
      },
    },
  ],
};
```

Authorization details can alternatively be supplied per call, which overrides the OIDC Client configuration for that request:

```js
const authResponse = await oidcClient.authorize.background({
  authorizationDetails: [
    {
      type: 'account_information',
      actions: ['list', 'read'],
      locations: ['https://example.com/accounts'],
      datatypes: ['balances', 'transactions'],
    },
  ],
});
```

Details are serialized to JSON for the `authorization_details` parameter and are included in both the standard flow and the pushed (PAR) request body. Server support for RAR is required; consult your authorization server's documentation for the detail `type` values and fields it accepts.

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
