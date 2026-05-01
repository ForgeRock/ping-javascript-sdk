#!/usr/bin/env node
// src/index.ts
import { Command, Options } from '@effect/cli';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Console, Effect, Option, Schema, pipe } from 'effect';
import { analyzeTreeshakeability, checkPackage } from './lib/treeshake-check.js';
import { EXPLANATIONS, primaryCause } from './lib/explanations.js';
import { TreeshakeResult } from './lib/schemas.js';

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

// ─── Rendering helpers ───────────────────────────────────────────────────────

const indent = (text: string, prefix = '    ') =>
  text
    .split('\n')
    .map((line) => prefix + line)
    .join('\n');

const SEPARATOR = '  ───────────────────────────────────────────────';

// ─── Renderers ───────────────────────────────────────────────────────────────

const renderJson = (result: TreeshakeResult) =>
  pipe(
    Schema.encode(TreeshakeResult)(result),
    Effect.flatMap((encoded) => Console.log(JSON.stringify(encoded, null, 2))),
  );

const renderHuman = (result: TreeshakeResult, topN: Option.Option<number>) =>
  Effect.gen(function* () {
    if (result._tag === 'FullyTreeshakeable') {
      yield* Console.info(tree);
      if (result.hints.recommendations.length > 0) {
        yield* Console.info('\nRecommendations:');
        for (const rec of result.hints.recommendations) {
          yield* Console.info(`  • ${rec}`);
        }
      }
      return;
    }

    // ─── Headline verdict ──────────────────────────────────────────────────
    const survivedPct = (result.totalRenderedBytes / result.totalOriginalBytes) * 100;
    const moduleCount = result.modules.length;

    yield* Console.info('\n  This package is not tree-shakeable.\n');
    yield* Console.info(
      `  When a consumer imports anything from this package, ${survivedPct.toFixed(0)}% ` +
        `of its code (${result.totalRenderedBytes} of ${result.totalOriginalBytes} bytes) ` +
        `gets pulled into their bundle, even if they only use a single export.\n`,
    );
    yield* Console.info(
      `  ${moduleCount} ${moduleCount === 1 ? 'file is' : 'files are'} preventing ` +
        `tree-shaking. Details below.\n`,
    );

    // ─── Per-module diagnosis ──────────────────────────────────────────────
    const sorted = [...result.modules].sort((a, b) => b.renderedLength - a.renderedLength);
    const shown = Option.match(topN, {
      onNone: () => sorted,
      onSome: (n) => sorted.slice(0, n),
    });

    yield* Console.info(`${SEPARATOR}\n`);

    for (const [i, m] of shown.entries()) {
      const cause = primaryCause(m.suspectedCauses);
      const explanation = EXPLANATIONS[cause];
      const filePct = (m.renderedLength / m.originalLength) * 100;

      yield* Console.info(`  [${i + 1}] ${m.id}\n`);
      yield* Console.info(`      Problem: ${explanation.summary}\n`);
      yield* Console.info(
        `      Impact:  ${m.renderedLength} of ${m.originalLength} bytes ` +
          `(${filePct.toFixed(0)}%) end up in consumer bundles\n`,
      );

      if (m.renderedExports.length > 0) {
        yield* Console.info(`      Exports affected: ${m.renderedExports.join(', ')}\n`);
      }

      yield* Console.info('      Why this happens:');
      yield* Console.info(indent(explanation.why, '        '));
      yield* Console.info('');

      yield* Console.info('      How to fix:');
      for (const f of explanation.fix) {
        yield* Console.info(`        • ${f}`);
      }

      if (explanation.example) {
        yield* Console.info('\n      Example:');
        yield* Console.info('        Before:');
        yield* Console.info(indent(explanation.example.before, '          '));
        yield* Console.info('\n        After:');
        yield* Console.info(indent(explanation.example.after, '          '));
      }

      // Show a snippet of the actual surviving code as evidence
      if (m.survivingCode && m.survivingCode.trim().length > 0) {
        const snippet =
          m.survivingCode.length > 400
            ? m.survivingCode.slice(0, 400) + '\n... (truncated)'
            : m.survivingCode;
        yield* Console.info('\n      Surviving code:');
        yield* Console.info(indent(snippet, '        '));
      }

      yield* Console.info(`\n${SEPARATOR}\n`);
    }

    // ─── Truncation notice ─────────────────────────────────────────────────
    if (Option.isSome(topN) && sorted.length > Option.getOrThrow(topN)) {
      yield* Console.info(
        `  (Showing top ${shown.length} of ${sorted.length}. ` +
          `Run without --top to see all, or with --json for machine-readable output.)\n`,
      );
    }

    // ─── Aggregate summary when all modules share a cause ──────────────────
    const uniqueCauses = new Set(result.modules.map((m) => primaryCause(m.suspectedCauses)));
    if (uniqueCauses.size === 1 && result.modules.length > 1) {
      const [onlyCause] = Array.from(uniqueCauses);
      yield* Console.info(
        `  Summary: All ${result.modules.length} files have the same root cause ` +
          `(${EXPLANATIONS[onlyCause].summary}). Applying the fix above resolves all of them.\n`,
      );
    }

    // ─── Rollup warnings, if any ───────────────────────────────────────────
    if (result.warnings.length > 0) {
      yield* Console.info('  Rollup warnings encountered during analysis:');
      for (const w of result.warnings) {
        const loc = w.loc ? ` (${w.loc.file ?? '?'}:${w.loc.line}:${w.loc.column})` : '';
        yield* Console.info(`    [${w.code ?? 'WARN'}] ${w.message}${loc}`);
      }
      yield* Console.info('');
    }

    // ─── Package-level recommendations ─────────────────────────────────────
    if (result.hints.recommendations.length > 0) {
      yield* Console.info('  Package-level recommendations:');
      for (const rec of result.hints.recommendations) {
        yield* Console.info(`    • ${rec}`);
      }
      yield* Console.info('');
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
  NodeRuntime.runMain,
);
