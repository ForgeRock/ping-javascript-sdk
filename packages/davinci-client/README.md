# @forgerock/davinci-client

## Overview

The `@forgerock/davinci-client` package provides a robust and type-safe client for interacting with the Forgerock DaVinci platform, built on the Effect-TS ecosystem. DaVinci is a no-code identity orchestration platform that allows you to build complex identity journeys. This client simplifies the process of initiating and managing these journeys from your JavaScript applications.

This package offers:

- **Flow Initiation**: Start various DaVinci flows (authentication, registration, passwordless, social login).
- **Flow Resumption**: Continue existing flows by submitting user input.
- **Flow Discovery**: Retrieve information about available DaVinci flows, filtered by tags or categories.
- **Session Management**: Handle user logout from DaVinci.

By leveraging Effect-TS, all operations are lazy, composable, and provide robust error handling, making your identity orchestration flows more predictable and resilient.

## Installation

```bash
pnpm add @forgerock/davinci-client
# or
npm install @forgerock/davinci-client
# or
yarn add @forgerock/davinci-client
```

## API Reference

### `davinci(config: DaVinciConfig)`

This is the main factory function that initializes the DaVinci client effect.

- **`config: DaVinciConfig`**: An object containing the DaVinci client configuration.
  - **`baseUrl: string`**: The base URL of your DaVinci tenant (e.g., `https://your-tenant.davinci.forgerock.com`).
  - **`companyId: string`**: Your DaVinci company ID.
  - **`requestMiddleware?: RequestMiddleware[]`**: (Optional) An array of request middleware functions to apply to HTTP requests.

- **Returns:** `DaVinciService` - An object containing the DaVinci client methods.

### `davinci.start(flowId: string, payload?: Record<string, unknown>): Effect.Effect<FlowResponse, DaVinciError, never>`

Initiates a new DaVinci flow.

- **`flowId: string`**: The ID of the DaVinci flow to start.
- **`payload?: Record<string, unknown>`**: (Optional) Initial data to send to the flow.

- **Returns:** `Effect.Effect<FlowResponse, DaVinciError, never>`
  - An `Effect` that resolves with `FlowResponse` on success.
  - Fails with `DaVinciError` on flow initiation failure.

### `davinci.resume(flowId: string, transactionId: string, payload: Record<string, unknown>): Effect.Effect<FlowResponse, DaVinciError, never>`

Resumes an existing DaVinci flow by submitting user input.

- **`flowId: string`**: The ID of the DaVinci flow.
- **`transactionId: string`**: The transaction ID of the active flow.
- **`payload: Record<string, unknown>`**: The data to submit to the flow.

- **Returns:** `Effect.Effect<FlowResponse, DaVinciError, never>`
  - An `Effect` that resolves with `FlowResponse` on success.
  - Fails with `DaVinciError` on flow resumption failure.

### `davinci.authenticate(flowId: string, payload?: Record<string, unknown>): Effect.Effect<FlowResponse, DaVinciError, never>`

A convenience method to start an authentication flow. Internally calls `davinci.start()`.

- **`flowId: string`**: The ID of the authentication flow.
- **`payload?: Record<string, unknown>`**: (Optional) Initial data for the flow.

- **Returns:** `Effect.Effect<FlowResponse, DaVinciError, never>`

### `davinci.register(flowId: string, payload?: Record<string, unknown>): Effect.Effect<FlowResponse, DaVinciError, never>`

A convenience method to start a registration flow. Internally calls `davinci.start()`.

- **`flowId: string`**: The ID of the registration flow.
- **`payload?: Record<string, unknown>`**: (Optional) Initial data for the flow.

- **Returns:** `Effect.Effect<FlowResponse, DaVinciError, never>`

### `davinci.passwordless(flowId: string, payload?: Record<string, unknown>): Effect.Effect<FlowResponse, DaVinciError, never>`

A convenience method to start a passwordless flow. Internally calls `davinci.start()`.

- **`flowId: string`**: The ID of the passwordless flow.
- **`payload?: Record<string, unknown>`**: (Optional) Initial data for the flow.

- **Returns:** `Effect.Effect<FlowResponse, DaVinciError, never>`

### `davinci.social(flowId: string, payload?: Record<string, unknown>): Effect.Effect<FlowResponse, DaVinciError, never>`

A convenience method to start a social login flow. Internally calls `davinci.start()`.

- **`flowId: string`**: The ID of the social login flow.
- **`payload?: Record<string, unknown>`**: (Optional) Initial data for the flow.

