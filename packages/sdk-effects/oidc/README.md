# Ping Identity SDK OIDC Module

A TypeScript library providing utilities for OpenID Connect (OIDC) authentication flows within Ping Identity's JavaScript SDK.

## Features

- Create OIDC authorization URLs with proper PKCE implementation
- Generate and manage state values for secure authentication
- Support for various response types
- Built with TypeScript for strong typing and better developer experience

## Installation

```bash
npm install @forgerock/sdk-oidc
```

## Usage

### Creating an Authorization URL

```typescript
import { createAuthorizeUrl } from '@forgerock/sdk-oidc';

async function initiateLogin() {
  const authUrl = await createAuthorizeUrl('https://auth.pingone.com/authorize', {
    clientId: 'your-client-id',
    redirectUri: 'https://your-app.com/callback',
    responseType: 'code',
    scope: 'openid profile email',
  });

  // Redirect the user to the authorization URL
  window.location.href = authUrl;
}
```

The `createAuthorizeUrl` function:

1. Generates a secure random state value
2. Creates a PKCE code verifier and challenge
3. Stores the state and verifier for later validation
4. Constructs a properly formatted authorization URL with all required parameters

## API Reference

### `createAuthorizeUrl(authorizeUrl, options)`

Creates an OIDC-compliant authorization URL for initiating the authentication flow.

**Parameters:**

- `authorizeUrl` (string): The base authorization URL for the OIDC provider
- `options` (object): Configuration options
  - `clientId` (string): The OAuth client ID
  - `redirectUri` (string): The URI to redirect to after authentication
  - `responseType` (string): The OAuth response type (typically 'code')
  - `scope` (string): Space-separated list of requested scopes

**Returns:**

- Promise<string>: A properly formatted authorization URL

### Security Features

- **PKCE Implementation**: Uses the PKCE (Proof Key for Code Exchange) extension to secure authorization code flow
- **State Parameter**: Generates and validates state parameters to prevent CSRF attacks
- **Secure Storage**: Securely stores PKCE verifiers and state values for validation

## Building

Run `nx build @forgerock/sdk-oidc` to build the library.

## Running Unit Tests

Run `nx test @forgerock/sdk-oidc` to execute the unit tests via [Vitest](https://vitest.dev/).
