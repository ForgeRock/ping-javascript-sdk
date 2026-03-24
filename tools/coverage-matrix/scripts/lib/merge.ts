import { globSync } from 'glob';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type {
  StaticAnalysis,
  CoverageMatrix,
  PackageEntry,
  PackageSummary,
  ModuleEntry,
  ExportEntry,
  ExportKind,
  CoverageEntry,
  RuntimeCoverage,
} from './types.js';

type UnitMap = Map<string, Map<string, string[]>>;
type TypeTestMap = Map<string, Map<string, string[]>>;
/** packageName → suiteNames[] (package-level) */
type E2ePackageMap = Map<string, string[]>;
/** packageName → exportName → suiteNames[] (export-level) */
type E2eExportMap = Map<string, Map<string, string[]>>;
/** packageName → Set of absolute covered file paths */
type RuntimeUnitMap = Map<string, Set<string>>;

function buildUnitMap(staticAnalysis: StaticAnalysis): UnitMap {
  const map: UnitMap = new Map();
  for (const mapping of staticAnalysis.unitTestMappings) {
    if (!map.has(mapping.packageName)) {
      map.set(mapping.packageName, new Map());
    }
    const exportMap = map.get(mapping.packageName)!;
    for (const exportName of mapping.importedExports) {
      if (!exportMap.has(exportName)) {
        exportMap.set(exportName, []);
      }
      exportMap.get(exportName)!.push(mapping.testFile);
    }
  }
  return map;
}

function buildE2eExportMap(staticAnalysis: StaticAnalysis): E2eExportMap {
  const map: E2eExportMap = new Map();
  for (const mapping of staticAnalysis.e2eSuiteMappings) {
    for (const pkgImport of mapping.packageImports) {
      if (!map.has(pkgImport.packageName)) {
        map.set(pkgImport.packageName, new Map());
      }
      const exportMap = map.get(pkgImport.packageName)!;
      for (const name of pkgImport.importedNames) {
        if (!exportMap.has(name)) {
          exportMap.set(name, []);
        }
        exportMap.get(name)!.push(mapping.suiteName);
      }
    }
  }
  return map;
}

function buildTypeTestMap(staticAnalysis: StaticAnalysis): TypeTestMap {
  const map: TypeTestMap = new Map();
  for (const mapping of staticAnalysis.typeTestMappings) {
    if (!map.has(mapping.packageName)) {
      map.set(mapping.packageName, new Map());
    }
    const exportMap = map.get(mapping.packageName)!;
    for (const exportName of mapping.importedExports) {
      if (!exportMap.has(exportName)) {
        exportMap.set(exportName, []);
      }
      exportMap.get(exportName)!.push(mapping.testFile);
    }
  }
  return map;
}

function buildRuntimeUnitMap(runtimeCoverage: RuntimeCoverage | null): RuntimeUnitMap {
  const map: RuntimeUnitMap = new Map();
  if (!runtimeCoverage) return map;

  for (const pkg of runtimeCoverage.unitCoverage) {
    map.set(pkg.packageName, new Set(pkg.coveredFiles));
  }
  return map;
}

/**
 * Normalize a Vite-served dist path back to the original TypeScript source path.
 * Vite dev server resolves packages from their `dist/` output, so paths look like
 * `packages/foo/dist/src/lib/bar.js`. We map `dist/src/` → `src/` and `.js` → `.ts`.
 */
