# @forgerock/sdk-types

## Overview

The `@forgerock/sdk-types` package provides a centralized collection of TypeScript type definitions and interfaces used across various Forgerock JavaScript SDKs. This package is designed to ensure type consistency, improve developer experience through better autocompletion and compile-time checks, and facilitate easier integration between different SDK modules.

By consolidating common types, this package helps:

- **Reduce Duplication**: Avoids redefining the same types in multiple packages.
- **Enhance Type Safety**: Provides robust type checking for data structures and function signatures.
- **Improve Readability**: Makes code easier to understand by clearly defining expected data shapes.
- **Streamline Development**: Offers a single source of truth for shared data models.

This package primarily exports interfaces and type aliases, and it does not contain any runtime logic. It is a development dependency for other SDK packages and applications that consume them.

## Installation

```bash
pnpm add @forgerock/sdk-types
# or
npm install @forgerock/sdk-types
# or
yarn add @forgerock/sdk-types
```

## API Reference

This package exports a variety of types and interfaces. Some of the key exports include:

- **`Config`**: Interface for general SDK configuration.
- **`Token`**: Interface for OAuth2 tokens (access, refresh, ID tokens).
- **`User`**: Interface for user profile information.
- **`Journey`**: Types related to authentication journeys.
- **`OIDC`**: Types specific to OpenID Connect flows.
- **`Protect`**: Types for the Protect SDK.
- **`FRAuth`**: Types for authentication-related data.
- **`FRUser`**: Types for user management.
- **`FRStep`**: Types for authentication steps.
- **`Callback`**: Types for authentication callbacks.
- **`Policy`**: Types for policy evaluation.
- **`WebAuthn`**: Types for WebAuthn authentication.
- **`PKCE`**: Types for PKCE (Proof Key for Code Exchange).
- **`OAuth2`**: General OAuth2 related types.
- **`Storage`**: Types for storage mechanisms.
- **`Logger`**: Types for logging utilities.
- **`RequestMiddleware`**: Types for HTTP request middleware.
- **`IFrameManager`**: Types for iframe management.

For a comprehensive list of all exported types and their definitions, please refer to the [TypeDoc documentation](https://forgerock.github.io/forgerock-javascript-sdk/modules/_forgerock_sdk_types.html) or inspect the `src` directory of this package.

## Usage Example

```typescript
import { Config, Token, User, FRStep } from '@forgerock/sdk-types';

// Example: Defining a configuration object
const myConfig: Config = {
  clientId: 'my-client-id',
  redirectUri: 'http://localhost:8080/callback',
  scope: 'openid profile email',
  serverConfig: {
    baseUrl: 'https://auth.example.com/am',
    timeout: 30000,
  },
};

// Example: Handling a token response
const receivedToken: Token = {
  access_token: 'eyJhbGciOiJIUzI1Ni...',
  expires_in: 3600,
  token_type: 'Bearer',
  scope: 'openid profile',
  id_token: 'eyJhbGciOiJIUzI1Ni...',
};

// Example: Working with user data
const currentUser: User = {
  sub: 'testuser',
  given_name: 'Test',
  family_name: 'User',
  email: 'test@example.com',
};

// Example: Processing an authentication step
const authStep: FRStep = {
  type: 'LoginSuccess',
  payload: {
    tokenId: 'some-token-id',
    successUrl: 'http://localhost:8080/dashboard',
  },
  callbacks: [], // No callbacks for a success step
};

function processAuthStep(step: FRStep) {
  if (step.type === 'LoginSuccess') {
    console.log(`Login successful! Redirecting to: ${step.payload.successUrl}`);
  } else if (step.type === 'LoginFailure') {
    console.error(`Login failed: ${step.payload.message}`);
  } else {
    console.log(`Received step with type: ${step.type}`);
    // Handle other step types and their callbacks
  }
}

processAuthStep(authStep);
```

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/sdk-types
```

## Testing

This package primarily contains type definitions and does not have runtime logic, so it typically does not have dedicated unit tests. Type checking is performed during the build process.
