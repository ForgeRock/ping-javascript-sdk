import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { extractNewSdkExports } from './new-sdk.js';

const FIXTURE_DIR = resolve(__dirname, '../fixtures/mock-package');

describe('extractNewSdkExports', () => {
  it('extracts exports from the main entry point', () => {
    const exports = extractNewSdkExports([FIXTURE_DIR]);
    const mainExports = exports.filter((e) => e.entryPoint === '.');

    expect(mainExports.map((e) => e.symbol)).toContain('journey');
  });

  it('extracts exports from the ./types entry point', () => {
    const exports = extractNewSdkExports([FIXTURE_DIR]);
    const typeExports = exports.filter((e) => e.entryPoint === './types');

    expect(typeExports.map((e) => e.symbol)).toContain('JourneyStep');
    expect(typeExports.map((e) => e.symbol)).toContain('JourneyLoginSuccess');
    expect(typeExports.map((e) => e.symbol)).toContain('NameCallback');
    expect(typeExports.map((e) => e.symbol)).toContain('PasswordCallback');
  });

  it('builds correct import paths', () => {
    const exports = extractNewSdkExports([FIXTURE_DIR]);
    const journeyStep = exports.find((e) => e.symbol === 'JourneyStep');

    expect(journeyStep).toBeDefined();
    expect(journeyStep?.packageName).toBe('@mock/test-client');
    expect(journeyStep?.importPath).toBe('@mock/test-client/types');
  });

  it('builds import path without suffix for main entry point', () => {
    const exports = extractNewSdkExports([FIXTURE_DIR]);
    const journey = exports.find((e) => e.symbol === 'journey');

    expect(journey).toBeDefined();
    expect(journey?.importPath).toBe('@mock/test-client');
  });

  it('skips ./package.json entry point', () => {
    const exports = extractNewSdkExports([FIXTURE_DIR]);
    const pkgExports = exports.filter((e) => e.entryPoint === './package.json');

    expect(pkgExports).toHaveLength(0);
  });

  it('skips entry points whose source file cannot be resolved', () => {
    // ./webauthn points to a file that doesn't exist in the fixture
    const exports = extractNewSdkExports([FIXTURE_DIR]);
    const webauthnExports = exports.filter((e) => e.entryPoint === './webauthn');

    expect(webauthnExports).toHaveLength(0);
  });

  it('classifies types vs classes correctly', () => {
    const exports = extractNewSdkExports([FIXTURE_DIR]);
    const journeyStep = exports.find((e) => e.symbol === 'JourneyStep');
    const nameCallback = exports.find((e) => e.symbol === 'NameCallback');

    expect(journeyStep).toBeDefined();
    expect(journeyStep?.kind).toBe('type');
    expect(nameCallback).toBeDefined();
    expect(nameCallback?.kind).toBe('class');
  });
});
