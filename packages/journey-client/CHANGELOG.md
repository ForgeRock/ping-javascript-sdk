# @forgerock/journey-client

## 2.0.0

### Major Changes

- [#524](https://github.com/ForgeRock/ping-javascript-sdk/pull/524) [`4c17ba5`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4c17ba5ef143cc91c51a0c92e6743086f46fc6e6) Thanks [@ryanbas21](https://github.com/ryanbas21)! - **BREAKING CHANGE**: Journey client methods now return `GenericError` instead of `undefined` for error cases.

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

- [#502](https://github.com/ForgeRock/ping-javascript-sdk/pull/502) [`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d) Thanks [@ryanbas21](https://github.com/ryanbas21)! - releasing version 2 of the ping javascript sdk

- [#525](https://github.com/ForgeRock/ping-javascript-sdk/pull/525) [`9a8ca14`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9a8ca14e1bd4dd6c81d3f7726c888b1d4e0252fb) Thanks [@ryanbas21](https://github.com/ryanbas21)! - BREAKING: Unify journey-client around wellknown-only configuration

  This release simplifies the configuration API by requiring the `wellknown` URL and automatically inferring `baseUrl` and `realmPath`.

  ## Breaking Changes
  - **Removed `baseUrl` from `JourneyServerConfig`**: The `baseUrl` is now always inferred from the wellknown URL. If inference fails (non-AM server), an error is returned.
  - **Removed `hasWellknownConfig` export**: This type guard is no longer needed since all configs use wellknown.

  ## Migration

  **Before:**

  ```typescript
  journey({
    config: {
      serverConfig: { baseUrl: 'https://am.example.com/am/' },
      realmPath: 'alpha',
    },
  });
  ```

  **After:**

  ```typescript
  journey({
    config: {
      serverConfig: {
        wellknown: 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration',
      },
      // realmPath is now optional - inferred from wellknown issuer
    },
  });
  ```

  ## Features
  - Automatic `baseUrl` inference from wellknown URL (extracts path before `/oauth2/`)
  - Automatic `realmPath` inference from wellknown issuer
  - Improved error messages for non-AM servers, guiding users to appropriate clients
  - Updated README with comprehensive API documentation

### Minor Changes

- [#527](https://github.com/ForgeRock/ping-javascript-sdk/pull/527) [`bca228e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/bca228e7a9beb1991159c42a03e537c29687b6e6) Thanks [@ancheetah](https://github.com/ancheetah)! - Expose return types for clients

- [#525](https://github.com/ForgeRock/ping-javascript-sdk/pull/525) [`9a8ca14`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9a8ca14e1bd4dd6c81d3f7726c888b1d4e0252fb) Thanks [@ryanbas21](https://github.com/ryanbas21)! - ### @forgerock/journey-client

  Add well-known OIDC endpoint discovery support. The journey client can now fetch configuration from the `.well-known/openid-configuration` endpoint:

  ```typescript
  const client = await journey({
    serverConfig: {
      baseUrl: 'https://am.example.com/am/',
      wellknown:
        'https://am.example.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration',
    },
  });
  ```

  The realm path can be automatically inferred from the well-known issuer URL.

  ### @forgerock/sdk-oidc

  Add shared well-known module with RTK Query API for OIDC endpoint discovery:
  - `wellknownApi` - RTK Query API for fetching well-known configuration
  - `createWellknownSelector` - Selector factory for cached well-known data
  - `createWellknownError` - Typed error creation from fetch failures
  - Re-exports pure utilities from `@forgerock/sdk-utilities`

  ### @forgerock/sdk-utilities

  Add pure well-known utilities:
  - `inferRealmFromIssuer` - Extract realm path from AM issuer URLs
  - `isValidWellknownUrl` - Validate well-known URLs (HTTPS required, HTTP allowed for localhost)

  ### @forgerock/davinci-client

  Refactored to use shared well-known module from `@forgerock/sdk-oidc`.

  ### @forgerock/oidc-client

  Refactored to use shared well-known module from `@forgerock/sdk-oidc`.

### Patch Changes

- [#500](https://github.com/ForgeRock/ping-javascript-sdk/pull/500) [`e99b374`](https://github.com/ForgeRock/ping-javascript-sdk/commit/e99b374aa17ce46dc733d791709ce2db851f305d) Thanks [@ancheetah](https://github.com/ancheetah)! - Add support for KBA `allowUserDefinedQuestions` flag

- Updated dependencies [[`3c63979`](https://github.com/ForgeRock/ping-javascript-sdk/commit/3c63979f83486e0914b61b6accfd5345e6eff152), [`ad81c13`](https://github.com/ForgeRock/ping-javascript-sdk/commit/ad81c13ab2b863be46a98803e48754b0e2b3746b), [`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d), [`9a8ca14`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9a8ca14e1bd4dd6c81d3f7726c888b1d4e0252fb), [`5a9ea40`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5a9ea4079af4698f2d7df4bb5e7b40261aece15c)]:
  - @forgerock/sdk-utilities@2.0.0
  - @forgerock/storage@2.0.0
  - @forgerock/sdk-logger@2.0.0
  - @forgerock/sdk-oidc@2.0.0
  - @forgerock/sdk-request-middleware@2.0.0
  - @forgerock/sdk-types@2.0.0

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
