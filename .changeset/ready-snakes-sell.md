---
'@forgerock/journey-client': minor
---

Add WebAuthn conditional mediation (passkey autofill) support.

- `WebAuthn.authenticate(step, mediation?, signal?)` forwards `mediation` and `signal` to `navigator.credentials.get`.
- When `mediation` is `'conditional'`, an `AbortSignal` is required.
- If conditional mediation is requested but not supported, `authenticate()` throws `NotSupportedError` (and the existing error handling sets the hidden outcome to `unsupported`).
- Adds `WebAuthn.isConditionalMediationSupported()` helper, docs, and unit tests.
