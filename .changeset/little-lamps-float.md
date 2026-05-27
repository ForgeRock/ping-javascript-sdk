---
'@forgerock/davinci-client': patch
---

Fixed collector value types and simplified node reducer imports

### `client.types.ts`

- Added `CollectorValueTypes` union type; replaces inline unions in `updateCollectorValues` action payload (`node.reducer.ts`) and the `update` method return closure (`client.store.ts`).

- Rewrote `CollectorValueType<T>` conditional type: grouped branches by return type (string, boolean, string[], specialized, category catch-alls), added `never` for `ActionCollector` and `NoValueCollector`, and added a `SingleValueAutoCollector` catch-all.

### `node.reducer.ts` / `client.store.ts`

- Replaced ~30 individual collector type imports with `Collectors` (from `node.types`) and `CollectorValueTypes` (from `client.types`), collapsing verbose inline union annotations to single-type references.
