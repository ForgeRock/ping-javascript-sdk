---
'@forgerock/recognize': minor
---

Default `wasmBinaryURL`, `wasmDataURL` and `wasmScriptURL` to the vendored SDK files when not provided, so bundlers like webpack can resolve them instead of failing with unfetchable `file://` paths.

Accept `operationId` as an alias of `operationID`, matching the casing the server sends in `webSDKOptions`. `operationID` is unchanged and wins when both are set.
