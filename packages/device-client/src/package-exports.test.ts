import { describe, it, expect } from 'vitest';
import { deviceClient } from './index.js';
import * as types from './lib/types/index.js';
import packageJson from '../package.json';

describe('Package Exports', () => {
  it('should export main module correctly', () => {
    expect(deviceClient).toBeDefined();
    expect(typeof deviceClient).toBe('function');
  });

  it('should export types correctly', () => {
    expect(types).toBeDefined();
  });

  it('should export package.json correctly', () => {
    expect(packageJson).toBeDefined();
    expect(packageJson.name).toBe('@forgerock/device-client');
    expect(packageJson.version).toBeDefined();
  });

  it('should match export paths with package.json', () => {
    const exports = packageJson.exports;
    expect(exports['.']).toBe('./dist/index.js');
    expect(exports['./types']).toBe('./dist/lib/types/index.d.ts');
    expect(exports['./package.json']).toBe('./package.json');
  });
});
