# @forgerock/sdk-utilities

## 2.0.0

### Major Changes

- [#502](https://github.com/ForgeRock/ping-javascript-sdk/pull/502) [`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d) Thanks [@ryanbas21](https://github.com/ryanbas21)! - releasing version 2 of the ping javascript sdk

### Patch Changes

- [#510](https://github.com/ForgeRock/ping-javascript-sdk/pull/510) [`3c63979`](https://github.com/ForgeRock/ping-javascript-sdk/commit/3c63979f83486e0914b61b6accfd5345e6eff152) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Fix error handling in storage client and davinci-client
  - Add `isGenericError` type guard to sdk-utilities for runtime error validation
  - Fix storage client to properly catch errors from custom storage implementations, honoring the errors-as-values contract
  - Improve davinci-client error handling to use explicit error checks instead of try-catch

- Updated dependencies [[`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d)]:
  - @forgerock/sdk-types@2.0.0

## 1.3.0

### Minor Changes

- [#412](https://github.com/ForgeRock/ping-javascript-sdk/pull/412) [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe) Thanks [@ryanbas21](https://github.com/ryanbas21)! - feat: Update SDK utilities
  - Inlined `REQUESTED_WITH` and `X_REQUESTED_PLATFORM` constants with literal types for better tree-shaking and type narrowing.

## 1.2.0

### Minor Changes

- [#246](https://github.com/ForgeRock/ping-javascript-sdk/pull/246) [`0d54b34`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0d54b3461443fcf5c5071a08578f2d418f066073) Thanks [@cerebrl](https://github.com/cerebrl)! - created effects type packages, logger, oidc, and request middleware
