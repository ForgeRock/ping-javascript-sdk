import { writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { collectUnitCoverage } from './lib/collect-unit-coverage.js';
import { collectE2eCoverage } from './lib/collect-e2e-coverage.js';
import { findWorkspacePackages } from './lib/discover-packages.js';
import type { RuntimeCoverage } from './lib/types.js';

const workspaceRoot = join(import.meta.dirname, '..', '..', '..');
const outputDir = join(import.meta.dirname, '..', 'data');
const outputPath = join(outputDir, 'runtime-coverage.json');

console.log('Coverage Matrix — Collect Runtime Coverage');
console.log('==========================================\n');

const packageInfos = findWorkspacePackages(workspaceRoot);
const packagePaths = packageInfos.map((p) => relative(workspaceRoot, p.path));

const unitCoverage = collectUnitCoverage(workspaceRoot, packagePaths);
console.log(`Collected unit coverage for ${unitCoverage.length} packages`);

const e2eCoverage = collectE2eCoverage(workspaceRoot);
if (e2eCoverage) {
  console.log(
    `Collected e2e coverage: ${e2eCoverage.coveredFiles.length} SDK source files covered`,
  );
} else {
  console.log(
    'No e2e coverage data found. Run e2e tests with INSTRUMENT_COVERAGE=true to collect.',
  );
}

const output: RuntimeCoverage = {
  unitCoverage,
  e2eCoverage: e2eCoverage ? [e2eCoverage] : [],
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`\nOutput written to ${relative(workspaceRoot, outputPath)}`);
