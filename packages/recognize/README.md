# @forgerock/recognize

Facial recognition client for the Ping JavaScript SDK.

## Installation

```bash
npm install @forgerock/recognize
```

## Usage

```ts
import { recognize } from '@forgerock/recognize';

const client = recognize({
  authorizationToken: 'USER_AUTHORIZATION_FROM_CUSTOMER',
  customer: 'CUSTOMER_NAME',
  serviceURL: 'KEYLESS_SERVICE_URL',
  transactionData: 'DATA_FROM_CUSTOMER_SERVER_TO_BE_SIGNED',
});

client.subscribe({
  next: (event) => console.log('[recognize]', event.type, event.detail),
  error: (err) => console.error('[recognize] error', err),
  complete: (detail) => console.log('[recognize] complete', detail),
});

await client.init({
  mode: 'mount',
  container: document.getElementById('app'),
  type: 'auth',
  username: 'USERNAME',
});

// When done
client.dispose();
```

## Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `customer` | `string` | Yes | Customer identifier |
| `serviceURL` | `string` | Yes | URL of the recognition service |
| `authorizationToken` | `string` | No | Authorization token |
| `lang` | `string` | No | Language code for the UI |
| `theme` | `unknown` | No | Theme object |
| `disableSteps` | `string[]` | No | Steps to skip in the flow |
| `enableCameraFlash` | `boolean` | No | Enable camera flash |
| `enableCameraInstructions` | `boolean` | No | Show camera instructions |
| `disableLogger` | `boolean` | No | Disable internal logging |
| `disablePoweredBy` | `boolean` | No | Hide the "Powered by" badge |
| `enableWasmPthreads` | `boolean` | No | Enable WASM pthreads |
| `operationID` | `string` | No | Custom operation ID |
| `transactionData` | `string` | No | Transaction data string |
