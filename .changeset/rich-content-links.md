---
'@forgerock/davinci-client': minor
---

A new `ReadOnlyCollector.output.richContent` property is always present and contains the structured link data when a LABEL field includes `richContent`. Its shape is `CollectorRichContent` — a template string with `{{key}}` placeholders (`content`) and a validated `replacements` array (`ValidatedReplacement[]`). When no `richContent` is present, `replacements` is an empty array.

**New type exports**: `RichContentLink`, `ValidatedReplacement`, `CollectorRichContent`
