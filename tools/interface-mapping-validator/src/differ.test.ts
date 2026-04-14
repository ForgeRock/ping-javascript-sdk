import { describe, it, expect } from 'vitest';
import { diff } from './differ.js';
import type { LegacyExport, NewSdkExport, MarkdownExtractionResult } from './types.js';
import { SECTIONS } from './config.js';

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function makeLegacy(names: string[]): LegacyExport[] {
  return names.map((name) => ({ name, kind: 'variable' as const }));
}

function makeNewSdk(
  entries: Array<{
    symbol: string;
    importPath: string;
    entryPoint?: string;
    packageName?: string;
  }>,
): NewSdkExport[] {
  return entries.map(({ symbol, importPath, entryPoint, packageName }) => ({
    symbol,
    importPath,
    // entryPoint is the package.json exports key (e.g. "./types"), not the full import path
    entryPoint: entryPoint ?? '.',
    packageName: packageName ?? importPath.split('/').slice(0, 2).join('/'),
    kind: 'variable' as const,
  }));
}

function makeDoc(
  mappings: Array<{
    section: string;
    legacySymbol: string;
    newImport: string;
    lineNumber: number;
  }>,
  entryPoints?: string[],
): MarkdownExtractionResult {
  return {
    mappings: mappings.map((m) => ({
      ...m,
      otherColumns: [],
    })),
    entryPoints: entryPoints ?? [],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('diff', () => {
  it('returns no findings when everything is aligned', () => {
    const legacy = makeLegacy(['FRAuth', 'Config']);
    const newSdk = makeNewSdk([
      { symbol: 'FRAuth', importPath: '@anthropic/journey-client' },
      { symbol: 'Config', importPath: '@anthropic/oidc-client' },
    ]);
    const documented = makeDoc(
      [
        {
          section: SECTIONS.QUICK_REFERENCE,
          legacySymbol: 'FRAuth',
          newImport: '@anthropic/journey-client',
          lineNumber: 10,
        },
        {
          section: SECTIONS.QUICK_REFERENCE,
          legacySymbol: 'Config',
          newImport: '@anthropic/oidc-client',
          lineNumber: 11,
        },
      ],
      ['@anthropic/journey-client', '@anthropic/oidc-client'],
    );

    const findings = diff(legacy, newSdk, documented);
    expect(findings).toEqual([]);
  });

  it('reports undocumented legacy symbols', () => {
    const legacy = makeLegacy(['FRAuth', 'UndocumentedThing']);
    const newSdk = makeNewSdk([{ symbol: 'FRAuth', importPath: '@anthropic/journey-client' }]);
    const documented = makeDoc([
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'FRAuth',
        newImport: '@anthropic/journey-client',
        lineNumber: 10,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const undoc = findings.filter((f) => f.category === 'undocumented-legacy-symbol');

    expect(undoc).toHaveLength(1);
    expect(undoc[0].severity).toBe('error');
    expect(undoc[0].action).toBe('add');
    expect(undoc[0].message).toContain('UndocumentedThing');
  });

  it('reports stale legacy symbols with lineNumber', () => {
    const legacy = makeLegacy(['FRAuth']);
    const newSdk = makeNewSdk([{ symbol: 'FRAuth', importPath: '@anthropic/journey-client' }]);
    const documented = makeDoc([
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'FRAuth',
        newImport: '@anthropic/journey-client',
        lineNumber: 10,
      },
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'ObsoleteSymbol',
        newImport: '@anthropic/oidc-client',
        lineNumber: 15,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const stale = findings.filter((f) => f.category === 'stale-legacy-symbol');

    expect(stale).toHaveLength(1);
    expect(stale[0].severity).toBe('error');
    expect(stale[0].action).toBe('remove');
    expect(stale[0].lineNumber).toBe(15);
    expect(stale[0].message).toContain('ObsoleteSymbol');
  });

  it('does NOT report "Removed" entries as stale', () => {
    const legacy = makeLegacy(['FRAuth']);
    const newSdk = makeNewSdk([{ symbol: 'FRAuth', importPath: '@anthropic/journey-client' }]);
    const documented = makeDoc([
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'FRAuth',
        newImport: '@anthropic/journey-client',
        lineNumber: 10,
      },
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'OldThing',
        newImport: 'Removed - no longer needed',
        lineNumber: 20,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const stale = findings.filter((f) => f.category === 'stale-legacy-symbol');

    expect(stale).toHaveLength(0);
  });

  it('does NOT report "Not exported" entries as stale', () => {
    const legacy = makeLegacy(['FRAuth']);
    const newSdk = makeNewSdk([{ symbol: 'FRAuth', importPath: '@anthropic/journey-client' }]);
    const documented = makeDoc([
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'FRAuth',
        newImport: '@anthropic/journey-client',
        lineNumber: 10,
      },
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'InternalHelper',
        newImport: 'Not exported - use X instead',
        lineNumber: 25,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const stale = findings.filter((f) => f.category === 'stale-legacy-symbol');

    expect(stale).toHaveLength(0);
  });

  it('does NOT flag new-only symbols (in new SDK but not legacy) as stale', () => {
    const legacy = makeLegacy(['FRAuth']);
    const newSdk = makeNewSdk([
      { symbol: 'FRAuth', importPath: '@anthropic/journey-client' },
      { symbol: 'OidcClient', importPath: '@anthropic/oidc-client' },
    ]);
    // OidcClient is documented but has no legacy counterpart — it's a new type
    const documented = makeDoc([
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'FRAuth',
        newImport: '@anthropic/journey-client',
        lineNumber: 10,
      },
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'OidcClient',
        newImport: '@anthropic/oidc-client',
        lineNumber: 20,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const stale = findings.filter((f) => f.category === 'stale-legacy-symbol');

    // OidcClient should NOT be flagged — it exists in the new SDK
    expect(stale).toHaveLength(0);
  });

  it('reports invalid import paths', () => {
    const legacy = makeLegacy(['FRAuth']);
    const newSdk = makeNewSdk([{ symbol: 'FRAuth', importPath: '@anthropic/journey-client' }]);
    const documented = makeDoc([
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'FRAuth',
        newImport: '@anthropic/nonexistent-package',
        lineNumber: 10,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const invalid = findings.filter((f) => f.category === 'invalid-import-path');

    expect(invalid).toHaveLength(1);
    expect(invalid[0].severity).toBe('error');
    expect(invalid[0].action).toBe('update');
    expect(invalid[0].message).toContain('@anthropic/nonexistent-package');
  });

  it('skips @forgerock/javascript-sdk paths for invalid import check', () => {
    const legacy = makeLegacy(['FRAuth']);
    const newSdk = makeNewSdk([{ symbol: 'FRAuth', importPath: '@anthropic/journey-client' }]);
    const documented = makeDoc([
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'FRAuth',
        newImport: '@forgerock/javascript-sdk',
        lineNumber: 10,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const invalid = findings.filter((f) => f.category === 'invalid-import-path');

    expect(invalid).toHaveLength(0);
  });

  it('reports missing callbacks', () => {
    const legacy = makeLegacy([]);
    const newSdk = makeNewSdk([
      {
        symbol: 'NameCallback',
        importPath: '@forgerock/journey-client/types',
        entryPoint: './types',
      },
      {
        symbol: 'PasswordCallback',
        importPath: '@forgerock/journey-client/types',
        entryPoint: './types',
      },
    ]);
    const documented = makeDoc([
      {
        section: SECTIONS.CALLBACKS,
        legacySymbol: 'NameCallback',
        newImport: '@forgerock/journey-client/types',
        lineNumber: 50,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const missing = findings.filter((f) => f.category === 'missing-callback');

    expect(missing).toHaveLength(1);
    expect(missing[0].severity).toBe('error');
    expect(missing[0].action).toBe('add');
    expect(missing[0].message).toContain('PasswordCallback');
  });

  it('callback detection only matches journey-client/types, not other packages', () => {
    const legacy = makeLegacy([]);
    const newSdk = makeNewSdk([
      {
        symbol: 'NameCallback',
        importPath: '@forgerock/journey-client/types',
        entryPoint: './types',
      },
      {
        symbol: 'OidcConfig',
        importPath: '@forgerock/oidc-client/types',
        entryPoint: './types',
      },
      {
        symbol: 'DeviceClient',
        importPath: '@forgerock/device-client/types',
        entryPoint: './types',
      },
    ]);
    const documented = makeDoc([]);

    const findings = diff(legacy, newSdk, documented);
    const missing = findings.filter((f) => f.category === 'missing-callback');

    // Only NameCallback from journey-client/types should be flagged, not OidcConfig or DeviceClient
    expect(missing).toHaveLength(1);
    expect(missing[0].message).toContain('NameCallback');
  });

  it('callback detection only matches symbols ending with Callback', () => {
    const legacy = makeLegacy([]);
    const newSdk = makeNewSdk([
      {
        symbol: 'NameCallback',
        importPath: '@forgerock/journey-client/types',
        entryPoint: './types',
      },
      {
        symbol: 'JourneyStep',
        importPath: '@forgerock/journey-client/types',
        entryPoint: './types',
      },
      {
        symbol: 'CallbackType',
        importPath: '@forgerock/journey-client/types',
        entryPoint: './types',
      },
    ]);
    const documented = makeDoc([]);

    const findings = diff(legacy, newSdk, documented);
    const missing = findings.filter((f) => f.category === 'missing-callback');

    // Only NameCallback ends with "Callback"
    expect(missing).toHaveLength(1);
    expect(missing[0].message).toContain('NameCallback');
  });

  it('reports stale callbacks', () => {
    const legacy = makeLegacy([]);
    const newSdk = makeNewSdk([
      {
        symbol: 'NameCallback',
        importPath: '@forgerock/journey-client/types',
        entryPoint: './types',
      },
    ]);
    const documented = makeDoc([
      {
        section: SECTIONS.CALLBACKS,
        legacySymbol: 'NameCallback',
        newImport: '@forgerock/journey-client/types',
        lineNumber: 50,
      },
      {
        section: SECTIONS.CALLBACKS,
        legacySymbol: 'ObsoleteCallback',
        newImport: '@forgerock/journey-client/types',
        lineNumber: 55,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const stale = findings.filter((f) => f.category === 'stale-callback');

    expect(stale).toHaveLength(1);
    expect(stale[0].severity).toBe('error');
    expect(stale[0].action).toBe('remove');
    expect(stale[0].lineNumber).toBe(55);
    expect(stale[0].message).toContain('ObsoleteCallback');
  });

  it('handles renamed callbacks (e.g. FRCallback -> BaseCallback) without false positives', () => {
    const legacy = makeLegacy(['FRCallback']);
    const newSdk = makeNewSdk([
      {
        symbol: 'BaseCallback',
        importPath: '@forgerock/journey-client/types',
        entryPoint: './types',
      },
    ]);
    // The doc maps FRCallback (legacy) -> BaseCallback (new) via the import column
    const documented = makeDoc([
      {
        section: SECTIONS.CALLBACKS,
        legacySymbol: 'FRCallback',
        newImport: "`import { BaseCallback } from '@forgerock/journey-client/types'`",
        lineNumber: 50,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const missingCallbacks = findings.filter((f) => f.category === 'missing-callback');
    const staleCallbacks = findings.filter((f) => f.category === 'stale-callback');

    // BaseCallback should NOT be flagged as missing (it's documented via the FRCallback row)
    expect(missingCallbacks).toHaveLength(0);
    // FRCallback should NOT be flagged as stale (the new name BaseCallback is exported)
    expect(staleCallbacks).toHaveLength(0);
  });

  it('reports undocumented new exports as warnings', () => {
    const legacy = makeLegacy([]);
    const newSdk = makeNewSdk([
      { symbol: 'FRAuth', importPath: '@anthropic/journey-client' },
      { symbol: 'NewThing', importPath: '@anthropic/journey-client' },
    ]);
    const documented = makeDoc(
      [
        {
          section: SECTIONS.QUICK_REFERENCE,
          legacySymbol: 'SomeLegacy',
          newImport: "import { journey } from '@anthropic/journey-client'",
          lineNumber: 10,
        },
      ],
      // entryPoints are import paths (not package.json export keys)
      ['@anthropic/journey-client'],
    );

    const findings = diff(legacy, newSdk, documented);
    const undoc = findings.filter((f) => f.category === 'undocumented-new-export');

    // 'journey' is extracted from the newImport statement and is in allDocumentedSymbols.
    // 'SomeLegacy' is also in allDocumentedSymbols. Neither 'FRAuth' nor 'NewThing' match.
    // The OR means: referencedImportPaths or allDocumentedSymbols.
    // referencedImportPaths has the full import statement, not '@anthropic/journey-client',
    // so that branch won't match. Only allDocumentedSymbols can match.
    expect(undoc).toHaveLength(2);
    expect(undoc.every((f) => f.severity === 'warning')).toBe(true);
    expect(undoc.every((f) => f.action === 'add')).toBe(true);
    expect(undoc.some((f) => f.message.includes('NewThing'))).toBe(true);
    expect(undoc.some((f) => f.message.includes('FRAuth'))).toBe(true);
  });

  it('undocumented-new-export does not flag symbols referenced in the doc', () => {
    const legacy = makeLegacy(['FRAuth']);
    const newSdk = makeNewSdk([
      { symbol: 'journey', importPath: '@anthropic/journey-client' },
      { symbol: 'Unreferenced', importPath: '@anthropic/journey-client' },
    ]);
    const documented = makeDoc(
      [
        {
          section: SECTIONS.QUICK_REFERENCE,
          legacySymbol: 'FRAuth',
          newImport: "import { journey } from '@anthropic/journey-client'",
          lineNumber: 10,
        },
      ],
      ['@anthropic/journey-client'],
    );

    const findings = diff(legacy, newSdk, documented);
    const undoc = findings.filter((f) => f.category === 'undocumented-new-export');

    // 'journey' is extracted from newImport via regex and is in allDocumentedSymbols — not flagged
    // 'Unreferenced' is not mentioned anywhere — flagged
    expect(undoc).toHaveLength(1);
    expect(undoc[0].message).toContain('Unreferenced');
  });

  it('undocumented-new-export matches on importPath not entryPoint', () => {
    const legacy = makeLegacy([]);
    const newSdk = makeNewSdk([
      { symbol: 'Foo', importPath: '@anthropic/journey-client', entryPoint: '.' },
    ]);
    // entryPoints contains import paths, not package.json export keys
    const documented = makeDoc([], ['@anthropic/journey-client']);

    const findings = diff(legacy, newSdk, documented);
    const undoc = findings.filter((f) => f.category === 'undocumented-new-export');

    // Foo's importPath matches a documented entry point, so it IS checked (and flagged)
    expect(undoc).toHaveLength(1);
    expect(undoc[0].message).toContain('Foo');
  });

  it('does NOT flag package-name entries starting with @ as stale', () => {
    const legacy = makeLegacy(['FRAuth']);
    const newSdk = makeNewSdk([{ symbol: 'FRAuth', importPath: '@anthropic/journey-client' }]);
    const documented = makeDoc([
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: 'FRAuth',
        newImport: '@anthropic/journey-client',
        lineNumber: 10,
      },
      {
        section: SECTIONS.QUICK_REFERENCE,
        legacySymbol: '@forgerock/ping-protect',
        newImport: '@anthropic/protect',
        lineNumber: 15,
      },
    ]);

    const findings = diff(legacy, newSdk, documented);
    const stale = findings.filter((f) => f.category === 'stale-legacy-symbol');

    // @forgerock/ping-protect starts with @ so it should be skipped
    expect(stale).toHaveLength(0);
  });
});
