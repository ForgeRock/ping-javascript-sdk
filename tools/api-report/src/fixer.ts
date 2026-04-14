import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';

/**
 * Extracts the symbol name from an ae-forgotten-export message.
 * Returns null if the message doesn't match the expected format.
 */
export function parseForgottenExportMessage(text: string): string | null {
  const match = /The symbol "(\w+)" needs to be exported/.exec(text);
  return match?.[1] ?? null;
}

/**
 * Resolves which @forgerock/* package a source file belongs to.
 * Handles both workspace source paths and node_modules paths.
 */
export function resolveSourcePackage(sourceFilePath: string, workspaceRoot: string): string | null {
  // Check node_modules path: ...node_modules/@forgerock/package-name/...
  const nodeModulesMatch = /@forgerock\/([^/]+)/.exec(sourceFilePath);
  if (nodeModulesMatch && sourceFilePath.includes('node_modules')) {
    return '@forgerock/' + nodeModulesMatch[1];
  }

  // Check workspace path: packages/<name>/... or packages/sdk-effects/<name>/...
  const rel = relative(workspaceRoot, sourceFilePath);
  const parts = rel.split('/');

  if (parts[0] !== 'packages') return null;

  if (parts[1] === 'sdk-effects' && parts[2]) {
    // sdk-effects subpackages: read the package.json name
    const pkgJsonPath = resolve(workspaceRoot, 'packages', 'sdk-effects', parts[2], 'package.json');
    try {
      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
      return pkg.name as string;
    } catch {
      return '@forgerock/sdk-effects/' + parts[2];
    }
  }

  if (parts[1]) {
    return '@forgerock/' + parts[1];
  }

  return null;
}

/**
 * Finds the module specifier for a symbol's import in a .d.ts file.
 * Given `import { ForgottenType } from '@forgerock/sdk-types'`, returns '@forgerock/sdk-types'.
 */
export function findImportModuleForSymbol(fileContent: string, symbolName: string): string | null {
  // Match: import [type] { ..., symbolName, ... } from 'module'
  // Handle both single-line and multi-line imports, with optional 'type' keyword
  const regex = new RegExp(
    'import\\s+(?:type\\s+)?\\{[^}]*\\b' +
      escapeRegex(symbolName) +
      '\\b[^}]*\\}\\s*from\\s*[\'"]([^\'"]+)[\'"]',
    's',
  );
  const match = regex.exec(fileContent);
  return match?.[1] ?? null;
}

/**
 * Determines whether a symbol is a type (interface/type alias) or a value
 * (class/enum/const/function) by scanning the source file content.
 * Defaults to 'type' when uncertain.
 */
export function determineExportKind(sourceContent: string, symbolName: string): 'type' | 'value' {
  // Check for value patterns first (more specific)
  // Handle optional 'export' and 'declare' keywords in .d.ts files
  const valuePatterns = [
    new RegExp('\\b(?:export\\s+)?(?:declare\\s+)?enum\\s+' + symbolName + '\\b'),
    new RegExp('\\b(?:export\\s+)?(?:declare\\s+)?class\\s+' + symbolName + '\\b'),
    new RegExp('\\b(?:export\\s+)?(?:declare\\s+)?(?:const|let|var)\\s+' + symbolName + '\\b'),
    new RegExp('\\b(?:export\\s+)?(?:declare\\s+)?function\\s+' + symbolName + '\\b'),
  ];

  for (const pattern of valuePatterns) {
    if (pattern.test(sourceContent)) return 'value';
  }

  // Check for type patterns
  const typePatterns = [
    new RegExp('\\b(?:export\\s+)?(?:declare\\s+)?interface\\s+' + symbolName + '\\b'),
    new RegExp('\\b(?:export\\s+)?(?:declare\\s+)?type\\s+' + symbolName + '\\b'),
  ];

  for (const pattern of typePatterns) {
    if (pattern.test(sourceContent)) return 'type';
  }

  // Default to type when uncertain (safer: type exports are a subset of value exports)
  return 'type';
}

/**
 * Builds a re-export statement for a symbol.
 */
