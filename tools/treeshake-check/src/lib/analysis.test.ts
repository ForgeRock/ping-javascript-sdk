// tools/treeshake-check/src/lib/analysis.test.ts
import { describe, it, expect } from '@effect/vitest';
import {
  detectCauses,
  buildModuleAnalysis,
  analyzePackageJsonHints,
  resolveEntry,
} from './analysis.js';

// ─── detectCauses ─────────────────────────────────────────────────────────────

describe('detectCauses', () => {
  it('detects TypeScript enum IIFE pattern', () => {
    const code = 'var X; (function (X) { X["A"] = "A"; })(X || (X = {}));';
    expect(new Set(detectCauses(code))).toContain('EnumPattern');
  });

  it('detects CommonJS require', () => {
    const code = 'const fs = require("fs");';
    expect(new Set(detectCauses(code))).toContain('CommonJsContamination');
  });

  it('detects module.exports contamination', () => {
    const code = 'module.exports = { foo: 1 };';
    expect(new Set(detectCauses(code))).toContain('CommonJsContamination');
  });

  it('detects Object.defineProperty as PrototypeMutation', () => {
    const code = 'Object.defineProperty(MyClass.prototype, "foo", { value: 1 });';
    const causes = new Set(detectCauses(code));
    expect(causes).toContain('PrototypeMutation');
  });

  it('detects .prototype assignment as PrototypeMutation', () => {
    const code = 'String.prototype.foo = function() {};';
    expect(new Set(detectCauses(code))).toContain('PrototypeMutation');
  });

  it('detects window global assignment', () => {
    const code = 'window.MY_LIB = { version: "1" };';
    expect(new Set(detectCauses(code))).toContain('GlobalAssignment');
  });

  it('detects globalThis assignment', () => {
    const code = 'globalThis.MY_LIB = {};';
    expect(new Set(detectCauses(code))).toContain('GlobalAssignment');
  });

  it('detects unannotated top-level call', () => {
    const code = 'initialize();';
    const causes = new Set(detectCauses(code));
    expect(causes).toContain('UnannotatedCall');
    expect(causes).toContain('TopLevelSideEffect');
  });

  it('does not flag PURE-annotated top-level call', () => {
    const code = 'const x = /*#__PURE__*/ compute();';
    expect(new Set(detectCauses(code))).not.toContain('UnannotatedCall');
  });

  it('returns Unknown for plain export', () => {
    const code = 'export const foo = 42;';
    expect(detectCauses(code)).toEqual(['Unknown']);
  });

  it('returns Unknown for empty input', () => {
    expect(detectCauses('')).toEqual(['Unknown']);
  });

  it('enum IIFE does not also trigger UnannotatedCall', () => {
    const code = 'var X; (function (X) { X["A"] = "A"; })(X || (X = {}));';
    const causes = new Set(detectCauses(code));
    expect(causes).toContain('EnumPattern');
    expect(causes).not.toContain('UnannotatedCall');
  });

  it('detects multiple causes in one file', () => {
    const code = `
      var Status;
      (function (Status) { Status["OK"] = "OK"; })(Status || (Status = {}));
      window.MY_LIB = Status;
    `;
    const causes = new Set(detectCauses(code));
    expect(causes).toContain('EnumPattern');
    expect(causes).toContain('GlobalAssignment');
  });

  // AST precision tests — cases the regex approach got wrong
  it('does NOT flag import statements as calls (AST precision)', () => {
    const code = `import { foo } from 'bar';\nexport const x = 1;`;
    expect(new Set(detectCauses(code))).not.toContain('UnannotatedCall');
  });

  it('does NOT flag variable-assigned calls as UnannotatedCall (AST precision)', () => {
    const code = `const x = createStore();\nexport { x };`;
    expect(new Set(detectCauses(code))).not.toContain('UnannotatedCall');
  });

  it('flags bare top-level call expression statement with no annotation (AST precision)', () => {
    const code = `initializeGlobals();\nexport const x = 1;`;
    const causes = new Set(detectCauses(code));
    expect(causes).toContain('UnannotatedCall');
    expect(causes).toContain('TopLevelSideEffect');
  });

  it('does not flag PURE-annotated bare call (AST precision)', () => {
    const code = `/*#__PURE__*/createRegistry();\nexport const x = 1;`;
    expect(new Set(detectCauses(code))).not.toContain('UnannotatedCall');
  });
});

// ─── buildModuleAnalysis ──────────────────────────────────────────────────────

describe('buildModuleAnalysis', () => {
  it('computes shaking ratio correctly', () => {
    const result = buildModuleAnalysis('test.js', {
      originalLength: 1000,
      renderedLength: 250,
      renderedExports: ['foo'],
      removedExports: ['bar', 'baz'],
      code: 'export const foo = 1;',
    });
    expect(result.shakingRatio).toBe(0.25);
    expect(result.renderedExports).toEqual(['foo']);
    expect(result.removedExports).toEqual(['bar', 'baz']);
    expect(result.id).toBe('test.js');
  });

  it('handles zero-byte modules without dividing by zero', () => {
    const result = buildModuleAnalysis('empty.js', {
      originalLength: 0,
      renderedLength: 0,
      renderedExports: [],
      removedExports: [],
      code: null,
    });
    expect(result.shakingRatio).toBe(0);
    expect(result.suspectedCauses).toEqual(['Unknown']);
  });

  it('returns Unknown when code is null', () => {
    const result = buildModuleAnalysis('no-code.js', {
      originalLength: 100,
      renderedLength: 50,
      renderedExports: [],
      removedExports: [],
      code: null,
    });
    expect(result.suspectedCauses).toEqual(['Unknown']);
    expect(result.survivingCode).toBeNull();
  });

  it('runs detectCauses on surviving code', () => {
    const result = buildModuleAnalysis('enum.js', {
      originalLength: 200,
      renderedLength: 100,
      renderedExports: [],
      removedExports: [],
      code: 'var X; (function (X) { X["A"] = "A"; })(X || (X = {}));',
    });
    expect(new Set(result.suspectedCauses)).toContain('EnumPattern');
  });
});

