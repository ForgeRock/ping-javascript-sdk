---
'@forgerock/journey-client': patch
---

Restore legacy resume() redirect query-param handling.

resume() now parses and forwards additional URL params (error, errorCode, errorMessage, nonce, RelayState, scope, suspendedId) and uses authIndexValue as a fallback journey value.
