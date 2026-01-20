---
'@forgerock/journey-client': major
---

**BREAKING CHANGE**: Journey client methods now return `GenericError` instead of `undefined` for error cases.

## What Changed

The `start`, `next`, `resume`, and `terminate` methods now return a `GenericError` object instead of `undefined` when encountering unknown step types or error conditions. This aligns the journey client with the DaVinci client's error handling patterns.

### Return Type Changes

| Method      | Before                                                                   | After                                                                       |
| ----------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `start`     | `JourneyStep \| JourneyLoginSuccess \| JourneyLoginFailure \| undefined` | `JourneyStep \| JourneyLoginSuccess \| JourneyLoginFailure \| GenericError` |
| `next`      | `JourneyStep \| JourneyLoginSuccess \| JourneyLoginFailure \| undefined` | `JourneyStep \| JourneyLoginSuccess \| JourneyLoginFailure \| GenericError` |
| `resume`    | `JourneyStep \| JourneyLoginSuccess \| JourneyLoginFailure \| undefined` | `JourneyStep \| JourneyLoginSuccess \| JourneyLoginFailure \| GenericError` |
| `terminate` | `void`                                                                   | `void \| GenericError`                                                      |

## Migration Guide

Before:

```ts
const step = await client.start();
if (step) {
  // Use step
}

After: const result = await client.start();
if ('error' in result) {
  // Handle error
  console.error(result.message);
} else {
  // Use step
}
```
