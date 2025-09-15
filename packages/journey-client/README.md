# @forgerock/journey-client

`@forgerock/journey-client` is a modern JavaScript client for interacting with Ping Identity's authentication journeys (formerly ForgeRock authentication trees). It provides a stateful, developer-friendly API that abstracts the complexities of the underlying authentication flow, making it easier to integrate with your applications.

## Features

- **Stateful Client**: Manages the authentication journey state internally, simplifying interaction compared to stateless approaches.
- **Redux Toolkit & RTK Query**: Built on robust and modern state management and data fetching libraries for predictable state and efficient API interactions.
- **Callback Handling**: Provides a structured way to interact with various authentication callbacks (e.g., username, password, MFA, device profiling).
- **Serializable Redux State**: Ensures the Redux store remains serializable by storing raw API payloads, with class instances created on demand.

## Installation

```bash
pnpm add @forgerock/journey-client
# or
npm install @forgerock/journey-client
# or
yarn add @forgerock/journey-client
```

## Usage

The `journey-client` is initialized via an asynchronous factory function, `journey()`, which returns a client instance with methods to control the authentication flow.

### Basic Authentication Flow

```typescript
import { journey } from '@forgerock/journey-client';
import { callbackType } from '@forgerock/sdk-types';
import type { NameCallback, PasswordCallback } from '@forgerock/journey-client/src/lib/callbacks';

async function authenticateUser() {
  const client = await journey({
    config: {
      serverConfig: { baseUrl: 'https://your-am-instance.com' },
      realmPath: 'root', // e.g., 'root', 'alpha'
      tree: 'Login', // The name of your authentication tree/journey
    },
  });

  try {
    // 1. Start the authentication journey
    let step = await client.start();

    // 2. Handle callbacks in a loop until success or failure
    while (step.type === 'Step') {
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

      // ... handle other callback types as needed (e.g., ChoiceCallback, DeviceProfileCallback)

      // Submit the current step and get the next one
      step = await client.next({ step: step.payload });
    }

    // 3. Check the final result
    if (step.type === 'LoginSuccess') {
      console.log('Login successful!', step.getSessionToken());
      // You can now use the session token for subsequent authenticated requests
    } else if (step.type === 'LoginFailure') {
      console.error('Login failed:', step.getMessage());
      // Display error message to the user
    } else {
      console.warn('Unexpected step type:', step.type, step.payload);
    }
  } catch (error) {
    console.error('An error occurred during the authentication journey:', error);
    // Handle network errors or other unexpected issues
  }
}

authenticateUser();
```

### Client Methods

The `journey()` factory function returns a client instance with the following methods:

- `client.start(options?: StepOptions): Promise<FRStep | undefined>`
  Initiates a new authentication journey. Returns the first `FRStep` in the journey.

- `client.next(options: { step: Step; options?: StepOptions }): Promise<FRStep | undefined>`
  Submits the current `Step` payload (obtained from `FRStep.payload`) to the authentication API and retrieves the next `FRStep` in the journey.

- `client.redirect(step: FRStep): Promise<void>`
  Handles `RedirectCallback`s by storing the current step and redirecting the browser to the specified URL. This is typically used for external authentication providers.

- `client.resume(url: string, options?: StepOptions): Promise<FRStep | undefined>`
  Resumes an authentication journey after an external redirect (e.g., from an OAuth provider). It retrieves the previously stored step and combines it with URL parameters to continue the flow.

### Handling Callbacks

The `FRStep` object provides methods to easily access and manipulate callbacks:

- `step.getCallbackOfType<T extends FRCallback>(type: CallbackType): T`
  Retrieves a single callback of a specific type. Throws an error if zero or more than one callback of that type is found.

- `step.getCallbacksOfType<T extends FRCallback>(type: CallbackType): T[]`
  Retrieves all callbacks of a specific type as an array.

- `callback.getPrompt(): string` (example for `NameCallback`, `PasswordCallback`)
  Gets the prompt message for the callback.

- `callback.setName(value: string): void` (example for `NameCallback`)
  Sets the input value for the callback.

- `callback.setPassword(value: string): void` (example for `PasswordCallback`)
  Sets the input value for the callback.

- `callback.setProfile(profile: DeviceProfileData): void` (example for `DeviceProfileCallback`)
  Sets the device profile data for the callback.

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
