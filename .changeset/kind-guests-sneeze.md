---
'@forgerock/journey-client': minor
---

feat: Implement new journey client

- Implemented a new `journey()` factory function for creating stateful client instances.
- Integrated Redux Toolkit and RTK Query for robust state management and API interactions.
- Refactored `resume` logic to correctly persist and retrieve plain `Step` payloads, resolving prototype loss issues during serialization.
- Improved error handling and type safety within the client.
- Updated internal callback handling and device profiling integration.
