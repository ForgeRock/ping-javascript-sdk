// tools/treeshake-check/src/treeshake-check.integration.test.ts
import { expect, layer } from '@effect/vitest';
import { assert } from 'vitest';
import { Effect } from 'effect';
import { NodeContext } from '@effect/platform-node';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeTreeshakeability, BundleFailed } from './lib/treeshake-check.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const fixturePath = (name: string) => resolve(__dirname, '__fixtures__', name, 'index.js');

layer(NodeContext.layer)('analyzeTreeshakeability integration', (it) => {
  it.scoped('reports clean package as fully tree-shakeable', () =>
    Effect.gen(function* () {
      const result = yield* analyzeTreeshakeability(fixturePath('clean'));
      assert(result._tag === 'FullyTreeshakeable');
      expect(result.hints.hasSideEffectsField).toBe(false);
      expect(result.hints.hasModuleField).toBe(false);
      expect(result.hints.recommendations).toHaveLength(0);
    }),
  );

  it.scoped('reports enum-only package as having side effects', () =>
    Effect.gen(function* () {
      const result = yield* analyzeTreeshakeability(fixturePath('enum-only'));
      assert(result._tag === 'HasSideEffects');
      const allCauses = new Set(result.modules.flatMap((m) => m.suspectedCauses));
      expect(allCauses).toContain('EnumPattern');
    }),
  );

  it.scoped('reports mixed package with both EnumPattern and PrototypeMutation', () =>
    Effect.gen(function* () {
      const result = yield* analyzeTreeshakeability(fixturePath('mixed'));
      assert(result._tag === 'HasSideEffects');
      const allCauses = new Set(result.modules.flatMap((m) => m.suspectedCauses));
      expect(allCauses).toContain('EnumPattern');
      expect(allCauses).toContain('PrototypeMutation');
    }),
  );

  it.scoped('returns totalRenderedBytes > 0 for side-effectful packages', () =>
    Effect.gen(function* () {
      const result = yield* analyzeTreeshakeability(fixturePath('enum-only'));
      assert(result._tag === 'HasSideEffects');
      expect(result.totalRenderedBytes).toBeGreaterThan(0);
      expect(result.totalOriginalBytes).toBeGreaterThan(0);
    }),
  );

  it.scoped('fails with BundleFailed when entry file has a syntax error', () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(analyzeTreeshakeability(fixturePath('bad-syntax')));
      expect(error).toBeInstanceOf(BundleFailed);
    }),
  );
});
