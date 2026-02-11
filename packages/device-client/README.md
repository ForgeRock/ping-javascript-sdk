# Device Client API

The `deviceClient` API provides a structured interface for managing various types of devices including OATH devices, PUSH devices, WebAuthn devices, bound devices, and device profiles. This API leverages Redux Toolkit Query (RTK Query) for efficient data fetching and state management.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [API Methods](#api-methods)
   - [OATH Management](#oath-management)
   - [PUSH Management](#push-management)
   - [WebAuthn Management](#webauthn-management)
   - [Bound Devices Management](#bound-devices-management)
   - [Device Profiling Management](#device-profiling-management)

5. [Example Usage](#example-usage)
6. [Error Handling](#error-handling)
7. [License](#license)

## Overview

The `deviceClient` function initializes the API client with the provided configuration options and sets up the Redux store with the necessary middleware and reducers.

## Installation

To install the necessary dependencies for using the `deviceClient`, run:

```bash
npm install @forgerock/device-client --save
```

## Configuration

To configure the `deviceClient`, you need to provide a `ConfigOptions` object that includes the base URL for the server and the realm path.

```typescript
import { deviceClient, type ConfigOptions } from '@forgerock/device-client';

const config: ConfigOptions = {
  serverConfig: {
    baseUrl: 'https://api.example.com',
  },
  realmPath: '/your-realm-path',
};
```

If there is no realmPath or you wish to override the value, you can do so in the api call itself where you pass in the query.

```typescript
const apiClient = deviceClient(config);
```

## API Methods

### OATH Management

#### Methods

- **get(query: RetrieveOathQuery): Promise<OathDevice[] | { error: unknown }>**
- Retrieves Oath devices based on the specified query.

- **delete(query: RetrieveOathQuery & { device: OathDevice }): Promise<null | { error: unknown }>**
- Deletes an Oath device based on the provided query and device information.

### PUSH Management

#### Methods

- **get(query: PushDeviceQuery): Promise<PushDevice[] | { error: unknown }>**
- Retrieves Push devices based on the specified query.

- **delete(query: DeleteDeviceQuery): Promise<null | { error: unknown }>**
- Deletes a Push device based on the provided query.

### WebAuthn Management

#### Methods

- **get(query: WebAuthnQuery): Promise<WebAuthnDevice[] | { error: unknown }>**
- Retrieves WebAuthn devices based on the specified query.

- **update(query: WebAuthnQuery & { device: WebAuthnDevice }): Promise<UpdatedWebAuthnDevice | { error: unknown }>**
- Updates the name of a WebAuthn device based on the provided query and body.

- **delete(query: WebAuthnQuery & { device: WebAuthnDevice | UpdatedWebAuthnDevice }): Promise<null | { error: unknown }>**
- Deletes a WebAuthn device based on the provided query and body.

### Bound Devices Management

#### Methods

- **get(query: GetBoundDevicesQuery): Promise<Device[] | { error: unknown }>**
- Retrieves bound devices based on the specified query.

- **update(query: BoundDeviceQuery): Promise<Device | { error: unknown }>**
- Updates the name of a bound device based on the provided query.

- **delete(query: BoundDeviceQuery): Promise<null | { error: unknown }>**
- Deletes a bound device based on the provided query.

### Device Profiling Management

#### Methods

- **get(query: GetProfileDevices): Promise<ProfileDevice[] | { error: unknown }>**
- Retrieves device profiles based on the specified query.

- **update(query: ProfileDevicesQuery): Promise<ProfileDevice | { error: unknown }>**
- Updates the name of a device profile based on the provided query.

- **delete(query: ProfileDevicesQuery): Promise<null | { error: unknown }>**
- Deletes a device profile based on the provided query.

## Example Usage

### OATH Management Example

```typescript
const oathQuery: RetrieveOathQuery = {
  /* your query parameters */
};

const getResponse = await apiClient.oath.get(oathQuery);
console.log('Oath Devices:', getResponse);

const deleteOathQuery: RetrieveOathQuery & { device: OathDevice } = {
  /* your delete query */
};

const deleteResponse = await apiClient.oath.delete(deleteOathQuery);
console.log('Deleted Oath Device:', deleteResponse);
```

### PUSH Management Example

```typescript
const pushQuery: PushDeviceQuery = {
  /* your query parameters */
};

const getResponse = await apiClient.push.get(pushQuery);
console.log('Push Devices:', getResponse);

const deletePushQuery: DeleteDeviceQuery = {
  /* your delete query */
};

const deleteResponse = await apiClient.push.delete(deletePushQuery);
console.log('Deleted Push Device:', deleteResponse);
```

### WebAuthn Management Example

```typescript
const webAuthnQuery: WebAuthnQuery = {
  /* your query parameters */
};

const getResponse = await apiClient.webAuthn.get(webAuthnQuery);
console.log('WebAuthn Devices:', getResponse);

const updateWebAuthnQuery: WebAuthnQuery & { device: WebAuthnDevice } = {
  /* your update query */
};

const updateResponse = await apiClient.webAuthn.update(updateWebAuthnQuery);
console.log('Updated WebAuthn Device:', updateResponse);

const deleteWebAuthnQuery: WebAuthnQuery & { device: WebAuthnDevice | UpdatedWebAuthnDevice } = {
  /* your delete query */
};

const deleteResponse = await apiClient.webAuthn.delete(deleteWebAuthnQuery);
console.log('Deleted WebAuthn Device:', deleteResponse);
```

### Bound Devices Management Example

```typescript
const bindingQuery: GetBoundDevicesQuery = {
  /* your query parameters */
};

const getResponse = await apiClient.bound.get(bindingQuery);
console.log('Bound Devices:', getResponse);

const updateBindingQuery: BoundDeviceQuery = {
  /* your update query */
};

const updateResponse = await apiClient.bound.update(updateBindingQuery);
console.log('Updated Bound Device:', updateResponse);

const deleteBindingQuery: BoundDeviceQuery = {
  /* your delete query */
};

const deleteResponse = await apiClient.bound.delete(deleteBindingQuery);
console.log('Deleted Bound Device:', deleteResponse);
```

### Device Profiling Management Example

```typescript
const profileQuery: GetProfileDevices = {
  /* your query parameters */
};

const getResponse = await apiClient.profile.get(profileQuery);
console.log('Device Profiles:', getResponse);

const updateProfileQuery: ProfileDevicesQuery = {
  /* your update query */
};

const updateResponse = await apiClient.profile.update(updateProfileQuery);
console.log('Updated Device Profile:', updateResponse);

const deleteProfileQuery: ProfileDevicesQuery = {
  /* your delete query */
};

const deleteResponse = await apiClient.profile.delete(deleteProfileQuery);
console.log('Deleted Device Profile:', deleteResponse);
```

## Error Handling

When a device client method makes a request to the server and the response is not valid, it will return a promise that resolves to an error object `{ error: unknown }`. For example, to handle WebAuthn device management errors:

```typescript
const getResponse = await apiClient.webAuthn.get(query);
if (!Array.isArray(getResponse) || 'error' in getResponse) {
  // handle get device error
}

const updateResponse = await apiClient.webAuthn.update(query);
if ('error' in updateResponse) {
  // handle update device error
}

const deleteResponse = await apiClient.webAuthn.delete(query);
if (deleteResponse !== null && 'error' in deleteResponse) {
  // handle delete device error
}
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
