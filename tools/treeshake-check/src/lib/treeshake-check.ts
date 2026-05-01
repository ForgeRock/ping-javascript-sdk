// src/lib/treeshake-check.ts
import { FileSystem, Path } from '@effect/platform';
import { Data, Effect, Schema, pipe } from 'effect';
import virtualPlugin from '@rollup/plugin-virtual';
import { rollup, type RollupBuild } from 'rollup';
import { analyzePackageJsonHints, buildModuleAnalysis, defaultHints } from './analysis.js';
import {
  PackageJsonFromString,
  type PackageJson,
  type RollupWarning,
  type TreeshakeResult,
} from './schemas.js';

// Type assertion for the virtual plugin to handle TypeScript compatibility
const virtual = virtualPlugin as any;

// ─── Errors ──────────────────────────────────────────────────────────────────

export class PackageJsonNotFound extends Data.TaggedError('PackageJsonNotFound')<{
  readonly path: string;
}> {}

export class MissingEntryPoint extends Data.TaggedError('MissingEntryPoint')<{
  readonly path: string;
}> {}

export class BundleFailed extends Data.TaggedError('BundleFailed')<{
  readonly cause: unknown;
}> {}

// ─── Read & validate package.json ────────────────────────────────────────────

const readPackageJson = (cwd: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const pkgPath = path.join(cwd, 'package.json');
    const exists = yield* fs.exists(pkgPath);
    if (!exists) {
      return yield* new PackageJsonNotFound({ path: pkgPath });
    }

    const contents = yield* fs.readFileString(pkgPath, 'utf-8');
    const pkg = yield* Schema.decodeUnknown(PackageJsonFromString)(contents);

    return { pkg, pkgPath } as const;
  });

export const getEntryFromPackageJson = (cwd?: string) =>
  pipe(
    readPackageJson(cwd ?? process.cwd()),
    Effect.flatMap(({ pkg, pkgPath }) => {
      const entry = pkg.module ?? pkg.main;
      return entry !== undefined
        ? Effect.succeed({ entry, pkg } as const)
        : new MissingEntryPoint({ path: pkgPath });
    }),
  );

// ─── Helpers ─────────────────────────────────────────────────────────────────

const closeBundle = (bundle: RollupBuild) =>
  Effect.tryPromise(() => bundle.close()).pipe(
    Effect.catchAll((cause) =>
      Effect.logWarning('Failed to close rollup bundle').pipe(
        Effect.annotateLogs('cause', String(cause)),
      ),
    ),
  );

/**
 * Drop the synthetic virtual entry — `@rollup/plugin-virtual` prefixes its
 * module IDs with `\0virtual:`. The leading null byte is sometimes stripped
 * before the ID surfaces in `chunk.modules`, sometimes not, so we check the
 * realistic forms plus a permissive `:treeshake` suffix as a catch-all.
 */
const isSyntheticEntry = (id: string) =>
  id === 'treeshake' ||
  id === 'virtual:treeshake' ||
  id === '\0virtual:treeshake' ||
  id.endsWith(':treeshake');

// ─── Rollup bundling ─────────────────────────────────────────────────────────

/**
 * Bundle the entry as the *only* import in a synthetic virtual module.
 * If rollup can statically determine the entry has no observable side
 * effects, every real module renders to zero bytes — that's our "fully
 * shakeable" signal. Anything that survives is what's preventing
 * tree-shaking.
 */
export const analyzeTreeshakeability = (
  entry: string,
  pkg?: PackageJson,
): Effect.Effect<TreeshakeResult, BundleFailed, Path.Path> =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const resolvedEntry = path.resolve(entry);
    const warnings: RollupWarning[] = [];

    const bundle = yield* Effect.acquireRelease(
      Effect.tryPromise({
        try: () =>
          rollup({
            input: 'treeshake',
            plugins: [
              virtual({
                treeshake: `import ${JSON.stringify(resolvedEntry)}`,
              }),
            ],
            onwarn: (warning) => {
              if (warning.code === 'EMPTY_BUNDLE') return;
              warnings.push({
                code: warning.code,
                message: warning.message,
                id: warning.id,
                loc: warning.loc,
              });
            },
          }),
        catch: (cause) => new BundleFailed({ cause }),
      }),
      closeBundle,
    );

    const output = yield* Effect.tryPromise({
      try: () => bundle.generate({ format: 'esm' }),
      catch: (cause) => new BundleFailed({ cause }),
    });

    const chunk = output.output[0];
    const hints = pkg ? analyzePackageJsonHints(pkg) : defaultHints();

    // Build per-module analyses, skipping the synthetic virtual entry.
    const modules = Object.entries(chunk.modules)
      .filter(([id]) => !isSyntheticEntry(id))
      .map(([id, m]) => buildModuleAnalysis(id, m));

    const totalOriginalBytes = modules.reduce((s, m) => s + m.originalLength, 0);
    const totalRenderedBytes = modules.reduce((s, m) => s + m.renderedLength, 0);

    // The package is fully shakeable when none of the real modules have
    // surviving code. The bundle's `chunk.code` may still contain a tiny
    // bit of rollup glue, but that's not the user's code.
    const isFullyShakeable = modules.length === 0 || totalRenderedBytes === 0;

    if (isFullyShakeable) {
      return { _tag: 'FullyTreeshakeable', hints } as const;
    }

    const offenders = modules.filter((m) => m.renderedLength > 0);

    return {
      _tag: 'HasSideEffects',
      totalOriginalBytes,
      totalRenderedBytes,
      modules: modules.filter((m) => m.renderedLength > 0), // only show actual offenders
      warnings,
      hints,
      unshakenCode: offenders.map((m) => `// ${m.id}\n${m.survivingCode ?? ''}`).join('\n\n'),
    } as const;
  }).pipe(Effect.scoped);

// ─── Composed pipeline ───────────────────────────────────────────────────────

/**
 * Full check: read package.json from `cwd`, resolve its entry, then analyze.
 */
export const checkPackage = (cwd?: string) =>
  pipe(
    getEntryFromPackageJson(cwd),
    Effect.flatMap(({ entry, pkg }) => analyzeTreeshakeability(entry, pkg)),
  );
