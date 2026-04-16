---
'@forgerock/journey-client': patch
'@forgerock/protect': patch
---

Support `signalsInitializationOptions` pass-through config from AM in `PingOneProtectInitializeCallback`.

- `getConfig()` detects `signalsInitializationOptions` in the callback output; if it is a valid plain object, returns it directly as `SignalsInitializationOptions`
- Falls back to the existing `ProtectConfig` construction when the property is absent or invalid (null, string, array)
- `protect()` now accepts `ProtectConfig | SignalsInitializationOptions` so the pass-through config flows in without type assertions
- Updates vendored Signals SDK from v5.6.0w to v5.6.9w