function normalizeDistPath(filePath: string): string {
  return filePath.replace(/\/dist\/src\//, '/src/').replace(/\.js$/, '.ts');
}

/** Build a flat Set of all source files covered by e2e tests (V8/Playwright data) */
function buildRuntimeE2eFileSet(runtimeCoverage: RuntimeCoverage | null): Set<string> {
  const files = new Set<string>();
  if (!runtimeCoverage) return files;

  for (const entry of runtimeCoverage.e2eCoverage) {
    for (const file of entry.coveredFiles) {
      files.add(normalizeDistPath(file));
    }
  }
  return files;
}

function buildExportEntry(
  exportDef: { name: string; kind: ExportKind; sourceFile: string },
  unitMap: Map<string, string[]> | undefined,
  typeTestMap: Map<string, string[]> | undefined,
  e2eExportMap: Map<string, string[]> | undefined,
  runtimeUnitFiles: Set<string> | undefined,
  runtimeE2eFiles: Set<string>,
): ExportEntry {
  const isType = exportDef.kind === 'type';

  let unitCoverage: CoverageEntry | null = null;
  if (!isType) {
    const hasRuntimeCoverage = runtimeUnitFiles?.has(exportDef.sourceFile) ?? false;

    if (hasRuntimeCoverage) {
      unitCoverage = {
        covered: true,
        source: 'runtime',
      };
    } else {
      const testFiles = unitMap?.get(exportDef.name);
      if (testFiles && testFiles.length > 0) {
        unitCoverage = {
          covered: true,
          testFiles,
          source: 'static',
        };
      }
    }
  }

  // E2E coverage — runtime Istanbul only, no static fallback.
  // Only count exports whose source file had functions actually invoked.
  let e2eCoverage: CoverageEntry | null = null;
  if (!isType && runtimeE2eFiles.has(exportDef.sourceFile)) {
    e2eCoverage = {
      covered: true,
      source: 'runtime',
    };
  }

  // Type test coverage — applies to type exports
  let typeTestCoverage: CoverageEntry | null = null;
  if (isType) {
    const testFiles = typeTestMap?.get(exportDef.name);
    if (testFiles && testFiles.length > 0) {
      typeTestCoverage = {
        covered: true,
        testFiles,
        source: 'static',
      };
    }
  }

  return {
    name: exportDef.name,
    kind: exportDef.kind,
    coverage: {
      unit: unitCoverage,
      e2e: e2eCoverage,
      typeTest: typeTestCoverage,
    },
  };
}

function buildModuleEntry(
  moduleDef: {
    name: string;
    sourcePath: string;
    exports: readonly { name: string; kind: ExportKind; sourceFile: string }[];
  },
  unitMap: Map<string, string[]> | undefined,
  typeTestMap: Map<string, string[]> | undefined,
  e2eExportMap: Map<string, string[]> | undefined,
  runtimeUnitFiles: Set<string> | undefined,
  runtimeE2eFiles: Set<string>,
): ModuleEntry {
  const exports = moduleDef.exports.map((exp) =>
    buildExportEntry(exp, unitMap, typeTestMap, e2eExportMap, runtimeUnitFiles, runtimeE2eFiles),
  );
  return {
    name: moduleDef.name,
    path: moduleDef.sourcePath,
    exports,
  };
}

function buildPackageSummary(
  modules: readonly ModuleEntry[],
  runtimeUnitFiles: Set<string> | undefined,
  totalSourceFiles: number,
): PackageSummary {
  // Deduplicate exports across modules — the same symbol exported from
  // both "." and "./constants" should only count once in the summary.
  const seen = new Set<string>();
  let totalExports = 0;
  let unitCovered = 0;
  let e2eCovered = 0;
  let coveredByAny = 0;

  for (const mod of modules) {
    for (const exp of mod.exports) {
      if (exp.kind === 'type') continue;
      if (seen.has(exp.name)) continue;
      seen.add(exp.name);

      totalExports++;
      const hasUnit = exp.coverage.unit?.covered ?? false;
      const hasE2e = exp.coverage.e2e?.covered ?? false;
      if (hasUnit) unitCovered++;
      if (hasE2e) e2eCovered++;
      if (hasUnit || hasE2e) coveredByAny++;
    }
  }

  const uncovered = totalExports - coveredByAny;
  const unitTestedFiles = runtimeUnitFiles?.size ?? 0;

  return { totalExports, unitCovered, e2eCovered, uncovered, totalSourceFiles, unitTestedFiles };
}

function buildPackageEntry(
  packageDef: StaticAnalysis['packages'][number],
  unitMap: UnitMap,
  typeTestMap: TypeTestMap,
  e2eExportMap: E2eExportMap,
  runtimeUnitMap: RuntimeUnitMap,
  runtimeE2eFiles: Set<string>,
  workspaceRoot: string,
): PackageEntry {
  const pkgUnitMap = unitMap.get(packageDef.name);
  const pkgTypeTestMap = typeTestMap.get(packageDef.name);
  const pkgE2eExportMap = e2eExportMap.get(packageDef.name);
  const runtimeUnitFiles = runtimeUnitMap.get(packageDef.name);

  const modules = packageDef.modules.map((mod) =>
    buildModuleEntry(
      mod,
      pkgUnitMap,
      pkgTypeTestMap,
      pkgE2eExportMap,
      runtimeUnitFiles,
      runtimeE2eFiles,
    ),
  );

  // Count non-test, non-type source files in the package
  const srcDir = join(workspaceRoot, packageDef.path, 'src');
  let totalSourceFiles = 0;
  if (existsSync(srcDir)) {
    totalSourceFiles = globSync(['**/*.ts'], {
      cwd: srcDir,
      ignore: ['**/*.test.*', '**/*.spec.*', '**/*.test-d.*', '**/*.d.ts'],
    }).length;
  }

  const summary = buildPackageSummary(modules, runtimeUnitFiles, totalSourceFiles);

  return {
    name: packageDef.name,
    path: packageDef.path,
    modules,
    summary,
  };
}

export function buildCoverageMatrix(
  staticAnalysis: StaticAnalysis,
  runtimeCoverage: RuntimeCoverage | null,
  workspaceRoot: string,
): CoverageMatrix {
  const unitMap = buildUnitMap(staticAnalysis);
  const typeTestMap = buildTypeTestMap(staticAnalysis);
  const e2eExportMap = buildE2eExportMap(staticAnalysis);
  const runtimeUnitMap = buildRuntimeUnitMap(runtimeCoverage);
  const runtimeE2eFiles = buildRuntimeE2eFileSet(runtimeCoverage);

  const hasRuntime = runtimeUnitMap.size > 0 || runtimeE2eFiles.size > 0;
  const source = hasRuntime ? 'hybrid' : 'static';

  const packages = staticAnalysis.packages.map((pkg) =>
    buildPackageEntry(
      pkg,
      unitMap,
      typeTestMap,
      e2eExportMap,
      runtimeUnitMap,
      runtimeE2eFiles,
      workspaceRoot,
    ),
  );

  return {
    generatedAt: new Date().toISOString(),
    source,
    packages,
  };
}
