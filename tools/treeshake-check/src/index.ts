#!/usr/bin/env node
// src/index.ts
import { Command, Options } from '@effect/cli';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Console, Effect, Option } from 'effect';
import { analyzeTreeshakeability, checkPackage } from './lib/treeshake-check.js';
import type { TreeshakeResult } from './lib/schemas.js';

const tree = `
      \\\\///  /Thanks
        \\\\//////
         |||||
         |||||
         |||||
   .....//||||\\\\....
Awesome! Your code is 100% tree-shakeable!
`;

// ─── Options ─────────────────────────────────────────────────────────────────

const cwd = Options.directory('cwd', { exists: 'yes' }).pipe(
  Options.withAlias('C'),
  Options.withDescription(
    'Directory containing the package.json to analyze. Defaults to the current working directory.',
  ),
  Options.optional,
);

const entry = Options.file('entry', { exists: 'yes' }).pipe(
  Options.withAlias('e'),
  Options.withDescription(
    'Analyze a specific entry file directly, skipping package.json resolution.',
  ),
  Options.optional,
);

const json = Options.boolean('json').pipe(
  Options.withDescription('Emit machine-readable JSON instead of human-readable output.'),
);

const quiet = Options.boolean('quiet').pipe(
  Options.withAlias('q'),
  Options.withDescription('Suppress all output; rely on exit code only.'),
);

const top = Options.integer('top').pipe(
  Options.withDescription('Show only the N modules with the largest surviving byte count.'),
  Options.optional,
);

// ─── Renderers ───────────────────────────────────────────────────────────────

const pct = (n: number, total: number) =>
  total === 0 ? '0%' : `${((n / total) * 100).toFixed(1)}%`;

const renderJson = (result: TreeshakeResult) => Console.log(JSON.stringify(result, null, 2));

const renderHuman = (result: TreeshakeResult, topN: Option.Option<number>) =>
  Effect.gen(function* () {
    if (result._tag === 'FullyTreeshakeable') {
      yield* Console.info(tree);
      if (result.hints.recommendations.length > 0) {
        yield* Console.info('\nNotes:');
        for (const rec of result.hints.recommendations) {
          yield* Console.info(`  • ${rec}`);
        }
      }
      return;
    }

    yield* Console.info(
      `Not fully tree-shakeable: ${result.totalRenderedBytes} of ` +
        `${result.totalOriginalBytes} bytes survived ` +
        `(${pct(result.totalRenderedBytes, result.totalOriginalBytes)}).\n`,
    );

    // Sort modules worst-first; optionally truncate
    const sorted = [...result.modules].sort((a, b) => b.renderedLength - a.renderedLength);
    const shown = Option.match(topN, {
      onNone: () => sorted,
      onSome: (n) => sorted.slice(0, n),
    });

    yield* Console.info(
      Option.isSome(topN) ? `Top ${shown.length} unshaken modules:` : 'Per-module breakdown:',
    );

    for (const m of shown) {
      const exportInfo =
        m.renderedExports.length === 0 && m.removedExports.length === 0
          ? '    exports:  (none)'
          : `    exports:  rendered=[${m.renderedExports.join(', ')}] ` +
            `removed=[${m.removedExports.join(', ')}]`;

      yield* Console.info(
        `\n  ${m.id}\n` +
          `    bytes:    ${m.renderedLength}/${m.originalLength} ` +
          `(${pct(m.renderedLength, m.originalLength)} survived)\n` +
          `${exportInfo}\n` +
          `    likely:   ${m.suspectedCauses.join(', ')}`,
      );
    }

    if (Option.isSome(topN) && sorted.length > Option.getOrThrow(topN)) {
      yield* Console.info(`\n  ...and ${sorted.length - Option.getOrThrow(topN)} more.`);
    }

    if (result.warnings.length > 0) {
      yield* Console.info('\nRollup warnings:');
      for (const w of result.warnings) {
        const loc = w.loc ? ` (${w.loc.file ?? '?'}:${w.loc.line}:${w.loc.column})` : '';
        yield* Console.info(`  [${w.code ?? 'WARN'}] ${w.message}${loc}`);
      }
    }

    if (result.hints.recommendations.length > 0) {
      yield* Console.info('\nRecommendations:');
      for (const rec of result.hints.recommendations) {
        yield* Console.info(`  • ${rec}`);
      }
    }
  });

// ─── Command ─────────────────────────────────────────────────────────────────

const command = Command.make(
  'treeshake-check',
  { cwd, entry, json, quiet, top },
  ({ cwd, entry, json, quiet, top }) =>
    Effect.gen(function* () {
      const result = yield* Option.match(entry, {
        onNone: () => checkPackage(Option.getOrUndefined(cwd)),
        onSome: (entryPath) => analyzeTreeshakeability(entryPath),
      });

      if (!quiet) {
        yield* json ? renderJson(result) : renderHuman(result, top);
      }

      // Non-zero exit when shaking failed, so this composes as a CI gate.
      // Use process.exitCode (not process.exit) so any in-flight stdout
      // writes flush before Node exits.
      if (result._tag === 'HasSideEffects') {
        yield* Effect.sync(() => {
          process.exitCode = 1;
        });
      }
    }),
).pipe(Command.withDescription('Check whether a package can be fully tree-shaken by Rollup.'));

const cli = Command.run(command, {
  name: 'Treeshake Check',
  version: '1.0.0',
});

cli(process.argv).pipe(
  Effect.catchTags({
    PackageJsonNotFound: (e) =>
      Console.error(`error: package.json not found at ${e.path}`).pipe(
        Effect.zipRight(
          Effect.sync(() => {
            process.exitCode = 1;
          }),
        ),
      ),
    MissingEntryPoint: (e) =>
      Console.error(`error: package.json at ${e.path} has no "module" or "main" entry`).pipe(
        Effect.zipRight(
          Effect.sync(() => {
            process.exitCode = 1;
          }),
        ),
      ),
    BundleFailed: (e) =>
      Console.error(`error: bundling failed — ${String(e.cause)}`).pipe(
        Effect.zipRight(
          Effect.sync(() => {
            process.exitCode = 1;
          }),
        ),
      ),
    ParseError: (e) =>
      Console.error(`error: invalid package.json — ${e.message}`).pipe(
        Effect.zipRight(
          Effect.sync(() => {
            process.exitCode = 1;
          }),
        ),
      ),
  }),
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain as any,
);
