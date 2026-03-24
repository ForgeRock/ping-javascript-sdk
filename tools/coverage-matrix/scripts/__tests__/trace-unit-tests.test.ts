import { describe, it, expect } from 'vitest';
import { traceTestImports } from '../lib/trace-unit-tests.js';
import { join } from 'node:path';
import type { DiscoveredPackage } from '../lib/types.js';

const fixturesDir = join(import.meta.dirname, 'fixtures');
const mockPkgDir = join(fixturesDir, 'mock-package-simple');

describe('traceTestImports', () => {
  it('maps test file imports to discovered exports', () => {
    const discoveredPackage: DiscoveredPackage = {
      name: '@forgerock/mock-simple',
      path: mockPkgDir,
      modules: [
        {
          name: '.',
          sourcePath: 'src/index.ts',
          exports: [
            { name: 'greet', kind: 'function', sourceFile: join(mockPkgDir, 'src/index.ts') },
            {
              name: 'DEFAULT_NAME',
              kind: 'constant',
              sourceFile: join(mockPkgDir, 'src/index.ts'),
            },
            { name: 'GreetOptions', kind: 'type', sourceFile: join(mockPkgDir, 'src/index.ts') },
          ],
        },
      ],
    };

    const result = traceTestImports(mockPkgDir, discoveredPackage);

    expect(result).toEqual([
      {
        testFile: expect.stringContaining('foo.test.ts'),
        packageName: '@forgerock/mock-simple',
        importedExports: expect.arrayContaining(['greet', 'DEFAULT_NAME']),
      },
    ]);
    // GreetOptions should NOT be in the list (not imported by the test)
    expect(result[0].importedExports).not.toContain('GreetOptions');
  });
});
