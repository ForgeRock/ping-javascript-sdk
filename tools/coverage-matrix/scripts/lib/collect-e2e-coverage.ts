import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface RuntimeE2eCoverage {
  /** Absolute paths of SDK source files with at least one invoked function */
  readonly coveredFiles: readonly string[];
}

/**
 * A single V8 coverage entry from Playwright's page.coverage.stopJSCoverage().
 * Each entry represents one script/module loaded by the browser.
 */
interface V8CoverageEntry {
  url: string;
  source?: string;
  functions: V8FunctionCoverage[];
}

interface V8FunctionCoverage {
  functionName: string;
  ranges: Array<{ startOffset: number; endOffset: number; count: number }>;
}

/**
 * Check if a V8 coverage entry has functions that were genuinely invoked.
 *
 * V8 reports one anonymous function for every module (the module wrapper/body).
 * In compiled ESM/CJS output, most function names are empty strings because
 * they're assigned to exports (e.g. `exports.foo = function() {}`).
 *
 * Heuristic: if more than one function in the module was executed, real code
 * ran — not just the module initialization. The module wrapper alone counts
 * as 1 function with count > 0.
 */
function hasGenuineInvocations(entry: V8CoverageEntry): boolean {
  const called = entry.functions.filter((fn) => fn.ranges.some((r) => r.count > 0));

  // More than 1 function called = real usage beyond module wrapper
  return called.length > 1;
}

/**
 * Extract the absolute file path from a Vite dev server URL.
 *
 * Vite serves workspace files as:
 *   http://localhost:5829/@fs/Users/.../packages/journey-client/dist/src/lib/client.store.js
 *
 * We extract the path after `/@fs` to get the absolute filesystem path.
 */
function extractFilePath(url: string): string | null {
  const fsMatch = url.match(/\/@fs(\/.*)/);
  if (fsMatch) return fsMatch[1];
  return null;
}

/**
 * Reads V8 coverage JSON files from `.e2e-coverage/` directory
 * (written by the Playwright coverage fixture) and extracts which
 * SDK source files had functions genuinely invoked during e2e tests.
 *
 * Uses Playwright's built-in V8 coverage — no Istanbul instrumentation
 * required. The browser itself tracks function execution.
 */
/**
 * Discover all `.e2e-coverage/` directories under `e2e/` suite projects.
 *
 * Each e2e suite writes coverage into its own project dir (e.g.
 * `e2e/oidc-suites/.e2e-coverage/`) so that Nx Cloud DTE agents transfer
 * the data back as declared outputs.
 */
function findCoverageDirs(workspaceRoot: string): string[] {
  const e2eRoot = join(workspaceRoot, 'e2e');
  if (!existsSync(e2eRoot)) return [];

  return readdirSync(e2eRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(e2eRoot, d.name, '.e2e-coverage'))
    .filter((dir) => existsSync(dir));
}

export function collectE2eCoverage(workspaceRoot: string): RuntimeE2eCoverage | null {
  const coverageDirs = findCoverageDirs(workspaceRoot);

  if (coverageDirs.length === 0) return null;

  const allCoveredFiles = new Set<string>();

  for (const coverageDir of coverageDirs) {
    const files = readdirSync(coverageDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      try {
        const entries: V8CoverageEntry[] = JSON.parse(
          readFileSync(join(coverageDir, file), 'utf-8'),
        );

        for (const entry of entries) {
          const filePath = extractFilePath(entry.url);
          if (!filePath || !filePath.includes('/packages/')) continue;
          if (hasGenuineInvocations(entry)) {
            allCoveredFiles.add(filePath);
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[collect-e2e-coverage] Skipping ${file}: ${message}`);
        continue;
      }
    }
  }

  if (allCoveredFiles.size === 0) return null;

  return { coveredFiles: [...allCoveredFiles] };
}
