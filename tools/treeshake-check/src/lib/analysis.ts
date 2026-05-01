// src/lib/analysis.ts
import type { ModuleAnalysis, PackageJson, PackageJsonHints, SuspectedCause } from './schemas.js';

/**
 * Heuristic detection of common patterns that prevent tree-shaking.
 *
 * This is regex-based and approximate — a rigorous implementation would
 * AST-walk the surviving code. But these patterns catch the vast majority
 * of real-world cases, and labeling them "suspected" makes the uncertainty
 * honest.
 */
export const detectCauses = (code: string): ReadonlyArray<SuspectedCause> => {
  const causes = new Set<SuspectedCause>();

  // CJS contamination — these strings shouldn't appear in clean ESM output
  if (/\b(require\s*\(|module\.exports|exports\.[a-zA-Z_$]|__esModule)/.test(code)) {
    causes.add('CommonJsContamination');
  }

  // Object.defineProperty / Object.assign / prototype mutations
  if (/Object\.(defineProperty|defineProperties|assign|setPrototypeOf|freeze)\s*\(/.test(code)) {
    causes.add('PrototypeMutation');
  }
  if (/\.prototype\.[a-zA-Z_$]+\s*=/.test(code)) {
    causes.add('PrototypeMutation');
  }

  // Top-level assignment to global-ish names
  if (/^\s*(window|globalThis|self|global)\.[a-zA-Z_$]/m.test(code)) {
    causes.add('GlobalAssignment');
  }

  // Bare top-level function call without /*#__PURE__*/ annotation
  // Approximate but catches the common `someInit()` / `extend(Foo, Bar)` case
  const topLevelCall = /^(?!.*\/\*#__PURE__\*\/)\s*[a-zA-Z_$][\w$]*\s*\(/m;
  if (topLevelCall.test(code)) {
    causes.add('UnannotatedCall');
    causes.add('TopLevelSideEffect');
  }

  if (causes.size === 0) causes.add('Unknown');
  return Array.from(causes);
};

/**
 * Build a single ModuleAnalysis from rollup's per-module rendered info.
 */
export const buildModuleAnalysis = (
  id: string,
  m: {
    originalLength: number;
    renderedLength: number;
    renderedExports: ReadonlyArray<string>;
    removedExports: ReadonlyArray<string>;
    code: string | null;
  },
): ModuleAnalysis => ({
  id,
  originalLength: m.originalLength,
  renderedLength: m.renderedLength,
  shakingRatio: m.originalLength === 0 ? 0 : m.renderedLength / m.originalLength,
  renderedExports: [...m.renderedExports],
  removedExports: [...m.removedExports],
  survivingCode: m.code,
  suspectedCauses: m.code ? detectCauses(m.code) : ['Unknown'],
});

/**
 * Inspect a parsed package.json and produce hints + recommendations.
 *
 * The single highest-leverage fix for most real-world libraries is
 * declaring `"sideEffects": false`, so that recommendation comes first.
 */
export const analyzePackageJsonHints = (pkg: PackageJson): PackageJsonHints => {
  const hasSideEffectsField = pkg.sideEffects !== undefined;
  const hasModuleField = pkg.module !== undefined;
  const hasTypeModule = pkg.type === 'module';

  const recommendations: string[] = [];

  if (!hasSideEffectsField) {
    recommendations.push(
      'Add "sideEffects": false to package.json. Without it, bundlers ' +
        'conservatively assume every module may have side effects, which ' +
        'blocks aggressive tree-shaking by consumers.',
    );
  }

  if (!hasModuleField && pkg.main !== undefined) {
    recommendations.push(
      'Add a "module" field pointing to an ESM build. The "main" field ' +
        'traditionally points to CommonJS, which cannot be statically ' +
        'analyzed for tree-shaking.',
    );
  }

  if (!hasTypeModule && !hasModuleField) {
    recommendations.push(
      'Add "type": "module" to package.json, or provide a separate ' +
        '"module" entry for ESM consumers.',
    );
  }

  return {
    hasSideEffectsField,
    sideEffectsValue: pkg.sideEffects,
    hasModuleField,
    hasTypeModule,
    recommendations,
  };
};

/**
 * Default hints for cases where we analyze a raw entry path without a
 * package.json (e.g., when the user passes --entry directly).
 */
export const defaultHints = (): PackageJsonHints => ({
  hasSideEffectsField: false,
  hasModuleField: false,
  hasTypeModule: false,
  recommendations: [],
});
