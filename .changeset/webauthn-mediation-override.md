---
'@forgerock/journey-client': minor
---

Add an optional `mediationOverride` parameter to `WebAuthn.authenticate()`. When provided, it takes precedence over the mediation value in the step metadata, letting a manual "Sign in with a passkey" button force a modal (non-conditional) prompt even when the server requested conditional mediation.
