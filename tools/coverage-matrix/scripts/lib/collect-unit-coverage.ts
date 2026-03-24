import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface RuntimeUnitCoverage {
  readonly packageName: string;
  /** Only files with at least one executed statement */
  readonly coveredFiles: readonly string[];
}

interface IstanbulFileCoverage {
  s: Record<string, number>;
  f: Record<string, number>;
}

/** A file is "covered" only if at least one statement was actually executed */
function hasExecutedStatements(fileCoverage: IstanbulFileCoverage): boolean {
  return Object.values(fileCoverage.s).some((hits) => hits > 0);
}

export function collectUnitCoverage(
  workspaceRoot: string,
  packagePaths: readonly string[],
): readonly RuntimeUnitCoverage[] {
  const results: RuntimeUnitCoverage[] = [];

  for (const pkgPath of packagePaths) {
    const coverageDir = join(workspaceRoot, pkgPath, 'coverage');
    const coverageJsonPath = join(coverageDir, 'coverage-final.json');

    if (!existsSync(coverageJsonPath)) continue;

    try {
      const coverageData: Record<string, IstanbulFileCoverage> = JSON.parse(
        readFileSync(coverageJsonPath, 'utf-8'),
      );

      // Only include files where at least one statement was actually hit
      const coveredFiles = Object.entries(coverageData)
        .filter(([, fileCov]) => hasExecutedStatements(fileCov))
        .map(([filePath]) => filePath);

      const pkgJson = JSON.parse(
        readFileSync(join(workspaceRoot, pkgPath, 'package.json'), 'utf-8'),
      );

      results.push({
        packageName: pkgJson.name,
        coveredFiles,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[collect-unit-coverage] Skipping ${pkgPath}: ${message}`);
      continue;
    }
  }

  return results;
}
