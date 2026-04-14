import { describe, it, expect } from 'vitest';
import { buildReportFileName } from './config.js';

describe('buildReportFileName', () => {
  it('should produce base name for root entry "."', () => {
    expect(buildReportFileName('@forgerock/journey-client', '.')).toBe('journey-client.api.md');
  });

  it('should append subpath for sub-entries', () => {
    expect(buildReportFileName('@forgerock/journey-client', './webauthn')).toBe(
      'journey-client.webauthn.api.md',
    );
  });

  it('should handle ./types subpath', () => {
    expect(buildReportFileName('@forgerock/journey-client', './types')).toBe(
      'journey-client.types.api.md',
    );
  });

  it('should handle different scoped package names', () => {
    expect(buildReportFileName('@forgerock/oidc-client', '.')).toBe('oidc-client.api.md');
  });
});
