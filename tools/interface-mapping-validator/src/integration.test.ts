import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { extractLegacyExports } from './extractors/legacy.js';
import { extractNewSdkExports } from './extractors/new-sdk.js';
import { extractDocumentedMappings } from './extractors/markdown.js';
import { diff } from './differ.js';
import { formatReport } from './reporter.js';
import { generateSections } from './generator.js';
import { replaceSections } from './writer.js';
import { SYMBOL_MAP, PACKAGE_MAP } from './mapping-config.js';
import type {
  LegacyExport,
  NewSdkExport,
  MarkdownExtractionResult,
  GeneratedSections,
} from './types.js';
import { LEGACY_SDK_INDEX_PATH, INTERFACE_MAPPING_PATH, NEW_SDK_PACKAGES } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// src/ -> interface-mapping-validator/ -> tools/ -> workspace root
const WORKSPACE_ROOT = resolve(__dirname, '..', '..', '..');
const TOOL_ROOT = resolve(__dirname, '..');

/**
 * The legacy SDK is a devDependency of this tool, so its node_modules
 * live under the tool directory (pnpm strict mode), not the workspace root.
 * Resolve from TOOL_ROOT to find the actual .d.ts file.
 */
const legacyPath = resolve(TOOL_ROOT, LEGACY_SDK_INDEX_PATH);
const mappingPath = resolve(WORKSPACE_ROOT, INTERFACE_MAPPING_PATH);
const packageDirs = NEW_SDK_PACKAGES.map((p) => resolve(WORKSPACE_ROOT, p));

/**
 * ts-morph extraction is expensive (creates a Project per file), so we
 * extract once in beforeAll and share across tests.
 */
describe('integration: full pipeline against real workspace data', () => {
  let legacy: LegacyExport[];
  let newSdk: NewSdkExport[];
  let documented: MarkdownExtractionResult;

  beforeAll(() => {
    legacy = extractLegacyExports(legacyPath);
    newSdk = extractNewSdkExports(packageDirs);
    documented = extractDocumentedMappings(mappingPath);
  }, 60_000);

  it('extracts legacy exports from the real SDK', () => {
    expect(legacy.length).toBeGreaterThan(40);

    const names = legacy.map((e) => e.name);
    expect(names).toContain('FRAuth');
    expect(names).toContain('NameCallback');
  });

  it('extracts new SDK exports from real packages', () => {
    expect(newSdk.length).toBeGreaterThan(10);

    const journeyExports = newSdk.filter((e) => e.packageName === '@forgerock/journey-client');
    expect(journeyExports.length).toBeGreaterThan(0);
  });

  it('parses the real interface_mapping.md', () => {
    expect(documented.mappings.length).toBeGreaterThan(30);
    expect(documented.entryPoints.length).toBeGreaterThan(3);
  });

  it('runs the full diff pipeline without throwing', () => {
    const findings = diff(legacy, newSdk, documented);
    const report = formatReport(findings);

    expect(report).toContain('Summary:');
  });

  it('produces a report with structured finding categories', () => {
    const findings = diff(legacy, newSdk, documented);

    // Every finding should have the required shape
    for (const finding of findings) {
      expect(finding).toHaveProperty('category');
      expect(finding).toHaveProperty('severity');
      expect(finding).toHaveProperty('section');
      expect(finding).toHaveProperty('message');
      expect(finding).toHaveProperty('action');
      expect(['error', 'warning']).toContain(finding.severity);
      expect(['add', 'remove', 'update']).toContain(finding.action);
    }
  });
});

describe('integration: generation', () => {
  let legacy: LegacyExport[];
  let newSdk: NewSdkExport[];
  let generated: GeneratedSections;

  beforeAll(() => {
    const legacyP = resolve(TOOL_ROOT, LEGACY_SDK_INDEX_PATH);
    const packageDirs = NEW_SDK_PACKAGES.map((p) => resolve(WORKSPACE_ROOT, p));

    legacy = extractLegacyExports(legacyP);
    newSdk = extractNewSdkExports(packageDirs);
    generated = generateSections(legacy, newSdk, SYMBOL_MAP, PACKAGE_MAP);
  }, 60_000);

  it('generates sections with zero unmapped symbols', () => {
    expect(generated.unmapped).toEqual([]);
  });

  it('every SYMBOL_MAP key exists in legacy SDK exports', () => {
    const legacyNames = new Set(legacy.map((e) => e.name));

    for (const key of Object.keys(SYMBOL_MAP)) {
      expect(legacyNames.has(key), `SYMBOL_MAP key "${key}" not in legacy SDK`).toBe(true);
    }
  });

  it('generated output can be written and produces valid markdown', () => {
    const mappingP = resolve(WORKSPACE_ROOT, INTERFACE_MAPPING_PATH);

    const content = readFileSync(mappingP, 'utf-8');
    const updated = replaceSections(content, {
      quickReference: generated.quickReference,
      packageMapping: generated.packageMapping,
      callbackMapping: generated.callbackMapping,
    });

    // Updated content should be valid and preserve structure
    expect(updated.length).toBeGreaterThan(1000);
    expect(updated).toContain('## 0. Quick Reference');
    expect(updated).toContain('## 1. Package Mapping');
    expect(updated).toContain('### Callback Type Mapping');
    // Hand-written sections preserved
    expect(updated).toContain('## 2. Configuration');
    expect(updated).toContain('## 3. Authentication Flow');
  });
});
