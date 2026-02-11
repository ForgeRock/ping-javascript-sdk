# @forgerock/sdk-utilities

A collection of utility functions used by the ForgeRock/Ping Identity JavaScript SDK packages.

## Installation

This package is intended to be used as a dependency within the ForgeRock/Ping Identity JavaScript SDK ecosystem and is not meant to be installed directly by end users.

## Features

### URL Utilities

Utilities for formatting and handling URLs for ForgeRock/Ping Identity services:

- `getRealmUrlPath`: Formats realm paths for use in API calls
- `getEndpointPath`: Constructs endpoint paths for various API endpoints

### OIDC Utilities

Utilities for OAuth2/OIDC related operations:

- PKCE (Proof Key for Code Exchange) utilities for OAuth2 authorization code flow

## Usage

### URL Utilities

```typescript
import { getRealmUrlPath, getEndpointPath } from '@forgerock/sdk-utilities';

// Get a formatted realm path
const realmPath = getRealmUrlPath('alpha/beta');
// Returns: "realms/root/realms/alpha/realms/beta"

// Get a specific endpoint path
const authEndpoint = getEndpointPath({
  endpoint: 'authenticate',
  realmPath: 'alpha',
});
// Returns: "json/realms/root/realms/alpha/authenticate"

// With custom path
const customAuthEndpoint = getEndpointPath({
  endpoint: 'authenticate',
  realmPath: 'alpha',
  customPaths: { authenticate: 'custom/authenticate' },
});
// Returns: "custom/authenticate"
```

### OIDC/PKCE Utilities

```typescript
import { createVerifier, createChallenge } from '@forgerock/sdk-utilities';

// Create a PKCE verifier
const verifier = createVerifier();

// Generate a challenge from the verifier
const challenge = await createChallenge(verifier);
```

### Error Utilities

Utilities for working with error objects:

- `isGenericError`: TypeScript type guard to check if a value is a `GenericError`

```typescript
import { isGenericError } from '@forgerock/sdk-utilities';

const result = await someOperation();

if (isGenericError(result)) {
  console.error(`Error (${result.type}): ${result.error}`);
  console.error(`Message: ${result.message}`);
} else {
  console.log('Operation successful:', result);
}
```

## Development

### Testing

To run tests:

```bash
nx test sdk-utilities
```

### Linting

To lint the codebase:

```bash
nx lint sdk-utilities
```

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](../../LICENSE) file for details.
