import { describe, it, expect } from 'vitest';
import { resolveEntryPoints } from './resolve-entries.js';

describe('resolveEntryPoints', () => {
  it('should resolve .js exports to .d.ts paths', () => {
    const exports = {
      '.': './dist/src/index.js',
      './types': './dist/src/types.d.ts',
      './webauthn': './dist/src/lib/webauthn/webauthn.js',
      './package.json': './package.json',
    };
    const result = resolveEntryPoints(exports, '/fake/package');
    expect(result).toEqual([
      { subpath: '.', dtsPath: '/fake/package/dist/src/index.d.ts' },
      { subpath: './types', dtsPath: '/fake/package/dist/src/types.d.ts' },
      { subpath: './webauthn', dtsPath: '/fake/package/dist/src/lib/webauthn/webauthn.d.ts' },
    ]);
  });

  it('should skip ./package.json entries', () => {
    const exports = { '.': './dist/src/index.js', './package.json': './package.json' };
    const result = resolveEntryPoints(exports, '/fake/package');
    expect(result).toHaveLength(1);
    expect(result[0].subpath).toBe('.');
  });

  it('should skip non-string entries (conditional exports)', () => {
    const exports = {
      '.': { import: './dist/index.js', require: './dist/index.cjs' },
      './types': './dist/src/types.d.ts',
    } as unknown as Record<string, string>;
    const result = resolveEntryPoints(exports, '/fake/package');
    expect(result).toHaveLength(1);
    expect(result[0].subpath).toBe('./types');
  });

  it('should return empty array for empty exports', () => {
    expect(resolveEntryPoints({}, '/fake/package')).toEqual([]);
  });

  it('should preserve .d.ts extension when target is already .d.ts', () => {
    const exports = { './types': './dist/src/types.d.ts' };
    const result = resolveEntryPoints(exports, '/fake/package');
    expect(result[0].dtsPath).toBe('/fake/package/dist/src/types.d.ts');
  });
});
