import { readFileSync } from 'node:fs';
import { SECTIONS } from '../config.js';
import type { DocumentedMapping, MarkdownExtractionResult } from '../types.js';

const IMPORT_SYMBOL_RE = /import\s+(?:type\s+)?{\s*(\w+)\s*}\s+from\s+['"]([^'"]+)['"]/;
const BACKTICK_CONTENT_RE = /^`(.+)`$/;

const TARGET_SECTIONS = new Set<string>([
  SECTIONS.QUICK_REFERENCE,
  SECTIONS.PACKAGE_MAPPING,
  SECTIONS.CALLBACKS,
]);

type SectionInfo = {
  readonly name: string;
  readonly headingLevel: number;
};

/**
 * Splits a markdown table row into its cell values, stripping the outer pipes.
 *
 * @param line - A single markdown table row (e.g., `| foo | bar |`).
 * @returns An array of trimmed cell contents.
 */
function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

/**
 * Extracts a package import path from a table cell containing an import statement.
 *
 * @param text - The raw table cell text that may contain an import statement.
 * @returns The extracted entry point string, or null if no import statement is found.
 */
function extractEntryPoint(text: string): string | null {
  const match = text.match(IMPORT_SYMBOL_RE);
  return match ? (match[2] ?? '') : null;
}

/**
 * Extracts the symbol name from a table cell, using section-specific parsing rules.
 *
 * @param cell - The raw table cell text containing a symbol reference.
 * @param section - The section name, which determines how the cell is parsed (backtick vs import statement).
 * @returns The extracted symbol name, or null if the cell does not match the expected format.
 */
function extractSymbolName(cell: string, section: string): string | null {
  const trimmed = cell.trim();

  if (section === SECTIONS.QUICK_REFERENCE) {
    const backtickMatch = trimmed.match(BACKTICK_CONTENT_RE);
    return backtickMatch ? (backtickMatch[1] ?? '') : trimmed;
  }

  if (section === SECTIONS.PACKAGE_MAPPING || section === SECTIONS.CALLBACKS) {
    const importMatch = trimmed.match(IMPORT_SYMBOL_RE);
    return importMatch ? (importMatch[1] ?? '') : null;
  }

  return null;
}

/**
 * Parses the interface mapping markdown file and extracts all documented symbol mappings and entry points.
 *
 * @param filePath - Absolute path to the interface_mapping.md file.
 * @returns The extracted mappings and the set of entry point import paths found in the document.
 */
export function extractDocumentedMappings(filePath: string): MarkdownExtractionResult {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  type ParseState = {
    readonly mappings: readonly DocumentedMapping[];
    readonly entryPoints: readonly string[];
    readonly currentSection: SectionInfo | null;
    readonly inCodeBlock: boolean;
    readonly headerRowSeen: boolean;
  };

  const initialState: ParseState = {
    mappings: [],
    entryPoints: [],
    currentSection: null,
    inCodeBlock: false,
    headerRowSeen: false,
  };

  const finalState = lines.reduce<ParseState>((state, line, i) => {
    const lineNumber = i + 1;

    // Track fenced code blocks to avoid parsing their contents
    if (line.trimStart().startsWith('```')) {
      return { ...state, inCodeBlock: !state.inCodeBlock };
    }

    if (state.inCodeBlock) return state;

    // Detect headings
    const headingMatch = line.match(/^(#{1,4})\s+(?:\d+\.\s+)?(.+)/);
    if (headingMatch) {
      const level = (headingMatch[1] ?? '').length;
      const title = (headingMatch[2] ?? '').trim();

      if (TARGET_SECTIONS.has(title)) {
        return {
          ...state,
          currentSection: { name: title, headingLevel: level },
          headerRowSeen: false,
        };
      } else if (state.currentSection && level <= state.currentSection.headingLevel) {
        return { ...state, currentSection: null, headerRowSeen: false };
      }
      return state;
    }

    if (!state.currentSection) return state;

    if (!line.startsWith('|')) {
      // A non-table, non-empty line after a table ends table parsing
      if (line.trim() !== '' && line.trim() !== '---') {
        return { ...state, headerRowSeen: false };
      }
      return state;
    }

    // Separator row (e.g. |---|---|)
    if (line.match(/^\|[\s-|]+$/)) {
      return { ...state, headerRowSeen: true };
    }

    // Header row (first | row before separator) — skip
    if (!state.headerRowSeen) return state;

    // Data row
    const columns = parseTableRow(line);
    if (columns.length < 2) return state;

    const [firstCol, secondCol, ...rest] = columns;
    const legacySymbol = extractSymbolName(firstCol ?? '', state.currentSection.name);
    const newImport = (secondCol ?? '').trim();

    if (!legacySymbol) return state;

    // Collect entry points from import statements in both columns
    const newEntryPoints = [extractEntryPoint(newImport), extractEntryPoint(firstCol ?? '')].filter(
      (ep): ep is string => ep !== null,
    );

    const uniqueEntryPoints = newEntryPoints.filter((ep) => !state.entryPoints.includes(ep));

    return {
      ...state,
      mappings: [
        ...state.mappings,
        {
          section: state.currentSection.name,
          legacySymbol,
          newImport,
          otherColumns: rest.map((c) => c.trim()),
          lineNumber,
        },
      ],
      entryPoints: [...state.entryPoints, ...uniqueEntryPoints],
    };
  }, initialState);

  return {
    mappings: finalState.mappings as DocumentedMapping[],
    entryPoints: finalState.entryPoints as string[],
  };
}
