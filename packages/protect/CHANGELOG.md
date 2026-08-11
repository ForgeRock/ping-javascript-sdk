# @forgerock/protect

## 2.1.0

### Patch Changes

- [#578](https://github.com/ForgeRock/ping-javascript-sdk/pull/578) [`096733d`](https://github.com/ForgeRock/ping-javascript-sdk/commit/096733df543a6fa2e9468873677ab2f350aade36) Thanks [@SteinGabriel](https://github.com/SteinGabriel)! - Support `signalsInitializationOptions` pass-through config from AM in `PingOneProtectInitializeCallback`.
  - `getConfig()` detects `signalsInitializationOptions` in the callback output; if it is a valid plain object, returns it directly as `SignalsInitializationOptions`
  - Falls back to the existing `ProtectConfig` construction when the property is absent or invalid (null, string, array)
  - `protect()` now accepts `ProtectConfig | SignalsInitializationOptions` so the pass-through config flows in without type assertions
  - Updates vendored Signals SDK from v5.6.0w to v5.6.9w

## 2.0.0

### Major Changes

- [#502](https://github.com/ForgeRock/ping-javascript-sdk/pull/502) [`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d) Thanks [@ryanbas21](https://github.com/ryanbas21)! - releasing version 2 of the ping javascript sdk

### Patch Changes

- [#526](https://github.com/ForgeRock/ping-javascript-sdk/pull/526) [`5a9ea40`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5a9ea4079af4698f2d7df4bb5e7b40261aece15c) Thanks [@ancheetah](https://github.com/ancheetah)! - Update READMES. Fix types and comments.

## 1.3.0

### Minor Changes

- [#362](https://github.com/ForgeRock/ping-javascript-sdk/pull/362) [`18677d9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/18677d910631a544279f7725c6fb3fa5a3fcc0f6) Thanks [@ancheetah](https://github.com/ancheetah)! - Implemented ping protect package
