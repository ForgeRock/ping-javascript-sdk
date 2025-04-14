# @forgerock/davinci-client

## 1.1.0

### Minor Changes

- [#3](https://github.com/ForgeRock/ping-javascript-sdk/pull/3) [`5fc1b35`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5fc1b35927ab697c47a2fd11b0c777c9e9968650) Thanks [@ryanbas21](https://github.com/ryanbas21)! - adding support for fields in DROPDOWN, CHECKBOX, COMBOBOX, RADIO, FLOW_LINK.

- [#171](https://github.com/ForgeRock/ping-javascript-sdk/pull/171) [`dc469d5`](https://github.com/ForgeRock/ping-javascript-sdk/commit/dc469d5aab01bc4552d759f81884aed307b10644) Thanks [@cerebrl](https://github.com/cerebrl)! - Introduce request middleware feature to DaVinci Client

- [#14](https://github.com/ForgeRock/ping-javascript-sdk/pull/14) [`b2b8bcc`](https://github.com/ForgeRock/ping-javascript-sdk/commit/b2b8bccc139d52639651035f2d8daa00668ccef9) Thanks [@ryanbas21](https://github.com/ryanbas21)! - add support for default data, add support for multivalue/multiselector

- [#94](https://github.com/ForgeRock/ping-javascript-sdk/pull/94) [`34f4140`](https://github.com/ForgeRock/ping-javascript-sdk/commit/34f4140a88ab71d95d4275580c371cce380c09e4) Thanks [@cerebrl](https://github.com/cerebrl)! - Add support for label and password validate field components

- [#7](https://github.com/ForgeRock/ping-javascript-sdk/pull/7) [`6ce29c4`](https://github.com/ForgeRock/ping-javascript-sdk/commit/6ce29c4297a603ecb3afa2e3c5d1a40c2f27f300) Thanks [@ryanbas21](https://github.com/ryanbas21)! - adds the ability to call start with query parameters which are appended to the /authorize call

- [#134](https://github.com/ForgeRock/ping-javascript-sdk/pull/134) [`15e8c8a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/15e8c8a5d18e1d3285da9b03c8f9e07d2d043f18) Thanks [@cerebrl](https://github.com/cerebrl)! - Replace less valuable `details` property from error with `collectors`

- [#128](https://github.com/ForgeRock/ping-javascript-sdk/pull/128) [`c002af0`](https://github.com/ForgeRock/ping-javascript-sdk/commit/c002af09b0c6aeac63acdde4944834b0e6876fd8) Thanks [@ryanbas21](https://github.com/ryanbas21)! - add social-login feature to davinci-client

### Patch Changes

- [#226](https://github.com/ForgeRock/ping-javascript-sdk/pull/226) [`5bd7e8a`](https://github.com/ForgeRock/ping-javascript-sdk/commit/5bd7e8a74505b62a14de6b01d3c8711aaae05a46) Thanks [@ryanbas21](https://github.com/ryanbas21)! - handle formData lookup with more saftey in case it is not in response

- [#204](https://github.com/ForgeRock/ping-javascript-sdk/pull/204) [`f473565`](https://github.com/ForgeRock/ping-javascript-sdk/commit/f47356596767bf8c5499c451a3e8004c1674accd) Thanks [@ryanbas21](https://github.com/ryanbas21)! - fix return value for social-login

- [#22](https://github.com/ForgeRock/ping-javascript-sdk/pull/22) [`e8698fc`](https://github.com/ForgeRock/ping-javascript-sdk/commit/e8698fce2a4ad90174dd40a1e14154785348b3ed) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@forgerock/javascript-sdk` to `4.7.0`.

- [#161](https://github.com/ForgeRock/ping-javascript-sdk/pull/161) [`1e904ae`](https://github.com/ForgeRock/ping-javascript-sdk/commit/1e904ae4fc6f696f415e853e762f543a5dd0c848) Thanks [@ryanbas21](https://github.com/ryanbas21)! - Error node is now submittable and a user can recover more gracefully from an error state

- [#15](https://github.com/ForgeRock/ping-javascript-sdk/pull/15) [`a8c7124`](https://github.com/ForgeRock/ping-javascript-sdk/commit/a8c71243d5c93c692b83a98c352ca1efcbe59da3) Thanks [@ryanbas21](https://github.com/ryanbas21)! - fixes the checks to determine what node state we are in based on the response from p1

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
