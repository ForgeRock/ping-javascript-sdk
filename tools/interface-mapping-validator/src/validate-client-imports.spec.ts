import { describe, it, expect } from 'vitest';
import { validateClientImportsOnly } from './validate-client-imports.js';

const ALLOWED_PACKAGES = [
  '@forgerock/journey-client',
  '@forgerock/oidc-client',
  '@forgerock/device-client',
  '@forgerock/davinci-client',
  '@forgerock/protect',
];

describe('validateClientImportsOnly', () => {
  it('should pass for client package imports', () => {
    const lines = [
      "| `import type { Step } from '@forgerock/journey-client/types'` |",
      "| `import { oidc } from '@forgerock/oidc-client'` |",
    ];
    const errors = validateClientImportsOnly(lines, ALLOWED_PACKAGES);
    expect(errors).toEqual([]);
  });

  it('should flag internal package imports', () => {
    const lines = ["| `import type { Step } from '@forgerock/sdk-types'` |"];
    const errors = validateClientImportsOnly(lines, ALLOWED_PACKAGES);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('@forgerock/sdk-types');
  });

  it('should flag sdk-effects imports', () => {
    const lines = ["| `import { logger } from '@forgerock/sdk-effects/logger'` |"];
    const errors = validateClientImportsOnly(lines, ALLOWED_PACKAGES);
    expect(errors).toHaveLength(1);
  });

  it('should skip non-import lines', () => {
    const lines = [
      '| Removed - use native Promise constructor |',
      '| N/A |',
      '| Not exported - internal to webauthn module |',
    ];
    const errors = validateClientImportsOnly(lines, ALLOWED_PACKAGES);
    expect(errors).toEqual([]);
  });

  it('should allow subpath imports from client packages', () => {
    const lines = [
      "| `import { WebAuthn } from '@forgerock/journey-client/webauthn'` |",
      "| `import { Policy } from '@forgerock/journey-client/policy'` |",
    ];
    const errors = validateClientImportsOnly(lines, ALLOWED_PACKAGES);
    expect(errors).toEqual([]);
  });

  it('should flag @forgerock/storage as internal', () => {
    const lines = ["| `import { storage } from '@forgerock/storage'` |"];
    const errors = validateClientImportsOnly(lines, ALLOWED_PACKAGES);
    expect(errors).toHaveLength(1);
  });

  it('should flag @forgerock/sdk-logger as internal', () => {
    const lines = ["| `import type { CustomLogger } from '@forgerock/sdk-logger'` |"];
    const errors = validateClientImportsOnly(lines, ALLOWED_PACKAGES);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('@forgerock/sdk-logger');
  });

  it('should handle multiple imports in one line', () => {
    const lines = [
      "| `import { Foo } from '@forgerock/sdk-types'` and `import { Bar } from '@forgerock/sdk-logger'` |",
    ];
    const errors = validateClientImportsOnly(lines, ALLOWED_PACKAGES);
    expect(errors).toHaveLength(2);
  });
});
