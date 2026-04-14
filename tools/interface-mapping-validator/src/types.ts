export type ExportKind = 'class' | 'interface' | 'type' | 'enum' | 'function' | 'variable';

export type LegacyExport = {
  readonly name: string;
  readonly kind: ExportKind;
};

export type NewSdkExport = {
  readonly symbol: string;
  readonly packageName: string;
  readonly entryPoint: string;
  readonly importPath: string;
  readonly kind: ExportKind;
};

export type DocumentedMapping = {
  readonly section: string;
  readonly legacySymbol: string;
  readonly newImport: string;
  readonly otherColumns: readonly string[];
  readonly lineNumber: number;
};

export type FindingCategory =
  | 'undocumented-legacy-symbol'
  | 'stale-legacy-symbol'
  | 'undocumented-new-export'
  | 'invalid-import-path'
  | 'missing-callback'
  | 'stale-callback'
  | 'incorrect-import';

export type FindingSeverity = 'error' | 'warning';

export type FindingAction = 'add' | 'remove' | 'update';

export type Finding = {
  readonly category: FindingCategory;
  readonly severity: FindingSeverity;
  readonly section: string;
  readonly message: string;
  readonly action: FindingAction;
  readonly lineNumber?: number;
  readonly suggestedRow?: readonly string[];
};

export type MarkdownExtractionResult = {
  readonly mappings: readonly DocumentedMapping[];
  readonly entryPoints: readonly string[];
};

export type RenamedMapping = {
  readonly new: string;
  readonly package: string;
  readonly type?: boolean;
  readonly note?: string;
};

export type RemovedMapping = {
  readonly status: 'removed';
  readonly note: string;
};

export type InternalMapping = {
  readonly status: 'internal';
  readonly note: string;
};

export type SymbolMapping = RenamedMapping | RemovedMapping | InternalMapping;

export type GeneratedSections = {
  readonly quickReference: string;
  readonly packageMapping: string;
  readonly callbackMapping: string;
  readonly migrationDependencies: string;
  readonly unmapped: readonly string[];
};
