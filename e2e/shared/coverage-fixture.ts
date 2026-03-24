/**
 * Playwright fixture that collects V8 code coverage via Chrome DevTools Protocol.
 *
 * Uses Playwright's built-in page.coverage API — no Istanbul instrumentation,
 * no Vite plugins, no build changes. The browser itself tracks which functions
 * were executed during each test.
 *
 * Coverage data is written to `.e2e-coverage/` as JSON files. The
 * collect-e2e-coverage.ts script reads these and maps them back to SDK
 * source files using source map data.
 *
 * Import this instead of `@playwright/test` in e2e test files:
 *   import { test, expect } from '@forgerock/e2e-shared/coverage-fixture';
 */
import { test as base, type Page, type TestInfo } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

/**
 * Resolve the coverage output directory relative to the test file's suite directory.
 *
 * Playwright tests run with cwd set to the suite root (e.g. e2e/oidc-suites).
 * Writing coverage into {cwd}/.e2e-coverage keeps it inside the project so
 * Nx Cloud DTE agents transfer it back as a declared output.
 */
const COVERAGE_DIR = join(process.cwd(), '.e2e-coverage');

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    // Start V8 JS coverage before the test runs
    await page.coverage.startJSCoverage({ reportAnonymousScripts: false });

    await use(page);

    // Collect coverage after test completes
    try {
      const entries = await page.coverage.stopJSCoverage();
      if (entries.length > 0) {
        mkdirSync(COVERAGE_DIR, { recursive: true });
        const hash = createHash('md5').update(testInfo.titlePath.join('/')).digest('hex');
        writeFileSync(join(COVERAGE_DIR, `${hash}.json`), JSON.stringify(entries));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Target closed') || message.includes('has been closed')) {
        // Expected: page closed before coverage could be collected
      } else {
        console.warn(
          `[coverage] Failed to collect for "${testInfo.titlePath.join(' > ')}": ${message}`,
        );
      }
    }
  },
});

export { expect } from '@playwright/test';
export type { CDPSession } from '@playwright/test';
