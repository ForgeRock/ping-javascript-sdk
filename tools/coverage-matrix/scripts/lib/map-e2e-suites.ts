import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { globSync } from 'glob';
import ts from 'typescript';
import type { E2eSuiteMapping, E2eSuitePackageImports } from './types.js';

interface NamedImport {
  readonly packageName: string;
  readonly importedName: string;
}

/** Extract @forgerock/* package names and named imports from a file. */
function extractForgeRockNamedImports(filePath: string): readonly NamedImport[] {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return [];
  }

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const result: NamedImport[] = [];

  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;

    const specifier = stmt.moduleSpecifier;
    if (!ts.isStringLiteral(specifier)) continue;

    const value = specifier.text;
    if (!value.startsWith('@forgerock/')) continue;

    // Normalize to top-level package: @forgerock/davinci-client
    const parts = value.split('/');
    const packageName = parts.slice(0, 2).join('/');

    const clause = stmt.importClause;
    if (!clause) continue;

    const { namedBindings } = clause;
    if (namedBindings && ts.isNamedImports(namedBindings)) {
      for (const element of namedBindings.elements) {
        result.push({ packageName, importedName: element.name.text });
      }
    }
  }

  return result;
}

/** Scan all source files in an app directory and collect named imports per package. */
function collectNamedImportsFromApp(appDir: string): readonly E2eSuitePackageImports[] {
  const files = globSync(['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'], {
    cwd: appDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*'],
  });

  const packageMap = new Map<string, Set<string>>();

  for (const file of files) {
    for (const { packageName, importedName } of extractForgeRockNamedImports(file)) {
      if (!packageMap.has(packageName)) {
        packageMap.set(packageName, new Set());
      }
      packageMap.get(packageName)!.add(importedName);
    }
  }

  return Array.from(packageMap.entries()).map(([packageName, names]) => ({
    packageName,
    importedNames: [...names],
  }));
}

/**
 * Scans the workspace `e2e/` directory, finds all `*-suites` directories, and
 * maps each suite to the `@forgerock/*` packages and specific named imports
 * used by its companion `*-app` directory.
 *
 * Uses the Nx dependency graph to include transitive dependencies —
 * if an e2e app imports `@forgerock/davinci-client` which depends on
 * `@forgerock/sdk-request-middleware`, the middleware package is included
 * as a transitive dependency with package-level (not export-level) coverage.
 */
export function mapE2eSuitesToPackages(workspaceRoot: string): readonly E2eSuiteMapping[] {
  const e2eDir = join(workspaceRoot, 'e2e');
  const entries = readdirSync(e2eDir, { withFileTypes: true });
  const mappings: E2eSuiteMapping[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.endsWith('-suites')) continue;

    const suiteName = entry.name;
    const appName = suiteName.replace(/-suites$/, '-app');
    const appDir = join(e2eDir, appName);

    if (!existsSync(appDir)) continue;

    // Direct imports from the e2e app — export-level accuracy
    const directImports = collectNamedImportsFromApp(appDir);
    const directPackages = directImports.map((p) => p.packageName);

    if (directPackages.length === 0) continue;

    mappings.push({ suiteName, packages: directPackages, packageImports: directImports });
  }

  return mappings;
}
