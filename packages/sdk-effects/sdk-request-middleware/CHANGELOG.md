# @forgerock/sdk-request-middleware

## 2.1.0

### Minor Changes

- [#563](https://github.com/ForgeRock/ping-javascript-sdk/pull/563) [`ec39137`](https://github.com/ForgeRock/ping-javascript-sdk/commit/ec3913769fbd1572f09fdf3fd45dcb61e84866c9) Thanks [@ancheetah](https://github.com/ancheetah)! - Adds `pollStatus()` method and `PollingCollector` to `@forgerock/davinci-client` for polling support in DaVinci flows.

  Pass a `PollingCollector` to `davinciClient.pollStatus(collector)` to get a poller function. The polling mode is detected automatically from the collector:
  - **Challenge polling**: Periodically calls the `/status` endpoint until the challenge is resolved.
  - **Continue polling**: Performs a delay and returns a status based on remaining poll retries. Call the returned poller function repeatedly in a loop until it resolves with the next node in the flow or an error.

  Adds ability to intercept the polling request with middleware.

- [#631](https://github.com/ForgeRock/ping-javascript-sdk/pull/631) [`15d616d`](https://github.com/ForgeRock/ping-javascript-sdk/commit/15d616d665ed6daec7c55fdcdcfe7256972a805c) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Add support for PAR in oidc-client requests for redirect flows

### Patch Changes

- [#555](https://github.com/ForgeRock/ping-javascript-sdk/pull/555) [`d849256`](https://github.com/ForgeRock/ping-javascript-sdk/commit/d849256768abea11d8e034fb982ae4220a5b7801) Thanks [@ancheetah](https://github.com/ancheetah)! - Fixes files distributed in sdk-effects packages. Excludes files not in `/dist` folder.

## 2.0.0

### Major Changes

- [#502](https://github.com/ForgeRock/ping-javascript-sdk/pull/502) [`9ad4062`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9ad406268dd568d8d6f6447a07b656e317a9da8d) Thanks [@ryanbas21](https://github.com/ryanbas21)! - releasing version 2 of the ping javascript sdk

### Patch Changes

- [#526](https://github.com/ForgeRock/ping-javascript-sdk/pull/526) [`5a9ea40`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5a9ea4079af4698f2d7df4bb5e7b40261aece15c) Thanks [@ancheetah](https://github.com/ancheetah)! - Update READMES. Fix types and comments.

## 1.3.0

## 1.2.0

### Minor Changes

- [#246](https://github.com/ForgeRock/ping-javascript-sdk/pull/246) [`0d54b34`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0d54b3461443fcf5c5071a08578f2d418f066073) Thanks [@cerebrl](https://github.com/cerebrl)! - created effects type packages, logger, oidc, and request middleware
