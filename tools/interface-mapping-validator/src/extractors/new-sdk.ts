import { Project, Node } from 'ts-morph';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import type { NewSdkExport, ExportKind } from '../types.js';

type PackageExports = Record<string, string | Record<string, string>>;

/**
 * Resolves a conditional export map to a single file path, preferring types over import over default.
 *
 * @param target - The conditional export object from package.json (e.g., `{ types, import, default }`).
 * @returns The resolved file path, or undefined if no recognized condition exists.
 */
function resolveConditionalExport(target: Record<string, string>): string | undefined {
  return target['types'] ?? target['import'] ?? target['default'];
}

/**
 * Converts a dist output path back to its corresponding TypeScript source path.
 *
 * @param packageDir - Absolute path to the package directory.
 * @param distPath - Relative dist path from package.json exports (e.g., `./dist/index.d.ts`).
 * @returns The resolved absolute source file path, or undefined if conversion fails.
 */
function resolveSourcePath(packageDir: string, distPath: string): string | undefined {
  const srcPath = distPath
    .replace(/^\.\//, '')
    .replace(/^dist\//, '')
    .replace(/\.d\.ts$/, '.ts')
    .replace(/\.js$/, '.ts');

  return resolve(packageDir, srcPath);
}

/**
 * Classifies an AST node into an export kind based on its declaration type.
 *
 * @param node - The ts-morph AST node to classify.
 * @returns The export kind (class, interface, type, enum, function, or variable as fallback).
 */
function getDeclarationKind(node: Node): ExportKind {
  if (Node.isClassDeclaration(node)) return 'class';
  if (Node.isInterfaceDeclaration(node)) return 'interface';
  if (Node.isTypeAliasDeclaration(node)) return 'type';
  if (Node.isEnumDeclaration(node)) return 'enum';
  if (Node.isFunctionDeclaration(node)) return 'function';
  return 'variable';
}

/**
 * Parses a single TypeScript source file and extracts all named exports with their declaration kinds.
 *
 * @param project - Shared ts-morph Project instance (reused across files for performance).
 * @param filePath - Absolute path to the TypeScript source file.
 * @returns An array of export names paired with their declaration kind (class, interface, type, etc.).
 */
function extractExportsFromFile(
  project: Project,
  filePath: string,
): Array<{ name: string; kind: ExportKind }> {
  const sourceFile = project.addSourceFileAtPath(filePath);

  return Array.from(sourceFile.getExportedDeclarations())
    .filter(([name]) => name !== 'default')
    .flatMap(([name, declarations]) => {
      const decl = declarations[0];
      return decl ? [{ name, kind: getDeclarationKind(decl) }] : [];
    });
}

/**
 * Extracts all public exports from the new SDK packages by reading their package.json exports fields.
 *
 * @param packageDirs - Absolute paths to new SDK package directories to scan.
 * @returns An array of exports with symbol names, package names, entry points, and import paths.
 */
export function extractNewSdkExports(packageDirs: string[]): NewSdkExport[] {
  const project = new Project({ skipAddingFilesFromTsConfig: true });

  return packageDirs.flatMap((dir) => {
    const pkgJsonPath = join(dir, 'package.json');
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as {
      name: string;
      exports?: PackageExports;
    };

    const packageName = pkgJson.name;
    const exportsField = pkgJson.exports;
    if (!exportsField) return [];

    return Object.entries(exportsField).flatMap(([entryPoint, target]) => {
      if (entryPoint === './package.json') return [];

      const distPath = typeof target === 'string' ? target : resolveConditionalExport(target);
      if (!distPath) return [];

      const sourcePath = resolveSourcePath(dir, distPath);
      if (!sourcePath || !existsSync(sourcePath)) return [];

      const importPath =
        entryPoint === '.' ? packageName : `${packageName}/${entryPoint.replace(/^\.\//, '')}`;

      return extractExportsFromFile(project, sourcePath).map((exp) => ({
        symbol: exp.name,
        packageName,
        entryPoint,
        importPath,
        kind: exp.kind,
      }));
    });
  });
}
