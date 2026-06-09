---
'@forgerock/journey-client': patch
---

Return `JourneyLoginFailure` by hitting the previously-unreached `LoginFailure` branch when `start()`/`next()` receives a failure payload with a login failure `code`
