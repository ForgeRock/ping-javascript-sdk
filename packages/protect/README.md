# Ping Protect

The Ping Protect module provides an API for interacting with the PingOne Signals (Protect) SDK to perform risk evaluations. It can be used with either a PingOne AIC/PingAM authentication journey with Protect callbacks or with a PingOne DaVinci flow with Protect collectors.

## Full API

```js
// Protect methods
start();
getData();
pauseBehavioralData();
resumeBehavioralData();
```

## Quickstart with a PingOne AIC or PingAM Authentication Journey

The Ping Protect module is intended to be used along with the Journey client to provide the Protect feature.

### Requirements

1. PingOne Advanced Identity Cloud (aka PingOne AIC) platform or an up-to-date Ping Identity Access Management (aka PingAM)
2. PingOne tenant with Protect enabled
3. A Ping Protect Service configured in AIC or AM
4. A journey/tree with the appropriate Protect Nodes
5. A client application with the `@forgerock/journey-client` and `@forgerock/protect` modules installed

### Integrate into a Client Application

#### Installation

Install both modules and their latest versions:

```sh
npm install @forgerock/journey-client @forgerock/protect
```

```sh
pnpm install @forgerock/journey-client @forgerock/protect
```

#### Initialization (Recommended)

The `@forgerock/protect` module has a `protect()` function that accepts configuration options and returns a set of methods for interacting with Protect. The two main responsibilities of the Ping Protect module are the initialization of the profiling and data collection and the completion and preparation of the collected data for the server. You can find these two methods on the API returned by `protect()`.

- `start()`
- `getData()`

When calling `protect()`, you have many different options to configure what and how the data is collected. The most important and required of these settings is the `envId`. All other settings are optional.

The `start` method can be called at application startup, or when you receive the `PingOneProtectInitializeCallback` callback from the server. We recommend you call `start` as soon as you can to collect as much data as possible for higher accuracy.

```js
import { protect } from '@forgerock/protect';

// Call early in your application startup
const protectApi = protect({ envId: '12345' });
await protectApi.start();
```

#### Initialization (alternate)

Alternatively, you can delay the initialization until you receive the instruction from the server by way of the special callback: `PingOneProtectInitializeCallback`. To do this, you would call the `start` method when the callback is present in the journey.

```js
if (step.getCallbacksOfType('PingOneProtectInitializeCallback')) {
  // Asynchronous call
  await protectApi.start();
}
```

#### Data collection

You then call the `next` method after initialization to move the user forward in the journey.

```js
journeyClient.next(step);
```

At some point in the journey, and as late as possible in order to collect as much data as you can, you will come across the `PingOneProtectEvaluationCallback`. This is when you call the `getData` method to package what's been collected for the server to evaluate.

```js
let data;

if (step.getCallbacksOfType('PingOneProtectEvaluationCallback')) {
  // Asynchronous call
  data = await protectApi.getData();
}
```

Now that we have the data, set it on the callback in order to send it to the server when we call `next`.

```js
callback.setData(data);

journeyClient.next(step);
```

### Error Handling

The Protect API methods will return an error object if they fail. When you encounter an error during initialization or evaluation, set the error message on the callback using the `setClientError` method. Setting the message on the callback is how it gets sent to the server on the `next` method call.

```js
if (step.getCallbacksOfType('PingOneProtectInitializeCallback')) {
  const callback = step.getCallbackOfType('PingOneProtectInitializeCallback');

  // Asynchronous call
  const result = await protectApi.start();

  if (result?.error) {
    callback.setClientError(result.error);
  }
}
```

A similar process is used for the evaluation step.

```js
if (step.getCallbacksOfType('PingOneProtectEvaluationCallback')) {
  const callback = step.getCallbackOfType('PingOneProtectEvaluationCallback');

  // Asynchronous call
  const result = await protectApi.getData();

  if (typeof result !== 'string' && 'error' in result) {
    callback.setClientError(data.error);
  }
}
```

## Quickstart with a PingOne DaVinci Flow

The Ping Protect module is intended to be used along with the DaVinci client to provide the Ping Protect feature.

### Requirements

1. A PingOne environment with PingOne Protect added
2. A worker application configured in your PingOne environment
3. A DaVinci flow with the appropriate Protect connectors
4. A client application with the `@forgerock/davinci-client` and `@forgerock/protect` modules installed

### Integrate into a Client Application

#### Initialization (Recommended)

Install both modules and their latest versions:

```sh
npm install @forgerock/davinci-client @forgerock/protect
```

The `@forgerock/protect` module has a `protect()` function that accepts configuration options and returns a set of methods for interacting with Protect. The two main responsibilities of the Ping Protect module are the initialization of the profiling and data collection and the completion and preparation of the collected data for the server. You can find these two methods on the API returned by `protect()`.

- `start()`
- `getData()`

When calling `protect()`, you have many different options to configure what and how the data is collected. The most important and required of these settings is the `envId`. All other settings are optional.

The `start` method can be called at application startup, or when you receive the `ProtectCollector` from the server. We recommend you call `start` as soon as you can to collect as much data as possible for higher accuracy.

```js
import { protect } from '@forgerock/protect';

// Call early in your application startup
const protectApi = protect({ envId: '12345' });
await protectApi.start();
```

#### Initialization (alternate)

Alternatively, you can delay the initialization until you receive the instruction from the server by way of the `ProtectCollector`. To do this, you would call the `start` method when the collector is present in the flow. The Protect collector is returned from the server when it is configured with either a PingOne Forms connector or HTTP connector with Custom HTML Template.

```js
const collectors = davinciClient.getCollectors();
collectors.forEach((collector) => {
  if (collector.type === 'ProtectCollector') {
    // Optionally use configuration options from the flow to initialize the protect module
    const config = collector.output.config;

    // Initialize the Protect module and begin collecting data
    const protectApi = protect({
      envId: '12345',
      behavioralDataCollection: config.behavioralDataCollection,
      universalDeviceIdentification: config.universalDeviceIdentification,
    });
    await protectApi.start();
  }
  ...
});
```

#### Data collection

When the user has finished filling out the form and is ready to submit, you can call the `getData` method to package what's been collected. The Protector collector should then be updated with this data to send back to the server to evaluate.

```js
async function onSubmitHandler() {
  try {
    const protectCollector = collectors.find((collector) => collector.type === 'ProtectCollector');

    // Update the Protect collector with the data collected
    if (protectCollector) {
      const updater = davinciClient.update(protectCollector);
      const data = await protectApi.getData();
      updater(data);
    }

    // Submit all collectors and get the next node in the flow
    await davinciClient.next();
  } catch (err) {
    // handle error
  }
}
```

### Error Handling

The Protect API methods will return an error object if they fail. You may use this to return a message to the user or implement your own error handling.

**Example**: Handling error messages on `start`

```js
const result = await protectApi.start();
if (result?.error) {
  console.error(`Error initializing Protect: ${result.error}`);
}
```

**Example**: Handling error messages on `getData`

```js
const result = await protectApi.getData();
if (typeof result !== 'string' && 'error' in result) {
  console.error(`Failed to retrieve data from Protect: ${result.error}`);
}
```
