import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';
import type { DiscoveredPackage, UnitTestMapping, TypeTestMapping } from './types.js';

function extractImportedNames(sourceFile: ts.SourceFile): readonly string[] {
  const names: string[] = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;

    const { importClause } = statement;
    if (!importClause) continue;

    const { namedBindings } = importClause;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;

    for (const element of namedBindings.elements) {
      names.push(element.name.text);
    }
  }

  return names;
}

export function traceTestImports(
  packageDir: string,
  discoveredPackage: DiscoveredPackage,
): readonly UnitTestMapping[] {
  const testFiles = globSync('src/**/*.test.ts', {
    cwd: packageDir,
    absolute: true,
  });

  const knownExports = new Set<string>(
    discoveredPackage.modules.flatMap((mod) => mod.exports.map((exp) => exp.name)),
  );

  const mappings: UnitTestMapping[] = [];

  for (const testFile of testFiles) {
    const content = readFileSync(testFile, 'utf-8');
    const sourceFile = ts.createSourceFile(testFile, content, ts.ScriptTarget.ES2022, true);

    const importedNames = extractImportedNames(sourceFile);
    const importedExports = importedNames.filter((name) => knownExports.has(name));

    if (importedExports.length > 0) {
      mappings.push({
        testFile,
        packageName: discoveredPackage.name,
        importedExports,
      });
    }
  }

  return mappings;
}

export function traceTypeTestImports(
  packageDir: string,
  discoveredPackage: DiscoveredPackage,
): readonly TypeTestMapping[] {
  const testFiles = globSync('src/**/*.test-d.ts', {
    cwd: packageDir,
    absolute: true,
  });

  const knownExports = new Set<string>(
    discoveredPackage.modules.flatMap((mod) => mod.exports.map((exp) => exp.name)),
  );

  const mappings: TypeTestMapping[] = [];

  for (const testFile of testFiles) {
    const content = readFileSync(testFile, 'utf-8');
    const sourceFile = ts.createSourceFile(testFile, content, ts.ScriptTarget.ES2022, true);

    const importedNames = extractImportedNames(sourceFile);
    const importedExports = importedNames.filter((name) => knownExports.has(name));

    if (importedExports.length > 0) {
      mappings.push({
        testFile,
        packageName: discoveredPackage.name,
        importedExports,
      });
    }
  }

  return mappings;
}
