# @forgerock/sdk-effects-oidc

## Overview

The `@forgerock/sdk-effects-oidc` package provides a comprehensive and type-safe implementation of OpenID Connect (OIDC) flows, built on top of the Effect-TS ecosystem. It simplifies the integration of OIDC-based authentication and authorization into your JavaScript applications by abstracting away the complexities of the protocol.

This package offers:

- **Authorization Code Flow with PKCE**: Securely handles user authentication and token acquisition.
- **Token Management**: Provides methods for exchanging authorization codes, refreshing tokens, and revoking sessions.
- **User Information**: Fetches user profile data from the OIDC UserInfo endpoint.
- **Token Introspection**: Verifies the active state and metadata of access tokens.
- **Session Management**: Supports ending user sessions.

By leveraging Effect-TS, all operations are lazy, composable, and provide robust error handling, making your authentication flows more predictable and resilient.

## Installation

```bash
pnpm add @forgerock/sdk-effects-oidc
# or
npm install @forgerock/sdk-effects-oidc
# or
yarn add @forgerock/sdk-effects-oidc
```

## API Reference

### `oidc(config: OIDCClientConfig)`

This is the main factory function that initializes the OIDC client effect.

- **`config: OIDCClientConfig`**: An object containing the OIDC client configuration.
  - **`clientId: string`**: The client ID of your application registered with the OIDC provider.
  - **`redirectUri: string`**: The URI to which the OIDC provider will redirect the user after authentication.
  - **`scope: string`**: A space-separated list of scopes requested (e.g., `openid profile email`).
  - **`authorizationEndpoint: string`**: The OIDC provider's authorization endpoint URL.
  - **`tokenEndpoint: string`**: The OIDC provider's token endpoint URL.
  - **`endSessionEndpoint?: string`**: (Optional) The OIDC provider's end session endpoint URL.
  - **`userInfoEndpoint?: string`**: (Optional) The OIDC provider's user info endpoint URL.
  - **`revocationEndpoint?: string`**: (Optional) The OIDC provider's token revocation endpoint URL.
  - **`introspectionEndpoint?: string`**: (Optional) The OIDC provider's token introspection endpoint URL.
  - **`pkce?: boolean`**: (Optional) Whether to use PKCE. Defaults to `true`.
  - **`requestMiddleware?: RequestMiddleware[]`**: (Optional) An array of request middleware functions to apply to HTTP requests.

- **Returns:** `OIDCService` - An object containing the OIDC client methods.

### `oidc.authorize(): Effect.Effect<OIDCClientTokens, OIDCError, never>`

Initiates the OIDC Authorization Code Flow with PKCE. It redirects the user to the OIDC provider's authorization endpoint. Upon successful authentication and user consent, the provider redirects back to the `redirectUri` with an authorization code. This method then automatically exchanges the code for tokens.

- **Returns:** `Effect.Effect<OIDCClientTokens, OIDCError, never>`
  - An `Effect` that resolves with `OIDCClientTokens` (access token, ID token, refresh token, etc.) on success.
  - Fails with `OIDCError` if the authorization flow encounters an error (e.g., user denies consent, invalid request, network issues).

### `oidc.exchangeCode(code: string, codeVerifier: string): Effect.Effect<OIDCClientTokens, OIDCError, never>`

Exchanges an authorization code for OIDC tokens. This method is typically called internally by `oidc.authorize()` but can be used directly if you manage the redirect and code extraction manually.

- **`code: string`**: The authorization code received from the OIDC provider.
- **`codeVerifier: string`**: The PKCE code verifier generated during the authorization request.

- **Returns:** `Effect.Effect<OIDCClientTokens, OIDCError, never>`
  - An `Effect` that resolves with `OIDCClientTokens` on success.
  - Fails with `OIDCError` on token exchange failure.

### `oidc.endSession(idTokenHint: string, postLogoutRedirectUri?: string): Effect.Effect<void, OIDCError, never>`

Initiates an OIDC End Session (logout) flow. It redirects the user to the OIDC provider's end session endpoint.

- **`idTokenHint: string`**: The ID token previously issued to the client.
- **`postLogoutRedirectUri?: string`**: (Optional) The URI to which the OIDC provider will redirect the user after logout.

- **Returns:** `Effect.Effect<void, OIDCError, never>`
  - An `Effect` that resolves to `void` on successful redirection.
  - Fails with `OIDCError` on end session failure.

### `oidc.revoke(token: string, tokenTypeHint?: 'access_token' | 'refresh_token'): Effect.Effect<void, OIDCError, never>`

