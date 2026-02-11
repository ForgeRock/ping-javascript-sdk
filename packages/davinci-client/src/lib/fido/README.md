# FIDO Module for DaVinci

## Overview

The `fido` API provides an interface for registering and authenticating with the WebAuthn API and transforming data to and from DaVinci. These methods transform options from DaVinci into WebAuthn compatible options, then call `navigator.credentials.create` or `navigator.credentials.get`, and finally transform the output of the WebAuthn API into a valid payload to send back to DaVinci.

**Note**: To use this module, browser support is required for `navigator.credentials.create` and `navigator.credentials.get`

## Installation and Initialization

The `fido` module is exported as a member of the `@forgerock/davinci-client` package and is intended to be used alongside the `davinciClient` to progress through a flow. To install the necessary dependencies, run:

```bash
npm install @forgerock/davinci-client --save
```

After installing, import and initialize the clients:

```typescript
import { davinci, fido } from '@forgerock/davinci-client';

const davinciClient = await davinci({ config });
const fidoApi = fido();
```

## API methods

### Registration

**register(options: FidoRegistrationOptions) => Promise<FidoRegistrationInputValue | GenericError>**

Creates a keypair and returns a public key credential formatted for DaVinci or an error

### Authentication

**authenticate: (options: FidoAuthenticationOptions) => Promise<FidoAuthenticationInputValue | GenericError>**

Creates an assertion to send to DaVinci for authentication

## Example Usage

### Registration Example

```typescript
if (collector.type === 'FidoRegistrationCollector') {
  const credentialOptions = collector.output.config.publicKeyCredentialCreationOptions;
  const publicKeyCredential = await fidoApi.register(credentialOptions);
  if ('error' in publicKeyCredential) {
    // Handle error
  } else {
    // Update the FidoRegistrationCollector with the credential
    const updater = davinciClient.update(collector);
    updater(publicKeyCredential);
  }
}
```

### Authentication Example

```typescript
if (collector.type === 'FidoAuthenticationCollector') {
  const credentialOptions = collector.output.config.publicKeyCredentialRequestOptions;
  const assertion = await fidoApi.authenticate(credentialOptions);
  if ('error' in assertion) {
    // Handle error
  } else {
    // Update the FidoAuthenticationCollector with the credential
    const updater = davinciClient.update(collector);
    updater(assertion);
  }
}
```
