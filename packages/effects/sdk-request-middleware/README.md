# SDK Request Middleware

A flexible middleware system for intercepting and modifying HTTP requests in the Ping Identity JavaScript SDK.

## Overview

This package provides a middleware architecture that allows developers to intercept, inspect, and modify HTTP requests before they are sent to the server. It's designed to work with Redux Toolkit's Query API, providing a familiar middleware pattern for request manipulation.

## Features

- **Request Interception**: Intercept outgoing API requests before they reach the server
- **Request Modification**: Modify URL parameters, headers, and request bodies
- **Action-Based Middleware**: Process requests based on specific action types
- **Middleware Chain**: Execute multiple middleware functions in sequence
- **Immutable Actions**: Prevent accidental mutation of action objects
- **TypeScript Support**: Built with TypeScript for better developer experience and type safety

## Installation

```bash
npm install @forgerock/sdk-request-middleware
```

## Usage

### Basic Usage

```typescript
import { initQuery } from '@forgerock/sdk-request-middleware';

// Define your middleware functions
const requestMiddleware = [
  (req, action, next) => {
    // Add custom headers
    req.headers.set('x-custom-header', 'custom-value');

    // Continue to the next middleware
    next();
  },
  (req, action, next) => {
    // Add URL parameters
    req.url.searchParams.set('timestamp', Date.now().toString());

    // Continue to the next middleware
    next();
  },
];

// Create a request
const fetchArgs = { url: 'https://api.example.com/resource' };

// Initialize a query and apply middleware
const response = await initQuery(fetchArgs, 'start')
  .applyMiddleware(requestMiddleware)
  .applyQuery(async (args) => {
    // Your fetch implementation here
    return fetch(args.url, args);
  });
```

### Action-Based Middleware

```typescript
import { initQuery } from '@forgerock/sdk-request-middleware';

const authMiddleware = [
  (req, action, next) => {
    // Apply different logic based on action type
    switch (action.type) {
      case 'DAVINCI_START':
        req.url.searchParams.set(...params);
        break;
      case 'DAVINCI_NEXT'
        req.url.searchParams.set(...params);
        break;
    }

    // Add authorization token from action payload if available
    if (action.payload?.token) {
      req.headers.set('Authorization', `Bearer ${action.payload.token}`);
    }

    next();
  },
];

// Use the middleware with specific action type
const response = await initQuery(fetchArgs, 'login')
  .applyMiddleware(authMiddleware)
  .applyQuery(queryCallback);
```

## API Reference

### `initQuery(fetchArgs, endpoint)`

Initializes a query object that can be used to apply middleware and execute HTTP requests.

**Parameters:**

- `fetchArgs`: A FetchArgs object containing the URL and any other request options
- `endpoint`: A string representing the endpoint being called (maps to an action type)

**Returns:**
A query API object with the following methods:

### `applyMiddleware(middleware)`

Applies an array of middleware functions to the request.

**Parameters:**

- `middleware`: An array of middleware functions that conform to the RequestMiddleware type

**Returns:**
The query API object for chaining

### `applyQuery(callback)`

Executes the request with the provided callback function.

**Parameters:**

- `callback`: A function that takes the modified request and returns a Promise with the API response

**Returns:**
A Promise with the result of the callback function

### RequestMiddleware Type

```typescript
type RequestMiddleware<Type, Payload> = (
  req: ModifiedFetchArgs,
  action: Action<Type, Payload>,
  next: () => ModifiedFetchArgs,
) => void;
```

## Building

Run `nx build sdk-request-middleware` to build the library.

## Running unit tests

Run `nx test sdk-request-middleware` to execute the unit tests via [Vitest](https://vitest.dev/).
