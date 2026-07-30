import ts from 'typescript';
import { existsSync } from 'node:fs';
import type { DiscoveredExport, ExportKind } from './types.js';

const COMPILER_OPTIONS: ts.CompilerOptions = {
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ES2022,
  strict: true,
  noEmit: true,
  allowJs: true,
};

function resolveKindFromSymbol(symbol: ts.Symbol, checker: ts.TypeChecker): ExportKind {
  // Follow aliases to the actual declaration
  let resolved = symbol;
  if (symbol.flags & ts.SymbolFlags.Alias) {
    resolved = checker.getAliasedSymbol(symbol);
  }

  // Check symbol flags first (covers interface and type alias)
  if (resolved.flags & ts.SymbolFlags.TypeAlias) return 'type';
  if (resolved.flags & ts.SymbolFlags.Interface) return 'type';
  if (resolved.flags & ts.SymbolFlags.Class) return 'class';
  if (resolved.flags & ts.SymbolFlags.Function) return 'function';

  // Inspect declarations for more precise classification
  const decls = resolved.getDeclarations() ?? [];
  for (const decl of decls) {
    if (ts.isFunctionDeclaration(decl)) return 'function';
    if (ts.isClassDeclaration(decl)) return 'class';
    if (ts.isInterfaceDeclaration(decl)) return 'type';
    if (ts.isTypeAliasDeclaration(decl)) return 'type';
  }

  // Check if the original symbol was a type-only export specifier
  const origDecls = symbol.getDeclarations() ?? [];
  for (const decl of origDecls) {
    if (ts.isExportSpecifier(decl) && decl.isTypeOnly) return 'type';
    // Also check parent export declaration for `export type { ... }`
    if (
      ts.isExportSpecifier(decl) &&
      ts.isNamedExports(decl.parent) &&
      ts.isExportDeclaration(decl.parent.parent) &&
      decl.parent.parent.isTypeOnly
    ) {
      return 'type';
    }
  }

  return 'constant';
}

export function extractExportsFromFile(filePath: string): readonly DiscoveredExport[] {
  if (!existsSync(filePath)) return [];

  const program = ts.createProgram([filePath], COMPILER_OPTIONS);
  const checker = program.getTypeChecker();

  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) return [];

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return [];

  const exports = checker.getExportsOfModule(moduleSymbol);

  return exports.map((sym): DiscoveredExport => {
    // Resolve through re-exports to find the actual declaration file
    let resolved = sym;
    if (sym.flags & ts.SymbolFlags.Alias) {
      resolved = checker.getAliasedSymbol(sym);
    }

    const decls = resolved.getDeclarations() ?? [];
    const declFile = decls.length > 0 ? decls[0].getSourceFile().fileName : filePath;

    return {
      name: sym.getName(),
      kind: resolveKindFromSymbol(sym, checker),
      sourceFile: declFile,
    };
  });
}
