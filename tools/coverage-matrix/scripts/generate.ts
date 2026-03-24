import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildCoverageMatrix } from './lib/merge.js';
import type { RuntimeCoverage, StaticAnalysis } from './lib/types.js';

const dataDir = join(import.meta.dirname, '..', 'data');
const staticAnalysisPath = join(dataDir, 'static-analysis.json');
const runtimeCoveragePath = join(dataDir, 'runtime-coverage.json');
const outputPath = join(dataDir, 'coverage-matrix.json');

console.log('Coverage Matrix — Generate');
console.log('==========================\n');

if (!existsSync(staticAnalysisPath)) {
  console.error('No static-analysis.json found. Run `analyze` first.');
  process.exit(1);
}

const staticAnalysis: StaticAnalysis = JSON.parse(readFileSync(staticAnalysisPath, 'utf-8'));
console.log(`Loaded static analysis: ${staticAnalysis.packages.length} packages`);

let runtimeCoverage: RuntimeCoverage | null = null;
if (existsSync(runtimeCoveragePath)) {
  runtimeCoverage = JSON.parse(readFileSync(runtimeCoveragePath, 'utf-8')) as RuntimeCoverage;
  console.log('Loaded runtime coverage data');
}

const workspaceRoot = join(import.meta.dirname, '..', '..', '..');
const matrix = buildCoverageMatrix(staticAnalysis, runtimeCoverage, workspaceRoot);

mkdirSync(dataDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(matrix, null, 2));
console.log(`\nOutput written to ${relative(workspaceRoot, outputPath)}`);
console.log(`Source: ${matrix.source}`);
console.log(`Packages: ${matrix.packages.length}`);

for (const pkg of matrix.packages) {
  const { summary } = pkg;
  const unitPct =
    summary.totalExports > 0 ? Math.round((summary.unitCovered / summary.totalExports) * 100) : 0;
  const e2ePct =
    summary.totalExports > 0 ? Math.round((summary.e2eCovered / summary.totalExports) * 100) : 0;
  const filePct =
    summary.totalSourceFiles > 0
      ? Math.round((summary.unitTestedFiles / summary.totalSourceFiles) * 100)
      : 0;
  console.log(
    `  ${pkg.name}: ${summary.totalExports} exports, unit ${unitPct}%, e2e ${e2ePct}%, files ${summary.unitTestedFiles}/${summary.totalSourceFiles} (${filePct}%), ${summary.uncovered} uncovered`,
  );
}