Revokes an access or refresh token at the OIDC provider.

- **`token: string`**: The token to revoke.
- **`tokenTypeHint?: 'access_token' | 'refresh_token'`**: (Optional) A hint about the type of the token being revoked.

- **Returns:** `Effect.Effect<void, OIDCError, never>`
  - An `Effect` that resolves to `void` on successful revocation.
  - Fails with `OIDCError` on revocation failure.

### `oidc.userInfo(accessToken: string): Effect.Effect<Record<string, any>, OIDCError, never>`

Fetches user profile information from the OIDC provider's UserInfo endpoint.

- **`accessToken: string`**: The access token to use for authentication.

- **Returns:** `Effect.Effect<Record<string, any>, OIDCError, never>`
  - An `Effect` that resolves with the user's profile data as a key-value object.
  - Fails with `OIDCError` on UserInfo request failure.

### `oidc.introspect(token: string, tokenTypeHint?: 'access_token' | 'refresh_token'): Effect.Effect<Record<string, any>, OIDCError, never>`

Introspects an access or refresh token to determine its active state and metadata.

- **`token: string`**: The token to introspect.
- **`tokenTypeHint?: 'access_token' | 'refresh_token'`**: (Optional) A hint about the type of the token being introspected.

- **Returns:** `Effect.Effect<Record<string, any>, OIDCError, never>`
  - An `Effect` that resolves with the token's introspection data.
  - Fails with `OIDCError` on introspection request failure.

### `oidc.refresh(refreshToken: string): Effect.Effect<OIDCClientTokens, OIDCError, never>`

Refreshes an access token using a refresh token.

- **`refreshToken: string`**: The refresh token.

- **Returns:** `Effect.Effect<OIDCClientTokens, OIDCError, never>`
  - An `Effect` that resolves with new `OIDCClientTokens` on success.
  - Fails with `OIDCError` on refresh token failure.

## Usage Example

```typescript
import * as Effect from 'effect/Effect';
import { oidc } from '@forgerock/sdk-effects-oidc';
import { requestMiddleware } from '@forgerock/sdk-effects-request-middleware';

// Example OIDC Configuration
const oidcConfig = {
  clientId: 'my-spa-client',
  redirectUri: 'http://localhost:8080/callback',
  scope: 'openid profile email',
  authorizationEndpoint: 'https://auth.example.com/oauth2/realms/root/realms/alpha/authorize',
  tokenEndpoint: 'https://auth.example.com/oauth2/realms/root/realms/alpha/access_token',
  userInfoEndpoint: 'https://auth.example.com/oauth2/realms/root/realms/alpha/userinfo',
  endSessionEndpoint: 'https://auth.example.com/oauth2/realms/root/realms/alpha/connect/endSession',
  revocationEndpoint: 'https://auth.example.com/oauth2/realms/root/realms/alpha/token/revoke',
  introspectionEndpoint:
    'https://auth.example.com/oauth2/realms/root/realms/alpha/token/introspect',
  pkce: true,
  requestMiddleware: [
    requestMiddleware().add((request) =>
      Effect.sync(() => {
        console.log(`[OIDC Request] ${request.method} ${request.url}`);
        return request;
      }),
    ),
  ],
};

// Initialize the OIDC client
const oidcClient = oidc(oidcConfig);

async function authenticateUser() {
  try {
    console.log('Initiating OIDC authorization flow...');
    const tokens = await Effect.runPromise(oidcClient.authorize());
    console.log('Authentication successful! Tokens:', tokens);

    // Use tokens to get user info
    const userInfo = await Effect.runPromise(oidcClient.userInfo(tokens.access_token));
    console.log('User Info:', userInfo);

    // Example: Refresh token
    if (tokens.refresh_token) {
      console.log('Refreshing token...');
      const newTokens = await Effect.runPromise(oidcClient.refresh(tokens.refresh_token));
      console.log('Token refreshed. New tokens:', newTokens);
    }

    // Example: Revoke access token
    console.log('Revoking access token...');
    await Effect.runPromise(oidcClient.revoke(tokens.access_token, 'access_token'));
    console.log('Access token revoked.');

    // Example: End session
    console.log('Ending session...');
    await Effect.runPromise(oidcClient.endSession(tokens.id_token, oidcConfig.redirectUri));
    console.log('Session ended.');
  } catch (error) {
    console.error('OIDC operation failed:', error);
  }
}

// Call the authentication function
authenticateUser();
```

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/sdk-effects-oidc
```

## Testing

To run the unit tests for this package, run:

```bash
pnpm nx test @forgerock/sdk-effects-oidc
```
