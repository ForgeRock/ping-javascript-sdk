# @forgerock/davinci-client

## 1.2.0

### Minor Changes

- [#262](https://github.com/ForgeRock/ping-javascript-sdk/pull/262) [`e38b49e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/e38b49ebd29c304cb362d77e3e9862217f1cc17a) Thanks [@cerebrl](https://github.com/cerebrl)! - Add support for MFA OTP field support with added collectors

- [#246](https://github.com/ForgeRock/ping-javascript-sdk/pull/246) [`0d54b34`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0d54b3461443fcf5c5071a08578f2d418f066073) Thanks [@cerebrl](https://github.com/cerebrl)! - created effects type packages, logger, oidc, and request middleware

- [#270](https://github.com/ForgeRock/ping-javascript-sdk/pull/270) [`4756348`](https://github.com/ForgeRock/ping-javascript-sdk/commit/475634870558309cf28fd3848a180e9753f0a9a0) Thanks [@cerebrl](https://github.com/cerebrl)! - Implemented phone number collector to support phone number field

### Patch Changes

- [#270](https://github.com/ForgeRock/ping-javascript-sdk/pull/270) [`4756348`](https://github.com/ForgeRock/ping-javascript-sdk/commit/475634870558309cf28fd3848a180e9753f0a9a0) Thanks [@cerebrl](https://github.com/cerebrl)! - Fixed bugs related to device auth and registration

- [#267](https://github.com/ForgeRock/ping-javascript-sdk/pull/267) [`12179a1`](https://github.com/ForgeRock/ping-javascript-sdk/commit/12179a14a6fc8cba9af34bbc0f3dc87d4319e183) Thanks [@ryanbas21](https://github.com/ryanbas21)! - update type misalignments and fallback to `continue` state when there is no state given

- Updated dependencies [[`04b506c`](https://github.com/ForgeRock/ping-javascript-sdk/commit/04b506c2016324dffeba3a473bfc705843ac3e41), [`0d54b34`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0d54b3461443fcf5c5071a08578f2d418f066073), [`50fd7fa`](https://github.com/ForgeRock/ping-javascript-sdk/commit/50fd7fab9f0dd893528e85cb15f1ba6fdc1fe3e8)]:
  - @forgerock/sdk-oidc@1.2.0
  - @forgerock/sdk-types@1.2.0
  - @forgerock/sdk-request-middleware@1.2.0

## 1.1.0

### Minor Changes

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - adding support for fields in DROPDOWN, CHECKBOX, COMBOBOX, RADIO, FLOW_LINK.

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Introduce request middleware feature to DaVinci Client

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - add support for default data, add support for multivalue/multiselector

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Add support for label and password validate field components

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - adds the ability to call start with query parameters which are appended to the /authorize call

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Replace less valuable `details` property from error with `collectors`

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - add social-login feature to davinci-client

### Patch Changes

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - handle formData lookup with more saftey in case it is not in response

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - fix return value for social-login

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Updated dependency `@forgerock/javascript-sdk` to `4.7.0`.

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Error node is now submittable and a user can recover more gracefully from an error state

- [#238](https://github.com/ForgeRock/ping-javascript-sdk/pull/238) [`4ec7a2e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/4ec7a2eaa468e990ba7ad7dc2e241995694380e5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - fixes the checks to determine what node state we are in based on the response from p1

## 1.0.0

### Major Changes

- [#522](https://github.com/ForgeRock/forgerock-javascript-sdk/pull/522) [`6b007a6`](https://github.com/ForgeRock/forgerock-javascript-sdk/commit/6b007a638901af05104e92bc78c11a088afb34f1) Thanks [@ryanbas21](https://github.com/ryanbas21)! - 1.0 Release of davinci-client

## 0.1.3

### Patch Changes

- [#518](https://github.com/ForgeRock/forgerock-javascript-sdk/pull/518) [`03e4e84`](https://github.com/ForgeRock/forgerock-javascript-sdk/commit/03e4e849b7889124f3fca59a844d54c82cc47367) Thanks [@ryanbas21](https://github.com/ryanbas21)! - remove the format check for ci

- [#520](https://github.com/ForgeRock/forgerock-javascript-sdk/pull/520) [`3563b77`](https://github.com/ForgeRock/forgerock-javascript-sdk/commit/3563b77855a8d5e140e6de1f9801e53fb6504ba3) Thanks [@ryanbas21](https://github.com/ryanbas21)! - explicitly add access public

## 0.1.2

### Patch Changes

- [#518](https://github.com/ForgeRock/forgerock-javascript-sdk/pull/518) [`03e4e84`](https://github.com/ForgeRock/forgerock-javascript-sdk/commit/03e4e849b7889124f3fca59a844d54c82cc47367) Thanks [@ryanbas21](https://github.com/ryanbas21)! - remove the format check for ci

- [#516](https://github.com/ForgeRock/forgerock-javascript-sdk/pull/516) [`5eaa7ec`](https://github.com/ForgeRock/forgerock-javascript-sdk/commit/5eaa7ecc4da81ceda1ba8418e4f9969f09bc76b1) Thanks [@ryanbas21](https://github.com/ryanbas21)! - chore: fix-version-formatting

## 0.1.1

### Patch Changes

- [#514](https://github.com/ForgeRock/forgerock-javascript-sdk/pull/514) [`dee377f`](https://github.com/ForgeRock/forgerock-javascript-sdk/commit/dee377fdbba7c7be9ea7c5bc3e3739eb75b9c02c) Thanks [@ryanbas21](https://github.com/ryanbas21)! - fix-versioning-format

## 0.1.0

### Minor Changes

- [#509](https://github.com/ForgeRock/forgerock-javascript-sdk/pull/509) [`958ba10`](https://github.com/ForgeRock/forgerock-javascript-sdk/commit/958ba101b37efab1ba5cb0afe4b6c870f8f4ef36) Thanks [@ryanbas21](https://github.com/ryanbas21)! - fix the type for the single value collector output. make it a union so it narrows and either has a url or does not have a url

### Patch Changes

- [#493](https://github.com/ForgeRock/forgerock-javascript-sdk/pull/493) [`70de27a`](https://github.com/ForgeRock/forgerock-javascript-sdk/commit/70de27aa322154f36d52e5b3a21cdc9c94a2ec92) Thanks [@ryanbas21](https://github.com/ryanbas21)! - refactor to improve type inference. use the wellknown endpoint to derive all the endpoints for the server, rather than using the baseurl

- [#491](https://github.com/ForgeRock/forgerock-javascript-sdk/pull/491) [`2b7e983`](https://github.com/ForgeRock/forgerock-javascript-sdk/commit/2b7e98352b6b264af086791b33a64ee409e15944) Thanks [@ryanbas21](https://github.com/ryanbas21)! - use async config options instead of configoptions
