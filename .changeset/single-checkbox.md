---
'@forgerock/davinci-client': minor
---

Adds support for the SINGLE_CHECKBOX field. A new ValidatedBooleanCollector type was introduced including validation support for required checkboxes and updater support for booleans.

**Type improvements**

- `SingleValueCollectorWithValue<T, V>` and `ValidatedSingleValueCollectorWithValue<T, V>` are now generic over their value type (`V`, defaults to `string`), replacing the loose `string | number | boolean` union
