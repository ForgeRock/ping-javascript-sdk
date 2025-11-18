# @forgerock/davinci-client

## 1.3.0

### Minor Changes

- [#348](https://github.com/ForgeRock/ping-javascript-sdk/pull/348) [`beb349a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/beb349a9a13e7bb8fbad35bf9bda9e340545cffa) Thanks [@cerebrl](https://github.com/cerebrl)! - Implemented token exchange within OIDC Client

- [#340](https://github.com/ForgeRock/ping-javascript-sdk/pull/340) [`0fa522a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0fa522ab734a9b5adf41883abf25fa8600aaf6a9) Thanks [@ancheetah](https://github.com/ancheetah)! - Implemented Ping Protect collector

- [#396](https://github.com/ForgeRock/ping-javascript-sdk/pull/396) [`036f495`](https://github.com/ForgeRock/ping-javascript-sdk/commit/036f4952f959e3eedb8e0c88a5043dd2448ad6ca) Thanks [@ancheetah](https://github.com/ancheetah)! - Added support for pre-filled phone number and country code

- [#468](https://github.com/ForgeRock/ping-javascript-sdk/pull/468) [`fd14ca9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/fd14ca943d3d08911846a122fc3d7b1ee8716aca) Thanks [@ancheetah](https://github.com/ancheetah)! - Adds FIDO feature module to `@forgerock/davinci-client` package

- [#428](https://github.com/ForgeRock/ping-javascript-sdk/pull/428) [`b327c79`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b327c79c8dfc4bd7d97008ff81a27f8f922bf5cd) Thanks [@ancheetah](https://github.com/ancheetah)! - Added WebAuthn/FIDO2 collectors

### Patch Changes

- [#413](https://github.com/ForgeRock/ping-javascript-sdk/pull/413) [`9213bb9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9213bb9299ade800e8482f4904a8620c47d27ad2) Thanks [@ancheetah](https://github.com/ancheetah)! - Exposes `required` and `validatePhoneNumber` properties on collectors

- [#363](https://github.com/ForgeRock/ping-javascript-sdk/pull/363) [`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement OIDC logout and user info request; includes type updates and global error type

- Updated dependencies [[`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe), [`beb349a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/beb349a9a13e7bb8fbad35bf9bda9e340545cffa), [`dc4d4bd`](https://github.com/ForgeRock/ping-javascript-sdk/commit/dc4d4bdb5aa781660de631f45b22620e400d9f4a), [`7ffa428`](https://github.com/ForgeRock/ping-javascript-sdk/commit/7ffa428b0fda63d978e181cd5c9150777d863f40), [`6c06e70`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6c06e709a7aa503cda2e4f2b923cace1abcebd3c), [`93595d2`](https://github.com/ForgeRock/ping-javascript-sdk/commit/93595d265234cd149ff76dbac20e3e1031c3ef5f), [`fd14ca9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/fd14ca943d3d08911846a122fc3d7b1ee8716aca), [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe), [`ef4ab6f`](https://github.com/ForgeRock/ping-javascript-sdk/commit/ef4ab6ffb8ba3179d9fc11442986d38448a5d0f2), [`b0f4368`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b0f4368637a788c5472587f5232678312a7eabfe)]:
  - @forgerock/storage@1.3.0
  - @forgerock/sdk-oidc@1.3.0
  - @forgerock/sdk-types@1.3.0
  - @forgerock/sdk-logger@1.3.0
  - @forgerock/sdk-request-middleware@1.3.0

## 1.2.0

### Minor Changes

- [#299](https://github.com/ForgeRock/ping-javascript-sdk/pull/299) [`629d3e0`](https://github.com/ForgeRock/ping-javascript-sdk/commit/629d3e00fbdffce254987c25b1183d8ac4d1b5c5) Thanks [@ryanbas21](https://github.com/ryanbas21)! - provide a client type that handles the awaiting of the davinci client initalization and a type for handling getClient call so consumers have the type available easily

- [#293](https://github.com/ForgeRock/ping-javascript-sdk/pull/293) [`95d6bb9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/95d6bb9db24bcbbccf29f415504840c6cc3faff3) Thanks [@cerebrl](https://github.com/cerebrl)! - Implement the logger module to DaVinci Client

- [#262](https://github.com/ForgeRock/ping-javascript-sdk/pull/262) [`e38b49e`](https://github.com/ForgeRock/ping-javascript-sdk/commit/e38b49ebd29c304cb362d77e3e9862217f1cc17a) Thanks [@cerebrl](https://github.com/cerebrl)! - Add support for MFA OTP field support with added collectors

- [#246](https://github.com/ForgeRock/ping-javascript-sdk/pull/246) [`0d54b34`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0d54b3461443fcf5c5071a08578f2d418f066073) Thanks [@cerebrl](https://github.com/cerebrl)! - created effects type packages, logger, oidc, and request middleware

- [#270](https://github.com/ForgeRock/ping-javascript-sdk/pull/270) [`4756348`](https://github.com/ForgeRock/ping-javascript-sdk/commit/475634870558309cf28fd3848a180e9753f0a9a0) Thanks [@cerebrl](https://github.com/cerebrl)! - Implemented phone number collector to support phone number field

### Patch Changes

- [#312](https://github.com/ForgeRock/ping-javascript-sdk/pull/312) [`5d71457`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5d714577f4a508fa37afc2161880affd4ab2127f) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Fixes the device-fields which were changed to options on the object

- [#322](https://github.com/ForgeRock/ping-javascript-sdk/pull/322) [`9a03632`](https://github.com/ForgeRock/ping-javascript-sdk/commit/9a03632e044a325da9bdf4073446c465bb34b2fd) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Return a url from the externalIdp function for app developers to use to redirect their url

- [#270](https://github.com/ForgeRock/ping-javascript-sdk/pull/270) [`4756348`](https://github.com/ForgeRock/ping-javascript-sdk/commit/475634870558309cf28fd3848a180e9753f0a9a0) Thanks [@cerebrl](https://github.com/cerebrl)! - Fixed bugs related to device auth and registration

- [#277](https://github.com/ForgeRock/ping-javascript-sdk/pull/277) [`fb041e0`](https://github.com/ForgeRock/ping-javascript-sdk/commit/fb041e04804adcc8404262b790d10b98c9e46e79) Thanks [@ryanbas21](https://github.com/ryanbas21)! - error states should be cleared from state when a successful next or success node was processed

- [#267](https://github.com/ForgeRock/ping-javascript-sdk/pull/267) [`12179a1`](https://github.com/ForgeRock/ping-javascript-sdk/commit/12179a14a6fc8cba9af34bbc0f3dc87d4319e183) Thanks [@ryanbas21](https://github.com/ryanbas21)! - update type misalignments and fallback to `continue` state when there is no state given

- [#331](https://github.com/ForgeRock/ping-javascript-sdk/pull/331) [`d9dc175`](https://github.com/ForgeRock/ping-javascript-sdk/commit/d9dc1753a07216d07acab5c083daa5a1ee487be3) Thanks [@ryanbas21](https://github.com/ryanbas21)! - export the InternalErrorResponse type

- [#332](https://github.com/ForgeRock/ping-javascript-sdk/pull/332) [`0ea7df7`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0ea7df728c7175ec6aee1d7208063db4947155bb) Thanks [@ryanbas21](https://github.com/ryanbas21)! - add-back-node-states-api

- Updated dependencies [[`04b506c`](https://github.com/ForgeRock/ping-javascript-sdk/commit/04b506c2016324dffeba3a473bfc705843ac3e41), [`0d54b34`](https://github.com/ForgeRock/ping-javascript-sdk/commit/0d54b3461443fcf5c5071a08578f2d418f066073), [`50fd7fa`](https://github.com/ForgeRock/ping-javascript-sdk/commit/50fd7fab9f0dd893528e85cb15f1ba6fdc1fe3e8), [`95d6bb9`](https://github.com/ForgeRock/ping-javascript-sdk/commit/95d6bb9db24bcbbccf29f415504840c6cc3faff3)]:
  - @forgerock/sdk-oidc@1.2.0
  - @forgerock/sdk-types@1.2.0
  - @forgerock/sdk-request-middleware@1.2.0
  - @forgerock/sdk-logger@1.2.0
  - @forgerock/storage@1.2.0

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
