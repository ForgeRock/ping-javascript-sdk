# ForgeRock SDK Effects - Storage

This package provides a storage effect for managing token storage within the ForgeRock JavaScript SDK ecosystem.

## Installation

```bash
npm install @forgerock/sdk-effects-storage
# or
yarn add @forgerock/sdk-effects-storage
```

## Usage

The `storage` effect facilitates getting, setting, and removing items from browser storage (`localStorage` or `sessionStorage`) or a custom token store implementation.

```typescript
import { storage } from '@forgerock/sdk-effects-storage';
import { TokenStoreObject } from '@forgerock/sdk-types';

// Example using localStorage
const storageEffect = storage({
  tokenStore: 'localStorage',
  prefix: 'fr-auth',
  clientId: 'my-client-id',
});

const storageApi = storageEffect();

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
const myCustomStore: TokenStoreObject = {
  get: async (key) => {
    /* ... custom logic ... */ return null;
  },
  set: async (key, value) => {
    /* ... custom logic ... */
  },
  remove: async (key) => {
    /* ... custom logic ... */
  },
};

const customStorageEffect = storage(
  {
    tokenStore: 'localStorage', // This is ignored when customTokenStore is provided
    prefix: 'fr-auth',
    clientId: 'my-client-id',
  },
  myCustomStore,
);

const customStorageApi = customStorageEffect();
// Use customStorageApi.get(), .set(), .remove() as above
```

## Configuration

The `storage` function accepts a configuration object with the following properties:

- `tokenStore`: Specifies the storage mechanism. Can be `'localStorage'`, `'sessionStorage'`, or a custom object conforming to the `TokenStoreObject` interface.
- `prefix`: A string prefix used in generating the storage key.
- `clientId`: The client ID, also used in generating the storage key.

An optional second argument allows providing a `customTokenStore` object directly, which overrides the `tokenStore` configuration property if provided.

The storage key is generated as \`\` `${prefix}-${clientId}`
