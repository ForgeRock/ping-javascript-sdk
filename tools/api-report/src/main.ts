import { Extractor, type ExtractorMessage } from '@microsoft/api-extractor';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveEntryPoints, type EntryPoint } from './resolve-entries.js';
import { buildExtractorConfig } from './config.js';
import { parseForgottenExportMessage, applyFixes, type ForgottenExport } from './fixer.js';

const WORKSPACE_ROOT = resolve(import.meta.dirname, '../../..');

export interface PackageInfo {
  packageName: string;
  packageDir: string;
  tsconfigPath: string;
  entries: EntryPoint[];
}

export function resolvePackageInfo(packageDirArg: string): PackageInfo {
  // Resolve relative paths against workspace root, not cwd
  const packageDir = resolve(WORKSPACE_ROOT, packageDirArg);
  const packageJsonPath = resolve(packageDir, 'package.json');

  if (!existsSync(packageJsonPath)) {
    throw new Error('No package.json found at ' + packageJsonPath);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const packageName: string = packageJson.name;
  const exports: Record<string, string> = packageJson.exports ?? {};

  const tsconfigPath = existsSync(resolve(packageDir, 'tsconfig.lib.json'))
    ? resolve(packageDir, 'tsconfig.lib.json')
    : resolve(packageDir, 'tsconfig.json');

  const entries = resolveEntryPoints(exports, packageDir);

  return { packageName, packageDir, tsconfigPath, entries };
}

export interface AnalysisResult {
  results: Array<{ subpath: string; success: boolean; errorCount: number }>;
  totalErrors: number;
  forgottenExports: ForgottenExport[];
}

export function analyzePackage(info: PackageInfo): AnalysisResult {
  const results: AnalysisResult['results'] = [];
  const forgottenExports: ForgottenExport[] = [];
  let totalErrors = 0;

  for (const entry of info.entries) {
    if (!existsSync(entry.dtsPath)) {
      results.push({ subpath: entry.subpath, success: false, errorCount: 1 });
      totalErrors++;
      continue;
    }

    const config = buildExtractorConfig({
      packageDir: info.packageDir,
      packageName: info.packageName,
      entry,
      tsconfigPath: info.tsconfigPath,
    });

    // Ensure the api-report output directory exists before invoking
    mkdirSync(resolve(info.packageDir, 'api-report'), { recursive: true });

    const result = Extractor.invoke(config, {
      localBuild: true,
      showVerboseMessages: false,
      messageCallback: (message: ExtractorMessage) => {
        if (message.messageId === 'ae-forgotten-export') {
          const symbolName = parseForgottenExportMessage(message.text);
          if (symbolName && message.sourceFilePath) {
            forgottenExports.push({ symbolName, sourceFilePath: message.sourceFilePath });
          }
          message.handled = true;
        }
      },
    });

    results.push({
      subpath: entry.subpath,
      success: result.succeeded,
      errorCount: result.errorCount,
    });
    totalErrors += result.errorCount;
  }

  return { results, totalErrors, forgottenExports };
}

// CLI entry point - only runs when executed directly
import { fileURLToPath } from 'node:url';
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const packageDirArg = args.find((a) => !a.startsWith('--'));

  if (!packageDirArg) {
    console.error('Usage: tsx tools/api-report/src/main.ts <package-dir> [--fix]');
    process.exit(1);
  }

  const info = resolvePackageInfo(packageDirArg);

  if (info.entries.length === 0) {
    console.log('No entry points found for ' + info.packageName);
    process.exit(0);
  }

  console.log('\nAnalyzing ' + info.packageName + ' (' + info.entries.length + ' entry points)\n');

  const { results, totalErrors, forgottenExports } = analyzePackage(info);

  for (const r of results) {
    if (r.success) {
      console.log('  + ' + r.subpath);
    } else {
      console.error('  x ' + r.subpath + ' - ' + r.errorCount + ' error(s)');
    }
  }

  console.log('');

  if (totalErrors > 0 && shouldFix && forgottenExports.length > 0) {
    // Resolve the types.ts file for this package
    const typesFilePath = resolve(info.packageDir, 'src', 'types.ts');
    if (!existsSync(typesFilePath)) {
      console.error('Cannot auto-fix: ' + typesFilePath + ' not found');
      process.exit(1);
    }

    console.log('Fixing ' + forgottenExports.length + ' forgotten export(s)...\n');

    const { fixed, skipped } = applyFixes(forgottenExports, typesFilePath, WORKSPACE_ROOT);

    for (const name of fixed) {
      console.log('  + Added re-export: ' + name);
    }
    for (const msg of skipped) {
      console.log('  - Skipped: ' + msg);
    }

    if (fixed.length > 0) {
      console.log('\nFixed ' + fixed.length + ' export(s) in ' + typesFilePath);
      console.log('Rebuild and re-run to verify.');
    }
  } else if (totalErrors > 0) {
    if (forgottenExports.length > 0) {
      console.error('Missing re-exports:');
      for (const fe of forgottenExports) {
        console.error('  - ' + fe.symbolName);
      }
      console.error('');
    }
    console.error(totalErrors + ' error(s) found.');
    console.error('');
    console.error(
      'Fix this package:  tsx tools/api-report/src/main.ts ' + packageDirArg + ' --fix',
    );
    console.error('Fix all packages:  pnpm api-report:fix');
    process.exit(1);
  } else {
    console.log('All entry points clean.');
  }
}
