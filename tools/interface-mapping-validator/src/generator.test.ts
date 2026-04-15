import { describe, it, expect } from 'vitest';
import { generateSections } from './generator.js';
import type { LegacyExport, NewSdkExport, SymbolMapping } from './types.js';

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
    entryPoint: entryPoint ?? '.',
    packageName: packageName ?? importPath.split('/').slice(0, 2).join('/'),
    kind: 'variable' as const,
  }));
}

// ---------------------------------------------------------------------------
// Quick Reference — config-based rows
// ---------------------------------------------------------------------------

describe('generateSections', () => {
  describe('Quick Reference — renamed symbol', () => {
    it('produces a row with import statement for renamed mapping', () => {
      const legacy = makeLegacy(['Config']);
      const newSdk = makeNewSdk([]);
      const config: Record<string, SymbolMapping> = {
        Config: { new: 'DaVinciConfig', package: '@anthropic/sdk-client' },
      };

      const result = generateSections(legacy, newSdk, config);

      expect(result.quickReference).toContain(
        "| `Config` | `import { DaVinciConfig } from '@anthropic/sdk-client'` |",
      );
      expect(result.unmapped).toEqual([]);
    });

    it('includes a note when provided', () => {
      const legacy = makeLegacy(['Config']);
      const config: Record<string, SymbolMapping> = {
        Config: { new: 'DaVinciConfig', package: '@anthropic/sdk-client', note: 'see migration' },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      expect(result.quickReference).toContain(
        "| `Config` | `import { DaVinciConfig } from '@anthropic/sdk-client'` — see migration |",
      );
    });

    it('omits import path when package is empty', () => {
      const legacy = makeLegacy(['Config']);
      const config: Record<string, SymbolMapping> = {
        Config: { new: 'DaVinciConfig', package: '', note: 'use directly' },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      expect(result.quickReference).toContain('| `Config` | `DaVinciConfig` — use directly |');
    });
  });

  describe('Quick Reference — type mapping', () => {
    it('uses import type syntax when type: true', () => {
      const legacy = makeLegacy(['StepOptions']);
      const config: Record<string, SymbolMapping> = {
        StepOptions: {
          new: 'StepConfig',
          package: '@forgerock/journey-client',
          type: true,
        },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      expect(result.quickReference).toContain(
        "| `StepOptions` | `import type { StepConfig } from '@forgerock/journey-client'` |",
      );
    });
  });

  describe('Quick Reference — removed symbol', () => {
    it('produces a Removed row with note', () => {
      const legacy = makeLegacy(['TokenStorage']);
      const config: Record<string, SymbolMapping> = {
        TokenStorage: { status: 'removed', note: 'Use browser APIs' },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      expect(result.quickReference).toContain('| `TokenStorage` | Removed — Use browser APIs |');
      expect(result.unmapped).toEqual([]);
    });
  });

  describe('Quick Reference — internal symbol', () => {
    it('produces a Not exported row with note', () => {
      const legacy = makeLegacy(['Dispatcher']);
      const config: Record<string, SymbolMapping> = {
        Dispatcher: { status: 'internal', note: 'Internal implementation detail' },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      expect(result.quickReference).toContain(
        '| `Dispatcher` | Not exported — Internal implementation detail |',
      );
      expect(result.unmapped).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // Quick Reference — auto-match
  // ---------------------------------------------------------------------------

  describe('Quick Reference — auto-matched callback', () => {
    it('auto-matches a Callback type from journey-client/types', () => {
      const legacy = makeLegacy(['PasswordCallback']);
      const newSdk = makeNewSdk([
        {
          symbol: 'PasswordCallback',
          importPath: '@forgerock/journey-client/types',
          entryPoint: './types',
          packageName: '@forgerock/journey-client',
        },
      ]);

      const result = generateSections(legacy, newSdk, {});

      expect(result.quickReference).toContain(
        "| `PasswordCallback` | `import { PasswordCallback } from '@forgerock/journey-client/types'` |",
      );
      expect(result.unmapped).toEqual([]);
    });
  });

  describe('Quick Reference — auto-matched 1:1 name', () => {
    it('auto-matches a symbol with exact name in new SDK', () => {
      const legacy = makeLegacy(['PolicyKey']);
      const newSdk = makeNewSdk([{ symbol: 'PolicyKey', importPath: '@forgerock/sdk-types' }]);

      const result = generateSections(legacy, newSdk, {});

      expect(result.quickReference).toContain(
        "| `PolicyKey` | `import { PolicyKey } from '@forgerock/sdk-types'` |",
      );
      expect(result.unmapped).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // Quick Reference — unmapped
  // ---------------------------------------------------------------------------

  describe('Quick Reference — unmapped symbol', () => {
    it('adds unresolved symbols to the unmapped list', () => {
      const legacy = makeLegacy(['ObscureThing']);
      const result = generateSections(legacy, makeNewSdk([]), {});

      expect(result.unmapped).toEqual(['ObscureThing']);
    });

    it('does not include config entries in unmapped', () => {
      const legacy = makeLegacy(['Config', 'Removed']);
      const config: Record<string, SymbolMapping> = {
        Config: { new: 'NewConfig', package: '@pkg/a' },
        Removed: { status: 'removed', note: 'gone' },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      expect(result.unmapped).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // Quick Reference — packageMap entries
  // ---------------------------------------------------------------------------

  describe('Quick Reference — packageMap entries', () => {
    it('appends package map entries at the end of quick reference', () => {
      const legacy = makeLegacy([]);
      const packageMap = {
        '@forgerock/javascript-sdk': {
          new: '@forgerock/sdk-types',
          note: 'Core types moved',
        },
      };

      const result = generateSections(legacy, makeNewSdk([]), {}, packageMap);

      expect(result.quickReference).toContain(
        '| `@forgerock/javascript-sdk` | `@forgerock/sdk-types` — Core types moved |',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Package Mapping table
  // ---------------------------------------------------------------------------

  describe('Package Mapping table', () => {
    it('includes renamed symbols with non-empty package', () => {
      const legacy = makeLegacy(['Config']);
      const config: Record<string, SymbolMapping> = {
        Config: { new: 'DaVinciConfig', package: '@anthropic/sdk-client' },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      expect(result.packageMapping).toContain(
        "| `import { Config } from '@forgerock/javascript-sdk'` | `import { DaVinciConfig } from '@anthropic/sdk-client'` | Config |",
      );
    });

    it('uses import type for type mappings', () => {
      const legacy = makeLegacy(['Opts']);
      const config: Record<string, SymbolMapping> = {
        Opts: { new: 'Options', package: '@pkg/a', type: true },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      expect(result.packageMapping).toContain(
        "| `import type { Opts } from '@forgerock/javascript-sdk'` | `import type { Options } from '@pkg/a'` | Opts |",
      );
    });

    it('excludes removed symbols', () => {
      const legacy = makeLegacy(['Gone']);
      const config: Record<string, SymbolMapping> = {
        Gone: { status: 'removed', note: 'No longer needed' },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      // Should not appear in package mapping at all
      expect(result.packageMapping).not.toContain('Gone');
    });

    it('excludes internal symbols', () => {
      const legacy = makeLegacy(['Secret']);
      const config: Record<string, SymbolMapping> = {
        Secret: { status: 'internal', note: 'Private' },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      expect(result.packageMapping).not.toContain('Secret');
    });

    it('excludes renamed symbols with empty package', () => {
      const legacy = makeLegacy(['Config']);
      const config: Record<string, SymbolMapping> = {
        Config: { new: 'NewConfig', package: '' },
      };

      const result = generateSections(legacy, makeNewSdk([]), config);

      // Header is always present, but no data row for Config
      const lines = result.packageMapping.split('\n').filter((l) => l.includes('Config'));
      expect(lines).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Callback Type Mapping table
  // ---------------------------------------------------------------------------

  describe('Callback Type Mapping table', () => {
    it('includes Callback types from journey-client/types', () => {
      const legacy = makeLegacy(['PasswordCallback']);
      const newSdk = makeNewSdk([
        {
          symbol: 'PasswordCallback',
          importPath: '@forgerock/journey-client/types',
          entryPoint: './types',
          packageName: '@forgerock/journey-client',
        },
      ]);

      const result = generateSections(legacy, newSdk, {});

      expect(result.callbackMapping).toContain(
        "| `import { PasswordCallback } from '@forgerock/javascript-sdk'` | `import { PasswordCallback } from '@forgerock/journey-client/types'` | None |",
      );
    });

    it('excludes non-Callback types from callback table', () => {
      const newSdk = makeNewSdk([
        {
          symbol: 'StepConfig',
          importPath: '@forgerock/journey-client/types',
          entryPoint: './types',
          packageName: '@forgerock/journey-client',
        },
      ]);

      const result = generateSections(makeLegacy([]), newSdk, {});

      expect(result.callbackMapping).not.toContain('StepConfig');
    });

    it('excludes Callbacks from other packages', () => {
      const newSdk = makeNewSdk([
        {
          symbol: 'PasswordCallback',
          importPath: '@forgerock/other-package/types',
          entryPoint: './types',
          packageName: '@forgerock/other-package',
        },
      ]);

      const result = generateSections(makeLegacy([]), newSdk, {});

      expect(result.callbackMapping).not.toContain('PasswordCallback');
    });
  });

  // ---------------------------------------------------------------------------
  // Table structure
  // ---------------------------------------------------------------------------

  describe('table structure', () => {
    it('quick reference has correct header and separator', () => {
      const result = generateSections(makeLegacy([]), makeNewSdk([]), {});

      const lines = result.quickReference.split('\n');
      expect(lines[0]).toBe('| Legacy Symbol | New SDK Equivalent |');
      expect(lines[1]).toBe('| --- | --- |');
    });

    it('package mapping has correct header and separator', () => {
      const result = generateSections(makeLegacy([]), makeNewSdk([]), {});

      const lines = result.packageMapping.split('\n');
      expect(lines[0]).toBe('| Legacy Import | New Import | Notes |');
      expect(lines[1]).toBe('| --- | --- | --- |');
    });

    it('callback mapping has correct header and separator', () => {
      const result = generateSections(makeLegacy([]), makeNewSdk([]), {});

      const lines = result.callbackMapping.split('\n');
      expect(lines[0]).toBe('| Legacy Import | New Import | Notes |');
      expect(lines[1]).toBe('| --- | --- | --- |');
    });
  });

  describe('Migration Dependencies', () => {
    it('generates unique package rows from renamed config entries', () => {
      const legacy = makeLegacy(['FRAuth', 'FRStep']);
      const newSdk = makeNewSdk([
        { symbol: 'journey', importPath: '@forgerock/journey-client' },
        { symbol: 'JourneyStep', importPath: '@forgerock/journey-client/types' },
      ]);
      const config: Record<string, SymbolMapping> = {
        FRAuth: { new: 'journey', package: '@forgerock/journey-client' },
        FRStep: { new: 'JourneyStep', package: '@forgerock/journey-client/types', type: true },
      };

      const result = generateSections(legacy, newSdk, config);

      // Both map to @forgerock/journey-client — should appear only once
      const rows = result.migrationDependencies.split('\n').filter((l) => l.startsWith('|'));
      const dataRows = rows.slice(2); // skip header + separator
      expect(dataRows).toHaveLength(1);
      expect(dataRows[0]).toContain('@forgerock/journey-client');
    });

    it('includes package map entries', () => {
      const result = generateSections(
        makeLegacy([]),
        makeNewSdk([]),
        {},
        {
          '@forgerock/ping-protect': { new: '@forgerock/protect', note: 'Protect integration' },
        },
      );

      expect(result.migrationDependencies).toContain('@forgerock/ping-protect');
      expect(result.migrationDependencies).toContain('@forgerock/protect');
    });

    it('excludes removed and internal symbols', () => {
      const legacy = makeLegacy(['Config', 'WebAuthnOutcome']);
      const result = generateSections(legacy, makeNewSdk([]), {
        Config: { status: 'removed', note: 'gone' },
        WebAuthnOutcome: { status: 'internal', note: 'internal' },
      });

      const dataRows = result.migrationDependencies
        .split('\n')
        .filter((l) => l.startsWith('|'))
        .slice(2);
      expect(dataRows).toHaveLength(0);
    });
  });
});
