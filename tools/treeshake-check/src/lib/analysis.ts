// src/lib/analysis.ts
import * as acorn from 'acorn';
import type { ModuleAnalysis, PackageJson, PackageJsonHints, SuspectedCause } from './schemas.js';

// Walk the AST to find top-level ExpressionStatement → CallExpression nodes
// that are not preceded by a /*#__PURE__*/ annotation. Falls back to a regex
// heuristic when acorn cannot parse the code (e.g. unparseable rollup output).
const detectTopLevelCall = (code: string): boolean => {
  let ast: acorn.Program;
  try {
    ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
  } catch {
    const topLevelCall = /^(?!.*\/\*#__PURE__\*\/)\s*[a-zA-Z_$][\w$]*\s*\(/m;
    return topLevelCall.test(code);
  }

  return ast.body.some((node) => {
    if (node.type !== 'ExpressionStatement') return false;
    const expr = (node as acorn.ExpressionStatement).expression;
    if (expr.type !== 'CallExpression') return false;

    // Check for a /*#__PURE__*/ annotation immediately before this node
    const preceding = code.slice(0, node.start);
    const annotationIdx = preceding.lastIndexOf('/*#__PURE__*/');
    if (annotationIdx === -1) return true;
    const between = preceding.slice(annotationIdx + '/*#__PURE__*/'.length);
    return !/^\s*$/.test(between);
  });
};

export const detectCauses = (code: string): ReadonlyArray<SuspectedCause> => {
  const causes = new Set<SuspectedCause>();

  // TypeScript enum IIFE: `(function (X) { ... })(X || (X = {}));`
  if (
    /\(function\s*\([A-Z_$][\w$]*\)\s*\{[\s\S]*?\}\)\s*\(\s*[A-Z_$][\w$]*\s*\|\|\s*\(\s*[A-Z_$][\w$]*\s*=\s*\{\s*\}\s*\)\s*\)/.test(
      code,
    )
  ) {
    causes.add('EnumPattern');
  }

  // CJS contamination
  if (/\b(require\s*\(|module\.exports|exports\.[a-zA-Z_$]|__esModule)/.test(code)) {
    causes.add('CommonJsContamination');
  }

  // Prototype mutations / Object.defineProperty
  if (/Object\.(defineProperty|defineProperties|assign|setPrototypeOf|freeze)\s*\(/.test(code)) {
    causes.add('PrototypeMutation');
  }
  if (/\.prototype\.[a-zA-Z_$]+\s*=/.test(code)) {
    causes.add('PrototypeMutation');
  }

  // Global assignment
  if (/^\s*(window|globalThis|self|global)\.[a-zA-Z_$]/m.test(code)) {
    causes.add('GlobalAssignment');
  }

  // Bare top-level call without /*#__PURE__*/ — AST-based, regex fallback
  if (!causes.has('EnumPattern') && detectTopLevelCall(code)) {
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
