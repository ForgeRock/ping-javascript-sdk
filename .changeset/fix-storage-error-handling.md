---
'@forgerock/davinci-client': patch
'@forgerock/sdk-utilities': patch
'@forgerock/storage': patch
---

Fix error handling in storage client and davinci-client

- Add `isGenericError` type guard to sdk-utilities for runtime error validation
- Fix storage client to properly catch errors from custom storage implementations, honoring the errors-as-values contract
- Improve davinci-client error handling to use explicit error checks instead of try-catch
