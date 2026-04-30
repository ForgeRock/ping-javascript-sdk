---
'@forgerock/journey-client': minor
---

Add WebAuthn conditional mediation (passkey autofill) support.

- `WebAuthn.authenticate(step, signal?)` derives mediation from WebAuthn metadata (`meta.mediation`).
- When `meta.mediation` is `'conditional'`, an `AbortSignal` is used (caller-provided if present, otherwise created by the SDK).
- If conditional mediation is requested but not supported, `authenticate()` throws `NotSupportedError` (and the existing error handling sets the hidden outcome to `unsupported`).
- Adds `WebAuthn.isConditionalMediationSupported()` helper, docs, and unit tests.
