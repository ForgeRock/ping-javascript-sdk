# @forgerock/journey-client

## 1.3.0

### Minor Changes

- [#412](https://github.com/ForgeRock/ping-javascript-sdk/pull/412) [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe) Thanks [@ryanbas21](https://github.com/ryanbas21)! - feat: Implement new journey client
  - Implemented a new `journey()` factory function for creating stateful client instances.
  - Integrated Redux Toolkit and RTK Query for robust state management and API interactions.
  - Refactored `resume` logic to correctly persist and retrieve plain `Step` payloads, resolving prototype loss issues during serialization.
  - Improved error handling and type safety within the client.
  - Updated internal callback handling and device profiling integration.

- [#412](https://github.com/ForgeRock/ping-javascript-sdk/pull/412) [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe) Thanks [@ryanbas21](https://github.com/ryanbas21)! - feat(journey-client): Add WebAuthn, QR Code, and Recovery Code support
  - Introduces new utility modules (`FRWebAuthn`, `FRQRCode`, `FRRecoveryCodes`) to handle advanced authentication methods within authentication journeys.
  - Adds comprehensive parsing and handling for WebAuthn registration and authentication steps, including a fix for a type error where `TextOutputCallback` was being incorrectly inferred as `TextInputCallback`.
  - Implements support for displaying QR codes (for both OTP and Push) and for displaying and using recovery codes.
  - Includes extensive unit tests for the new callback types and utility modules to ensure correctness.
  - Updates documentation to reflect the new capabilities and architectural changes.

### Patch Changes

- Updated dependencies [[`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe), [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe), [`beb349a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/beb349a9a13e7bb8fbad35bf9bda9e340545cffa), [`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c), [`93595d2`](https://github.com/ForgeRock/ping-javascript-sdk/commit/93595d265234cd149ff76dbac20e3e1031c3ef5f), [`fd14ca9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/fd14ca943d3d08911846a122fc3d7b1ee8716aca), [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe), [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe)]:
  - @forgerock/storage@1.3.0
  - @forgerock/sdk-utilities@1.3.0
  - @forgerock/sdk-types@1.3.0
  - @forgerock/sdk-logger@1.3.0
  - @forgerock/sdk-request-middleware@1.3.0
