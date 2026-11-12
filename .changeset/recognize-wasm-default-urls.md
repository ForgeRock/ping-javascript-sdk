---
'@forgerock/recognize': patch
---

Default `wasmBinaryURL`, `wasmDataURL` and `wasmScriptURL` to the vendored SDK files when not provided, so bundlers like webpack can resolve them instead of failing with unfetchable `file://` paths.
