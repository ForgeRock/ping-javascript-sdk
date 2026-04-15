import type {
  LegacyExport,
  NewSdkExport,
  SymbolMapping,
  RenamedMapping,
  GeneratedSections,
} from './types.js';

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/**
 * Checks whether a symbol mapping represents a rename (symbol exists in the new SDK under a different name or package).
 *
 * @param m - The symbol mapping to check.
 * @returns True if the mapping contains `new` and `package` fields indicating a rename.
 */
function isRenamed(m: SymbolMapping): m is RenamedMapping {
  return 'new' in m && 'package' in m;
}

/**
 * Checks whether a symbol mapping indicates the symbol was removed from the new SDK.
 *
 * @param m - The symbol mapping to check.
 * @returns True if the mapping has status 'removed'.
 */
function isRemoved(m: SymbolMapping): m is { readonly status: 'removed'; readonly note: string } {
  return 'status' in m && m.status === 'removed';
}

/**
 * Checks whether a symbol mapping indicates the symbol is internal and not publicly exported.
 *
 * @param m - The symbol mapping to check.
 * @returns True if the mapping has status 'internal'.
 */
function isInternal(m: SymbolMapping): m is { readonly status: 'internal'; readonly note: string } {
  return 'status' in m && m.status === 'internal';
}

// ---------------------------------------------------------------------------
// Row formatters
// ---------------------------------------------------------------------------

/**
 * Formats a symbol and package into a backtick-wrapped import statement for use in markdown tables.
 *
 * @param symbol - The symbol name being imported.
 * @param pkg - The package path to import from.
 * @param isType - Whether to use `import type` instead of `import`.
 * @returns A markdown-formatted inline code import statement.
 */
function importStatement(symbol: string, pkg: string, isType: boolean): string {
  const keyword = isType ? 'import type' : 'import';
  return `\`${keyword} { ${symbol} } from '${pkg}'\``;
}

/**
 * Formats a Quick Reference table row with a backtick-wrapped legacy symbol and its replacement.
 *
 * @param legacy - The legacy symbol name.
 * @param rhs - The right-hand side content describing the new SDK equivalent.
 * @returns A formatted markdown table row.
 */
function quickRefRow(legacy: string, rhs: string): string {
  return `| \`${legacy}\` | ${rhs} |`;
}

/**
 * Formats a Quick Reference row for a renamed symbol, including its new import path and optional note.
 *
 * @param legacyName - The original legacy symbol name.
 * @param m - The rename mapping containing the new symbol name, package, and optional note.
 * @returns A formatted markdown table row.
 */
function formatRenamedQuickRef(legacyName: string, m: RenamedMapping): string {
  const note = m.note ? ` — ${m.note}` : '';
  if (m.package === '') {
    return quickRefRow(legacyName, `\`${m.new}\`${note}`);
  }
  return quickRefRow(legacyName, `${importStatement(m.new, m.package, m.type === true)}${note}`);
}

/**
 * Formats a Quick Reference row for a symbol that has been removed from the new SDK.
 *
 * @param legacyName - The original legacy symbol name.
 * @param note - An explanation of why it was removed or what to use instead.
 * @returns A formatted markdown table row.
 */
function formatRemovedQuickRef(legacyName: string, note: string): string {
  return quickRefRow(legacyName, `Removed — ${note}`);
}

/**
 * Formats a Quick Reference row for a symbol that is internal and not publicly exported.
 *
 * @param legacyName - The original legacy symbol name.
 * @param note - An explanation of the symbol's internal status.
 * @returns A formatted markdown table row.
 */
function formatInternalQuickRef(legacyName: string, note: string): string {
  return quickRefRow(legacyName, `Not exported — ${note}`);
}

/**
 * Formats a Quick Reference row for a callback that auto-matches to `@forgerock/journey-client/types`.
 *
 * @param name - The callback symbol name (same in both legacy and new SDK).
 * @returns A formatted markdown table row.
 */
function formatAutoCallbackQuickRef(name: string): string {
  return quickRefRow(name, `${importStatement(name, '@forgerock/journey-client/types', false)}`);
}

