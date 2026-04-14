import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { extractLegacyExports } from './extractors/legacy.js';
import { extractNewSdkExports } from './extractors/new-sdk.js';
import { extractDocumentedMappings } from './extractors/markdown.js';
import { diff } from './differ.js';
import { applyFixes } from './fixer.js';
import { formatReport } from './reporter.js';
import { generateSections } from './generator.js';
import { replaceSections, replaceMigrationDependencies } from './writer.js';
import { SYMBOL_MAP, PACKAGE_MAP } from './mapping-config.js';
import {
  LEGACY_SDK_INDEX_PATH,
  INTERFACE_MAPPING_PATH,
  NEW_SDK_PACKAGES,
  CLIENT_PACKAGES,
} from './config.js';
import { validateClientImportsOnly } from './validate-client-imports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * CLI entry point that orchestrates extraction, diffing, reporting, and optional fixing or generation
 * of the interface mapping documentation. Supports `--fix` and `--generate` flags.
 */
function main(): void {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const shouldGenerate = args.includes('--generate');

  // Resolve paths relative to workspace root (two levels up from tool dir)
  const workspaceRoot = resolve(__dirname, '..', '..', '..');
  const mappingPathArg = args.find((a) => a.startsWith('--mapping='));
  const mappingPath = mappingPathArg
    ? resolve(mappingPathArg.split('=')[1] ?? '')
    : resolve(workspaceRoot, INTERFACE_MAPPING_PATH);
  // Legacy SDK is a devDependency of this tool, resolve from tool's own node_modules
  const toolRoot = resolve(__dirname, '..');
  const legacyPath = resolve(toolRoot, LEGACY_SDK_INDEX_PATH);
  const packageDirs = NEW_SDK_PACKAGES.map((p) => resolve(workspaceRoot, p));

  console.log('Extracting legacy SDK exports...');
  const legacy = extractLegacyExports(legacyPath);
  console.log(`  Found ${legacy.length} legacy exports`);

  console.log('Extracting new SDK exports...');
  const newSdk = extractNewSdkExports(packageDirs);
  console.log(`  Found ${newSdk.length} new SDK exports`);

  console.log('Parsing interface_mapping.md...');
  const documented = extractDocumentedMappings(mappingPath);
  console.log(`  Found ${documented.mappings.length} documented mappings`);
  console.log('');

  if (shouldGenerate) {
    console.log('Generating sections 0, 1, 5...');
    const generated = generateSections(legacy, newSdk, SYMBOL_MAP, PACKAGE_MAP);

    if (generated.unmapped.length > 0) {
      console.log(`\n${generated.unmapped.length} unmapped legacy symbols:`);
      for (const name of generated.unmapped) {
        console.log(`  ✗ ${name} — add to SYMBOL_MAP in mapping-config.ts`);
      }
      console.log('\nGeneration aborted. Map all symbols first.');
      process.exit(1);
    }

    // Update interface_mapping.md
    const content = readFileSync(mappingPath, 'utf-8');
    const updated = replaceSections(content, {
      quickReference: generated.quickReference,
      packageMapping: generated.packageMapping,
      callbackMapping: generated.callbackMapping,
    });
    writeFileSync(mappingPath, updated, 'utf-8');

    // Update MIGRATION.md Package Dependencies table
    const migrationPath = resolve(workspaceRoot, 'MIGRATION.md');
    const migrationContent = readFileSync(migrationPath, 'utf-8');
    const migrationUpdated = replaceMigrationDependencies(
      migrationContent,
      generated.migrationDependencies,
    );
    writeFileSync(migrationPath, migrationUpdated, 'utf-8');

    // Format both files with prettier if available
    try {
      execFileSync('pnpm', ['prettier', '--write', mappingPath, migrationPath], {
        stdio: 'pipe',
      });
      console.log('Formatted with prettier.');
    } catch {
      // Prettier not available — skip formatting
    }

    console.log(`Updated ${mappingPath}`);
    console.log('  Section 0: Quick Reference');
    console.log('  Section 1: Package Mapping');
    console.log('  Section 5: Callback Type Mapping');
    console.log(`Updated ${migrationPath}`);
    console.log('  Package Dependencies table');

    // Re-validate after generation
    console.log('\nValidating generated output...\n');
    const reDocumented = extractDocumentedMappings(mappingPath);
    const reFindings = diff(legacy, newSdk, reDocumented);
    const reReport = formatReport(reFindings);
    console.log(reReport);

    const errorCount = reFindings.filter((f) => f.severity === 'error').length;
    process.exit(errorCount > 0 ? 1 : 0);
  }

  // Check that all import paths in the mapping doc reference consumer-facing
  // *-client packages rather than internal packages (sdk-types, sdk-effects, etc.)
  const mappingContent = readFileSync(mappingPath, 'utf-8');
  const mappingLines = mappingContent.split('\n');
  const clientImportErrors = validateClientImportsOnly(mappingLines, [...CLIENT_PACKAGES]);

  if (clientImportErrors.length > 0) {
    console.log(`\nClient-import-only violations (${clientImportErrors.length}):`);
    for (const err of clientImportErrors) {
      console.log(`  ✗ ${err}`);
    }
    console.log('');
  }

  const findings = diff(legacy, newSdk, documented);
  const report = formatReport(findings);
  console.log(report);

  if (shouldFix && findings.length > 0) {
    const fixableFindings = findings.filter((f) => f.action === 'add' || f.action === 'remove');

    if (fixableFindings.length > 0) {
      console.log('');
      console.log(`Applying ${fixableFindings.length} fixes...`);

      const content = readFileSync(mappingPath, 'utf-8');
      const fixed = applyFixes(content, fixableFindings);
      writeFileSync(mappingPath, fixed, 'utf-8');

      console.log('Fixes applied. Re-validating...');
      console.log('');

      // Re-validate
      const reDocumented = extractDocumentedMappings(mappingPath);
      const reFindings = diff(legacy, newSdk, reDocumented);
      const reReport = formatReport(reFindings);
      console.log(reReport);

      const remainingErrors = reFindings.filter((f) => f.severity === 'error').length;
      process.exit(remainingErrors > 0 ? 1 : 0);
    }
  }

  const errorCount = findings.filter((f) => f.severity === 'error').length;
  process.exit(errorCount > 0 || clientImportErrors.length > 0 ? 1 : 0);
}

main();
