export type ExportKind = 'function' | 'class' | 'type' | 'constant';
/**
 * Confidence level of coverage data:
 * - 'runtime': V8/Istanbul confirmed execution of the source file
 * - 'static': direct import found in test/app source code
 */
export type CoverageSource = 'static' | 'runtime';
export type MatrixSource = 'static' | 'runtime' | 'hybrid';

export interface CoverageEntry {
  readonly covered: boolean;
  readonly testFiles?: readonly string[];
  readonly testSuites?: readonly string[];
  readonly source: CoverageSource;
}

export interface ExportEntry {
  readonly name: string;
  readonly kind: ExportKind;
  readonly coverage: {
    readonly unit: CoverageEntry | null;
    readonly e2e: CoverageEntry | null;
    readonly typeTest: CoverageEntry | null;
  };
}

export interface ModuleEntry {
  readonly name: string;
  readonly path: string;
  readonly exports: readonly ExportEntry[];
}

export interface PackageSummary {
  readonly totalExports: number;
  readonly unitCovered: number;
  readonly e2eCovered: number;
  readonly uncovered: number;
  /** Total source files in the package (from V8/Istanbul data) */
  readonly totalSourceFiles: number;
  /** Source files with V8-confirmed unit test execution */
  readonly unitTestedFiles: number;
}

export interface PackageEntry {
  readonly name: string;
  readonly path: string;
  readonly modules: readonly ModuleEntry[];
  readonly summary: PackageSummary;
}

export interface CoverageMatrix {
  readonly generatedAt: string;
  readonly source: MatrixSource;
  readonly packages: readonly PackageEntry[];
}

/** Intermediate type used during analysis before coverage is known */
export interface DiscoveredExport {
  readonly name: string;
  readonly kind: ExportKind;
  readonly sourceFile: string;
}

export interface DiscoveredModule {
  readonly name: string;
  readonly sourcePath: string;
  readonly exports: readonly DiscoveredExport[];
}

export interface DiscoveredPackage {
  readonly name: string;
  readonly path: string;
  readonly modules: readonly DiscoveredModule[];
}

export interface StaticAnalysis {
  readonly generatedAt: string;
  readonly packages: readonly DiscoveredPackage[];
  readonly unitTestMappings: readonly UnitTestMapping[];
  readonly typeTestMappings: readonly TypeTestMapping[];
  readonly e2eSuiteMappings: readonly E2eSuiteMapping[];
  readonly warnings: readonly string[];
}

export interface UnitTestMapping {
  readonly testFile: string;
  readonly packageName: string;
  readonly importedExports: readonly string[];
}

export interface TypeTestMapping {
  readonly testFile: string;
  readonly packageName: string;
  readonly importedExports: readonly string[];
}

export interface E2eSuitePackageImports {
  readonly packageName: string;
  readonly importedNames: readonly string[];
}

export interface E2eSuiteMapping {
  readonly suiteName: string;
  readonly packages: readonly string[];
  /** Named imports per package — for export-level e2e coverage */
  readonly packageImports: readonly E2eSuitePackageImports[];
}

export interface RuntimeCoverage {
  readonly unitCoverage: readonly RuntimeUnitPackageCoverage[];
  /** Merged e2e coverage from Playwright V8 coverage collection */
  readonly e2eCoverage: readonly RuntimeE2eCoverageEntry[];
}

export interface RuntimeUnitPackageCoverage {
  readonly packageName: string;
  readonly coveredFiles: readonly string[];
}

export interface RuntimeE2eCoverageEntry {
  /** Absolute paths of SDK source files executed during e2e tests */
  readonly coveredFiles: readonly string[];
}
