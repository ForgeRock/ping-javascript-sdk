import type { Finding, FindingCategory } from './types.js';

const CATEGORY_LABELS: Record<FindingCategory, string> = {
  'undocumented-legacy-symbol': 'Undocumented Legacy Symbols',
  'stale-legacy-symbol': 'Stale Entries',
  'undocumented-new-export': 'Undocumented New Exports',
  'invalid-import-path': 'Invalid Import Paths',
  'missing-callback': 'Missing Callbacks',
  'stale-callback': 'Stale Callbacks',
  'incorrect-import': 'Incorrect Imports',
};

const DISPLAY_ORDER: readonly FindingCategory[] = [
  'undocumented-legacy-symbol',
  'stale-legacy-symbol',
  'invalid-import-path',
  'missing-callback',
  'stale-callback',
  'undocumented-new-export',
  'incorrect-import',
];

/**
 * Returns a count-prefixed noun, appending "s" for counts other than 1.
 *
 * @param count - The numeric count.
 * @param singular - The singular form of the noun.
 * @returns A string like "1 error" or "3 errors".
 */
function pluralize(count: number, singular: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${singular}s`;
}

/**
 * Groups a flat list of findings into a map keyed by their category.
 *
 * @param findings - The findings to group.
 * @returns A map from finding category to the findings in that category.
 */
function groupByCategory(findings: readonly Finding[]): Map<FindingCategory, readonly Finding[]> {
  return findings.reduce<Map<FindingCategory, readonly Finding[]>>((groups, finding) => {
    const existing = groups.get(finding.category) ?? [];
    return new Map(groups).set(finding.category, [...existing, finding]);
  }, new Map());
}

/**
 * Formats a list of findings into a human-readable drift report with categories and a summary line.
 *
 * @param findings - The findings to render.
 * @returns A multi-line report string suitable for console output.
 */
export function formatReport(findings: readonly Finding[]): string {
  const grouped = groupByCategory(findings);

  const categoryLines = DISPLAY_ORDER.flatMap((category) => {
    const categoryFindings = grouped.get(category);
    if (!categoryFindings || categoryFindings.length === 0) return [];

    const label = CATEGORY_LABELS[category];
    return [
      `${label} (${categoryFindings.length})`,
      ...categoryFindings.map((finding) => {
        const marker = finding.severity === 'error' ? '\u2717' : '\u26A0';
        return `  ${marker} ${finding.message}`;
      }),
      '',
    ];
  });

  const errorCount = findings.filter((f) => f.severity === 'error').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;

  return [
    'Interface Mapping Drift Report',
    '\u2550'.repeat(30),
    '',
    ...categoryLines,
    `Summary: ${pluralize(errorCount, 'error')}, ${pluralize(warningCount, 'warning')}`,
  ].join('\n');
}
