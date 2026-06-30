import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** A single resolved export path entry. */
export interface ExportPath {
  readonly name: string;
  readonly distPath: string;
  readonly sourcePath: string;
}

/** The result of discovering a package's export paths. */
export interface DiscoveredPackageExportPaths {
  readonly name: string;
  readonly path: string;
  readonly exportPaths: readonly ExportPath[];
}

type ConditionalExport = {
  types?: string;
  import?: string;
  default?: string;
  [key: string]: string | undefined;
};

type PackageExports = Record<string, string | ConditionalExport>;

/** The entries that should always be excluded from export path resolution. */
const EXCLUDED_ENTRIES = new Set(['./package.json']);

/**
 * Maps a dist path (e.g. `./dist/src/index.js`) to the corresponding
 * source path (e.g. `./src/index.ts`).
 */
function distToSourcePath(distPath: string): string {
  return distPath
    .replace(/^\.\/dist\//, './')
    .replace(/\.d\.ts$/, '.ts')
    .replace(/\.js$/, '.ts');
}

/**
 * Resolves a single export value (string or conditional object) to a dist path,
 * returning `null` for entries that should be excluded (types-only `.d.ts` files,
 * plain `package.json` references, etc.).
 */
function resolveDistPath(value: string | ConditionalExport): string | null {
  if (typeof value === 'string') {
    if (value === './package.json') return null;
    // Accept .d.ts — it will resolve to the .ts source via distToSourcePath
    return value;
  }

  // Conditional export object — prefer `import`, fall back to `types`, then `default`
  const resolved = value['import'] ?? value['default'] ?? value['types'] ?? null;
  return resolved;
}

/**
 * Takes the raw `exports` field from a `package.json` and returns the
 * resolved `ExportPath[]`, filtering out non-code entries.
 */
export function resolveExportPaths(exports: PackageExports | undefined): ExportPath[] {
  if (exports === undefined) return [];

  const results: ExportPath[] = [];

  for (const [name, value] of Object.entries(exports)) {
    if (EXCLUDED_ENTRIES.has(name)) continue;

    const distPath = resolveDistPath(value);
    if (distPath === null) continue;

    results.push({ name, distPath, sourcePath: distToSourcePath(distPath) });
  }

  return results;
}

/**
 * Reads the `package.json` at `packageDir`, resolves its export paths, and
 * returns the combined result.
 */
export function discoverPackageExportPaths(packageDir: string): DiscoveredPackageExportPaths {
  const pkgJsonPath = join(packageDir, 'package.json');
  const raw = readFileSync(pkgJsonPath, 'utf-8');
  const pkg = JSON.parse(raw) as { name: string; exports?: PackageExports };

  return {
    name: pkg.name,
    path: packageDir,
    exportPaths: resolveExportPaths(pkg.exports),
  };
}

/**
 * Scans the workspace for packages, mirroring the layout:
 * - `packages/*`  (excluding `test-package` and `sdk-effects/`)
 * - `packages/sdk-effects/*`
 *
 * Returns only directories that contain a `package.json`.
 */
export function findWorkspacePackages(workspaceRoot: string): DiscoveredPackageExportPaths[] {
  const packagesRoot = join(workspaceRoot, 'packages');

  const topLevelEntries = readdirSync(packagesRoot, { withFileTypes: true });

  const packageDirs: string[] = [];

  for (const entry of topLevelEntries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'test-package') continue;

    if (entry.name === 'sdk-effects') {
      // Recurse one level into sdk-effects
      const sdkEffectsRoot = join(packagesRoot, 'sdk-effects');
      const subEntries = readdirSync(sdkEffectsRoot, { withFileTypes: true });
      for (const sub of subEntries) {
        if (!sub.isDirectory()) continue;
        packageDirs.push(join(sdkEffectsRoot, sub.name));
      }
    } else {
      packageDirs.push(join(packagesRoot, entry.name));
    }
  }

  return packageDirs
    .filter((dir) => {
      try {
        readFileSync(join(dir, 'package.json'), 'utf-8');
        return true;
      } catch {
        return false;
      }
    })
    .map(discoverPackageExportPaths);
}
