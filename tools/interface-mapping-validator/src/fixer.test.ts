import { describe, it, expect } from 'vitest';
import { applyFixes } from './fixer.js';
import type { Finding } from './types.js';
import { SECTIONS } from './config.js';

const SAMPLE_DOC = `# Interface Mapping

## 0. Quick Reference

| Legacy Symbol | New Import |
|---|---|
| \`FRAuth\` | \`import { journey } from '@forgerock/journey-client'\` |
| \`OldThing\` | \`import { old } from '@forgerock/old-package'\` |
| \`Config\` | Removed — pass config to factory params |

---

## 5. Callbacks

### Callback Type Mapping

| Legacy Import | New Import | Method Changes |
|---|---|---|
| \`import { NameCallback } from '@forgerock/javascript-sdk'\` | \`import { NameCallback } from '@forgerock/journey-client/types'\` | None |
| \`import { OldCallback } from '@forgerock/javascript-sdk'\` | \`import { OldCallback } from '@forgerock/journey-client/types'\` | None |

Some trailing prose that must not be touched.
`;

describe('applyFixes', () => {
  it('removes a stale row from Quick Reference by lineNumber', () => {
    const findings: Finding[] = [
      {
        category: 'stale-legacy-symbol',
        severity: 'warning',
        section: SECTIONS.QUICK_REFERENCE,
        message: 'OldThing is no longer in legacy SDK',
        action: 'remove',
        lineNumber: 8,
      },
    ];

    const result = applyFixes(SAMPLE_DOC, findings);

    expect(result).not.toContain('OldThing');
    expect(result).toContain('FRAuth');
    expect(result).toContain('Config');
  });

  it('adds a new row to Quick Reference', () => {
    const findings: Finding[] = [
      {
        category: 'undocumented-legacy-symbol',
        severity: 'error',
        section: SECTIONS.QUICK_REFERENCE,
        message: 'FRStep is exported from legacy SDK but not documented',
        action: 'add',
        suggestedRow: ['`FRStep`', '*TODO: add mapping*'],
      },
    ];

    const result = applyFixes(SAMPLE_DOC, findings);

    expect(result).toContain('| `FRStep` | *TODO: add mapping* |');
    // Existing rows preserved
    expect(result).toContain('FRAuth');
    expect(result).toContain('OldThing');
  });

  it('removes a stale callback row', () => {
    const findings: Finding[] = [
      {
        category: 'stale-callback',
        severity: 'warning',
        section: SECTIONS.CALLBACKS,
        message: 'OldCallback is no longer in legacy SDK',
        action: 'remove',
        lineNumber: 20,
      },
    ];

    const result = applyFixes(SAMPLE_DOC, findings);

    expect(result).not.toContain('OldCallback');
    expect(result).toContain('NameCallback');
  });

  it('adds a new callback row', () => {
    const findings: Finding[] = [
      {
        category: 'missing-callback',
        severity: 'error',
        section: SECTIONS.CALLBACKS,
        message: 'ChoiceCallback is not documented',
        action: 'add',
        suggestedRow: [
          "`import { ChoiceCallback } from '@forgerock/javascript-sdk'`",
          '*TODO: add mapping*',
          'None',
        ],
      },
    ];

    const result = applyFixes(SAMPLE_DOC, findings);

    expect(result).toContain(
      "| `import { ChoiceCallback } from '@forgerock/javascript-sdk'` | *TODO: add mapping* | None |",
    );
    expect(result).toContain('NameCallback');
    expect(result).toContain('OldCallback');
  });

  it('preserves non-table content byte-for-byte', () => {
    const findings: Finding[] = [
      {
        category: 'stale-legacy-symbol',
        severity: 'warning',
        section: SECTIONS.QUICK_REFERENCE,
        message: 'OldThing is stale',
        action: 'remove',
        lineNumber: 8,
      },
    ];

    const result = applyFixes(SAMPLE_DOC, findings);

    // The heading, separator, and trailing prose must be preserved exactly
    expect(result).toContain('# Interface Mapping');
    expect(result).toContain('## 0. Quick Reference');
    expect(result).toContain('---');
    expect(result).toContain('## 5. Callbacks');
    expect(result).toContain('### Callback Type Mapping');
    expect(result).toContain('Some trailing prose that must not be touched.');
  });

  it('never removes protected entries even if a remove finding targets one', () => {
    const findings: Finding[] = [
      {
        category: 'stale-legacy-symbol',
        severity: 'warning',
        section: SECTIONS.QUICK_REFERENCE,
        message: 'Config is stale',
        action: 'remove',
        lineNumber: 9, // The "Config | Removed ..." line
      },
    ];

    const result = applyFixes(SAMPLE_DOC, findings);

    // Config row starts with "Removed" in second column — must be preserved
    expect(result).toContain('Config');
    expect(result).toContain('Removed — pass config to factory params');
  });

  it('handles multiple fixes at once (remove + add across sections)', () => {
    const findings: Finding[] = [
      {
        category: 'stale-legacy-symbol',
        severity: 'warning',
        section: SECTIONS.QUICK_REFERENCE,
        message: 'OldThing is stale',
        action: 'remove',
        lineNumber: 8,
      },
      {
        category: 'undocumented-legacy-symbol',
        severity: 'error',
        section: SECTIONS.QUICK_REFERENCE,
        message: 'FRStep not documented',
        action: 'add',
        suggestedRow: ['`FRStep`', '*TODO: add mapping*'],
      },
      {
        category: 'stale-callback',
        severity: 'warning',
        section: SECTIONS.CALLBACKS,
        message: 'OldCallback stale',
        action: 'remove',
        lineNumber: 20,
      },
      {
        category: 'missing-callback',
        severity: 'error',
        section: SECTIONS.CALLBACKS,
        message: 'ChoiceCallback missing',
        action: 'add',
        suggestedRow: [
          "`import { ChoiceCallback } from '@forgerock/javascript-sdk'`",
          '*TODO: add mapping*',
          'None',
        ],
      },
    ];

    const result = applyFixes(SAMPLE_DOC, findings);

    // Removals applied
    expect(result).not.toContain('OldThing');
    expect(result).not.toContain('OldCallback');

    // Additions applied
    expect(result).toContain('| `FRStep` | *TODO: add mapping* |');
    expect(result).toContain(
      "| `import { ChoiceCallback } from '@forgerock/javascript-sdk'` | *TODO: add mapping* | None |",
    );

    // Existing preserved
    expect(result).toContain('FRAuth');
    expect(result).toContain('Config');
    expect(result).toContain('NameCallback');
  });

  it('returns original content unchanged when no findings', () => {
    const result = applyFixes(SAMPLE_DOC, []);

    expect(result).toBe(SAMPLE_DOC);
  });

  it('targets the actual heading, not a Table of Contents entry', () => {
    const docWithToC = `# Interface Mapping

## Table of Contents

- [Quick Reference](#quick-reference)
- [Callbacks](#callbacks)

## 0. Quick Reference

| Legacy Symbol | New Import |
|---|---|
| \`FRAuth\` | \`import { journey } from '@forgerock/journey-client'\` |
| \`OldThing\` | \`import { old } from '@forgerock/old-package'\` |

## 5. Callbacks

### Callback Type Mapping

| Legacy Import | New Import | Method Changes |
|---|---|---|
| \`import { NameCallback } from '@forgerock/javascript-sdk'\` | \`import { NameCallback } from '@forgerock/journey-client/types'\` | None |
`;

    const findings: Finding[] = [
      {
        category: 'undocumented-legacy-symbol',
        severity: 'error',
        section: SECTIONS.QUICK_REFERENCE,
        message: 'FRStep not documented',
        action: 'add',
        suggestedRow: ['`FRStep`', '*TODO: add mapping*'],
      },
    ];

    const result = applyFixes(docWithToC, findings);

    // The new row should appear after the Quick Reference table, not after the ToC line
    const lines = result.split('\n');
    const tocLine = lines.findIndex((l) => l.includes('[Quick Reference]'));
    const addedLine = lines.findIndex((l) => l.includes('FRStep'));
    const headingLine = lines.findIndex((l) => /^##\s+.*Quick Reference/.test(l));

    expect(tocLine).toBeGreaterThan(-1);
    expect(headingLine).toBeGreaterThan(tocLine);
    expect(addedLine).toBeGreaterThan(headingLine);
  });
});
