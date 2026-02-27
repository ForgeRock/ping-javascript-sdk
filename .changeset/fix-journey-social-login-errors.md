---
'@forgerock/journey-client': patch
---

Fix social login error handling in journey-client

- Fix `start()` and `next()` to extract AM error bodies from RTK Query's `error.data` slot, properly classifying HTTP 4xx responses (e.g. 401 from failed social login) as `JourneyLoginFailure` instead of generic `no_response_data` errors
- Fix `resume()` to return typed `GenericError` values instead of throwing raw `Error` objects, maintaining the `JourneyResult` contract
