import { writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { findWorkspacePackages } from './lib/discover-packages.js';
import { extractExportsFromFile } from './lib/extract-exports.js';
import { traceTestImports, traceTypeTestImports } from './lib/trace-unit-tests.js';
import { mapE2eSuitesToPackages } from './lib/map-e2e-suites.js';
import type { DiscoveredPackage, DiscoveredModule, StaticAnalysis } from './lib/types.js';

const workspaceRoot = join(import.meta.dirname, '..', '..', '..');
const outputDir = join(import.meta.dirname, '..', 'data');
const outputPath = join(outputDir, 'static-analysis.json');

const warnings: string[] = [];

function warn(message: string): void {
  warnings.push(message);
}

console.log('Coverage Matrix — Static Analysis');
console.log('==================================\n');

// Stage 1a: Discover packages and extract exports
const packageInfos = findWorkspacePackages(workspaceRoot);
console.log(`Found ${packageInfos.length} packages\n`);

const discoveredPackages: DiscoveredPackage[] = [];

for (const pkgInfo of packageInfos) {
  const pkgDir = pkgInfo.path;

  if (pkgInfo.exportPaths.length === 0) {
    warn(`${pkgInfo.name}: no code export paths found`);
    continue;
  }

  const modules: DiscoveredModule[] = [];

  for (const exportPath of pkgInfo.exportPaths) {
    const sourceFile = join(pkgDir, exportPath.sourcePath);
    const exports = extractExportsFromFile(sourceFile);

    if (exports.length === 0) {
      warn(
        `${pkgInfo.name} [${exportPath.name}]: source file not found or has no exports at ${exportPath.sourcePath}`,
      );
      continue;
    }

    modules.push({
      name: exportPath.name,
      sourcePath: exportPath.sourcePath,
      exports,
    });
  }

  if (modules.length > 0) {
    discoveredPackages.push({
      name: pkgInfo.name,
      path: relative(workspaceRoot, pkgDir),
      modules,
    });
  }

  const totalExports = modules.reduce((sum, m) => sum + m.exports.length, 0);
  console.log(`  ${pkgInfo.name}: ${modules.length} modules, ${totalExports} exports`);
}

// Stage 1b: Trace unit test imports
console.log('\nTracing unit test imports...');
const allUnitTestMappings = discoveredPackages.flatMap((pkg) => {
  const fullPath = join(workspaceRoot, pkg.path);
  return traceTestImports(fullPath, pkg);
});
console.log(`  Found ${allUnitTestMappings.length} test files with matched imports`);

// Stage 1b2: Trace type test imports
console.log('\nTracing type test imports...');
const allTypeTestMappings = discoveredPackages.flatMap((pkg) => {
  const fullPath = join(workspaceRoot, pkg.path);
  return traceTypeTestImports(fullPath, pkg);
});
console.log(`  Found ${allTypeTestMappings.length} type test files with matched imports`);

// Stage 1c: Map e2e suites
console.log('\nMapping e2e test suites...');
const e2eSuiteMappings = mapE2eSuitesToPackages(workspaceRoot);
for (const mapping of e2eSuiteMappings) {
  console.log(`  ${mapping.suiteName} → ${mapping.packages.join(', ')}`);
}

// Write output
mkdirSync(outputDir, { recursive: true });

const staticAnalysis: StaticAnalysis = {
  generatedAt: new Date().toISOString(),
  packages: discoveredPackages,
  unitTestMappings: allUnitTestMappings.map((m) => ({
    ...m,
    testFile: relative(workspaceRoot, m.testFile),
  })),
  typeTestMappings: allTypeTestMappings.map((m) => ({
    ...m,
    testFile: relative(workspaceRoot, m.testFile),
  })),
  e2eSuiteMappings: [...e2eSuiteMappings],
  warnings,
};

writeFileSync(outputPath, JSON.stringify(staticAnalysis, null, 2));
console.log(`\nOutput written to ${relative(workspaceRoot, outputPath)}`);

if (warnings.length > 0) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) {
    console.warn(`  ⚠ ${w}`);
  }
}
