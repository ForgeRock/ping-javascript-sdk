---
'@forgerock/journey-client': minor
---

feat(journey-client): Add WebAuthn, QR Code, and Recovery Code support

- Introduces new utility modules (`FRWebAuthn`, `FRQRCode`, `FRRecoveryCodes`) to handle advanced authentication methods within authentication journeys.
- Adds comprehensive parsing and handling for WebAuthn registration and authentication steps, including a fix for a type error where `TextOutputCallback` was being incorrectly inferred as `TextInputCallback`.
- Implements support for displaying QR codes (for both OTP and Push) and for displaying and using recovery codes.
- Includes extensive unit tests for the new callback types and utility modules to ensure correctness.
- Updates documentation to reflect the new capabilities and architectural changes.
