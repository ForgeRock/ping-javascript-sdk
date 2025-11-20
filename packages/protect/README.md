# @forgerock/protect

The `@forgerock/protect` package provides a high-level API for interacting with the PingOne Signals (Protect) SDK to perform device profiling and risk evaluation. It is designed to be used within client applications that integrate with PingOne Advanced Identity Cloud (AIC), PingAM, or PingOne DaVinci flows.

> [!WARNING]
> This package is under active development and is not yet published to the public NPM registry. It is intended for use within the Ping Identity JavaScript SDK monorepo.

## Features

- **Simple API**: A straightforward interface (`start`, `getData`) for managing the device profiling lifecycle.
- **Flexible Integration**: Can be used with journey-based authentication flows (PingOne AIC/PingAM) or with PingOne DaVinci flows.
- **Bundled SDK**: Includes the PingOne Signals SDK, simplifying dependency management.
- **Configurable**: Allows for detailed configuration of the Signals SDK, including what data to collect and how.

## Installation

This package is part of a `pnpm` workspace. To install dependencies, run the following command from the root of the monorepo:

```bash
pnpm install
```

## Usage with a PingOne AIC or PingAM Journey

Integrate Ping Protect into an authentication journey that uses callbacks.

### 1. Initialization

The `protect()` function accepts configuration options and returns an API for interacting with the Signals SDK. It's recommended to initialize it early in your application's lifecycle to maximize data collection.

```typescript
import { protect } from '@forgerock/protect';
import type { ProtectConfig } from '@forgerock/protect/types';

// Define the Protect configuration
const protectConfig: ProtectConfig = {
  envId: 'YOUR_PINGONE_ENVIRONMENT_ID',
  // Optional settings:
  behavioralDataCollection: true,
  deviceAttributesToIgnore: ['userAgent'],
};

// Initialize the Protect API
const protectApi = protect(protectConfig);

// Start data collection at application startup
async function startProtect() {
  const result = await protectApi.start();
  if (result?.error) {
    console.error(`Error initializing Protect: ${result.error}`);
  }
}

startProtect();
```

### 2. Handling Callbacks in a Journey

Within your authentication journey, you will encounter two specific callbacks for Ping Protect.

- **`PingOneProtectInitializeCallback`**: An optional callback that can also be used to trigger the `start()` method if you prefer just-in-time initialization.
- **`PingOneProtectEvaluationCallback`**: A required callback that signals when to collect the profiled data and send it to the server.

```typescript
import { FRAuth } from '@forgerock/javascript-sdk';
import { callbackType } from '@forgerock/sdk-types';
import type { JourneyStep, PingOneProtectEvaluationCallback } from '@forgerock/javascript-sdk';

// Assuming `step` is the current step from FRAuth.next()

// Handle the evaluation callback
if (step.getCallbacksOfType(callbackType.PingOneProtectEvaluationCallback).length > 0) {
  const callback = step.getCallbackOfType<PingOneProtectEvaluationCallback>(
    callbackType.PingOneProtectEvaluationCallback,
  );

  const signals = await protectApi.getData();

  if (typeof signals === 'string') {
    callback.setData(signals);
  } else {
    // Handle error from getData()
    callback.setClientError(signals.error);
  }
}

// Submit the step to continue the journey
const nextStep = await FRAuth.next(step);
```

## Usage with a PingOne DaVinci Flow

Integrate Ping Protect into a DaVinci flow that uses the `ProtectCollector`.

### 1. Initialization

Initialization is the same as the journey-based approach. Call `protect()` with your configuration and invoke `start()` early.

```typescript
import { protect } from '@forgerock/protect';

const protectApi = protect({ envId: 'YOUR_PINGONE_ENVIRONMENT_ID' });
await protectApi.start();
```

### 2. Handling the ProtectCollector

When your DaVinci flow returns a `ProtectCollector`, use it to send the collected signals back to the flow.

```typescript
import { davinci } from '@forgerock/davinci-client';

const davinciClient = await davinci({
  /* ... config ... */
});
const { response } = await davinciClient.start();

// Check for the ProtectCollector
const protectCollector = response.collectors?.find((c) => c.type === 'ProtectCollector');

if (protectCollector) {
  // Get the signals data
  const signals = await protectApi.getData();

  if (typeof signals === 'string') {
    // Update the collector with the signals data
    const updater = davinciClient.update(protectCollector);
    updater(signals);
  } else {
    console.error('Failed to get Protect signals:', signals.error);
    // Handle the error appropriately in your UI
  }
}

// Submit the updated collectors to continue the flow
await davinciClient.next();
```

## API Reference

The `protect(options: ProtectConfig)` function returns an object with the following methods:

- `start(): Promise<void | { error: string }>`
  Initializes the PingOne Signals SDK and begins data collection. It's safe to call multiple times.

- `getData(): Promise<string | { error: string }>`
  Stops data collection, gathers the device profile and behavioral data, and returns it as an encrypted string. Returns an error object if the SDK is not initialized.

- `pauseBehavioralData(): void | { error: string }`
  Pauses the collection of behavioral (mouse, keyboard, touch) data. Device profile data collection continues.

- `resumeBehavioralData(): void | { error: string }`
  Resumes the collection of behavioral data.

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/protect
```

## Testing

To run the unit tests for this package, run:

```bash
pnpm nx test @forgerock/protect
```
