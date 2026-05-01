import type { SuspectedCause } from './schemas.js';

export interface CauseExplanation {
  /** One-line description of what was detected. */
  readonly summary: string;
  /** Why this prevents tree-shaking. */
  readonly why: string;
  /** Concrete steps the user can take. */
  readonly fix: ReadonlyArray<string>;
  /** Optional code example showing the fix. */
  readonly example?: { before: string; after: string };
}

export const EXPLANATIONS: Record<SuspectedCause, CauseExplanation> = {
  EnumPattern: {
    summary: 'TypeScript enum',
    why:
      'TypeScript compiles `enum` declarations into an IIFE that mutates a ' +
      'module-scoped variable. Rollup sees the mutation and conservatively ' +
      'assumes the module has observable side effects, even when no one is ' +
      'using the enum.',
    fix: [
      'Replace `enum` with an `as const` object plus a derived type. This ' +
        'compiles to a plain object literal that Rollup can statically analyze.',
      'For published packages, also add `"sideEffects": false` to ' +
        'package.json so consumers benefit from the change.',
    ],
    example: {
      before: 'export enum StepType {\n' + '  LOGIN = "LOGIN",\n' + '  LOGOUT = "LOGOUT",\n' + '}',
      after:
        'export const StepType = {\n' +
        '  LOGIN: "LOGIN",\n' +
        '  LOGOUT: "LOGOUT",\n' +
        '} as const;\n' +
        'export type StepType = typeof StepType[keyof typeof StepType];',
    },
  },

  PrototypeMutation: {
    summary: 'prototype or property mutation at module scope',
    why:
      'Calls like `Object.defineProperty`, `Object.assign`, or assignments ' +
      'to `.prototype` at the top level run when the module is imported, so ' +
      'Rollup keeps them in the bundle.',
    fix: [
      'Move the mutation inside a function that callers explicitly invoke.',
      'If the call is genuinely pure (e.g., defining a property on a ' +
        'module-local object), wrap it in a `/*#__PURE__*/` annotation.',
      'For library code that legitimately needs side effects on import ' +
        "(polyfills, registrations), declare the file in `package.json`'s " +
        "`sideEffects` array so it's explicitly opted in.",
    ],
  },

  GlobalAssignment: {
    summary: 'assignment to a global object',
    why:
      'Assignments to `window`, `globalThis`, `self`, or `global` at module ' +
      'scope are observable side effects — they affect state outside the ' +
      'module — and can never be tree-shaken.',
    fix: [
      'If this is a polyfill or registration, declare the file in ' +
        "`package.json`'s `sideEffects` array so consumers know it has to run.",
      'If the global assignment is opportunistic (e.g., exposing a debug API), ' +
        'consider moving it to a separately-imported entry point so the main ' +
        'entry stays shakeable.',
    ],
  },

  CommonJsContamination: {
    summary: 'CommonJS code in the bundle',
    why:
      '`require()`, `module.exports`, and `__esModule` markers indicate ' +
      "CommonJS code, which Rollup can't statically analyze for tree-shaking. " +
      'This usually means a transitive dependency ships only CJS, or your ' +
      'build is producing CJS output.',
    fix: [
      'Verify your build emits ESM. Check `package.json` for a `"module"` ' +
        'field or `"type": "module"`.',
      'If a dependency is the source, look for an ESM-only alternative or ' +
        'check whether the dep has an `exports` field with an `import` condition.',
      'For unavoidable CJS deps, mark them as external in your build so they ' +
        "don't get bundled into your output.",
    ],
  },

  UnannotatedCall: {
    summary: 'top-level function call',
    why:
      'A bare function call at module scope is treated as side-effectful by ' +
      "default — Rollup doesn't know whether the call mutates state, prints " +
      'to console, or registers something globally.',
    fix: [
      'If you know the call is pure, prefix it with `/*#__PURE__*/`:\n' +
        '    const result = /*#__PURE__*/ computeOnce();',
      'If the call genuinely has side effects, move it inside a function ' +
        'that consumers explicitly invoke.',
    ],
  },

  TopLevelSideEffect: {
    summary: 'top-level statement with side effects',
    why:
      'Some statement at the top of the module runs when imported and ' +
      "Rollup can't prove it's safe to eliminate.",
    fix: [
      'Move side-effecting code into an exported function.',
      'For pure expressions, wrap them in `/*#__PURE__*/`.',
    ],
  },

  Unknown: {
    summary: 'unknown side effect',
    why:
      "The heuristic patterns didn't match this code, but Rollup decided to " +
      'keep it. Look at the surviving code below to identify the cause manually.',
    fix: [
      'Read the surviving code in the breakdown above to identify the side effect.',
      'Common causes the heuristic might miss: getters, decorators, ' +
        'destructuring with defaults, or class field initializers.',
    ],
  },
};

/**
 * Pick the most informative cause when a module has multiple labels.
 * EnumPattern wins over UnannotatedCall, etc., so users get the most
 * specific explanation rather than a generic one.
 */
export const primaryCause = (causes: ReadonlyArray<SuspectedCause>): SuspectedCause => {
  const priority: ReadonlyArray<SuspectedCause> = [
    'EnumPattern',
    'CommonJsContamination',
    'GlobalAssignment',
    'PrototypeMutation',
    'UnannotatedCall',
    'TopLevelSideEffect',
    'Unknown',
  ];
  for (const p of priority) {
    if (causes.includes(p)) return p;
  }
  return 'Unknown';
};
