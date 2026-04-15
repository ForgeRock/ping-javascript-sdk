import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { extractDocumentedMappings } from './markdown.js';

const FIXTURE_PATH = resolve(__dirname, '../fixtures/sample-mapping.md');

describe('extractDocumentedMappings', () => {
  it('extracts Quick Reference mappings', () => {
    const result = extractDocumentedMappings(FIXTURE_PATH);
    const qr = result.mappings.filter((m) => m.section === 'Quick Reference');

    expect(qr).toHaveLength(4);
    expect(qr.map((m) => m.legacySymbol)).toEqual(['FRAuth', 'Config', 'FRStep', 'HttpClient']);
  });

  it('strips backtick wrapping from legacy symbols', () => {
    const result = extractDocumentedMappings(FIXTURE_PATH);
    const frAuth = result.mappings.find(
      (m) => m.section === 'Quick Reference' && m.legacySymbol === 'FRAuth',
    );

    expect(frAuth).toBeDefined();
    expect(frAuth?.legacySymbol).toBe('FRAuth');
  });

  it('preserves the full new import text', () => {
    const result = extractDocumentedMappings(FIXTURE_PATH);
    const frAuth = result.mappings.find(
      (m) => m.section === 'Quick Reference' && m.legacySymbol === 'FRAuth',
    );

    expect(frAuth).toBeDefined();
    expect(frAuth?.newImport).toContain('@forgerock/journey-client');
  });

  it('extracts Callback Type Mapping entries', () => {
    const result = extractDocumentedMappings(FIXTURE_PATH);
    const callbacks = result.mappings.filter((m) => m.section === 'Callback Type Mapping');

    expect(callbacks).toHaveLength(2);
    expect(callbacks.map((m) => m.legacySymbol)).toEqual(['NameCallback', 'PasswordCallback']);
  });

  it('extracts callback legacy symbol from import statement', () => {
    const result = extractDocumentedMappings(FIXTURE_PATH);
    const name = result.mappings.find(
      (m) => m.section === 'Callback Type Mapping' && m.legacySymbol === 'NameCallback',
    );

    expect(name).toBeDefined();
  });

  it('collects import paths as entry points', () => {
    const result = extractDocumentedMappings(FIXTURE_PATH);

    expect(result.entryPoints).toContain('@forgerock/journey-client');
    expect(result.entryPoints).toContain('@forgerock/journey-client/types');
    expect(result.entryPoints).toContain('@forgerock/journey-client/webauthn');
  });

  it('records line numbers for each mapping', () => {
    const result = extractDocumentedMappings(FIXTURE_PATH);
    const qr = result.mappings.filter((m) => m.section === 'Quick Reference');

    for (const mapping of qr) {
      expect(mapping.lineNumber).toBeGreaterThan(0);
    }

    const lineNumbers = qr.map((m) => m.lineNumber);
    expect(lineNumbers).toEqual([...lineNumbers].sort((a, b) => a - b));
  });

  it('preserves other columns for Quick Reference', () => {
    const result = extractDocumentedMappings(FIXTURE_PATH);
    const frAuth = result.mappings.find(
      (m) => m.section === 'Quick Reference' && m.legacySymbol === 'FRAuth',
    );

    expect(frAuth).toBeDefined();
    expect(frAuth?.otherColumns).toEqual([]);
  });

  it('preserves other columns for Callback Type Mapping', () => {
    const result = extractDocumentedMappings(FIXTURE_PATH);
    const name = result.mappings.find(
      (m) => m.section === 'Callback Type Mapping' && m.legacySymbol === 'NameCallback',
    );

    expect(name).toBeDefined();
    expect(name?.otherColumns).toEqual(['None']);
  });
});
