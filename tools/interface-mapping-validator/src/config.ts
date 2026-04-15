export const NEW_SDK_PACKAGES = [
  'packages/journey-client',
  'packages/oidc-client',
  'packages/device-client',
  'packages/protect',
  'packages/sdk-types',
  'packages/sdk-utilities',
  'packages/sdk-effects/logger',
  'packages/sdk-effects/storage',
] as const;

export const LEGACY_SDK_INDEX_PATH = 'node_modules/@forgerock/javascript-sdk/dist/index.d.ts';

export const INTERFACE_MAPPING_PATH = 'interface_mapping.md';

export const PROTECTED_PREFIXES = ['Removed', 'Not exported', 'No direct equivalent'] as const;

/**
 * The consumer-facing *-client packages that may appear in import paths
 * within the interface mapping doc. Any @forgerock/* import that does not
 * resolve to one of these base packages is considered an internal reference
 * and should be flagged.
 */
export const CLIENT_PACKAGES = [
  '@forgerock/journey-client',
  '@forgerock/oidc-client',
  '@forgerock/device-client',
  '@forgerock/davinci-client',
  '@forgerock/protect',
  // Legacy packages appear in the "Legacy Import" column of mapping tables
  '@forgerock/javascript-sdk',
  '@forgerock/ping-protect',
] as const;

export const SECTIONS = {
  QUICK_REFERENCE: 'Quick Reference',
  PACKAGE_MAPPING: 'Package Mapping',
  CALLBACKS: 'Callback Type Mapping',
} as const;
