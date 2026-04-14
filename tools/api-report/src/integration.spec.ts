import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, mkdtempSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { analyzePackage, type PackageInfo } from './main.js';
import { applyFixes } from './fixer.js';

let FIXTURE_ROOT: string;
let CLIENT_DIR: string;
let INTERNAL_DIR: string;

/**
 * Creates a minimal workspace fixture where:
 * - packages/test-client has index.d.ts exporting a function returning `ForgottenType`
 * - packages/test-internal defines ForgottenType (mimics @forgerock/sdk-types)
 * - ForgottenType is NOT re-exported from test-client's index.d.ts
 *
 * api-extractor should flag ForgottenType as ae-forgotten-export.
 * The fixer should resolve it to @forgerock/test-internal and add the re-export.
 */
function createFixture() {
  FIXTURE_ROOT = mkdtempSync(join(tmpdir(), 'api-report-test-'));
  CLIENT_DIR = resolve(FIXTURE_ROOT, 'packages/test-client');
  INTERNAL_DIR = resolve(FIXTURE_ROOT, 'packages/test-internal');

  // Create directory structure
  mkdirSync(resolve(CLIENT_DIR, 'dist/src'), { recursive: true });
  mkdirSync(resolve(CLIENT_DIR, 'src'), { recursive: true });
  mkdirSync(resolve(INTERNAL_DIR, 'dist/src'), { recursive: true });
  mkdirSync(resolve(INTERNAL_DIR, 'src'), { recursive: true });
  // Simulate node_modules symlink: client depends on internal
  mkdirSync(resolve(CLIENT_DIR, 'node_modules/@forgerock'), { recursive: true });

  // Client package.json
  writeFileSync(
    resolve(CLIENT_DIR, 'package.json'),
    JSON.stringify(
      {
        name: '@forgerock/test-client',
        version: '0.0.0',
        type: 'module',
        exports: { '.': './dist/src/index.js' },
      },
      null,
      2,
    ),
  );

  // Internal package.json (mimics @forgerock/sdk-types)
  writeFileSync(
    resolve(INTERNAL_DIR, 'package.json'),
    JSON.stringify({ name: '@forgerock/test-internal', version: '0.0.0', type: 'module' }, null, 2),
  );

  // Client tsconfig.json — use paths to resolve @forgerock/test-internal
  writeFileSync(
    resolve(CLIENT_DIR, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'nodenext',
          moduleResolution: 'nodenext',
          declaration: true,
          strict: true,
          rootDir: './src',
          outDir: './dist',
          paths: {
            '@forgerock/test-internal': ['../test-internal/dist/src/index.d.ts'],
          },
        },
        include: ['src/**/*.ts'],
      },
      null,
      2,
    ),
  );

  // Internal package: dist/src/index.d.ts — defines types the client uses
  writeFileSync(
    resolve(INTERNAL_DIR, 'dist/src/index.d.ts'),
    [
      'export interface ForgottenType {',
      '  value: string;',
      '}',
      'export interface AnotherForgottenType {',
      '  count: number;',
      '}',
      'export declare enum ForgottenEnum {',
      '  A = "A",',
      '  B = "B"',
      '}',
      'export interface ExistingType {',
      '  id: number;',
      '}',
      '',
    ].join('\n'),
  );

  // Internal package: src/index.ts — source for resolving export kind
  writeFileSync(
    resolve(INTERNAL_DIR, 'src/index.ts'),
    [
      'export interface ForgottenType {',
      '  value: string;',
      '}',
      'export interface AnotherForgottenType {',
      '  count: number;',
      '}',
      'export enum ForgottenEnum {',
      '  A = "A",',
      '  B = "B",',
      '}',
      'export interface ExistingType {',
      '  id: number;',
      '}',
      '',
    ].join('\n'),
  );

  // Client: dist/src/types.d.ts — existing re-exports
  writeFileSync(
    resolve(CLIENT_DIR, 'dist/src/types.d.ts'),
    ["export type { ExistingType } from '@forgerock/test-internal';", ''].join('\n'),
  );

  // Client: dist/src/index.d.ts — uses forgotten symbols from internal package
  writeFileSync(
    resolve(CLIENT_DIR, 'dist/src/index.d.ts'),
    [
      "import { ForgottenType, AnotherForgottenType, ForgottenEnum } from '@forgerock/test-internal';",
      'export declare function getData(): ForgottenType;',
      'export declare function getMore(): AnotherForgottenType;',
      'export declare function getEnum(): ForgottenEnum;',
      "export * from './types.js';",
      '',
    ].join('\n'),
  );

  // Client: src/types.ts — the source file the fixer will modify
  writeFileSync(
    resolve(CLIENT_DIR, 'src/types.ts'),
    ["export type { ExistingType } from '@forgerock/test-internal';", ''].join('\n'),
  );
}

