# @forgerock/oidc-client

## 1.3.0

### Minor Changes

- [#348](https://github.com/ForgeRock/ping-javascript-sdk/pull/348) [`beb349a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/beb349a9a13e7bb8fbad35bf9bda9e340545cffa) Thanks [@cerebrl](https://github.com/cerebrl)! - Implemented token exchange within OIDC Client

- [#344](https://github.com/ForgeRock/ping-javascript-sdk/pull/344) [`dc4d4bd`](https://github.com/ForgeRock/ping-javascript-sdk/commit/dc4d4bdb5aa781660de631f45b22620e400d9f4a) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement authorize functionality in oidc-client
  - Provide authorize URL method for URL creation
  - Provide background method for authorization without redirection
  - Introduce Micro from the Effect package

- [#363](https://github.com/ForgeRock/ping-javascript-sdk/pull/363) [`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement OIDC logout and user info request; includes type updates and global error type

### Patch Changes

- Updated dependencies [[`beb349a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/beb349a9a13e7bb8fbad35bf9bda9e340545cffa), [`dc4d4bd`](https://github.com/ForgeRock/ping-javascript-sdk/commit/dc4d4bdb5aa781660de631f45b22620e400d9f4a), [`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c)]:
  - @forgerock/iframe-manager@1.3.0
  - @forgerock/storage@1.3.0
  - @forgerock/sdk-oidc@1.3.0
  - @forgerock/sdk-types@1.3.0
  - @forgerock/sdk-logger@1.3.0
  - @forgerock/sdk-request-middleware@1.3.0

## 1.2.0

### Patch Changes

- [#279](https://github.com/ForgeRock/ping-javascript-sdk/pull/279) [`ad03cd5`](https://github.com/ForgeRock/ping-javascript-sdk/commit/ad03cd567ce9364880d46162a1cb787deb2f8b15) Thanks [@ryanbas21](https://github.com/ryanbas21)! - adds token-store module to newly created oidc-client for generic oidc interactions.

- Updated dependencies [[`04b506c`](https://github.com/ForgeRock/ping-javascript-sdk/commit/04b506c2016324dffeba3a473bfc705843ac3e41), [`50fd7fa`](https://github.com/ForgeRock/ping-javascript-sdk/commit/50fd7fab9f0dd893528e85cb15f1ba6fdc1fe3e8)]:
  - @forgerock/sdk-types@1.2.0
  - @forgerock/storage@1.2.0
