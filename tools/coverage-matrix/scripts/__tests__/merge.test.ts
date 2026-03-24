import { describe, it, expect } from 'vitest';
import { buildCoverageMatrix } from '../lib/merge.js';
import type { StaticAnalysis } from '../lib/types.js';

const mockStaticAnalysis: StaticAnalysis = {
  generatedAt: '2026-03-23T12:00:00Z',
  packages: [
    {
      name: '@forgerock/mock-package',
      path: 'packages/mock-package',
      modules: [
        {
          name: '.',
          sourcePath: 'src/index.ts',
          exports: [
            {
              name: 'doStuff',
              kind: 'function',
              sourceFile: '/mock/packages/mock-package/src/lib/stuff.ts',
            },
            {
              name: 'CONSTANT',
              kind: 'constant',
              sourceFile: '/mock/packages/mock-package/src/lib/stuff.ts',
            },
            {
              name: 'StuffOptions',
              kind: 'type',
              sourceFile: '/mock/packages/mock-package/src/lib/stuff.ts',
            },
          ],
        },
      ],
    },
  ],
  unitTestMappings: [
    {
      testFile: 'packages/mock-package/src/lib/stuff.test.ts',
      packageName: '@forgerock/mock-package',
      importedExports: ['doStuff'],
    },
  ],
  typeTestMappings: [
    {
      testFile: 'packages/mock-package/src/types.test-d.ts',
      packageName: '@forgerock/mock-package',
      importedExports: ['StuffOptions'],
    },
  ],
  e2eSuiteMappings: [
    {
      suiteName: 'mock-suites',
      packages: ['@forgerock/mock-package'],
      packageImports: [{ packageName: '@forgerock/mock-package', importedNames: ['doStuff'] }],
    },
  ],
  warnings: [],
};

describe('buildCoverageMatrix', () => {
  it('builds matrix from static analysis only', () => {
    const result = buildCoverageMatrix(mockStaticAnalysis, null, '/nonexistent');

    expect(result.source).toBe('static');
    expect(result.packages).toHaveLength(1);

    const pkg = result.packages[0];
    expect(pkg.name).toBe('@forgerock/mock-package');

    // Summary should exclude type exports from totalExports
    expect(pkg.summary.totalExports).toBe(2); // doStuff + CONSTANT (not StuffOptions)
    expect(pkg.summary.unitCovered).toBe(1); // doStuff
    expect(pkg.summary.uncovered).toBe(1); // CONSTANT has no coverage (not in e2e app imports)

    // Check individual exports
    const doStuff = pkg.modules[0].exports.find((e) => e.name === 'doStuff');
    expect(doStuff?.coverage.unit).toEqual({
      covered: true,
      testFiles: ['packages/mock-package/src/lib/stuff.test.ts'],
      source: 'static',
    });

    const constant = pkg.modules[0].exports.find((e) => e.name === 'CONSTANT');
    expect(constant?.coverage.unit).toBeNull();

    const typeExport = pkg.modules[0].exports.find((e) => e.name === 'StuffOptions');
    expect(typeExport?.kind).toBe('type');
    expect(typeExport?.coverage.unit).toBeNull();
    expect(typeExport?.coverage.e2e).toBeNull();
  });

  it('e2e coverage requires runtime Istanbul data — no static fallback', () => {
    const result = buildCoverageMatrix(mockStaticAnalysis, null, '/nonexistent');

    const pkg = result.packages[0];
    // Without Istanbul runtime data, e2e is null even if static tracing finds imports
    const doStuff = pkg.modules[0].exports.find((e) => e.name === 'doStuff');
    expect(doStuff?.coverage.e2e).toBeNull();

    const constant = pkg.modules[0].exports.find((e) => e.name === 'CONSTANT');
    expect(constant?.coverage.e2e).toBeNull();
  });

  it('excludes type exports from e2e coverage', () => {
    const result = buildCoverageMatrix(mockStaticAnalysis, null, '/nonexistent');
    const pkg = result.packages[0];
    const typeExport = pkg.modules[0].exports.find((e) => e.name === 'StuffOptions');
    expect(typeExport?.coverage.e2e).toBeNull();
  });

  it('uses runtime V8 coverage when available', () => {
    const runtimeCoverage = {
      unitCoverage: [
        {
          packageName: '@forgerock/mock-package',
          coveredFiles: ['/mock/packages/mock-package/src/lib/stuff.ts'],
        },
      ],
      e2eCoverage: [],
    };

    const result = buildCoverageMatrix(mockStaticAnalysis, runtimeCoverage, '/nonexistent');

    expect(result.source).toBe('hybrid');

    const pkg = result.packages[0];
    // Both doStuff and CONSTANT come from stuff.ts which is in coverage data
    const doStuff = pkg.modules[0].exports.find((e) => e.name === 'doStuff');
    expect(doStuff?.coverage.unit).toEqual({
      covered: true,
      source: 'runtime',
    });

    const constant = pkg.modules[0].exports.find((e) => e.name === 'CONSTANT');
    expect(constant?.coverage.unit).toEqual({
      covered: true,
      source: 'runtime',
    });

    // Type exports still excluded
    const typeExport = pkg.modules[0].exports.find((e) => e.name === 'StuffOptions');
    expect(typeExport?.coverage.unit).toBeNull();

    // Summary reflects runtime coverage
    expect(pkg.summary.unitCovered).toBe(2);
    expect(pkg.summary.uncovered).toBe(0);
  });

  it('falls back to static when export file not in runtime coverage', () => {
    const runtimeCoverage = {
      unitCoverage: [
        {
          packageName: '@forgerock/mock-package',
          coveredFiles: ['/mock/packages/mock-package/src/lib/other.ts'], // doesn't include stuff.ts
        },
      ],
      e2eCoverage: [],
    };

    const result = buildCoverageMatrix(mockStaticAnalysis, runtimeCoverage, '/nonexistent');

    const pkg = result.packages[0];
    // doStuff has static coverage from import tracing, but no runtime
    const doStuff = pkg.modules[0].exports.find((e) => e.name === 'doStuff');
    expect(doStuff?.coverage.unit?.source).toBe('static');

    // CONSTANT has no coverage at all from either source
    const constant = pkg.modules[0].exports.find((e) => e.name === 'CONSTANT');
    expect(constant?.coverage.unit).toBeNull();
  });

  it('marks e2e coverage when runtime e2e data matches after dist path normalization', () => {
    // The mock sourceFile paths are relative (e.g. 'src/lib/stuff.ts')
    // In production they're absolute, but normalizeDistPath works on any path
    // containing /dist/src/ — so we construct a path that normalizes to match
    const runtimeCoverage = {
      unitCoverage: [],
      e2eCoverage: [
        {
          coveredFiles: [
            // normalizeDistPath: /dist/src/ → /src/, .js → .ts
            '/mock/packages/mock-package/dist/src/lib/stuff.js',
          ],
        },
      ],
    };

    const result = buildCoverageMatrix(mockStaticAnalysis, runtimeCoverage, '/nonexistent');

    const pkg = result.packages[0];
    const doStuff = pkg.modules[0].exports.find((e) => e.name === 'doStuff');
    expect(doStuff?.coverage.e2e).toEqual({
      covered: true,
      source: 'runtime',
    });

    const constant = pkg.modules[0].exports.find((e) => e.name === 'CONSTANT');
    expect(constant?.coverage.e2e).toEqual({
      covered: true,
      source: 'runtime',
    });

    const typeExport = pkg.modules[0].exports.find((e) => e.name === 'StuffOptions');
    expect(typeExport?.coverage.e2e).toBeNull();
  });
});
