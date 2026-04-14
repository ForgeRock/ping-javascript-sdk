import type {
  Finding,
  FindingAction,
  FindingCategory,
  FindingSeverity,
  LegacyExport,
  MarkdownExtractionResult,
  NewSdkExport,
} from './types.js';
import { PROTECTED_PREFIXES, SECTIONS } from './config.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Constructs a Finding object with the given metadata, optionally including a line number.
 *
 * @param category - The classification of the finding (e.g., undocumented-legacy-symbol).
 * @param severity - Whether this is an error or warning.
 * @param section - The markdown section where the finding applies.
 * @param message - Human-readable description of the issue.
 * @param action - The suggested remediation action (add, remove, or update).
 * @param lineNumber - Optional 1-based line number in the markdown file.
 * @returns A fully constructed Finding object.
 */
function makeFinding(
  category: FindingCategory,
  severity: FindingSeverity,
  section: string,
  message: string,
  action: FindingAction,
  lineNumber?: number,
): Finding {
  const base: Finding = { category, severity, section, message, action };
  return lineNumber !== undefined ? { ...base, lineNumber } : base;
}

/**
 * Checks whether a documented mapping should be excluded from drift detection because it uses a protected prefix.
 *
 * @param mapping - A mapping with a newImport field to check against protected prefixes.
 * @returns True if the mapping's import path starts with any protected prefix.
 */
