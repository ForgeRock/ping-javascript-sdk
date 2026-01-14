# @forgerock/journey-client

`@forgerock/journey-client` is a JavaScript client for interacting with ForgeRock Access Management (AM) authentication journeys (authentication trees). It provides a stateful, developer-friendly API that abstracts the complexities of the underlying authentication flow.

> **Note**: This client is designed specifically for ForgeRock AM servers. For PingOne DaVinci flows, use `@forgerock/davinci-client`. For standard OIDC operations, use `@forgerock/oidc-client`.

## Features

- **Wellknown Discovery**: Automatically discovers server configuration from the OIDC wellknown endpoint
- **Stateful Client**: Manages authentication journey state internally
- **Error-as-Value Pattern**: Returns errors as values instead of throwing, enabling type-safe error handling
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
import { journey, isJourneyClient } from '@forgerock/journey-client';
import { callbackType } from '@forgerock/sdk-types';

async function authenticateUser() {
  // Initialize the client with wellknown discovery
  const result = await journey({
    config: {
      serverConfig: {
        wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
      },
      // realmPath is optional - inferred from wellknown issuer
    },
  });

  // Handle initialization errors using the type guard
  if (!isJourneyClient(result)) {
    console.error('Failed to initialize:', result.message);
    return;
  }

  const client = result;

  // Start the authentication journey
  let step = await client.start({ journey: 'Login' });

  // Handle callbacks in a loop until success or failure
  while (step?.type === 'Step') {
    // Handle NameCallback
    const nameCallbacks = step.getCallbacksOfType(callbackType.NameCallback);
    for (const cb of nameCallbacks) {
      cb.setName('demo');
    }

    // Handle PasswordCallback
    const passwordCallbacks = step.getCallbacksOfType(callbackType.PasswordCallback);
    for (const cb of passwordCallbacks) {
      cb.setPassword('password');
    }

    // Submit and get next step
    step = await client.next(step);
  }

  // Check the final result
  if (step?.type === 'LoginSuccess') {
    console.log('Login successful!', step.getSessionToken());
  } else if (step?.type === 'LoginFailure') {
    console.error('Login failed:', step.payload.message);
  }
}
```

## Configuration

The client uses OIDC wellknown discovery to automatically configure itself:

```typescript
import type { JourneyClientConfig } from '@forgerock/journey-client/types';

const config: JourneyClientConfig = {
  serverConfig: {
    // Required: OIDC discovery endpoint
    wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
    // Optional: Custom path overrides
    paths: {
      authenticate: '/custom/authenticate',
    },
    // Optional: Request timeout in milliseconds
    timeout: 30000,
  },
  // Optional: Realm path (inferred from wellknown issuer if not provided)
  realmPath: 'alpha',
};
```

### Automatic Inference

The client automatically infers configuration from the wellknown URL:

| Property    | Inferred From                                         |
| ----------- | ----------------------------------------------------- |
| `baseUrl`   | Extracted from wellknown URL path (before `/oauth2/`) |
| `realmPath` | Extracted from the `issuer` in the wellknown response |

## API Reference

### `journey(options)`

Factory function that creates a journey client instance.

```typescript
const result = await journey({
  config: JourneyClientConfig,
  requestMiddleware?: RequestMiddleware[],
  logger?: { level: LogLevel; custom?: CustomLogger },
});
```

**Returns**: `Promise<JourneyClient | GenericError>`

Use the `isJourneyClient()` type guard to narrow the result:

```typescript
if (!isJourneyClient(result)) {
  // result is GenericError
  console.error(result.error, result.message);
  return;
}
// result is JourneyClient
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

const result = await journey({
  config,
  requestMiddleware: [loggingMiddleware],
});
```

### Middleware Actions

| Action Type     | Description             |
| --------------- | ----------------------- |
| `JOURNEY_START` | Starting a new journey  |
| `JOURNEY_NEXT`  | Submitting a step       |
| `END_SESSION`   | Terminating the session |

## Error Handling

The client uses an error-as-value pattern instead of throwing exceptions:

```typescript
const result = await journey({ config });

if (!isJourneyClient(result)) {
  // Handle initialization error
  switch (result.type) {
    case 'wellknown_error':
      console.error('Configuration error:', result.message);
      break;
    default:
      console.error('Unknown error:', result.error);
  }
  return;
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
