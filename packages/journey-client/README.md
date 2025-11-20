# @forgerock/journey-client

`@forgerock/journey-client` is a modern JavaScript client for interacting with Ping Identity's authentication journeys (formerly ForgeRock authentication trees). It provides a stateful, developer-friendly API that abstracts the complexities of the underlying authentication flow, making it easier to integrate with your applications.

> [!NOTE]
> This package is currently private and not available on the public NPM registry. It is intended for internal use within the Ping Identity JavaScript SDK monorepo.

## Features

- **Stateful Client**: Manages the authentication journey state internally, simplifying interaction compared to stateless approaches.
- **Redux Toolkit & RTK Query**: Built on robust and modern state management and data fetching libraries for predictable state and efficient API interactions.
- **Extensible Middleware**: Allows for custom request modifications and processing through a flexible middleware pipeline.
- **Comprehensive Callback Handling**: Provides a structured way to interact with various authentication callbacks (e.g., username, password, MFA, device profiling).
- **TypeScript Support**: Written in TypeScript for a better developer experience and type safety.

## Installation

This package is part of a `pnpm` workspace. To install dependencies, run the following command from the root of the monorepo:

```bash
pnpm install
```

## Usage

The `journey-client` is initialized via an asynchronous factory function, `journey()`, which returns a client instance with methods to control the authentication flow.

### Client Initialization

```typescript
import { journey } from '@forgerock/journey-client';
import type {
  JourneyClientConfig,
  RequestMiddleware,
  CustomLogger,
} from '@forgerock/journey-client/types';

// Define optional middleware for request modification
const myMiddleware: RequestMiddleware[] = [
  (req, action, next) => {
    console.log(`Intercepting action: ${action.type}`);
    req.headers.set('X-Custom-Header', 'my-custom-value');
    next();
  },
];

// Define optional custom logger
const myLogger: CustomLogger = {
  log: (message) => console.log(`CUSTOM LOG: ${message}`),
  error: (message) => console.error(`CUSTOM ERROR: ${message}`),
  warn: (message) => console.warn(`CUSTOM WARN: ${message}`),
  debug: (message) => console.debug(`CUSTOM DEBUG: ${message}`),
};

// Define the client configuration
const config: JourneyClientConfig = {
  serverConfig: { baseUrl: 'https://your-am-instance.com' },
  realmPath: 'root', // e.g., 'root', 'alpha'
};

// Initialize the client
const client = await journey({
  config,
  requestMiddleware: myMiddleware,
  logger: {
    level: 'debug',
    custom: myLogger,
  },
});
```

### Basic Authentication Flow

```typescript
import { journey } from '@forgerock/journey-client';
import { callbackType } from '@forgerock/sdk-types';
import type { JourneyStep, NameCallback, PasswordCallback } from '@forgerock/journey-client/types';

async function authenticateUser() {
  const client = await journey({
    config: {
      serverConfig: { baseUrl: 'https://your-am-instance.com' },
      realmPath: 'root',
    },
  });

  try {
    // 1. Start the authentication journey
    let step = await client.start({ journey: 'Login' });

    // 2. Handle callbacks in a loop until success or failure
    while (step && step.type === 'Step') {
      console.log('Current step:', step.payload);

      // Example: Handle NameCallback
      if (step.getCallbacksOfType(callbackType.NameCallback).length > 0) {
        const nameCallback = step.getCallbackOfType<NameCallback>(callbackType.NameCallback);
        console.log('Prompt for username:', nameCallback.getPrompt());
        nameCallback.setName('demo'); // Set the username
      }

      // Example: Handle PasswordCallback
      if (step.getCallbacksOfType(callbackType.PasswordCallback).length > 0) {
        const passwordCallback = step.getCallbackOfType<PasswordCallback>(
          callbackType.PasswordCallback,
        );
        console.log('Prompt for password:', passwordCallback.getPrompt());
        passwordCallback.setPassword('password'); // Set the password
      }

      // ... handle other callback types as needed

      // Submit the current step and get the next one
      step = await client.next(step);
    }

    // 3. Check the final result
    if (step && step.type === 'LoginSuccess') {
      console.log('Login successful!', step.getSessionToken());
      // You can now use the session token for subsequent authenticated requests
    } else if (step && step.type === 'LoginFailure') {
      console.error('Login failed:', step.getMessage());
      // Display error message to the user
    } else {
      console.warn('Unexpected step type or end of journey.');
    }
  } catch (error) {
    console.error('An error occurred during the authentication journey:', error);
    // Handle network errors or other unexpected issues
  }
}

authenticateUser();
```

### API Reference

The `journey()` factory returns a client instance with the following methods:

- `client.start(options: StartParam): Promise<JourneyStep | undefined>`
  Initiates a new authentication journey. Returns the first `JourneyStep` in the journey.

- `client.next(step: JourneyStep, options?: NextOptions): Promise<JourneyStep | undefined>`
  Submits the current `JourneyStep` to the authentication API and retrieves the next step.

- `client.redirect(step: JourneyStep): Promise<void>`
  Handles `RedirectCallback`s by storing the current step and redirecting the browser to the specified URL. This is typically used for external authentication providers.

- `client.resume(url: string, options?: ResumeOptions): Promise<JourneyStep | undefined>`
  Resumes an authentication journey after an external redirect (e.g., from an OAuth provider). It retrieves the previously stored step and combines it with URL parameters to continue the flow.

- `client.terminate(options?: { query?: Record<string, string> }): Promise<void>`
  Ends the current authentication session by calling the `/sessions` endpoint with `_action=logout`.

### Sub-path Exports

This package exposes additional functionality through sub-paths:

- **`@forgerock/journey-client/device`**: Utilities for device profiling.
- **`@forgerock/journey-client/policy`**: Helpers for parsing and handling policy failures from AM.
- **`@forgerock/journey-client/qr-code`**: Functions to handle QR code display and interaction within a journey.
- **`@forgerock/journey-client/recovery-codes`**: Utilities for managing recovery codes.
- **`@forgerock/journey-client/webauthn`**: Helpers for WebAuthn (FIDO2) registration and authentication within a journey.
- **`@forgerock/journey-client/types`**: TypeScript type definitions for the package.

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/journey-client
```

## Testing

To run the unit tests for this package, run:

```bash
pnpm nx test @forgerock/journey-client
```
