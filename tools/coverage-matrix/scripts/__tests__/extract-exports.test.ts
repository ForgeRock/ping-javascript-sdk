import { describe, it, expect } from 'vitest';
import { extractExportsFromFile } from '../lib/extract-exports.js';
import { join } from 'node:path';

const fixturesDir = join(import.meta.dirname, 'fixtures');

describe('extractExportsFromFile', () => {
  it('extracts named exports with correct kinds from a barrel file, resolving to actual source', () => {
    const barrelFile = join(fixturesDir, 'mock-package-simple', 'src', 'index.ts');
    const actualSource = join(fixturesDir, 'mock-package-simple', 'src', 'lib', 'foo.ts');
    const result = extractExportsFromFile(barrelFile);

    // Re-exports should resolve to the actual declaration file, not the barrel
    expect(result).toEqual(
      expect.arrayContaining([
        { name: 'greet', kind: 'function', sourceFile: actualSource },
        { name: 'DEFAULT_NAME', kind: 'constant', sourceFile: actualSource },
        { name: 'GreetOptions', kind: 'type', sourceFile: actualSource },
      ]),
    );
    expect(result).toHaveLength(3);
  });

  it('extracts exports directly from a source file with declarations', () => {
    const sourceFile = join(fixturesDir, 'mock-package-simple', 'src', 'lib', 'foo.ts');
    const result = extractExportsFromFile(sourceFile);

    expect(result).toEqual(
      expect.arrayContaining([
        { name: 'greet', kind: 'function', sourceFile },
        { name: 'DEFAULT_NAME', kind: 'constant', sourceFile },
        { name: 'GreetOptions', kind: 'type', sourceFile },
        { name: 'Greeter', kind: 'class', sourceFile },
      ]),
    );
    expect(result).toHaveLength(4);
  });

  it('returns empty array for non-existent file', () => {
    const result = extractExportsFromFile('/nonexistent/file.ts');
    expect(result).toEqual([]);
  });
});
