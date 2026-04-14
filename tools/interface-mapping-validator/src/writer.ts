export type SectionReplacements = {
  quickReference?: string;
  packageMapping?: string;
  callbackMapping?: string;
};

type SectionPattern = {
  key: keyof SectionReplacements;
  heading: RegExp;
};

const SECTION_PATTERNS: readonly SectionPattern[] = [
  { key: 'quickReference', heading: /^## 0\.\s+Quick Reference/m },
  { key: 'packageMapping', heading: /^## 1\.\s+Package Mapping/m },
  { key: 'callbackMapping', heading: /^### Callback Type Mapping/m },
] as const;

/**
 * Replaces the first markdown table found under a specific heading with new table content.
 * Pure function — returns the original content unchanged if the heading is not found.
 *
 * @param content - The full markdown document content.
 * @param headingPattern - A regex matching the section heading that contains the table.
 * @param newTable - The replacement table content (header + separator + data rows).
 * @returns The updated markdown content, or the original content if the heading is not found.
 */
function replaceTableInSection(content: string, headingPattern: RegExp, newTable: string): string {
  const headingMatch = headingPattern.exec(content);
  if (!headingMatch) return content;

  const lines = content.split('\n');
  const headingOffset = content.slice(0, headingMatch.index).split('\n').length - 1;

  // Scan forward from heading to find first table line
  const tableStart = lines.findIndex((line, i) => i > headingOffset && line.startsWith('|'));
  if (tableStart === -1) return content;

  // Find last consecutive table line
  const afterTable = lines.findIndex((line, i) => i > tableStart && !line.startsWith('|'));
  const tableEnd = (afterTable === -1 ? lines.length : afterTable) - 1;

  // Build new content: everything before table + new table + everything after table
  return [
    ...lines.slice(0, tableStart),
    ...newTable.split('\n'),
    ...lines.slice(tableEnd + 1),
  ].join('\n');
}

/**
 * Replace the Package Dependencies table in MIGRATION.md.
 *
 * @param content - The full MIGRATION.md content.
 * @param newTable - The replacement table content (header + separator + data rows).
 * @returns The updated markdown content with the Package Dependencies table replaced.
 */
export function replaceMigrationDependencies(content: string, newTable: string): string {
  return replaceTableInSection(content, /^## Package Dependencies/m, newTable);
}

/**
 * Replace markdown table sections in-place while preserving all surrounding
 * content (headings, preamble text, trailing prose, and unrelated sections).
 *
 * @param content - The full markdown document content.
 * @param replacements - An object mapping section keys to their new table content.
 * @returns The updated markdown content with the specified table sections replaced.
 */
export function replaceSections(content: string, replacements: SectionReplacements): string {
  return SECTION_PATTERNS.reduce((result, { key, heading }) => {
    const newTable = replacements[key];
    return newTable !== undefined ? replaceTableInSection(result, heading, newTable) : result;
  }, content);
}
