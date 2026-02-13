---
'@forgerock/davinci-client': patch
---

Add WebAuthn error code propagation for FIDO operations

- FIDO registration and authentication errors now include the WebAuthn error code in the `code` field of `GenericError`
- Supported error codes: `NotAllowedError`, `AbortError`, `InvalidStateError`, `NotSupportedError`, `SecurityError`, `TimeoutError`, `UnknownError`
- Added optional `FidoClientConfig` parameter to `fido()` for logger configuration
- Replaced `console.error` with SDK logger
- Added `formData: {}` to `transformActionRequest()` for API contract consistency

Consumers can propagate FIDO errors to DaVinci using `client.flow({ action: result.code })()`.
