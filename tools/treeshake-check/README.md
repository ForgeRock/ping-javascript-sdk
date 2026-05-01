# treeshake-check

A tree-shakeability analyzer for npm packages. Tells you whether your package can be fully tree-shaken by Rollup, and when it can't, points at the specific files, exports, and likely causes preventing it.

Built on [Effect](https://effect.website), [@effect/cli](https://www.npmjs.com/package/@effect/cli), and [Rollup](https://rollupjs.org).

## Why this exists

When you publish a library, consumers' bundlers (webpack, Rollup, Vite, esbuild) try to eliminate unused exports from your package — that's tree-shaking. If your package isn't shakeable, every consumer who imports a single function pulls in your entire library, inflating their bundle size.

Tree-shakeability isn't visible from the outside. You can ship what looks like a clean ESM library and still have it be unshakeable due to a single `Object.defineProperty` call at module scope, a missing `"sideEffects": false` in `package.json`, or a transitive CJS dependency. This tool surfaces those problems.

The technique is the same one used by Rich Harris's [agadoo](https://www.npmjs.com/package/agadoo): bundle your package as a side-effect-only import (`import "your-package"` with no bindings used) and see what Rollup couldn't eliminate. Anything that survives is what's preventing tree-shaking.

## Installation

In a monorepo, install once at the workspace root:

\`\`\`bash
pnpm add -Dw treeshake-check
\`\`\`

For a standalone project:

\`\`\`bash
pnpm add -D treeshake-check
\`\`\`

## Usage

### Quickstart

From any package directory:

\`\`\`bash
pnpm treeshake-check
\`\`\`

You'll get one of two outcomes:

- **Fully tree-shakeable** — ASCII tree celebration plus any recommendations for `package.json` improvements (typically `"sideEffects": false`).
- **Has side effects** — a per-module breakdown of what survived, with diagnostic info for each file.

### Flags

| Flag             | Alias | Description                                                                     |
| ---------------- | ----- | ------------------------------------------------------------------------------- |
| `--cwd <path>`   | `-C`  | Directory containing `package.json`. Defaults to the current working directory. |
| `--entry <path>` | `-e`  | Analyze a specific entry file directly, skipping `package.json` resolution.     |
| `--json`         |       | Emit machine-readable JSON instead of human output.                             |
| `--quiet`        | `-q`  | Suppress all output; rely on the exit code only.                                |
| `--top <n>`      |       | Show only the N modules with the largest surviving byte count.                  |

Plus the standard `--help`, `--version`, `--wizard`, and `--completions <shell>` flags from `@effect/cli`.

### Examples

Check the current package:

\`\`\`bash
pnpm treeshake-check
\`\`\`

Check a different package in the workspace:

\`\`\`bash
pnpm treeshake-check --cwd packages/my-sdk
\`\`\`

Check a specific built file directly:

\`\`\`bash
pnpm treeshake-check --entry dist/index.js
\`\`\`

Show only the worst 5 offenders:

\`\`\`bash
pnpm treeshake-check --top 5
\`\`\`

JSON output for CI tooling:

\`\`\`bash
pnpm treeshake-check --json | jq '.modules[] | {id, renderedLength, suspectedCauses}'
\`\`\`

## Output

### Fully shakeable

\`\`\`
tree88shakey
TREESHAKEtRe eSha
kETREESHaKetreeshAKE
TreeShakEY o0o tREeSHAKE
Es6 /T r eesHakeY
\\\/// /Thanks
\\//////
|||||
|||||
|||||
.....//||||\\....
Awesome! Your code is 100% tree-shakeable!

Notes:
• Add "sideEffects": false to package.json. Without it, bundlers
conservatively assume every module may have side effects, which
blocks aggressive tree-shaking by consumers.
\`\`\`

### Has side effects

\`\`\`
Not fully tree-shakeable: 487 of 2840 bytes survived (17.1%).

Per-module breakdown:

/path/to/src/utils.js
bytes: 487/1240 (39.3% survived)
exports: rendered=[configureLogger] removed=[isString, isNumber]
likely: PrototypeMutation, TopLevelSideEffect

Recommendations:
• Add "sideEffects": false to package.json...
\`\`\`

### Reading the output

Each module entry tells you:

- **Path** — the file rollup couldn't eliminate
- **bytes** — how much of the file survived versus its original size
- **exports** — `rendered` exports were kept (these are your investigation targets); `removed` exports were successfully shaken
- **likely** — heuristic labels for the kind of side effect detected:
  - `TopLevelSideEffect` — a top-level statement with observable effects
  - `PrototypeMutation` — `Object.defineProperty`, `.prototype.x = ...`, etc.
  - `GlobalAssignment` — assignment to `window`, `globalThis`, `self`, or `global`
  - `CommonJsContamination` — `require()`, `module.exports`, `__esModule` artifacts
  - `UnannotatedCall` — top-level function call without `/*#__PURE__*/`
  - `Unknown` — none of the above patterns matched (look at the code yourself)

The labels are heuristic. They're a starting point for investigation, not a verdict.

## Common fixes

### "Add `sideEffects: false`"

The single highest-leverage fix for most packages. Add to `package.json`:

\`\`\`json
{
"sideEffects": false
}
\`\`\`

This declares to bundlers that no module in your package has observable side effects from being imported. Without it, bundlers conservatively assume every module _might_ have side effects and refuse to shake aggressively.

If some files genuinely have side effects (CSS imports, polyfills, modules that register globals), use the array form to whitelist them:

\`\`\`json
{
"sideEffects": [
"**/*.css",
"./src/polyfill.js"
]
}
\`\`\`

### Top-level function calls

A bare top-level call like `init()` or `Object.defineProperty(target, key, descriptor)` is treated as side-effectful by default. If you know the call is pure, annotate it:

\`\`\`js
// Before — kept by tree-shaking
const result = computeOnce();

// After — eligible for tree-shaking when unused
const result = /_#**PURE**_/ computeOnce();
\`\`\`

### CommonJS contamination

If `likely: CommonJsContamination` shows up, your package or one of its dependencies is shipping CJS, which can't be statically analyzed for tree-shaking. Either:

- Add a `module` field to `package.json` pointing to an ESM build
- Set `"type": "module"`
- Replace CJS dependencies with ESM equivalents
- For unavoidable CJS deps, mark them as external in your build

## Programmatic usage

The CLI is a thin wrapper around library functions you can use directly:

\`\`\`typescript
import { Effect } from "effect";
import { NodeContext } from "@effect/platform-node";
import { checkPackage } from "treeshake-check";

const program = Effect.gen(function* () {
const result = yield* checkPackage("./packages/sdk");

if (result.\_tag === "FullyTreeshakeable") {
return true;
}

for (const m of result.modules) {
console.log(`${m.id}: ${m.renderedLength}/${m.originalLength} bytes`);
console.log(`  causes: ${m.suspectedCauses.join(", ")}`);
}
return false;
});

const isShakeable = await Effect.runPromise(
program.pipe(Effect.provide(NodeContext.layer))
);
\`\`\`

The result types and schemas are exported from `treeshake-check/schemas`, the analyzers from `treeshake-check/analysis`. See those modules' source for the full surface.

## CI integration

`treeshake-check` exits with code 1 when a package isn't fully shakeable, so it composes naturally as a quality gate.

### GitHub Actions

\`\`\`yaml

- name: Tree-shake check
  run: pnpm -r --filter "./packages/\*" exec treeshake-check --top 5
  \`\`\`

### As a pre-publish hook

\`\`\`json
{
"scripts": {
"prepublishOnly": "treeshake-check --quiet"
}
}
\`\`\`

A regression literally cannot ship.

### Across a monorepo

\`\`\`bash
pnpm -r --parallel exec treeshake-check --top 3
\`\`\`

`-r` runs in every workspace package; `--parallel` runs them concurrently since they're independent.

To skip packages that don't have a shakeable entry (meta-packages, internal tooling), filter:

\`\`\`bash
pnpm -r --filter "@my-org/sdk-\*" exec treeshake-check
\`\`\`

## How it works

1. Reads `package.json` from the target directory and resolves the entry point (`module` preferred, falling back to `main`).
2. Constructs a synthetic Rollup entry that imports the target as a side-effect-only import: `import "/absolute/path/to/entry.js"`.
3. Runs Rollup with default tree-shaking enabled.
4. Inspects `chunk.modules` for per-module `renderedLength`, `renderedExports`, and `removedExports`.
5. Heuristically classifies surviving code by pattern (regex over the rendered output).
6. Reports per-module statistics, surviving code, and `package.json` recommendations.

The synthetic-entry trick is key: when you import a module without using any of its exports, anything that survives bundling must be there because Rollup believes evaluating the module has observable side effects. That's exactly the question we want to answer.

## Limitations

- **Heuristic cause detection.** Cause labels come from regex over the rendered code. False positives and missed cases are possible. The labels are diagnostic hints, not authoritative classifications.
- **Single-entry analysis.** The tool checks one entry at a time. Packages with multiple entry points (`exports` field with subpaths) need multiple invocations, one per entry.
- **No transitive cause tracing.** When module A is impure because it imports module B which imports module C, the tool reports A as the offender. Tracing back to C requires reading the surviving code.
- **Rollup-specific.** Other bundlers' tree-shaking may differ. webpack and esbuild use different heuristics; a package that's shakeable in Rollup is _usually_ shakeable in others, but not guaranteed.

## Prior art

- [agadoo](https://www.npmjs.com/package/agadoo) by Rich Harris — same technique, the original implementation. This package adds richer diagnostics, structured output, and Effect-based composition for use as a library.
- [bundle-phobia](https://bundlephobia.com) — measures the post-shake size from a consumer's perspective rather than analyzing why shaking succeeds or fails.
