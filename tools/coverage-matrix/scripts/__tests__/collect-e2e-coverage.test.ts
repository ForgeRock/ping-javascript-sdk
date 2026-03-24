import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { collectE2eCoverage } from '../lib/collect-e2e-coverage.js';

const tmpDir = join(import.meta.dirname, '.tmp-e2e-coverage-test');
const coverageDir = join(tmpDir, '.e2e-coverage');

function writeV8Coverage(filename: string, entries: unknown[]): void {
  mkdirSync(coverageDir, { recursive: true });
  writeFileSync(join(coverageDir, filename), JSON.stringify(entries));
}

function makeEntry(url: string, functions: Array<{ functionName: string; count: number }>) {
  return {
    url,
    source: '',
    functions: functions.map((f) => ({
      functionName: f.functionName,
      ranges: [{ startOffset: 0, endOffset: 100, count: f.count }],
    })),
  };
}

describe('collectE2eCoverage', () => {
  beforeEach(() => {
    mkdirSync(coverageDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null when no .e2e-coverage directory exists', () => {
    rmSync(tmpDir, { recursive: true, force: true });
    expect(collectE2eCoverage(tmpDir)).toBeNull();
  });

  it('returns null when directory is empty', () => {
    expect(collectE2eCoverage(tmpDir)).toBeNull();
  });

  it('extracts file paths from Vite /@fs/ URLs', () => {
    writeV8Coverage('test.json', [
      makeEntry('http://localhost:5829/@fs/workspace/packages/foo/dist/src/lib/bar.js', [
        { functionName: '', count: 1 },
        { functionName: 'doStuff', count: 1 },
      ]),
    ]);

    const result = collectE2eCoverage(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.coveredFiles).toContain('/workspace/packages/foo/dist/src/lib/bar.js');
  });

  it('filters out non-package URLs', () => {
    writeV8Coverage('test.json', [
      makeEntry('http://localhost:5829/@vite/client', [
        { functionName: '', count: 1 },
        { functionName: 'setup', count: 1 },
      ]),
    ]);

    const result = collectE2eCoverage(tmpDir);
    expect(result).toBeNull();
  });

  it('filters out modules with only the wrapper function called', () => {
    writeV8Coverage('test.json', [
      makeEntry(
        'http://localhost:5829/@fs/workspace/packages/foo/dist/src/lib/bar.js',
        [{ functionName: '', count: 1 }], // Only module wrapper
      ),
    ]);

    const result = collectE2eCoverage(tmpDir);
    expect(result).toBeNull();
  });

  it('includes modules with more than one function called', () => {
    writeV8Coverage('test.json', [
      makeEntry('http://localhost:5829/@fs/workspace/packages/foo/dist/src/lib/bar.js', [
        { functionName: '', count: 1 },
        { functionName: 'myFunction', count: 3 },
      ]),
    ]);

    const result = collectE2eCoverage(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.coveredFiles).toHaveLength(1);
  });

  it('merges coverage across multiple JSON files', () => {
    writeV8Coverage('test1.json', [
      makeEntry('http://localhost:5829/@fs/workspace/packages/foo/dist/src/lib/a.js', [
        { functionName: '', count: 1 },
        { functionName: 'fnA', count: 1 },
      ]),
    ]);
    writeV8Coverage('test2.json', [
      makeEntry('http://localhost:5829/@fs/workspace/packages/foo/dist/src/lib/b.js', [
        { functionName: '', count: 1 },
        { functionName: 'fnB', count: 1 },
      ]),
    ]);

    const result = collectE2eCoverage(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.coveredFiles).toHaveLength(2);
  });

  it('skips malformed JSON files and continues', () => {
    mkdirSync(coverageDir, { recursive: true });
    writeFileSync(join(coverageDir, 'bad.json'), 'not valid json{{{');
    writeV8Coverage('good.json', [
      makeEntry('http://localhost:5829/@fs/workspace/packages/foo/dist/src/lib/bar.js', [
        { functionName: '', count: 1 },
        { functionName: 'fn', count: 1 },
      ]),
    ]);

    const result = collectE2eCoverage(tmpDir);
    expect(result).not.toBeNull();
    expect(result!.coveredFiles).toHaveLength(1);
  });
});
