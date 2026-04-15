# API Report — Forgotten Export Detector

Validates that every type in a client package's public API surface is explicitly exported. Catches forgotten re-exports — including types surfaced through inferred return types — by running [@microsoft/api-extractor](https://api-extractor.com/) programmatically against every entry point declared in the package's `exports` field.

## Quick Start

```bash
# Check all client packages (requires build)
pnpm api-report

# Auto-fix all client packages
pnpm api-report:fix

# Check a single package
tsx tools/api-report/src/main.ts packages/journey-client

# Auto-fix a single package
tsx tools/api-report/src/main.ts packages/journey-client --fix
```

## How It Works

1. Reads `package.json` → `exports` field to discover all entry points (`.`, `./types`, `./webauthn`, etc.)
2. Resolves each entry to its `.d.ts` path (`.js` → `.d.ts`)
3. Runs api-extractor per entry point with `ae-forgotten-export` set to **error**
4. Reports pass/fail per entry point

No per-entry config files needed. When someone adds a new sub-entry to `exports`, it's automatically analyzed on the next run.

### `--fix` Mode

When `ae-forgotten-export` errors are found, `--fix` auto-resolves each one:

1. Captures the symbol name and source file path from each error via api-extractor's `messageCallback`
2. Follows the import chain in the `.d.ts` file to find where the symbol is actually defined (e.g. `import { ForgottenType } from '@forgerock/sdk-types'` → resolves to `packages/sdk-types/dist/src/index.d.ts`)
3. Reads the definition file to determine whether the symbol is a **type** (`interface`/`type alias`) or a **value** (`enum`/`class`/`const`/`function`) — handles `declare` keywords in `.d.ts` files
4. Extracts the source package from the import module specifier (e.g. `@forgerock/sdk-types`)
5. Inserts the re-export into the client package's `src/types.ts`:
   - Appends to an existing re-export block for the same package when one exists
   - Uses `export type { ... }` for types, `export { ... }` for values
   - Creates a new export statement if no matching block exists
   - Skips symbols that are already exported

After fixing, rebuild and re-run to verify:

```bash
pnpm api-report:fix
pnpm nx run-many -t build -p journey-client oidc-client device-client davinci-client
pnpm api-report
```

### Pre-commit Failure Output

When the tool fails in the lefthook pre-commit hook, it shows the specific missing symbols and the exact commands to fix them:

```
  x . - 2 error(s)

Missing re-exports:
  - ProfileData
  - SomeEnum

2 error(s) found.

Fix this package:  tsx tools/api-report/src/main.ts packages/journey-client --fix
Fix all packages:  pnpm api-report:fix
```

## Why This Exists

Consumers should only import from `*-client` packages. Internal packages like `@forgerock/sdk-types` are implementation details. When a client package's public API uses a type from an internal package without re-exporting it, consumers are forced to depend on the internal package directly.

api-extractor's `ae-forgotten-export` rule catches this — including types that leak through **inferred return types** that don't appear in any explicit annotation.

## Nx Integration

Each client package has an `api-report` target that runs after build:

```json
{
  "api-report": {
    "dependsOn": ["build"],
    "command": "tsx tools/api-report/src/main.ts {projectRoot}",
    "inputs": [
      "{projectRoot}/dist/**/*.d.ts",
      "{workspaceRoot}/api-extractor.base.json",
      "{workspaceRoot}/tools/api-report/src/**/*.ts"
    ],
    "outputs": ["{projectRoot}/api-report/"]
  }
}
```

Also runs in the lefthook pre-commit hook alongside `typecheck`, `lint`, and `build`.

## API Reports

Each run generates `.api.md` files in `packages/*/api-report/`. These are tracked in git and show the full public API surface per entry point — useful for reviewing API changes in PRs.

## Architecture

```
src/
├── resolve-entries.ts      # package.json exports → .d.ts entry points
├── resolve-entries.spec.ts # 5 tests
├── config.ts               # Build ExtractorConfig per entry point
├── config.spec.ts          # 4 tests
├── fixer.ts                # Follow import chain, resolve packages, insert re-exports
├── fixer.spec.ts           # 23 tests
├── main.ts                 # CLI entry + analyzePackage orchestration
├── main.spec.ts            # 5 tests
└── integration.spec.ts     # 4 tests — end-to-end detect → fix with fixtures
```

### Fixer Pipeline

```
api-extractor message (ae-forgotten-export)
  ↓ parseForgottenExportMessage — extract symbol name
  ↓ read usage-site .d.ts
  ↓ findImportModuleForSymbol — find 'import { Symbol } from "package"'
  ↓ resolve definition .d.ts from import module
  ↓ determineExportKind — check for declare enum/class/interface/type
  ↓ resolveSourcePackage — extract @forgerock/* package name
  ↓ insertReExport — append to existing block or create new statement
  ↓ writeFileSync — update types.ts
```

## Testing

```bash
# Run all tests (45 tests)
pnpm nx run api-report:test
```

The integration tests create a fixture workspace with two packages (`test-client` and `test-internal`), where the client has forgotten exports from the internal package. They verify the full cycle: api-extractor detects the forgotten exports → the fixer follows the import chain → correctly inserts `export type` for interfaces and `export` for enums → the updated `types.ts` contains all re-exports.
