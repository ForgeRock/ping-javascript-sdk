# @forgerock/sdk-types

A TypeScript type definitions package for the ForgeRock/Ping Identity JavaScript SDK ecosystem.

## Overview

This package contains shared TypeScript interfaces, types, and other type definitions that are used across the ForgeRock/Ping Identity JavaScript SDK packages. It provides a centralized repository for type definitions to ensure consistency across the SDK ecosystem.

## Installation

This package is intended to be used as a dependency within the ForgeRock/Ping Identity JavaScript SDK ecosystem and is not typically installed directly by end users.

If needed, you can install it via:

```bash
npm install @forgerock/sdk-types
# or
pnpm add @forgerock/sdk-types
# or
yarn add @forgerock/sdk-types
```

## Contents

The package includes the following type categories:

### Authentication Callback Types

Definitions for AM/Ping authentication tree callback schema:

```typescript
export interface Callback {
  _id?: number;
  input?: NameValue[];
  output: NameValue[];
  type: CallbackType;
}
```

Provides type definitions for various callback types, including:

- BooleanAttributeInputCallback
- ChoiceCallback
- ConfirmationCallback
- DeviceProfileCallback
- NameCallback
- PasswordCallback
- PingOneProtect callbacks
- And many more

### Configuration Types

Types for configuring the SDK:

```typescript
export interface ServerConfig {
  baseUrl: string;
  paths?: CustomPathConfig;
  timeout?: number;
}
```

Includes interfaces for:

- Server configuration
- Custom path configuration
- Token storage
- Well-known endpoint response types
- Authentication step options

### Token Types

Definitions for OAuth2/OIDC tokens:

```typescript
export interface Tokens {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
}
```

### Middleware Types

Types for request middleware implementations.

### Authorization Types

Types for OIDC/OAuth2 authorization workflows.

### Error Types

A GenericError type used throughout the Ping Javascript SDK ecosystem.

### Policy Types

Password and user attribute validation policy types returned by the server during user registration or password management flows.

## Usage

Import types directly from the package:

```typescript
import { ServerConfig, Tokens, Callback } from '@forgerock/sdk-types';

const config: ServerConfig = {
  baseUrl: 'https://example.forgerock.com/am',
  timeout: 30000,
};

const processTokens = (tokens: Tokens) => {
  // Use token information
};

const handleCallback = (callback: Callback) => {
  // Process callback
};
```

## Development

This package follows the development practices of the overall ForgeRock/Ping Identity JavaScript SDK monorepo.

### Building

```bash
nx build sdk-types
```

### Testing

```bash
nx test sdk-types
```

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](../../LICENSE) file for details.