/**
 * Formats a Quick Reference row for a symbol that auto-matches 1:1 by name in the new SDK.
 *
 * @param name - The symbol name (same in both legacy and new SDK).
 * @param importPath - The new SDK import path where the symbol is found.
 * @returns A formatted markdown table row.
 */
function formatAutoMatchQuickRef(name: string, importPath: string): string {
  return quickRefRow(name, `${importStatement(name, importPath, false)}`);
}

// ---------------------------------------------------------------------------
// Index builders
// ---------------------------------------------------------------------------

/**
 * Builds a lookup index from symbol name to its new SDK export for fast auto-matching.
 *
 * @param newSdk - The full list of new SDK exports.
 * @returns A map from symbol name to its NewSdkExport entry (last-write-wins for duplicates).
 */
function buildNewSdkIndex(newSdk: readonly NewSdkExport[]): Map<string, NewSdkExport> {
  return new Map(newSdk.map((exp) => [exp.symbol, exp] as const));
}

/**
 * Checks whether a new SDK export is a callback type from the journey-client/types entry point.
 *
 * @param exp - The new SDK export to check.
 * @returns True if the export is from `@forgerock/journey-client/types` and ends with "Callback".
 */
function isCallbackFromJourneyClient(exp: NewSdkExport): boolean {
  return exp.importPath === '@forgerock/journey-client/types' && exp.symbol.endsWith('Callback');
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

const LEGACY_PKG = '@forgerock/javascript-sdk';

const QR_HEADER = '| Legacy Symbol | New SDK Equivalent |';
const QR_SEP = '| --- | --- |';

const PKG_HEADER = '| Legacy Import | New Import | Notes |';
const PKG_SEP = '| --- | --- | --- |';

const CB_HEADER = '| Legacy Import | New Import | Notes |';
const CB_SEP = '| --- | --- | --- |';

const MIG_HEADER = '| Legacy | New | Purpose |';
const MIG_SEP = '| --- | --- | --- |';

/**
 * Purpose descriptions for new SDK packages, used in the MIGRATION.md dependencies table.
 */
const PACKAGE_PURPOSES: Record<string, string> = {
  '@forgerock/journey-client': 'Authentication tree/journey flows',
  '@forgerock/oidc-client': 'OAuth2/OIDC token management, user info, logout',
  '@forgerock/device-client': 'Device profile & management (OATH, Push, WebAuthn, Bound, Profile)',
  '@forgerock/protect': 'PingOne Protect/Signals integration',
  '@forgerock/sdk-types': 'Shared types and enums',
  '@forgerock/sdk-utilities': 'URL, string, and OIDC utilities',
  '@forgerock/sdk-logger': 'Logging abstraction',
  '@forgerock/storage': 'Storage abstraction',
};

/**
 * Generates the Quick Reference, Package Mapping, and Callback Mapping markdown table sections
 * by combining legacy exports, new SDK exports, and the manual symbol/package configuration.
 *
 * @param legacy - Exports extracted from the legacy SDK.
 * @param newSdk - Exports extracted from the new SDK packages.
 * @param config - Manual symbol mapping configuration (renames, removals, internals).
 * @param packageMap - Optional package-level mappings (e.g., legacy package to new package).
 * @returns Generated markdown table strings for each section, plus a list of unmapped symbols.
 */
export function generateSections(
  legacy: LegacyExport[],
  newSdk: NewSdkExport[],
  config: Record<string, SymbolMapping>,
  packageMap?: Record<string, { new: string; note?: string }>,
): GeneratedSections {
  const newSdkIndex = buildNewSdkIndex(newSdk);

  // Process each legacy export into { qr, pkg, unmapped } per symbol
  const processed = legacy.map(({ name }) => {
    const mapping = config[name];

    if (mapping !== undefined) {
      if (isRenamed(mapping)) {
        const qr = formatRenamedQuickRef(name, mapping);
        const pkg =
          mapping.package !== ''
            ? `| \`${mapping.type === true ? 'import type' : 'import'} { ${name} } from '${LEGACY_PKG}'\` | \`${mapping.type === true ? 'import type' : 'import'} { ${mapping.new} } from '${mapping.package}'\` | ${name} |`
            : null;
        return { qr, pkg, unmapped: null as string | null };
      } else if (isRemoved(mapping)) {
        return {
          qr: formatRemovedQuickRef(name, mapping.note),
          pkg: null,
          unmapped: null as string | null,
        };
      } else if (isInternal(mapping)) {
        return {
          qr: formatInternalQuickRef(name, mapping.note),
          pkg: null,
          unmapped: null as string | null,
        };
      }
    }

    // Auto-match
    const sdkExport = newSdkIndex.get(name);
    if (
      name.endsWith('Callback') &&
      sdkExport !== undefined &&
      sdkExport.importPath === '@forgerock/journey-client/types'
    ) {
      return { qr: formatAutoCallbackQuickRef(name), pkg: null, unmapped: null as string | null };
    } else if (sdkExport !== undefined) {
      return {
        qr: formatAutoMatchQuickRef(name, sdkExport.importPath),
        pkg: null,
        unmapped: null as string | null,
      };
    }

    return { qr: null as string | null, pkg: null, unmapped: name as string | null };
  });

  const packageMapRows =
    packageMap !== undefined
      ? Object.entries(packageMap).map(([legacyPkg, info]) => {
          const note = info.note ? ` — ${info.note}` : '';
          return `| \`${legacyPkg}\` | \`${info.new}\`${note} |`;
        })
      : [];

  const qrRows = [...processed.flatMap((p) => (p.qr !== null ? [p.qr] : [])), ...packageMapRows];
  const pkgRows = processed.flatMap((p) => (p.pkg !== null ? [p.pkg] : []));
  const unmapped = processed.flatMap((p) => (p.unmapped !== null ? [p.unmapped] : []));

  // Build callback mapping from newSdk
  const cbRows = newSdk
    .filter(isCallbackFromJourneyClient)
    .map(
      (exp) =>
        `| \`import { ${exp.symbol} } from '${LEGACY_PKG}'\` | \`import { ${exp.symbol} } from '${exp.importPath}'\` | None |`,
    );

  // Build migration dependencies table (unique target packages)
  const configEntries = Object.values(config)
    .filter((m): m is RenamedMapping => isRenamed(m) && m.package !== '')
    .map((m) => ({
      legacy: LEGACY_PKG,
      basePkg: m.package.split('/').slice(0, 2).join('/'),
    }));

  const packageMapEntries =
    packageMap !== undefined
      ? Object.entries(packageMap).map(([legacyPkg, info]) => ({
          legacy: legacyPkg,
          basePkg: info.new,
          note: info.note,
        }))
      : [];

  const migRows = [...configEntries, ...packageMapEntries].reduce<{
    readonly seen: ReadonlySet<string>;
    readonly rows: readonly string[];
  }>(
    (acc, entry) => {
      if (acc.seen.has(entry.basePkg)) return acc;
      const purpose =
        PACKAGE_PURPOSES[entry.basePkg] ??
        ('note' in entry ? (entry.note ?? entry.basePkg) : entry.basePkg);
      return {
        seen: new Set([...acc.seen, entry.basePkg]),
        rows: [...acc.rows, `| \`${entry.legacy}\` | \`${entry.basePkg}\` | ${purpose} |`],
      };
    },
    { seen: new Set<string>(), rows: [] as readonly string[] },
  ).rows;

  // Assemble tables
  const quickReference = [QR_HEADER, QR_SEP, ...qrRows].join('\n');
  const packageMapping = [PKG_HEADER, PKG_SEP, ...pkgRows].join('\n');
  const callbackMapping = [CB_HEADER, CB_SEP, ...cbRows].join('\n');
  const migrationDependencies = [MIG_HEADER, MIG_SEP, ...migRows].join('\n');

  return { quickReference, packageMapping, callbackMapping, migrationDependencies, unmapped };
}
