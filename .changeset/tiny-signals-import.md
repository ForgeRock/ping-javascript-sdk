---
'@forgerock/protect': major
---

Replace the bundled Signals SDK with `@ping-identity/pingone-signals-web-sdk`.

The package no longer declares `Window._pingOneSignals`; consumers that reference this global directly must use the type declaration supplied by `@ping-identity/pingone-signals-web-sdk`.
