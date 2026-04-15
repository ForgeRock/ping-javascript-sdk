import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { extractLegacyExports } from './legacy.js';

const FIXTURE_PATH = resolve(__dirname, '../fixtures/legacy-sample.d.ts');

describe('extractLegacyExports', () => {
  it('extracts value exports from export {} declaration', () => {
    const exports = extractLegacyExports(FIXTURE_PATH);
    const names = exports.map((e) => e.name);

    expect(names).toContain('FRAuth');
    expect(names).toContain('CallbackType');
    expect(names).toContain('Config');
    expect(names).toContain('NameCallback');
  });

  it('extracts type exports from export type {} declaration', () => {
    const exports = extractLegacyExports(FIXTURE_PATH);
    const names = exports.map((e) => e.name);

    expect(names).toContain('ConfigOptions');
    expect(names).toContain('FailureDetail');
    expect(names).toContain('Step');
  });

  it('marks type exports as type kind', () => {
    const exports = extractLegacyExports(FIXTURE_PATH);
    const configOptions = exports.find((e) => e.name === 'ConfigOptions');

    expect(configOptions).toBeDefined();
    expect(configOptions?.kind).toBe('type');
  });

  it('marks value exports as variable kind', () => {
    const exports = extractLegacyExports(FIXTURE_PATH);
    const frAuth = exports.find((e) => e.name === 'FRAuth');

    expect(frAuth).toBeDefined();
    expect(frAuth?.kind).toBe('variable');
  });

  it('returns no duplicates', () => {
    const exports = extractLegacyExports(FIXTURE_PATH);
    const names = exports.map((e) => e.name);
    const unique = [...new Set(names)];

    expect(names).toEqual(unique);
  });
});
