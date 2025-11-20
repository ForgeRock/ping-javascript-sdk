# @forgerock/device-client

## Overview

The `@forgerock/device-client` package provides a client for interacting with device-related functionalities within the Forgerock ecosystem, built on the Effect-TS framework. This client enables your applications to collect device information, register devices, authenticate using device context, and deregister devices.

This package offers:

- **Device Profile Collection**: Gathers various attributes about the user's device.
- **Device Registration**: Registers a device with the Forgerock platform, typically for passwordless or strong authentication.
- **Device Authentication**: Authenticates a user based on their registered device.
- **Device Deregistration**: Removes a device registration.

By leveraging Effect-TS, all operations are lazy, composable, and provide robust error handling, making your device management flows more predictable and resilient.

## Installation

```bash
pnpm add @forgerock/device-client
# or
npm install @forgerock/device-client
# or
yarn add @forgerock/device-client
```

## API Reference

### `device(config: DeviceConfig)`

This is the main factory function that initializes the device client effect.

- **`config: DeviceConfig`**: An object containing the device client configuration.
  - **`baseUrl: string`**: The base URL of your Forgerock instance (e.g., `https://your-tenant.forgerock.com/am`).
  - **`requestMiddleware?: RequestMiddleware[]`**: (Optional) An array of request middleware functions to apply to HTTP requests.

- **Returns:** `DeviceService` - An object containing the device client methods.

### `device.collect(): Effect.Effect<DeviceProfile, DeviceError, never>`

Collects various attributes about the current device. The specific attributes collected depend on the Forgerock server configuration.

- **Returns:** `Effect.Effect<DeviceProfile, DeviceError, never>`
  - An `Effect` that resolves with a `DeviceProfile` object containing collected device data.
  - Fails with `DeviceError` if device collection encounters an error.

### `device.register(payload: DeviceRegistrationPayload): Effect.Effect<DeviceRegistrationResponse, DeviceError, never>`

Registers the device with the Forgerock platform. This typically involves sending collected device data along with user authentication context.

- **`payload: DeviceRegistrationPayload`**: An object containing data required for device registration (e.g., `challengeId`, `challengeResponse`).

- **Returns:** `Effect.Effect<DeviceRegistrationResponse, DeviceError, never>`
  - An `Effect` that resolves with a `DeviceRegistrationResponse` on successful registration.
  - Fails with `DeviceError` on registration failure.

### `device.authenticate(payload: DeviceAuthenticationPayload): Effect.Effect<DeviceAuthenticationResponse, DeviceError, never>`

Authenticates a user using the registered device. This might involve a challenge-response mechanism.

- **`payload: DeviceAuthenticationPayload`**: An object containing data required for device authentication (e.g., `challengeId`, `challengeResponse`).

- **Returns:** `Effect.Effect<DeviceAuthenticationResponse, DeviceError, never>`
  - An `Effect` that resolves with a `DeviceAuthenticationResponse` on successful authentication.
  - Fails with `DeviceError` on authentication failure.

### `device.deregister(deviceId: string): Effect.Effect<void, DeviceError, never>`

Deregisters a specific device from the Forgerock platform.

- **`deviceId: string`**: The ID of the device to deregister.

- **Returns:** `Effect.Effect<void, DeviceError, never>`
  - An `Effect` that resolves to `void` on successful deregistration.
  - Fails with `DeviceError` on deregistration failure.

## Usage Example

```typescript
import * as Effect from 'effect/Effect';
import { device } from '@forgerock/device-client';

// Device client configuration
const deviceConfig = {
  baseUrl: 'https://your-tenant.forgerock.com/am',
};

// Initialize the device client
const deviceClient = device(deviceConfig);

async function manageDevice() {
  try {
    console.log('Collecting device profile...');
    const deviceProfile = await Effect.runPromise(deviceClient.collect());
    console.log('Device Profile:', deviceProfile);

    // Simulate a registration flow (replace with actual payload from your auth flow)
    const registrationPayload = {
      challengeId: 'some-challenge-id',
      challengeResponse: 'some-challenge-response',
      // ... other necessary fields
    };
    console.log('Registering device...');
    const registrationResponse = await Effect.runPromise(
      deviceClient.register(registrationPayload),
    );
    console.log('Device Registration Response:', registrationResponse);
    const deviceId = registrationResponse.deviceId; // Assuming deviceId is returned

    // Simulate an authentication flow
    const authenticationPayload = {
      challengeId: 'another-challenge-id',
      challengeResponse: 'another-challenge-response',
      // ... other necessary fields
    };
    console.log('Authenticating device...');
    const authenticationResponse = await Effect.runPromise(
      deviceClient.authenticate(authenticationPayload),
    );
    console.log('Device Authentication Response:', authenticationResponse);

    // Deregister the device
    if (deviceId) {
      console.log(`Deregistering device with ID: ${deviceId}`);
      await Effect.runPromise(deviceClient.deregister(deviceId));
      console.log('Device deregistered successfully.');
    }
  } catch (error) {
    console.error('Device operation failed:', error);
  }
}

// Run the device management example
Effect.runPromise(manageDevice()).catch((error) => {
  console.error('An unexpected error occurred:', error);
});
```

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/device-client
```

## Testing

To run the unit tests for this package, run:

```bash
pnpm nx test @forgerock/device-client
```
