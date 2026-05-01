// src/lib/schemas.ts
import { Schema } from 'effect';

// ─── package.json (the bits we care about) ───────────────────────────────────

export const SideEffectsValue = Schema.Union(Schema.Boolean, Schema.Array(Schema.String));

export const PackageJson = Schema.Struct({
  name: Schema.optional(Schema.String),
  module: Schema.optional(Schema.String),
  main: Schema.optional(Schema.String),
  type: Schema.optional(Schema.Literal('module', 'commonjs')),
  sideEffects: Schema.optional(SideEffectsValue),
  dependencies: Schema.optional(Schema.Unknown),
  peerDependencies: Schema.optional(Schema.Unknown),
  devDependencies: Schema.optional(Schema.Unknown),
});
export type PackageJson = typeof PackageJson.Type;

// JSON-string → validated PackageJson in one shot
export const PackageJsonFromString = Schema.parseJson(PackageJson);

// ─── Per-module analysis ─────────────────────────────────────────────────────

export const SuspectedCause = Schema.Literal(
  'TopLevelSideEffect',
  'PrototypeMutation',
  'GlobalAssignment',
  'CommonJsContamination',
  'UnannotatedCall',
  'Unknown',
);
export type SuspectedCause = typeof SuspectedCause.Type;

export const ModuleAnalysis = Schema.Struct({
  id: Schema.String,
  originalLength: Schema.Number,
  renderedLength: Schema.Number,
  // 0 = fully shaken, 1 = nothing shaken
  shakingRatio: Schema.Number,
  renderedExports: Schema.Array(Schema.String),
  removedExports: Schema.Array(Schema.String),
  survivingCode: Schema.NullOr(Schema.String),
  suspectedCauses: Schema.Array(SuspectedCause),
});
export type ModuleAnalysis = typeof ModuleAnalysis.Type;

// ─── Rollup warnings (captured during build) ─────────────────────────────────

export const RollupWarning = Schema.Struct({
  code: Schema.optional(Schema.String),
  message: Schema.String,
  id: Schema.optional(Schema.String),
  loc: Schema.optional(
    Schema.Struct({
      file: Schema.optional(Schema.String),
      line: Schema.Number,
      column: Schema.Number,
    }),
  ),
});
export type RollupWarning = typeof RollupWarning.Type;

// ─── package.json hints ──────────────────────────────────────────────────────

export const PackageJsonHints = Schema.Struct({
  hasSideEffectsField: Schema.Boolean,
  sideEffectsValue: Schema.optional(SideEffectsValue),
  hasModuleField: Schema.Boolean,
  hasTypeModule: Schema.Boolean,
  recommendations: Schema.Array(Schema.String),
});
export type PackageJsonHints = typeof PackageJsonHints.Type;

// ─── Top-level result ────────────────────────────────────────────────────────

export const TreeshakeResult = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal('FullyTreeshakeable'),
    hints: PackageJsonHints,
  }),
  Schema.Struct({
    _tag: Schema.Literal('HasSideEffects'),
    totalOriginalBytes: Schema.Number,
    totalRenderedBytes: Schema.Number,
    modules: Schema.Array(ModuleAnalysis),
    warnings: Schema.Array(RollupWarning),
    hints: PackageJsonHints,
    unshakenCode: Schema.String,
  }),
);
export type TreeshakeResult = typeof TreeshakeResult.Type;