export function buildReExportStatement(
  symbolName: string,
  sourcePackage: string,
  kind: 'type' | 'value',
): string {
  const keyword = kind === 'type' ? 'export type' : 'export';
  return keyword + ' { ' + symbolName + " } from '" + sourcePackage + "';";
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Inserts a re-export into a types.ts file content.
 * - If an existing re-export block for the same package and kind exists, appends to it.
 * - If the symbol is already exported, returns content unchanged.
 * - Otherwise, appends a new re-export statement.
 */
export function insertReExport(
  content: string,
  symbolName: string,
  sourcePackage: string,
  kind: 'type' | 'value',
): string {
  // Check if already exported (handle multi-line blocks where symbol and 'from' are on different lines)
  const hasSymbolInPackageBlock = new RegExp('\\b' + escapeRegex(symbolName) + '\\b');
  // Find all export blocks for this package and check if symbol is in any of them
  const blockRegex = new RegExp(
    '(?:export(?:\\s+type)?)\\s*\\{([^}]*)\\}\\s*from\\s*[\'"]' +
      escapeRegex(sourcePackage) +
      '[\'"]',
    'gs',
  );
  let blockMatch;
  while ((blockMatch = blockRegex.exec(content)) !== null) {
    if (hasSymbolInPackageBlock.test(blockMatch[1])) return content;
  }

  const keyword = kind === 'type' ? 'export type' : 'export';

  // For value exports, avoid matching 'export type {' blocks
  const keywordPattern = kind === 'value' ? 'export\\s+(?!type\\s)' : escapeRegex(keyword) + '\\s*';

  // Try single-line block first: export { Foo, Bar } from 'package';
  // (no newlines between { and })
  const singleLineRegex = new RegExp(
    '(' +
      keywordPattern +
      '\\{\\s*)([^}\\n]+)(\\s*\\}\\s*from\\s*[\'"]' +
      escapeRegex(sourcePackage) +
      '[\'"];)',
  );
  const singleLineMatch = singleLineRegex.exec(content);
  if (singleLineMatch) {
    const prefix = singleLineMatch[1];
    const symbols = singleLineMatch[2];
    const suffix = singleLineMatch[3];
    return content.replace(
      singleLineMatch[0],
      prefix + symbols.trimEnd() + ', ' + symbolName + ' ' + suffix.trimStart(),
    );
  }

  // Try multi-line block: export type {\n  Foo,\n  Bar,\n} from 'package';
  const multiLineBlockRegex = new RegExp(
    '(' +
      keywordPattern +
      '\\{[^}]*)(\\}\\s*from\\s*[\'"]' +
      escapeRegex(sourcePackage) +
      '[\'"];)',
    's',
  );
  const multiLineMatch = multiLineBlockRegex.exec(content);
  if (multiLineMatch) {
    const beforeClose = multiLineMatch[1];
    const closeAndFrom = multiLineMatch[2];
    const updated = beforeClose.trimEnd() + ',\n  ' + symbolName + ',\n' + closeAndFrom;
    return content.replace(multiLineMatch[0], updated);
  }

  // No existing block - append new statement at end
  const statement = buildReExportStatement(symbolName, sourcePackage, kind);
  return content.trimEnd() + '\n' + statement + '\n';
}

export interface ForgottenExport {
  symbolName: string;
  sourceFilePath: string;
}

/**
 * Applies fixes for forgotten exports by adding re-export statements
 * to the client package's types.ts file.
 */
export function applyFixes(
  forgottenExports: ForgottenExport[],
  typesFilePath: string,
  workspaceRoot: string,
): { fixed: string[]; skipped: string[] } {
  const fixed: string[] = [];
  const skipped: string[] = [];

  let content = readFileSync(typesFilePath, 'utf-8');

  for (const fe of forgottenExports) {
    // Read the usage-site file (where api-extractor found the symbol)
    let usageSiteContent: string;
    try {
      usageSiteContent = readFileSync(fe.sourceFilePath, 'utf-8');
    } catch {
      skipped.push(fe.symbolName + ' (could not read source file)');
      continue;
    }

    // Follow the import chain to find the actual definition module
    const importModule = findImportModuleForSymbol(usageSiteContent, fe.symbolName);
    let definitionFilePath: string | null = null;
    let sourcePackage: string | null = null;

    if (importModule) {
      // Resolve the import module to a file path
      if (importModule.startsWith('.')) {
        // Relative import — resolve relative to the usage-site file
        const dir = resolve(fe.sourceFilePath, '..');
        definitionFilePath = resolve(dir, importModule.replace(/\.js$/, '.d.ts'));
      } else {
        // Package import — resolve via workspace packages
        const parts = importModule.replace(/^@forgerock\//, '').split('/');
        // Try packages/<name>/dist/src/index.d.ts
        const candidatePaths = [
          resolve(workspaceRoot, 'packages', parts[0], 'dist/src/index.d.ts'),
          resolve(workspaceRoot, 'packages/sdk-effects', parts[0], 'dist/src/index.d.ts'),
        ];
        for (const candidate of candidatePaths) {
          if (existsSync(candidate)) {
            definitionFilePath = candidate;
            break;
          }
        }
      }
      // The source package for the re-export comes from the import module
      if (!importModule.startsWith('.')) {
        sourcePackage = importModule;
      }
    }

    // Fall back to resolving from the usage-site path
    if (!sourcePackage) {
      sourcePackage = resolveSourcePackage(fe.sourceFilePath, workspaceRoot);
    }

    if (!sourcePackage) {
      skipped.push(fe.symbolName + ' (could not resolve source package)');
      continue;
    }

    // Determine type vs value from the definition file (or fall back to usage site)
    const definitionContent = definitionFilePath
      ? (() => {
          try {
            return readFileSync(definitionFilePath, 'utf-8');
          } catch {
            return usageSiteContent;
          }
        })()
      : usageSiteContent;

    const kind = determineExportKind(definitionContent, fe.symbolName);
    const before = content;
    content = insertReExport(content, fe.symbolName, sourcePackage, kind);

    if (content !== before) {
      fixed.push(fe.symbolName);
    } else {
      skipped.push(fe.symbolName + ' (already exported)');
    }
  }

  if (fixed.length > 0) {
    writeFileSync(typesFilePath, content, 'utf-8');
  }

  return { fixed, skipped };
}
