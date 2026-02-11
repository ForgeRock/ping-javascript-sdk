# @forgerock/storage

## 2.0.0

### Major Changes

- [#502](https://github.com/ForgeRock/ping-javascript-sdk/pull/502) [`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d) Thanks [@ryanbas21](https://github.com/ryanbas21)! - releasing version 2 of the ping javascript sdk

### Patch Changes

- [#510](https://github.com/ForgeRock/ping-javascript-sdk/pull/510) [`3c63979`](https://github.com/ForgeRock/ping-javascript-sdk/commit/3c63979f83486e0914b61b6accfd5345e6eff152) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Fix error handling in storage client and davinci-client
  - Add `isGenericError` type guard to sdk-utilities for runtime error validation
  - Fix storage client to properly catch errors from custom storage implementations, honoring the errors-as-values contract
  - Improve davinci-client error handling to use explicit error checks instead of try-catch

- [#526](https://github.com/ForgeRock/ping-javascript-sdk/pull/526) [`5a9ea40`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5a9ea4079af4698f2d7df4bb5e7b40261aece15c) Thanks [@ancheetah](https://github.com/ancheetah)! - Update READMES. Fix types and comments.

- Updated dependencies [[`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d), [`5a9ea40`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5a9ea4079af4698f2d7df4bb5e7b40261aece15c)]:
  - @forgerock/sdk-types@2.0.0

## 1.3.0

### Minor Changes

- [#412](https://github.com/ForgeRock/ping-javascript-sdk/pull/412) [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe) Thanks [@ryanbas21](https://github.com/ryanbas21)! - feat: Update storage package
  - Updated ESLint configurations for consistent code style and linting rules.
  - Ensured compatibility with `verbatimModuleSyntax` by correcting type-only imports and module exports.

- [#348](https://github.com/ForgeRock/ping-javascript-sdk/pull/348) [`beb349a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/beb349a9a13e7bb8fbad35bf9bda9e340545cffa) Thanks [@cerebrl](https://github.com/cerebrl)! - Implemented token exchange within OIDC Client

- [#417](https://github.com/ForgeRock/ping-javascript-sdk/pull/417) [`93595d2`](https://github.com/ForgeRock/ping-javascript-sdk/commit/93595d265234cd149ff76dbac20e3e1031c3ef5f) Thanks [@ancheetah](https://github.com/ancheetah)! - - Standardizes return types on storage client and updates tests
  - Improves OIDC client where storage client methods are used

### Patch Changes

- [#363](https://github.com/ForgeRock/ping-javascript-sdk/pull/363) [`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement OIDC logout and user info request; includes type updates and global error type

- Updated dependencies [[`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c), [`fd14ca9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/fd14ca943d3d08911846a122fc3d7b1ee8716aca), [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe)]:
  - @forgerock/sdk-types@1.3.0

## 1.2.0

### Minor Changes

- [#251](https://github.com/ForgeRock/ping-javascript-sdk/pull/251) [`50fd7fa`](https://github.com/ForgeRock/ping-javascript-sdk/commit/50fd7fab9f0dd893528e85cb15f1ba6fdc1fe3e8) Thanks [@ryanbas21](https://github.com/ryanbas21)! - created sdk-storage module, which includes session,local, and token storage

### Patch Changes

- Updated dependencies [[`04b506c`](https://github.com/ForgeRock/ping-javascript-sdk/commit/04b506c2016324dffeba3a473bfc705843ac3e41), [`50fd7fa`](https://github.com/ForgeRock/ping-javascript-sdk/commit/50fd7fab9f0dd893528e85cb15f1ba6fdc1fe3e8)]:
  - @forgerock/sdk-types@1.2.0