// ─── analyzePackageJsonHints ──────────────────────────────────────────────────

describe('analyzePackageJsonHints', () => {
  it('flags missing sideEffects field', () => {
    const hints = analyzePackageJsonHints({ name: 'foo', main: './index.js' });
    expect(hints.hasSideEffectsField).toBe(false);
    expect(hints.recommendations.some((r) => r.includes('"sideEffects": false'))).toBe(true);
  });

  it('does not recommend sideEffects when already present', () => {
    const hints = analyzePackageJsonHints({ name: 'foo', sideEffects: false });
    expect(hints.hasSideEffectsField).toBe(true);
    expect(hints.recommendations.some((r) => r.includes('"sideEffects": false'))).toBe(false);
  });

  it('recommends module field when only main is present', () => {
    const hints = analyzePackageJsonHints({ name: 'foo', main: './cjs/index.js' });
    expect(hints.hasModuleField).toBe(false);
    expect(hints.recommendations.some((r) => r.includes('"module"'))).toBe(true);
  });

  it('does not recommend module field when already present', () => {
    const hints = analyzePackageJsonHints({ name: 'foo', module: './esm/index.js' });
    expect(hints.hasModuleField).toBe(true);
    expect(hints.recommendations.some((r) => r.includes('"module"'))).toBe(false);
  });

  it('recommends type module when no ESM signal', () => {
    const hints = analyzePackageJsonHints({ name: 'foo' });
    expect(hints.hasTypeModule).toBe(false);
    expect(hints.recommendations.some((r) => r.includes('"type": "module"'))).toBe(true);
  });

  it('recognizes type: module correctly', () => {
    const hints = analyzePackageJsonHints({ name: 'foo', type: 'module', sideEffects: false });
    expect(hints.hasTypeModule).toBe(true);
  });

  it('does not recommend type module when module field is present', () => {
    const hints = analyzePackageJsonHints({ name: 'foo', module: './esm/index.js' });
    expect(hints.recommendations.some((r) => r.includes('"type": "module"'))).toBe(false);
  });

  it('produces no recommendations when fully configured', () => {
    const hints = analyzePackageJsonHints({
      name: 'foo',
      module: './esm/index.js',
      sideEffects: false,
      type: 'module',
    });
    expect(hints.recommendations).toHaveLength(0);
  });
});

// ─── resolveEntry ─────────────────────────────────────────────────────────────

describe('resolveEntry', () => {
  // exports field — subpath map with conditions
  it('reads import condition from exports["."]]', () => {
    expect(
      resolveEntry({
        exports: { '.': { import: './dist/esm/index.js', require: './dist/cjs/index.js' } },
      }),
    ).toBe('./dist/esm/index.js');
  });

  it('reads module condition from exports["."] when import is absent', () => {
    expect(
      resolveEntry({
        exports: { '.': { module: './dist/esm/index.js', require: './dist/cjs/index.js' } },
      }),
    ).toBe('./dist/esm/index.js');
  });

  it('reads default condition from exports["."] when no esm-specific condition', () => {
    expect(resolveEntry({ exports: { '.': { default: './dist/index.js' } } })).toBe(
      './dist/index.js',
    );
  });

  // exports field — flat conditions (no subpath key)
  it('reads import condition from flat exports object', () => {
    expect(
      resolveEntry({ exports: { import: './dist/esm/index.js', require: './dist/cjs/index.js' } }),
    ).toBe('./dist/esm/index.js');
  });

  // exports field — bare string shorthand
  it('reads bare string exports field', () => {
    expect(resolveEntry({ exports: './dist/index.js' })).toBe('./dist/index.js');
  });

  // exports field takes priority over module/main
  it('prefers exports over module and main', () => {
    expect(
      resolveEntry({
        exports: { '.': { import: './esm/index.js' } },
        module: './module/index.js',
        main: './main/index.js',
      }),
    ).toBe('./esm/index.js');
  });

  // fallback chain
  it('falls back to module when no exports field', () => {
    expect(resolveEntry({ module: './dist/index.js', main: './dist/cjs/index.js' })).toBe(
      './dist/index.js',
    );
  });

  it('falls back to main when no exports or module field', () => {
    expect(resolveEntry({ main: './dist/index.js' })).toBe('./dist/index.js');
  });

  it('returns undefined when no entry can be resolved', () => {
    expect(resolveEntry({ name: 'no-entry' })).toBeUndefined();
  });

  // CJS-only exports should be skipped (require-only map with no default)
  it('returns undefined for require-only exports map with no default', () => {
    expect(resolveEntry({ exports: { '.': { require: './dist/cjs/index.js' } } })).toBeUndefined();
  });
});
