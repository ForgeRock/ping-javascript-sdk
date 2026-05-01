// tools/treeshake-check/src/treeshake-check.integration.test.ts
import { describe, expect, live } from '@effect/vitest';
import { assert } from 'vitest';
import { Effect } from 'effect';
import { NodeContext } from '@effect/platform-node';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeTreeshakeability, BundleFailed } from './lib/treeshake-check.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const fixturePath = (name: string) => resolve(__dirname, '__fixtures__', name, 'dist', 'index.js');

const run = <A, E>(effect: Effect.Effect<A, E, NodeContext.NodeContext>) =>
  effect.pipe(Effect.provide(NodeContext.layer));

describe('analyzeTreeshakeability integration', () => {
  live('reports clean package as fully tree-shakeable', () =>
    run(
      Effect.gen(function* () {
        const result = yield* analyzeTreeshakeability(fixturePath('clean'));
        assert(result._tag === 'FullyTreeshakeable');
        expect(result.hints.hasSideEffectsField).toBe(false);
        expect(result.hints.hasModuleField).toBe(false);
        expect(result.hints.recommendations).toHaveLength(0);
      }),
    ),
  );

  live('reports enum-only package as having side effects', () =>
    run(
      Effect.gen(function* () {
        const result = yield* analyzeTreeshakeability(fixturePath('enum-only'));
        assert(result._tag === 'HasSideEffects');
        const allCauses = new Set(result.modules.flatMap((m) => m.suspectedCauses));
        expect(allCauses).toContain('EnumPattern');
      }),
    ),
  );

  live('reports mixed package with both EnumPattern and PrototypeMutation', () =>
    run(
      Effect.gen(function* () {
        const result = yield* analyzeTreeshakeability(fixturePath('mixed'));
        assert(result._tag === 'HasSideEffects');
        const allCauses = new Set(result.modules.flatMap((m) => m.suspectedCauses));
        expect(allCauses).toContain('EnumPattern');
        expect(allCauses).toContain('PrototypeMutation');
      }),
    ),
  );

  live('returns totalRenderedBytes > 0 for side-effectful packages', () =>
    run(
      Effect.gen(function* () {
        const result = yield* analyzeTreeshakeability(fixturePath('enum-only'));
        assert(result._tag === 'HasSideEffects');
        expect(result.totalRenderedBytes).toBeGreaterThan(0);
        expect(result.totalOriginalBytes).toBeGreaterThan(0);
      }),
    ),
  );

  live('fails with BundleFailed when entry file has a syntax error', () =>
    run(
      Effect.gen(function* () {
        const error = yield* Effect.flip(analyzeTreeshakeability(fixturePath('bad-syntax')));
        expect(error).toBeInstanceOf(BundleFailed);
      }),
    ),
  );
});
