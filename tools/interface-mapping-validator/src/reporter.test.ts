import { describe, it, expect } from 'vitest';
import type { Finding } from './types.js';
import { formatReport } from './reporter.js';

const makeFinding = (overrides: Partial<Finding> = {}): Finding => ({
  category: 'undocumented-legacy-symbol',
  severity: 'error',
  section: 'Classes',
  message: 'Test finding message',
  action: 'add',
  ...overrides,
});

describe('formatReport', () => {
  it('returns clean report with zero errors and zero warnings when no findings', () => {
    const result = formatReport([]);

    expect(result).toContain('Interface Mapping Drift Report');
    expect(result).toContain('Summary: 0 errors, 0 warnings');
  });

  it('groups findings by category with counts', () => {
    const findings: Finding[] = [
      makeFinding({ category: 'undocumented-legacy-symbol', message: 'Missing: Config' }),
      makeFinding({ category: 'undocumented-legacy-symbol', message: 'Missing: Session' }),
      makeFinding({
        category: 'stale-legacy-symbol',
        message: 'Stale: OldThing',
        severity: 'warning',
      }),
    ];

    const result = formatReport(findings);

    expect(result).toContain('Undocumented Legacy Symbols (2)');
    expect(result).toContain('Stale Entries (1)');
  });

  it('separates errors from warnings in summary and singularizes when count is 1', () => {
    const findings: Finding[] = [
      makeFinding({ severity: 'error', message: 'An error finding' }),
      makeFinding({
        severity: 'warning',
        message: 'A warning finding',
        category: 'stale-legacy-symbol',
      }),
    ];

    const result = formatReport(findings);

    expect(result).toContain('Summary: 1 error, 1 warning');
  });

  it('pluralizes errors and warnings when counts are greater than 1', () => {
    const findings: Finding[] = [
      makeFinding({ severity: 'error', message: 'Error 1' }),
      makeFinding({ severity: 'error', message: 'Error 2', category: 'invalid-import-path' }),
      makeFinding({ severity: 'warning', message: 'Warning 1', category: 'stale-legacy-symbol' }),
      makeFinding({ severity: 'warning', message: 'Warning 2', category: 'stale-callback' }),
    ];

    const result = formatReport(findings);

    expect(result).toContain('Summary: 2 errors, 2 warnings');
  });

  it('includes individual finding messages in output', () => {
    const findings: Finding[] = [
      makeFinding({ severity: 'error', message: 'Missing: CallbackType in section Classes' }),
      makeFinding({
        severity: 'warning',
        message: 'Stale: OldClass no longer exported',
        category: 'stale-legacy-symbol',
      }),
    ];

    const result = formatReport(findings);

    expect(result).toContain('Missing: CallbackType in section Classes');
    expect(result).toContain('Stale: OldClass no longer exported');
  });

  it('uses error marker for errors and warning marker for warnings', () => {
    const findings: Finding[] = [
      makeFinding({ severity: 'error', message: 'error-msg' }),
      makeFinding({ severity: 'warning', message: 'warning-msg', category: 'stale-legacy-symbol' }),
    ];

    const result = formatReport(findings);

    expect(result).toMatch(/✗\s+error-msg/);
    expect(result).toMatch(/⚠\s+warning-msg/);
  });

  it('renders categories in the specified display order', () => {
    const findings: Finding[] = [
      makeFinding({ category: 'incorrect-import', message: 'last category' }),
      makeFinding({ category: 'undocumented-legacy-symbol', message: 'first category' }),
      makeFinding({
        category: 'stale-legacy-symbol',
        message: 'second category',
        severity: 'warning',
      }),
    ];

    const result = formatReport(findings);

    const undocIdx = result.indexOf('Undocumented Legacy Symbols');
    const staleIdx = result.indexOf('Stale Entries');
    const incorrectIdx = result.indexOf('Incorrect Imports');

    expect(undocIdx).toBeLessThan(staleIdx);
    expect(staleIdx).toBeLessThan(incorrectIdx);
  });

  it('omits categories with no findings', () => {
    const findings: Finding[] = [
      makeFinding({ category: 'invalid-import-path', message: 'bad path' }),
    ];

    const result = formatReport(findings);

    expect(result).toContain('Invalid Import Paths (1)');
    expect(result).not.toContain('Undocumented Legacy Symbols');
    expect(result).not.toContain('Stale Entries');
    expect(result).not.toContain('Missing Callbacks');
  });
});
