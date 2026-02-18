# @forgerock/journey-client

`@forgerock/journey-client` is a JavaScript client for interacting with ForgeRock Access Management (AM) authentication journeys (authentication trees). It provides a stateful, developer-friendly API that abstracts the complexities of the underlying authentication flow.

> **Note**: This client is designed specifically for ForgeRock AM servers. For PingOne DaVinci flows, use `@forgerock/davinci-client`. For standard OIDC operations, use `@forgerock/oidc-client`.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Working with Callbacks](#working-with-callbacks)
- [Request Middleware](#request-middleware)
- [Error Handling](#error-handling)
- [Building](#building)
- [Testing](#testing)

## Features

- **Wellknown Discovery**: Automatically discovers server configuration from the OIDC wellknown endpoint
- **Automatic Path Derivation**: Derives `baseUrl`, `authenticate`, and `sessions` paths directly from the well-known response
- **Stateful Client**: Manages authentication journey state internally
- **Callback Handling**: Provides a structured way to interact with various authentication callbacks
- **Redux Toolkit & RTK Query**: Built on modern state management for predictable state and efficient API interactions

## Installation

```bash
pnpm add @forgerock/journey-client
# or
npm install @forgerock/journey-client
# or
yarn add @forgerock/journey-client
```

## Quick Start

```typescript
import { journey } from '@forgerock/journey-client';
import { callbackType } from '@forgerock/sdk-types';

async function authenticateUser() {
  // Initialize the client with wellknown discovery
  try {
    const client = await journey({
      config: {
        serverConfig: {
          wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
        },
      },
    });

    // Start the authentication journey
    let step = await client.start({ journey: 'Login' });

    // Handle callbacks in a loop until success or failure
    while (step?.type === 'Step') {
      const nameCallbacks = step.getCallbacksOfType(callbackType.NameCallback);
      for (const cb of nameCallbacks) {
        cb.setName('demo');
      }

      const passwordCallbacks = step.getCallbacksOfType(callbackType.PasswordCallback);
      for (const cb of passwordCallbacks) {
        cb.setPassword('password');
      }

      step = await client.next(step);
    }

    // Check the final result
    if (step?.type === 'LoginSuccess') {
      console.log('Login successful!', step.getSessionToken());
    } else if (step?.type === 'LoginFailure') {
      console.error('Login failed:', step.payload.message);
    }
  } catch (error) {
    console.error('Failed to initialize client:', error);
  }
}
```

## Configuration

The client requires only the OIDC wellknown endpoint URL. All other configuration is derived automatically from the well-known response:

```typescript
import type { JourneyClientConfig } from '@forgerock/journey-client/types';

const config: JourneyClientConfig = {
  serverConfig: {
    wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
  },
};
```

### Automatic Derivation

The client automatically derives all needed configuration from the well-known response:

| Property       | Derived From                                                         |
| -------------- | -------------------------------------------------------------------- |
| `baseUrl`      | `authorization_endpoint` origin                                      |
| `authenticate` | Issuer path with `/oauth2` replaced by `/json`, plus `/authenticate` |
| `sessions`     | Issuer path with `/oauth2` replaced by `/json`, plus `/sessions/`    |

## API Reference

### `journey(options)`

Factory function that creates a journey client instance. Throws on initialization failure (invalid URL, fetch error, non-AM server).

```typescript
const client = await journey({
  config: JourneyClientConfig,
  requestMiddleware?: RequestMiddleware[],
  logger?: { level: LogLevel; custom?: CustomLogger },
});
```

**Returns**: `Promise<JourneyClient>`

**Throws**: `Error` if the wellknown URL is invalid, the fetch fails, or the server is not a ForgeRock AM instance.

```typescript
try {
  const client = await journey({ config });
} catch (error) {
  console.error('Initialization failed:', error.message);
}
```

### Client Methods

#### `client.start(options?)`

Initiates a new authentication journey.

```typescript
const step = await client.start({
  journey: 'Login', // Required: Journey/tree name
  query: { locale: 'en' }, // Optional: Query parameters
});
```

**Returns**: `Promise<JourneyStep | JourneyLoginSuccess | JourneyLoginFailure | undefined>`

#### `client.next(step, options?)`

Submits the current step and retrieves the next one.

```typescript
const nextStep = await client.next(step, {
  query: { noSession: 'true' }, // Optional: Query parameters
});
```

**Returns**: `Promise<JourneyStep | JourneyLoginSuccess | JourneyLoginFailure | undefined>`

#### `client.redirect(step)`

Handles redirect callbacks by redirecting the browser.

```typescript
await client.redirect(step);
```

#### `client.resume(url, options?)`

Resumes a journey after an external redirect.

```typescript
const step = await client.resume(window.location.href, {
  journey: 'Login', // Optional: Override journey name
});
```

#### `client.terminate(options?)`

Ends the current session.

```typescript
await client.terminate();
```

## Working with Callbacks

The `JourneyStep` object provides methods to access and manipulate callbacks:

```typescript
// Get all callbacks of a type
const nameCallbacks = step.getCallbacksOfType(callbackType.NameCallback);

// Get a single callback (throws if not exactly one)
const nameCallback = step.getCallbackOfType(callbackType.NameCallback);

// Common callback operations
nameCallback.getPrompt(); // Get the prompt text
nameCallback.setName('value'); // Set the input value

passwordCallback.getPrompt();
passwordCallback.setPassword('value');

choiceCallback.getChoices();
choiceCallback.setChoice(0);
```

## Request Middleware

Add custom logic to requests using middleware:

```typescript
import type { RequestMiddleware } from '@forgerock/journey-client/types';

const loggingMiddleware: RequestMiddleware = (req, action, next) => {
  console.log(`${action.type}: ${req.url}`);
  next();
};

const client = await journey({
  config,
  requestMiddleware: [loggingMiddleware],
});
```

### Middleware Actions

| Action Type         | Description             |
| ------------------- | ----------------------- |
| `JOURNEY_START`     | Starting a new journey  |
| `JOURNEY_NEXT`      | Submitting a step       |
| `JOURNEY_TERMINATE` | Terminating the session |

## Error Handling

The `journey()` factory throws on initialization failure. Use try/catch:

```typescript
try {
  const client = await journey({ config });
  // client is guaranteed to be a JourneyClient
} catch (error) {
  // Handle initialization errors (invalid URL, fetch failure, non-AM server)
  console.error('Failed to initialize:', error.message);
}
```

## Building

```bash
pnpm nx build @forgerock/journey-client
```

## Testing

```bash
pnpm nx test @forgerock/journey-client
```
