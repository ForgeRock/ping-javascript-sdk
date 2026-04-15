import { describe, it, expect } from 'vitest';
import { resolvePackageInfo } from './main.js';

describe('resolvePackageInfo', () => {
  it('should resolve package info from a valid package directory', () => {
    const info = resolvePackageInfo('packages/journey-client');
    expect(info.packageName).toBe('@forgerock/journey-client');
    expect(info.entries.length).toBeGreaterThan(0);
    expect(info.entries.find((e) => e.subpath === '.')).toBeDefined();
    expect(info.entries.find((e) => e.subpath === './types')).toBeDefined();
    expect(info.entries.find((e) => e.subpath === './webauthn')).toBeDefined();
  });

  it('should throw for non-existent package directory', () => {
    expect(() => resolvePackageInfo('/nonexistent/path')).toThrow(/No package\.json found/);
  });

  it('should resolve tsconfig.lib.json when it exists', () => {
    const info = resolvePackageInfo('packages/journey-client');
    expect(info.tsconfigPath).toContain('tsconfig.lib.json');
  });

  it('should skip ./package.json from entries', () => {
    const info = resolvePackageInfo('packages/journey-client');
    expect(info.entries.find((e) => e.subpath === './package.json')).toBeUndefined();
  });

  it('should resolve device-client with correct entry count', () => {
    const info = resolvePackageInfo('packages/device-client');
    expect(info.packageName).toBe('@forgerock/device-client');
    // device-client has ".", "./types" (./package.json is filtered out)
    expect(info.entries).toHaveLength(2);
  });
});
