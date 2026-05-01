---
'@forgerock/sdk-request-middleware': minor
'@forgerock/davinci-client': minor
---

Adds `pollStatus()` method and `PollingCollector` to `@forgerock/davinci-client` for polling support in DaVinci flows.

Pass a `PollingCollector` to `davinciClient.pollStatus(collector)` to get a poller function. The polling mode is detected automatically from the collector:

- **Challenge polling**: Periodically calls the `/status` endpoint until the challenge is resolved.

- **Continue polling**: Performs a delay and returns a status based on remaining poll retries. Call the returned poller function repeatedly in a loop until it resolves with the next node in the flow or an error.

Adds ability to intercept the polling request with middleware.
