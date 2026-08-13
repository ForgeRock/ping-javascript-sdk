import { describe, it, expect } from 'vitest';
import { mapE2eSuitesToPackages } from '../lib/map-e2e-suites.js';
import { join } from 'node:path';

const workspaceRoot = join(import.meta.dirname, '..', '..', '..', '..');

describe('mapE2eSuitesToPackages', () => {
  it('maps davinci-suites to davinci-client package', () => {
    const result = mapE2eSuitesToPackages(workspaceRoot);

    const davinciMapping = result.find((m) => m.suiteName === 'davinci-suites');
    expect(davinciMapping).toBeDefined();
    expect(davinciMapping!.packages).toContain('@forgerock/davinci-client');
  });

  it('maps journey-suites to journey-client package', () => {
    const result = mapE2eSuitesToPackages(workspaceRoot);

    const journeyMapping = result.find((m) => m.suiteName === 'journey-suites');
    expect(journeyMapping).toBeDefined();
    expect(journeyMapping!.packages).toContain('@forgerock/journey-client');
  });

  it('returns an array of suite mappings', () => {
    const result = mapE2eSuitesToPackages(workspaceRoot);

    expect(result.length).toBeGreaterThan(0);
    for (const mapping of result) {
      expect(mapping.suiteName).toBeTruthy();
      expect(mapping.packages.length).toBeGreaterThan(0);
    }
  });
});
