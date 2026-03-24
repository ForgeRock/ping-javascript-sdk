import { describe, it, expect } from 'vitest';
import { resolveExportPaths, discoverPackageExportPaths } from '../lib/discover-packages.js';
import { join } from 'node:path';

const fixturesDir = join(import.meta.dirname, 'fixtures');

describe('resolveExportPaths', () => {
  it('extracts code entry points from simple string exports', () => {
    const result = resolveExportPaths({
      '.': './dist/src/index.js',
      './feature': './dist/src/lib/feature/index.js',
      './types': './dist/src/types.d.ts',
      './package.json': './package.json',
    });

    expect(result).toEqual([
      { name: '.', distPath: './dist/src/index.js', sourcePath: './src/index.ts' },
      {
        name: './feature',
        distPath: './dist/src/lib/feature/index.js',
        sourcePath: './src/lib/feature/index.ts',
      },
      { name: './types', distPath: './dist/src/types.d.ts', sourcePath: './src/types.ts' },
    ]);
  });

  it('extracts code entry points from conditional object exports', () => {
    const result = resolveExportPaths({
      '.': {
        types: './dist/src/index.d.ts',
        import: './dist/src/index.js',
        default: './dist/src/index.js',
      },
      './constants': {
        types: './dist/src/lib/constants/index.d.ts',
        import: './dist/src/lib/constants/index.js',
        default: './dist/src/lib/constants/index.js',
      },
      './package.json': './package.json',
      './types': {
        types: './dist/src/types.d.ts',
        import: './dist/src/types.js',
        default: './dist/src/types.js',
      },
    });

    expect(result).toEqual([
      { name: '.', distPath: './dist/src/index.js', sourcePath: './src/index.ts' },
      {
        name: './constants',
        distPath: './dist/src/lib/constants/index.js',
        sourcePath: './src/lib/constants/index.ts',
      },
      { name: './types', distPath: './dist/src/types.js', sourcePath: './src/types.ts' },
    ]);
  });

  it('uses default key when import key is absent', () => {
    const result = resolveExportPaths({
      '.': { types: './dist/src/index.d.ts', default: './dist/src/index.js' },
    });

    expect(result).toEqual([
      { name: '.', distPath: './dist/src/index.js', sourcePath: './src/index.ts' },
    ]);
  });

  it('returns empty array when exports field is undefined', () => {
    const result = resolveExportPaths(undefined);
    expect(result).toEqual([]);
  });
});

describe('discoverPackageExportPaths', () => {
  it('reads package.json and returns resolved export paths', () => {
    const result = discoverPackageExportPaths(join(fixturesDir, 'mock-package-simple'));

    expect(result).toEqual({
      name: '@forgerock/mock-simple',
      path: expect.stringContaining('mock-package-simple'),
      exportPaths: [
        { name: '.', distPath: './dist/src/index.js', sourcePath: './src/index.ts' },
        {
          name: './feature',
          distPath: './dist/src/lib/feature/index.js',
          sourcePath: './src/lib/feature/index.ts',
        },
        { name: './types', distPath: './dist/src/types.d.ts', sourcePath: './src/types.ts' },
      ],
    });
  });

  it('handles conditional exports format', () => {
    const result = discoverPackageExportPaths(join(fixturesDir, 'mock-package-conditional'));

    expect(result).toEqual({
      name: '@forgerock/mock-conditional',
      path: expect.stringContaining('mock-package-conditional'),
      exportPaths: [
        { name: '.', distPath: './dist/src/index.js', sourcePath: './src/index.ts' },
        {
          name: './constants',
          distPath: './dist/src/lib/constants/index.js',
          sourcePath: './src/lib/constants/index.ts',
        },
        { name: './types', distPath: './dist/src/types.js', sourcePath: './src/types.ts' },
      ],
    });
  });
});