- **Returns:** `Effect.Effect<FlowResponse, DaVinciError, never>`

### `davinci.logout(flowId: string, payload?: Record<string, unknown>): Effect.Effect<FlowResponse, DaVinciError, never>`

A convenience method to start a logout flow. Internally calls `davinci.start()`.

- **`flowId: string`**: The ID of the logout flow.
- **`payload?: Record<string, unknown>`**: (Optional) Initial data for the flow.

- **Returns:** `Effect.Effect<FlowResponse, DaVinciError, never>`

### `davinci.getFlow(flowId: string): Effect.Effect<Flow, DaVinciError, never>`

Retrieves details for a specific DaVinci flow.

- **`flowId: string`**: The ID of the flow to retrieve.

- **Returns:** `Effect.Effect<Flow, DaVinciError, never>`
  - An `Effect` that resolves with `Flow` object on success.
  - Fails with `DaVinciError` if the flow is not found or an error occurs.

### `davinci.getFlows(): Effect.Effect<Flow[], DaVinciError, never>`

Retrieves a list of all available DaVinci flows.

- **Returns:** `Effect.Effect<Flow[], DaVinciError, never>`
  - An `Effect` that resolves with an array of `Flow` objects.
  - Fails with `DaVinciError` on API error.

### `davinci.getFlowsByTag(tag: string): Effect.Effect<Flow[], DaVinciError, never>`

Retrieves a list of DaVinci flows filtered by a specific tag.

- **`tag: string`**: The tag to filter flows by.

- **Returns:** `Effect.Effect<Flow[], DaVinciError, never>`

### `davinci.getFlowsByCategory(category: string): Effect.Effect<Flow[], DaVinciError, never>`

Retrieves a list of DaVinci flows filtered by a specific category.

- **`category: string`**: The category to filter flows by.

- **Returns:** `Effect.Effect<Flow[], DaVinciError, never>`

### `davinci.getFlowsByTagAndCategory(tag: string, category: string): Effect.Effect<Flow[], DaVinciError, never>`

Retrieves a list of DaVinci flows filtered by both a tag and a category.

- **`tag: string`**: The tag to filter flows by.
- **`category: string`**: The category to filter flows by.

- **Returns:** `Effect.Effect<Flow[], DaVinciError, never>`

### `davinci.getFlowsByTagOrCategory(tag: string, category: string): Effect.Effect<Flow[], DaVinciError, never>`

Retrieves a list of DaVinci flows filtered by either a tag or a category.

- **`tag: string`**: The tag to filter flows by.
- **`category: string`**: The category to filter flows by.

- **Returns:** `Effect.Effect<Flow[], DaVinciError, never>`

## Usage Example

```typescript
import * as Effect from 'effect/Effect';
import { davinci } from '@forgerock/davinci-client';

// DaVinci configuration
const davinciConfig = {
  baseUrl: 'https://your-tenant.davinci.forgerock.com',
  companyId: 'your-company-id',
};

// Initialize the DaVinci client
const davinciClient = davinci(davinciConfig);

async function runDaVinciFlow() {
  try {
    // Get all available flows
    const allFlows = await Effect.runPromise(davinciClient.getFlows());
    console.log('All DaVinci Flows:', allFlows);

    // Assuming you have a flowId for an authentication flow
    const authFlowId = 'auth-flow-example';

    console.log(`Starting authentication flow: ${authFlowId}`);
    let flowResponse = await Effect.runPromise(davinciClient.start(authFlowId));
    console.log('Initial Flow Response:', flowResponse);

    // Simulate user input for a resume step
    if (flowResponse.stage === 'USERNAME_PASSWORD') {
      console.log('Resuming flow with username and password...');
      flowResponse = await Effect.runPromise(
        davinciClient.resume(authFlowId, flowResponse.transactionId, {
          username: 'testuser',
          password: 'password',
        }),
      );
      console.log('Resumed Flow Response:', flowResponse);
    }

    if (flowResponse.status === 'SUCCESS') {
      console.log('Flow completed successfully!', flowResponse.response);
    } else if (flowResponse.status === 'FAILED') {
      console.error('Flow failed:', flowResponse.response);
    }
  } catch (error) {
    console.error('DaVinci operation failed:', error);
  }
}

// Run the DaVinci flow example
Effect.runPromise(runDaVinciFlow()).catch((error) => {
  console.error('An unexpected error occurred:', error);
});
```

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/davinci-client
```

## Testing

To run the unit tests for this package, run:

```bash
pnpm nx test @forgerock/davinci-client
```
