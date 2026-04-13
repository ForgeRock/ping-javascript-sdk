---
'@forgerock/davinci-client': minor
---

**Breaking change**: `ReadOnlyCollector.output.content` now returns a plain `string` (the label text) instead of `ContentPart[]`.

A new `ReadOnlyCollector.output.richContent` property is always present and contains the structured link data when a LABEL field includes `richContent`. Its shape is `CollectorRichContent` — a template string with `{{key}}` placeholders (`content`) and a validated `replacements` array (`ValidatedReplacement[]`). When no `richContent` is present, `replacements` is an empty array.

**Removed type exports**: `ContentPart`, `TextContentPart`, `LinkContentPart`

**New type exports**: `RichContentLink`, `ValidatedReplacement`, `CollectorRichContent`

Includes href protocol validation that rejects unsafe URI schemes (e.g. `javascript:`, `data:`).
