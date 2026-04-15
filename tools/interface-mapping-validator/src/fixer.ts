import type { Finding } from './types.js';
import { PROTECTED_PREFIXES } from './config.js';

/**
 * Find the section heading marker in the lines array for a given section name.
 *
 * @param lines - The full markdown content split into lines.
 * @param sectionName - The section title to search for within heading lines.
 * @returns The 0-based index of the heading line, or -1 if not found.
 */
function findSectionStart(lines: readonly string[], sectionName: string): number {
  return lines.findIndex((line) => /^#{1,4}\s+/.test(line) && line.includes(sectionName));
}

/**
 * Find the last data row of a table within a section.
 * A data row starts with '|' and is not a separator row (containing only |, -, and spaces).
 *
 * @param lines - The full markdown content split into lines.
 * @param sectionStart - The 0-based index of the section heading to search from.
 * @returns The 0-based index of the last table data row, or -1 if no table is found.
 */
function findLastTableRow(lines: readonly string[], sectionStart: number): number {
  const isSeparator = (line: string) => /^\|[-|\s]+\|$/.test(line);
  const isTableLine = (line: string) => line.trim().startsWith('|');

  const { lastDataRow } = lines.slice(sectionStart + 1).reduce(
    (acc, line, i) => {
      if (acc.done) return acc;
      const trimmed = line.trim();
      if (isTableLine(trimmed)) {
        const idx = sectionStart + 1 + i;
        return {
          lastDataRow: isSeparator(trimmed) ? acc.lastDataRow : idx,
          inTable: true,
          done: false,
        };
      }
      // Non-table line after table started — stop
      return acc.inTable ? { ...acc, done: true } : acc;
    },
    { lastDataRow: -1, inTable: false, done: false },
  );

  return lastDataRow;
}

/**
 * Check whether a line's second column starts with a protected prefix.
 * Protected rows must never be removed.
 *
 * @param line - A markdown table row to inspect.
 * @returns True if the row's second column begins with a protected prefix.
 */
function isProtectedRow(line: string): boolean {
  // Parse table columns: split by | and trim
  const columns = line
    .split('|')
    .map((col) => col.trim())
    .filter((col) => col.length > 0);

  if (columns.length < 2) {
    return false;
  }

  const secondCol = columns[1] ?? '';
  return PROTECTED_PREFIXES.some((prefix) => secondCol.startsWith(prefix));
}

/**
 * Format an array of cell values into a markdown table row.
 *
 * @param cells - The cell contents to join into a pipe-delimited row.
 * @returns A formatted markdown table row string.
 */
function formatRow(cells: readonly string[]): string {
  return `| ${cells.join(' | ')} |`;
}

/**
 * Apply fixes to interface mapping markdown content based on findings.
 * Round-trip safe: non-table content is preserved byte-for-byte.
 *
 * @param content - The raw markdown content to modify.
 * @param findings - The list of findings whose actions (add/remove) drive the modifications.
 * @returns The updated markdown content with fixes applied.
 */
export function applyFixes(content: string, findings: readonly Finding[]): string {
  if (findings.length === 0) {
    return content;
  }

  const lines = content.split('\n');

  // Separate removals and additions
  const removals = findings.filter((f) => f.action === 'remove' && f.lineNumber !== undefined);
  const additions = findings.filter((f) => f.action === 'add' && f.suggestedRow !== undefined);

  // Apply removals: collect line indices to remove, then filter
  const linesToRemove = new Set(
    removals
      .filter((f) => {
        const lineIndex = (f.lineNumber ?? 0) - 1;
        return lineIndex >= 0 && lineIndex < lines.length && !isProtectedRow(lines[lineIndex]);
      })
      .map((f) => (f.lineNumber ?? 1) - 1),
  );

  const filteredLines = lines.filter((_, i) => !linesToRemove.has(i));

  // Apply additions: fold over additions, inserting each at end of its relevant table
  const result = additions.reduce<readonly string[]>((acc, finding) => {
    const sectionName = finding.section;
    const sectionStart = findSectionStart(acc, sectionName);
    if (sectionStart === -1) return acc;

    const lastRow = findLastTableRow(acc, sectionStart);
    if (lastRow === -1) return acc;

    const newRow = formatRow(finding.suggestedRow ?? []);
    return [...acc.slice(0, lastRow + 1), newRow, ...acc.slice(lastRow + 1)];
  }, filteredLines);

  return (result as string[]).join('\n');
}
