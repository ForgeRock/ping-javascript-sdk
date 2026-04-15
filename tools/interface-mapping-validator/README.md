# Interface Mapping Validator & Generator

Validates and generates the `interface_mapping.md` document that maps every public symbol from the legacy `@forgerock/javascript-sdk` to its equivalent in the new Ping SDK packages.

## Quick Start

```bash
# Validate — check for drift between the doc and actual SDK exports
pnpm tsx tools/interface-mapping-validator/src/main.ts

# Generate — rebuild Sections 0, 1, and 5 from the mapping config
pnpm tsx tools/interface-mapping-validator/src/main.ts --generate

# Fix — patch existing tables (add missing rows, remove stale rows)
pnpm tsx tools/interface-mapping-validator/src/main.ts --fix
```

## How It Works

The tool has three modes:

### Validate (default)

Extracts the public API surface from both SDKs using [ts-morph](https://ts-morph.com/), parses the existing `interface_mapping.md` tables, and reports drift:

- **Undocumented legacy symbols** — in the legacy SDK but missing from the doc
- **Stale entries** — in the doc but no longer in the legacy SDK (auto-detects new-only symbols that exist in the new SDK but not legacy)
- **Invalid import paths** — documented paths that don't match real package exports
- **Internal package imports** — import paths referencing `@forgerock/sdk-types`, `@forgerock/sdk-logger`, etc. instead of `*-client` packages
- **Missing/stale callbacks** — callback types out of sync with `@forgerock/journey-client/types` (handles renames like `FRCallback` → `BaseCallback`)
- **Undocumented new exports** — new SDK symbols not referenced in the doc (warnings)

Exit code `0` if no errors, `1` if errors found.

### Generate (`--generate`)

Produces three sections of `interface_mapping.md` from a [mapping config](#mapping-config) combined with auto-discovered exports:

| Section                      | Source                                                             |
| ---------------------------- | ------------------------------------------------------------------ |
| **0. Quick Reference**       | `SYMBOL_MAP` config + auto-discovered callbacks + 1:1 name matches |
| **1. Package Mapping**       | Renamed symbols from `SYMBOL_MAP`, grouped by target package       |
| **5. Callback Type Mapping** | Auto-discovered from `@forgerock/journey-client/types` exports     |

All other sections (2–4, 6–20) are **never modified** — they contain hand-written behavioral notes, code examples, and migration guidance.

If any legacy symbol is missing from both the config and auto-discovery, generation aborts with a list of unmapped symbols.

### Fix (`--fix`)

Patches the existing tables in-place: adds missing rows, removes stale rows, corrects import paths. Does not regenerate from scratch — use `--generate` for that.

## Mapping Config

The mapping config at `src/mapping-config.ts` is the source of truth for legacy → new symbol connections. It exports:

### `SYMBOL_MAP`

Maps each legacy symbol to one of three categories:

```typescript
// Renamed or moved to a new package
FRAuth: {
  new: 'journey',
  package: '@forgerock/journey-client',
  note: 'factory returns `JourneyClient`',
}

// Intentionally removed with no replacement
Config: {
  status: 'removed',
  note: 'pass config to `journey()` / `oidc()` factory params',
}

// Exists but not publicly exported
WebAuthnOutcome: {
  status: 'internal',
  note: 'internal to webauthn module',
}
```

**Callbacks are omitted** from the config. Any symbol ending in `Callback` that exists in `@forgerock/journey-client/types` is auto-discovered and mapped automatically.

### `PACKAGE_MAP`

Maps package-level renames (not symbol-level):

```typescript
'@forgerock/ping-protect': {
  new: '@forgerock/protect',
  note: 'PingOne Protect/Signals integration',
}
```

## Adding a New Symbol

When a new symbol is added to either SDK:

1. Run `pnpm tsx tools/interface-mapping-validator/src/main.ts` to see the drift report
2. If the symbol is a callback with the same name in both SDKs, it's auto-discovered — nothing to do
3. Otherwise, add an entry to `SYMBOL_MAP` in `src/mapping-config.ts`
4. Run `pnpm tsx tools/interface-mapping-validator/src/main.ts --generate` to regenerate

## Architecture

```
src/
├── extractors/
│   ├── legacy.ts         # Parse legacy SDK dist/index.d.ts → symbol list
│   ├── new-sdk.ts        # Parse new SDK package.json exports + barrel files → symbol list
│   └── markdown.ts       # Parse interface_mapping.md tables → documented mappings
├── mapping-config.ts     # Symbol mapping data (the "rename database")
├── generator.ts          # Config + exports → markdown table strings
├── writer.ts             # Replace sections in markdown, preserve everything else
├── differ.ts                    # Compare extracted vs. documented → findings
├── fixer.ts                     # Apply findings as patches to markdown
├── validate-client-imports.ts   # Ensure doc only references *-client package imports
├── reporter.ts                  # Format findings for stdout
├── types.ts                     # Shared type definitions
├── config.ts                    # Constants (package paths, section names, allowed packages)
└── main.ts                      # CLI entry point
```

## Testing

```bash
# Run all tests (107 tests)
cd tools/interface-mapping-validator && npx vitest run

# Run specific module tests
npx vitest run src/generator.test.ts
npx vitest run src/writer.test.ts
npx vitest run src/integration.test.ts
```

The integration tests run against the real workspace data — they verify that the mapping config covers all legacy symbols and that generation produces valid output.