describe('integration: forgotten export detection and fix', () => {
  beforeEach(() => {
    createFixture();
  });

  afterEach(() => {
    rmSync(FIXTURE_ROOT, { recursive: true, force: true });
  });

  function makeInfo(): PackageInfo {
    return {
      packageName: '@forgerock/test-client',
      packageDir: CLIENT_DIR,
      tsconfigPath: resolve(CLIENT_DIR, 'tsconfig.json'),
      entries: [{ subpath: '.', dtsPath: resolve(CLIENT_DIR, 'dist/src/index.d.ts') }],
    };
  }

  it('should detect forgotten exports via api-extractor', () => {
    const { totalErrors, forgottenExports } = analyzePackage(makeInfo());

    expect(totalErrors).toBeGreaterThan(0);
    expect(forgottenExports.length).toBeGreaterThanOrEqual(3);
    expect(forgottenExports.some((fe) => fe.symbolName === 'ForgottenType')).toBe(true);
    expect(forgottenExports.some((fe) => fe.symbolName === 'AnotherForgottenType')).toBe(true);
    expect(forgottenExports.some((fe) => fe.symbolName === 'ForgottenEnum')).toBe(true);
  });

  it('should fix multiple forgotten exports in one run', () => {
    const { forgottenExports } = analyzePackage(makeInfo());
    expect(forgottenExports.length).toBeGreaterThanOrEqual(3);

    const typesFilePath = resolve(CLIENT_DIR, 'src/types.ts');
    const { fixed } = applyFixes(forgottenExports, typesFilePath, FIXTURE_ROOT);

    expect(fixed).toContain('ForgottenType');
    expect(fixed).toContain('AnotherForgottenType');
    expect(fixed).toContain('ForgottenEnum');

    const updatedContent = readFileSync(typesFilePath, 'utf-8');
    // All three should be present
    expect(updatedContent).toContain('ForgottenType');
    expect(updatedContent).toContain('AnotherForgottenType');
    expect(updatedContent).toContain('ForgottenEnum');
    // Existing export preserved
    expect(updatedContent).toContain('ExistingType');
  });

  it('should follow import chain and use correct export kind (type vs value)', () => {
    const { forgottenExports } = analyzePackage(makeInfo());

    const typesFilePath = resolve(CLIENT_DIR, 'src/types.ts');
    const { fixed } = applyFixes(forgottenExports, typesFilePath, FIXTURE_ROOT);
    expect(fixed.length).toBe(3);

    const updatedContent = readFileSync(typesFilePath, 'utf-8');

    // ForgottenType and AnotherForgottenType are interfaces — should be type exports
    expect(updatedContent).toMatch(/export\s+type\s*\{[^}]*ForgottenType[^}]*\}/s);
    expect(updatedContent).toMatch(/export\s+type\s*\{[^}]*AnotherForgottenType[^}]*\}/s);

    // ForgottenEnum is a declare enum — should be a value export (no 'type' keyword)
    expect(updatedContent).toMatch(/export\s+\{[^}]*ForgottenEnum[^}]*\}/);
    // And specifically NOT as a type export
    expect(updatedContent).not.toMatch(/export\s+type\s*\{[^}]*ForgottenEnum[^}]*\}/s);
  });

  it('should produce zero errors after fix + rebuild cycle', () => {
    // Step 1: Fix
    const { forgottenExports } = analyzePackage(makeInfo());
    const typesFilePath = resolve(CLIENT_DIR, 'src/types.ts');
    applyFixes(forgottenExports, typesFilePath, FIXTURE_ROOT);

    // Step 2: "Rebuild" — update the dist/src/types.d.ts to match the fixed source
    const fixedContent = readFileSync(typesFilePath, 'utf-8');
    writeFileSync(resolve(CLIENT_DIR, 'dist/src/types.d.ts'), fixedContent);

    // Step 3: Re-run analysis — should be clean
    const recheck = analyzePackage(makeInfo());
    expect(recheck.totalErrors).toBe(0);
    expect(recheck.forgottenExports).toHaveLength(0);
  });

  it('should be a no-op on an already-clean package', () => {
    // First: fix and rebuild to make the package clean
    const { forgottenExports } = analyzePackage(makeInfo());
    const typesFilePath = resolve(CLIENT_DIR, 'src/types.ts');
    applyFixes(forgottenExports, typesFilePath, FIXTURE_ROOT);
    writeFileSync(resolve(CLIENT_DIR, 'dist/src/types.d.ts'), readFileSync(typesFilePath, 'utf-8'));

    // Snapshot the clean types.ts
    const cleanContent = readFileSync(typesFilePath, 'utf-8');

    // Now run fix again on the clean package
    const recheck = analyzePackage(makeInfo());
    expect(recheck.forgottenExports).toHaveLength(0);

    const { fixed } = applyFixes(recheck.forgottenExports, typesFilePath, FIXTURE_ROOT);
    expect(fixed).toHaveLength(0);

    // types.ts should be unchanged
    expect(readFileSync(typesFilePath, 'utf-8')).toBe(cleanContent);
  });

  it('should handle multiple entry points', () => {
    // Add a second entry point: ./utils with its own forgotten export
    mkdirSync(resolve(CLIENT_DIR, 'dist/src/utils'), { recursive: true });

    writeFileSync(
      resolve(CLIENT_DIR, 'dist/src/utils/helpers.d.ts'),
      [
        "import { ForgottenType } from '@forgerock/test-internal';",
        'export declare function formatData(data: ForgottenType): string;',
        '',
      ].join('\n'),
    );

    const info: PackageInfo = {
      packageName: '@forgerock/test-client',
      packageDir: CLIENT_DIR,
      tsconfigPath: resolve(CLIENT_DIR, 'tsconfig.json'),
      entries: [
        { subpath: '.', dtsPath: resolve(CLIENT_DIR, 'dist/src/index.d.ts') },
        { subpath: './utils', dtsPath: resolve(CLIENT_DIR, 'dist/src/utils/helpers.d.ts') },
      ],
    };

    const { results, forgottenExports } = analyzePackage(info);

    // Both entry points should be analyzed
    expect(results).toHaveLength(2);
    // Forgotten exports should be found across entry points
    expect(forgottenExports.length).toBeGreaterThan(0);
    expect(forgottenExports.some((fe) => fe.symbolName === 'ForgottenType')).toBe(true);
  });
});
