---
'@forgerock/journey-client': minor
---

Add `WebAuthn.hasPasskeyAutocompleteValues()` to detect when a step's `NameCallback` carries both `username` and `webauthn` autocomplete values, signalling that the username input should be decorated with `autocomplete="username webauthn"` for passkey autofill.
