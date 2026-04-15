import { describe, it, expect } from 'vitest';
import { replaceSections, replaceMigrationDependencies } from './writer.js';

// ---------------------------------------------------------------------------
// Test fixture
// ---------------------------------------------------------------------------

const FIXTURE = `# Interface Mapping: Legacy SDK → Ping SDK

## Table of Contents

0. [Quick Reference](#0-quick-reference)
1. [Package Mapping](#1-package-mapping)
5. [Callbacks](#5-callbacks)

---

## 0. Quick Reference

Flat lookup table for AI context injection.

| Legacy Symbol | New Import |
|---|---|
| \`FRAuth\` | old mapping |

---

## 1. Package Mapping

The legacy SDK is a single package.

| Legacy Import | New Package | Purpose |
|---|---|---|
| old row | old row | old row |

---

## 2. Configuration

This section should NOT be touched.

### Architecture Change

| Aspect | Legacy | New |
|---|---|---|
| Pattern | Global | Per-client |

---

## 5. Callbacks

### Base Class Change

| Legacy | New | Notes |
|---|---|---|
| FRCallback | BaseCallback | Renamed |

### Callback Type Mapping

| Legacy Import | New Import | Method Changes |
|---|---|---|
| old callback row | old callback row | None |

Some trailing prose.`;

// ---------------------------------------------------------------------------
// Replacement tables
// ---------------------------------------------------------------------------

const newQuickRefTable = `| Legacy Symbol | New Import |
|---|---|
| \`FRAuth\` | \`authn()\` |
| \`FRUser\` | \`user()\` |`;

const newPackageTable = `| Legacy Import | New Package | Purpose |
|---|---|---|
| @forgerock/javascript-sdk | @anthropic/ping-auth | Auth |
| @forgerock/javascript-sdk | @anthropic/ping-protect | Protect |`;

const newCallbackTable = `| Legacy Import | New Import | Method Changes |
|---|---|---|
| NameCallback | NameCallback | Same |
| PasswordCallback | PasswordCallback | Same |`;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('replaceSections', () => {
  it('replaces Section 0 (Quick Reference) table with new content', () => {
    const result = replaceSections(FIXTURE, { quickReference: newQuickRefTable });

    expect(result).toContain('| `FRAuth` | `authn()` |');
    expect(result).toContain('| `FRUser` | `user()` |');
    expect(result).not.toContain('| `FRAuth` | old mapping |');
  });

  it('preserves Section 0 heading and preamble text', () => {
    const result = replaceSections(FIXTURE, { quickReference: newQuickRefTable });

    expect(result).toContain('## 0. Quick Reference');
    expect(result).toContain('Flat lookup table for AI context injection.');
  });

  it('replaces Section 1 (Package Mapping) table', () => {
    const result = replaceSections(FIXTURE, { packageMapping: newPackageTable });

    expect(result).toContain('| @forgerock/javascript-sdk | @anthropic/ping-auth | Auth |');
    expect(result).toContain('| @forgerock/javascript-sdk | @anthropic/ping-protect | Protect |');
    expect(result).not.toContain('| old row | old row | old row |');
  });

  it('preserves Section 1 preamble text', () => {
    const result = replaceSections(FIXTURE, { packageMapping: newPackageTable });

    expect(result).toContain('The legacy SDK is a single package.');
  });

  it('replaces Callback Type Mapping table only — Base Class Change table preserved, trailing prose preserved', () => {
    const result = replaceSections(FIXTURE, { callbackMapping: newCallbackTable });

    // New callback table present
    expect(result).toContain('| NameCallback | NameCallback | Same |');
    expect(result).toContain('| PasswordCallback | PasswordCallback | Same |');
    // Old callback row gone
    expect(result).not.toContain('| old callback row | old callback row | None |');
    // Base Class Change table preserved
    expect(result).toContain('| FRCallback | BaseCallback | Renamed |');
    // Trailing prose preserved
    expect(result).toContain('Some trailing prose.');
  });

  it('preserves Section 2 completely (not a target section)', () => {
    const result = replaceSections(FIXTURE, {
      quickReference: newQuickRefTable,
      packageMapping: newPackageTable,
      callbackMapping: newCallbackTable,
    });

    expect(result).toContain('## 2. Configuration');
    expect(result).toContain('This section should NOT be touched.');
    expect(result).toContain('| Pattern | Global | Per-client |');
  });

  it('preserves Table of Contents', () => {
    const result = replaceSections(FIXTURE, {
      quickReference: newQuickRefTable,
      packageMapping: newPackageTable,
      callbackMapping: newCallbackTable,
    });

    expect(result).toContain('## Table of Contents');
    expect(result).toContain('0. [Quick Reference](#0-quick-reference)');
    expect(result).toContain('1. [Package Mapping](#1-package-mapping)');
    expect(result).toContain('5. [Callbacks](#5-callbacks)');
  });

  it('returns original content when empty replacements object passed', () => {
    const result = replaceSections(FIXTURE, {});

    expect(result).toBe(FIXTURE);
  });

  it('returns original content unchanged when heading is not found', () => {
    const docWithoutSection0 = FIXTURE.replace('## 0. Quick Reference', '## 0. Something Else');
    const result = replaceSections(docWithoutSection0, {
      quickReference: newQuickRefTable,
    });

    expect(result).toBe(docWithoutSection0);
  });
});

describe('replaceMigrationDependencies', () => {
  const MIGRATION_FIXTURE = `# Migration Guide

## Package Dependencies

| Legacy | New | Purpose |
| --- | --- | --- |
| \`@forgerock/javascript-sdk\` | \`@forgerock/journey-client\` | Old purpose |

---

## SDK Initialization & Configuration

This content should not be touched.
`;

  it('replaces the Package Dependencies table', () => {
    const newTable =
      '| Legacy | New | Purpose |\n| --- | --- | --- |\n| `@forgerock/javascript-sdk` | `@forgerock/journey-client` | New purpose |';
    const result = replaceMigrationDependencies(MIGRATION_FIXTURE, newTable);

    expect(result).toContain('New purpose');
    expect(result).not.toContain('Old purpose');
  });

  it('preserves surrounding content', () => {
    const newTable = '| Legacy | New | Purpose |\n| --- | --- | --- |';
    const result = replaceMigrationDependencies(MIGRATION_FIXTURE, newTable);

    expect(result).toContain('# Migration Guide');
    expect(result).toContain('## SDK Initialization & Configuration');
    expect(result).toContain('This content should not be touched.');
  });
});
