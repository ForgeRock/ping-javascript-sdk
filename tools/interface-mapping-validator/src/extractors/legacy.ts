import { Project } from 'ts-morph';
import type { LegacyExport, ExportKind } from '../types.js';

/**
 * Extracts all named exports from the legacy SDK's index file using static analysis.
 *
 * @param indexPath - Absolute path to the legacy SDK's index.ts barrel file.
 * @returns An array of legacy exports with their names and kinds (type vs variable).
 */
export function extractLegacyExports(indexPath: string): LegacyExport[] {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFile = project.addSourceFileAtPath(indexPath);

  return sourceFile.getExportDeclarations().flatMap((exportDecl) => {
    const isTypeOnly = exportDecl.isTypeOnly();
    return exportDecl.getNamedExports().map((namedExport) => ({
      name: namedExport.getAliasNode()?.getText() ?? namedExport.getName(),
      kind: (isTypeOnly ? 'type' : 'variable') as ExportKind,
    }));
  });
}
