# ForgeRock SDK Effects - Storage

This package provides a storage effect for managing token storage within the Ping JavaScript SDK ecosystem.

## Installation

```bash
npm install @forgerock/storage
# or
yarn add @forgerock/storage
```

## Usage

The `storage` effect facilitates getting, setting, and removing items from browser storage (`localStorage` or `sessionStorage`) or a custom token store implementation.

```typescript
import { createStorage, type CustomStorageConfig } from '@forgerock/storage';

// Example using localStorage
const storageApi = createStorage({
  type: 'localStorage',
  name: 'MyStorage',
  prefix: 'myPrefix',
});

async function manageTokens() {
  // Set a token
  await storageApi.set('someTokenValue');

  // Get a token
  const token = await storageApi.get();
  console.log(token); // Output: 'someTokenValue'

  // Remove a token
  await storageApi.remove();

  // Verify removal
  const removedToken = await storageApi.get();
  console.log(removedToken); // Output: null
}

// Example using a custom token store
const myCustomStore: CustomStorageObject = {
  get: async (key: string): Promise<string | null | GenericError> => {
    /* ... custom logic ... */
  },
  set: async (key: string, valueToSet: string): Promise<void | GenericError> => {
    /* ... custom logic ... */
  },
  remove: async (key: string): Promise<void | GenericError> => {
    /* ... custom logic ... */
  },
};

const customStorageApi = createStorage({
  type: 'custom',
  name: 'MyCustomStorage',
  prefix: 'myPrefix',
  custom: myCustomStore,
});

// Use customStorageApi.get(), .set(), .remove() as above
```

## Configuration

The `createStorage` function accepts a configuration object with the following properties:

- `type`: Specifies the storage mechanism. Can be `'localStorage'`, `'sessionStorage'`, or `'custom'`.
- `name`: A string used to generate the storage key.
- `prefix`: An optional string prefix used in generating the storage key.
- `custom`: Required when the `type` is set to `'custom'`. Allows providing a custom storage object directly, which overrides the functionality of the `get`, `set`, and `remove` methods.

The storage key is generated as `${prefix}-${name}`