function isProtected(mapping: { readonly newImport: string }): boolean {
  return PROTECTED_PREFIXES.some((prefix) => mapping.newImport.startsWith(prefix));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compares legacy exports, new SDK exports, and the documented mappings to detect drift between them.
 *
 * @param legacy - Exports extracted from the legacy SDK.
 * @param newSdk - Exports extracted from the new SDK packages.
 * @param documented - Mappings and entry points extracted from the interface_mapping.md file.
 * @returns A list of findings describing undocumented, stale, or invalid entries.
 */
export function diff(
  legacy: LegacyExport[],
  newSdk: NewSdkExport[],
  documented: MarkdownExtractionResult,
): Finding[] {
  const quickRefMappings = documented.mappings.filter(
    (m) => m.section === SECTIONS.QUICK_REFERENCE,
  );
  const callbackMappings = documented.mappings.filter((m) => m.section === SECTIONS.CALLBACKS);

  // Sets for efficient lookup
  const legacyNames = new Set(legacy.map((e) => e.name));
  const documentedLegacySymbols = new Set(quickRefMappings.map((m) => m.legacySymbol));
  const newSdkImportPaths = new Set(newSdk.map((e) => e.importPath));
  const documentedCallbackSymbols = new Set(callbackMappings.map((m) => m.legacySymbol));
  // Also extract new symbol names from the "New Import" column to handle renames (e.g. FRCallback -> BaseCallback)
  const documentedCallbackNewSymbols = new Set(
    callbackMappings
      .map((m) => {
        const match = /import\s+(?:type\s+)?{\s*(\w+)\s*}/.exec(m.newImport);
        return match?.[1];
      })
      .filter(Boolean),
  );
  // Merge: a callback is documented if its legacy OR new name appears in the table
  const allDocumentedCallbackSymbols = new Set([
    ...documentedCallbackSymbols,
    ...documentedCallbackNewSymbols,
  ]);

  // 1. Undocumented legacy symbols: in legacy SDK but not in Quick Reference
  const undocumentedLegacy = Array.from(legacyNames)
    .filter((name) => !documentedLegacySymbols.has(name))
    .map((name) =>
      makeFinding(
        'undocumented-legacy-symbol',
        'error',
        SECTIONS.QUICK_REFERENCE,
        `Legacy symbol "${name}" is not documented in ${SECTIONS.QUICK_REFERENCE}`,
        'add',
      ),
    );

  // 2. Stale legacy symbols: in Quick Reference but not in legacy SDK (skip protected)
  //    Also skip "new-only" symbols — documented symbols that exist in the new SDK
  //    but have no legacy counterpart (e.g. OidcClient). These are intentionally new.
  const newSdkSymbols = new Set(newSdk.map((e) => e.symbol));
  const staleLegacy = quickRefMappings
    .filter(
      (m) =>
        !isProtected(m) &&
        !m.legacySymbol.startsWith('@') &&
        !legacyNames.has(m.legacySymbol) &&
        !newSdkSymbols.has(m.legacySymbol),
    )
    .map((m) =>
      makeFinding(
        'stale-legacy-symbol',
        'error',
        SECTIONS.QUICK_REFERENCE,
        `Documented symbol "${m.legacySymbol}" is not exported by the legacy SDK`,
        'remove',
        m.lineNumber,
      ),
    );

  // 3. Invalid import paths: documented import path not in new SDK export paths
  //    Skip @forgerock/javascript-sdk paths and protected entries
  const invalidPaths = documented.mappings
    .filter(
      (m) =>
        !isProtected(m) &&
        !m.newImport.startsWith('@forgerock/javascript-sdk') &&
        m.newImport.startsWith('@') &&
        !newSdkImportPaths.has(m.newImport),
    )
    .map((m) =>
      makeFinding(
        'invalid-import-path',
        'error',
        m.section,
        `Import path "${m.newImport}" is not a valid new SDK export path`,
        'update',
        m.lineNumber,
      ),
    );

  // 4. Missing callbacks: callback from journey-client/types not in Callback Type Mapping
  const callbackExports = newSdk.filter(
    (e) => e.importPath === '@forgerock/journey-client/types' && e.symbol.endsWith('Callback'),
  );

  const missingCallbacks = callbackExports
    .filter((cb) => !allDocumentedCallbackSymbols.has(cb.symbol))
    .map((cb) =>
      makeFinding(
        'missing-callback',
        'error',
        SECTIONS.CALLBACKS,
        `Callback "${cb.symbol}" from ${cb.entryPoint} is not documented in ${SECTIONS.CALLBACKS}`,
        'add',
      ),
    );

  // 5. Stale callbacks: in Callback Type Mapping but not exported
  const callbackExportSymbols = new Set(callbackExports.map((e) => e.symbol));

  const staleCallbacks = callbackMappings
    .filter((m) => {
      if (isProtected(m)) return false;
      // Check both legacy name AND new name from the import column
      if (callbackExportSymbols.has(m.legacySymbol)) return false;
      const newMatch = /import\s+(?:type\s+)?{\s*(\w+)\s*}/.exec(m.newImport);
      if (newMatch?.[1] && callbackExportSymbols.has(newMatch[1])) return false;
      return true;
    })
    .map((m) =>
      makeFinding(
        'stale-callback',
        'error',
        SECTIONS.CALLBACKS,
        `Documented callback "${m.legacySymbol}" is not exported by the new SDK`,
        'remove',
        m.lineNumber,
      ),
    );

  // 6. Undocumented new exports: in new SDK main entry points but not referenced in doc
  const documentedImportPaths = new Set(documented.entryPoints);
  const IMPORT_SYMBOL_RE = /import\s+(?:type\s+)?{\s*(\w+)\s*}\s+from/;
  const allDocumentedSymbols = new Set([
    ...documented.mappings.map((m) => m.legacySymbol),
    ...documented.mappings.flatMap((m) => {
      const match = m.newImport.match(IMPORT_SYMBOL_RE);
      return match ? [match[1] ?? ''] : [];
    }),
  ]);

  const undocumentedNew = newSdk
    .filter(
      (exp) => documentedImportPaths.has(exp.importPath) && !allDocumentedSymbols.has(exp.symbol),
    )
    .map((exp) =>
      makeFinding(
        'undocumented-new-export',
        'warning',
        SECTIONS.QUICK_REFERENCE,
        `New SDK export "${exp.symbol}" from ${exp.entryPoint} is not referenced in the documentation`,
        'add',
      ),
    );

  return [
    ...undocumentedLegacy,
    ...staleLegacy,
    ...invalidPaths,
    ...missingCallbacks,
    ...staleCallbacks,
    ...undocumentedNew,
  ];
}
