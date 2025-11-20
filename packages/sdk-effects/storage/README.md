# @forgerock/sdk-effects-storage

## Overview

The `@forgerock/sdk-effects-storage` package provides a type-safe and Effect-TS compatible wrapper around the browser's `localStorage` and `sessionStorage` APIs. It allows you to interact with web storage in a declarative and composable manner, integrating seamlessly with the Effect ecosystem for error handling and resource management.

This utility abstracts away the direct use of `localStorage` and `sessionStorage`, offering a consistent API for storing, retrieving, and managing data. It's particularly useful for managing user preferences, session tokens, or other client-side data that needs to persist across browser sessions or tabs.

## Installation

```bash
pnpm add @forgerock/sdk-effects-storage
# or
npm install @forgerock/sdk-effects-storage
# or
yarn add @forgerock/sdk-effects-storage
```

## API Reference

### `storage(options?: StorageOptions)`

This is the main factory function that initializes the storage effect.

- **`options`**: `StorageOptions` (optional) - An object to configure the storage instance.
  - **`type?: 'local' | 'session'`**: The type of web storage to use. Defaults to `'local'` (i.e., `localStorage`).
  - **`prefix?: string`**: A string prefix to prepend to all keys. This helps avoid key collisions, especially when multiple applications or modules use the same storage. Defaults to `''`.

- **Returns:** `StorageService` - An object containing the storage methods.

### `storage.get(key: string): Effect.Effect<Option<string>, StorageError, never>`

Retrieves an item from storage.

- **`key: string`**: The key of the item to retrieve.

- **Returns:** `Effect.Effect<Option<string>, StorageError, never>`
  - An `Effect` that resolves to `Option.some(value)` if the item exists, or `Option.none()` if the item does not exist.
  - Fails with `StorageError` if there's an issue accessing storage (e.g., security error, quota exceeded).

### `storage.set(key: string, value: string): Effect.Effect<void, StorageError, never>`

Stores an item in storage.

- **`key: string`**: The key under which to store the item.
- **`value: string`**: The string value to store.

- **Returns:** `Effect.Effect<void, StorageError, never>`
  - An `Effect` that resolves to `void` on success.
  - Fails with `StorageError` if there's an issue accessing storage (e.g., security error, quota exceeded).

### `storage.remove(key: string): Effect.Effect<void, StorageError, never>`

Removes an item from storage.

- **`key: string`**: The key of the item to remove.

- **Returns:** `Effect.Effect<void, StorageError, never>`
  - An `Effect` that resolves to `void` on success.
  - Fails with `StorageError` if there's an issue accessing storage.

### `storage.clear(): Effect.Effect<void, StorageError, never>`

Clears all items from the current storage instance (either `localStorage` or `sessionStorage`, depending on configuration).

- **Returns:** `Effect.Effect<void, StorageError, never>`
  - An `Effect` that resolves to `void` on success.
  - Fails with `StorageError` if there's an issue accessing storage.

### `storage.length(): Effect.Effect<number, StorageError, never>`

Returns the number of key-value pairs currently present in the storage.

- **Returns:** `Effect.Effect<number, StorageError, never>`
  - An `Effect` that resolves to the number of items.
  - Fails with `StorageError` if there's an issue accessing storage.

### `storage.key(index: number): Effect.Effect<Option<string>, StorageError, never>`

Returns the key at the specified index.

- **`index: number`**: The zero-based index of the key to retrieve.

- **Returns:** `Effect.Effect<Option<string>, StorageError, never>`
  - An `Effect` that resolves to `Option.some(key)` if a key exists at the index, or `Option.none()` if the index is out of bounds.
  - Fails with `StorageError` if there's an issue accessing storage.

## Usage Example

```typescript
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { storage } from '@forgerock/sdk-effects-storage';

// Initialize local storage with a prefix
const localStorageService = storage({ type: 'local', prefix: 'my-app-' });

// Initialize session storage without a prefix
const sessionStorageService = storage({ type: 'session' });

async function runStorageOperations() {
  // Set an item in local storage
  const setLocalEffect = localStorageService.set('username', 'john.doe');
  await Effect.runPromise(setLocalEffect);
  console.log('Username set in local storage.');

  // Get an item from local storage
  const getLocalEffect = localStorageService.get('username');
  const usernameOption = await Effect.runPromise(getLocalEffect);
  Option.match(usernameOption, {
    onNone: () => console.log('Username not found in local storage.'),
    onSome: (username) => console.log(`Username from local storage: ${username}`),
  });

  // Set an item in session storage
  const setSessionEffect = sessionStorageService.set('session-id', 'abc-123');
  await Effect.runPromise(setSessionEffect);
  console.log('Session ID set in session storage.');

  // Get an item from session storage
  const getSessionEffect = sessionStorageService.get('session-id');
  const sessionIdOption = await Effect.runPromise(getSessionEffect);
  Option.match(sessionIdOption, {
    onNone: () => console.log('Session ID not found in session storage.'),
    onSome: (sessionId) => console.log(`Session ID from session storage: ${sessionId}`),
  });

  // Remove an item from local storage
  const removeLocalEffect = localStorageService.remove('username');
  await Effect.runPromise(removeLocalEffect);
  console.log('Username removed from local storage.');

  // Check length of local storage
  const lengthLocalEffect = localStorageService.length();
  const localLength = await Effect.runPromise(lengthLocalEffect);
  console.log(`Local storage length: ${localLength}`);

  // Clear session storage
  const clearSessionEffect = sessionStorageService.clear();
  await Effect.runPromise(clearSessionEffect);
  console.log('Session storage cleared.');

  // Attempt to get a non-existent key
  const getNonExistentEffect = localStorageService.get('non-existent-key');
  const nonExistentOption = await Effect.runPromise(getNonExistentEffect);
  Option.match(nonExistentOption, {
    onNone: () => console.log('Non-existent key correctly returned None.'),
    onSome: (value) => console.log(`Unexpected value for non-existent key: ${value}`),
  });
}

// Run the storage operations
Effect.runPromise(runStorageOperations()).catch((error) => {
  console.error('An error occurred during storage operations:', error);
});
```

## Building

This library is part of an Nx monorepo. To build it, run:

```bash
pnpm nx build @forgerock/sdk-effects-storage
```

## Testing

To run the unit tests for this package, run:

```bash
pnpm nx test @forgerock/sdk-effects-storage
```
