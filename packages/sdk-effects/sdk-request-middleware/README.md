# @forgerock/sdk-effects-request-middleware

## Overview

The `@forgerock/sdk-effects-request-middleware` package provides a flexible and extensible mechanism for intercepting and modifying HTTP requests and responses within Effect-TS applications. It allows you to define a chain of middleware functions that can perform tasks such as:

- Adding authentication headers
- Logging request/response details
- Transforming request bodies or response data
- Handling errors or retries

This middleware system is designed to be composable and type-safe, integrating seamlessly with the Effect ecosystem. It helps centralize cross-cutting concerns related to network communication, making your application's request logic cleaner and more maintainable.

## Installation

```bash
pnpm add @forgerock/sdk-effects-request-middleware
# or
npm install @forgerock/sdk-effects-request-middleware
# or
yarn add @forgerock/sdk-effects-request-middleware
```

## API Reference

### `requestMiddleware(options?: RequestMiddlewareOptions)`

This is the main factory function that initializes the request middleware effect.

- **`options`**: `RequestMiddlewareOptions` (optional) - An object to configure the middleware instance.
  - **`middleware?: RequestMiddleware[]`**: An initial array of middleware functions to register.

- **Returns:** `RequestMiddlewareService` - An object containing the API methods for managing and executing middleware.

### `requestMiddleware.add(middleware: RequestMiddleware): Effect.Effect<void, never, never>`

Adds a new middleware function to the end of the middleware chain.

- **`middleware: RequestMiddleware`**: The middleware function to add. A `RequestMiddleware` is a function that takes a `Request` object and returns an `Effect` that resolves to a `Request` object.

- **Returns:** `Effect.Effect<void, never, never>` - An `Effect` that resolves to `void` on success.

### `requestMiddleware.remove(middleware: RequestMiddleware): Effect.Effect<void, never, never>`

Removes a specific middleware function from the chain.

- **`middleware: RequestMiddleware`**: The middleware function to remove.

- **Returns:** `Effect.Effect<void, never, never>` - An `Effect` that resolves to `void` on success.

### `requestMiddleware.get(): Effect.Effect<RequestMiddleware[], never, never>`

Retrieves the currently registered middleware functions.

- **Returns:** `Effect.Effect<RequestMiddleware[], never, never>` - An `Effect` that resolves to an array of `RequestMiddleware` functions.

### `requestMiddleware.clear(): Effect.Effect<void, never, never>`

Removes all registered middleware functions from the chain.

- **Returns:** `Effect.Effect<void, never, never>` - An `Effect` that resolves to `void` on success.

### `requestMiddleware.execute(request: Request): Effect.Effect<Request, never, never>`

Executes the entire middleware chain with the given `Request` object. Each middleware function in the chain will process the request sequentially.

- **`request: Request`**: The initial `Request` object to be processed by the middleware chain.

- **Returns:** `Effect.Effect<Request, never, never>` - An `Effect` that resolves to the final `Request` object after all middleware functions have been applied.

## Usage Example

```typescript
import * as Effect from 'effect/Effect';
import { requestMiddleware, RequestMiddleware } from '@forgerock/sdk-effects-request-middleware';

// Define some example middleware functions
const authMiddleware: RequestMiddleware = (request) =>
  Effect.succeed(
    new Request(request.url, {
      ...request,
      headers: { ...request.headers, Authorization: 'Bearer my-token' },
    }),
  );

const loggingMiddleware: RequestMiddleware = (request) =>
  Effect.sync(() => {
    console.log(`[Logger] Requesting: ${request.method} ${request.url}`);
    return request;
  });

const addHeaderMiddleware: RequestMiddleware = (request) =>
  Effect.succeed(
    new Request(request.url, {
      ...request,
      headers: { ...request.headers, 'X-Custom-Header': 'SDK-Effect' },
    }),
  );

async function runMiddlewareExample() {
  // Initialize the middleware service
  const middlewareService = requestMiddleware();

  // Add middleware functions to the chain
  await Effect.runPromise(middlewareService.add(loggingMiddleware));
  await Effect.runPromise(middlewareService.add(authMiddleware));
  await Effect.runPromise(middlewareService.add(addHeaderMiddleware));

  // Create an initial request
  const initialRequest = new Request('https://api.example.com/data', {
    method: 'GET',
  });

  console.log('Initial Request:', initialRequest.headers);

  // Execute the middleware chain
  const finalRequest = await Effect.runPromise(middlewareService.execute(initialRequest));

  console.log('Final Request after middleware:', finalRequest.headers);
  // Expected output for finalRequest.headers:
  // {
  //   "Authorization": "Bearer my-token",
  //   "X-Custom-Header": "SDK-Effect"
  // }

  // Remove a middleware
  await Effect.runPromise(middlewareService.remove(authMiddleware));
  console.log('Auth middleware removed.');

  // Execute again to see the change
  const requestAfterRemoval = await Effect.runPromise(middlewareService.execute(initialRequest));
  console.log('Request after auth middleware removal:', requestAfterRemoval.headers);
  // Expected output for requestAfterRemoval.headers:
  // {
  //   "X-Custom-Header": "SDK-Effect"
  // }

  // Clear all middleware
  await Effect.runPromise(middlewareService.clear());
  console.log('All middleware cleared.');

  // Execute again, should be back to initial request headers
  const requestAfterClear = await Effect.runPromise(middlewareService.execute(initialRequest));
  console.log('Request after clear:', requestAfterClear.headers);
  // Expected output for requestAfterClear.headers:
  // {}
}

// Run the example
Effect.runPromise(runMiddlewareExample()).catch((error) => {
  console.error('An error occurred during middleware operations:', error);
});
```

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/sdk-effects-request-middleware
```

## Testing

To run the unit tests for this package, run:

```bash
pnpm nx test @forgerock/sdk-effects-request-middleware
```
