# @forgerock/sdk-oidc

## 1.3.0

### Minor Changes

- [#348](https://github.com/ForgeRock/ping-javascript-sdk/pull/348) [`beb349a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/beb349a9a13e7bb8fbad35bf9bda9e340545cffa) Thanks [@cerebrl](https://github.com/cerebrl)! - Implemented token exchange within OIDC Client

- [#344](https://github.com/ForgeRock/ping-javascript-sdk/pull/344) [`dc4d4bd`](https://github.com/ForgeRock/ping-javascript-sdk/commit/dc4d4bdb5aa781660de631f45b22620e400d9f4a) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement authorize functionality in oidc-client
  - Provide authorize URL method for URL creation
  - Provide background method for authorization without redirection
  - Introduce Micro from the Effect package

- [#416](https://github.com/ForgeRock/ping-javascript-sdk/pull/416) [`7ffa428`](https://github.com/ForgeRock/ping-javascript-sdk/commit/7ffa428b0fda63d978e181cd5c9150777d863f40) Thanks [@ancheetah](https://github.com/ancheetah)! - - Adds tests for OIDC effects package
  - Exposes `getStorageKey` utility

### Patch Changes

- [#471](https://github.com/ForgeRock/ping-javascript-sdk/pull/471) [`ef4ab6f`](https://github.com/ForgeRock/ping-javascript-sdk/commit/ef4ab6ffb8ba3179d9fc11442986d38448a5d0f2) Thanks [@ancheetah](https://github.com/ancheetah)! - Append query params to authorization url when provided

- Updated dependencies [[`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe), [`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c), [`fd14ca9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/fd14ca943d3d08911846a122fc3d7b1ee8716aca), [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe)]:
  - @forgerock/sdk-utilities@1.3.0
  - @forgerock/sdk-types@1.3.0

## 1.2.0

### Minor Changes

- [#253](https://github.com/ForgeRock/ping-javascript-sdk/pull/253) [`04b506c`](https://github.com/ForgeRock/ping-javascript-sdk/commit/04b506c2016324dffeba3a473bfc705843ac3e41) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Adds IFrame manager package to be able to create iframes and parse search params from the iframe url.

- [#246](https://github.com/ForgeRock/ping-javascript-sdk/pull/246) [`0d54b34`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0d54b3461443fcf5c5071a08578f2d418f066073) Thanks [@cerebrl](https://github.com/cerebrl)! - created effects type packages, logger, oidc, and request middleware

### Patch Changes

- Updated dependencies [[`04b506c`](https://github.com/ForgeRock/ping-javascript-sdk/commit/04b506c2016324dffeba3a473bfc705843ac3e41), [`0d54b34`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0d54b3461443fcf5c5071a08578f2d418f066073), [`50fd7fa`](https://github.com/ForgeRock/ping-javascript-sdk/commit/50fd7fab9f0dd893528e85cb15f1ba6fdc1fe3e8)]:
  - @forgerock/sdk-types@1.2.0
  - @forgerock/sdk-utilities@1.2.0
