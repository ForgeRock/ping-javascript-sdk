/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Measures tree-shaken, fully-minified bundle cost of each fixture in `../fixtures/`.
 * Reports both minified (raw) size and gzip level-9 size — the two numbers that matter
 * to a consumer: what they ship and what their users download.
 *
 * Mirrors the approach used by the Effect team:
 * https://github.com/Effect-TS/effect-smol/blob/main/packages/tools/bundle/src/Rollup.ts
 *
 * Run via: pnpm nx nxBundle bundle-check-app
 */

import { createGzip } from 'node:zlib';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import esbuild from 'rollup-plugin-esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../fixtures');
const outDir = path.resolve(__dirname, '../dist');

mkdirSync(outDir, { recursive: true });

const fixtures = readdirSync(fixturesDir)
  .filter((f) => f.endsWith('.ts'))
  .sort();

if (fixtures.length === 0) {
  console.error('No fixtures found in', fixturesDir);
  process.exit(1);
}

console.log(`\nMeasuring ${fixtures.length} fixture(s)…\n`);

/** Gzip a string buffer at level 9 and return the compressed byte count. */
function gzipSize(code: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const gz = createGzip({ level: 9 });
    let total = 0;
    gz.on('data', (chunk: Buffer) => {
      total += chunk.length;
    });
    gz.on('end', () => resolve(total));
    gz.on('error', reject);
    gz.end(Buffer.from(code, 'utf8'));
  });
}

function fmt(bytes: number): string {
  return `${(bytes / 1000).toFixed(2)} kB`;
}

type Row = { name: string; minifiedBytes: number; gzipBytes: number };

const rows: Row[] = [];

for (const fixture of fixtures) {
  const inputPath = path.join(fixturesDir, fixture);
  const name = path.basename(fixture, '.ts');

  const bundle = await rollup({
    input: inputPath,
    plugins: [
      nodeResolve({ browser: true }),
      esbuild({ target: 'esnext', format: 'esm', treeShaking: true }),
      // @ts-ignore – NodeNext moduleResolution misidentifies the default export type for @rollup/plugin-terser
      terser({ format: { comments: false }, compress: true, mangle: true }),
    ],
    onwarn: (warning, next) => {
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      next(warning);
    },
  });

  const { output } = await bundle.generate({ format: 'esm' });
  await bundle.close();

  const code = output
    .filter((chunk) => chunk.type === 'chunk')
    .map((chunk) => chunk.code)
    .join('');

  // Write minified output for inspection
  writeFileSync(path.join(outDir, `${name}.min.js`), code, 'utf8');

  rows.push({
    name: fixture,
    minifiedBytes: Buffer.byteLength(code, 'utf8'),
    gzipBytes: await gzipSize(code),
  });
}

// --- Baseline JSON (raw bytes, used for PR comparison) ---
type Baseline = Record<string, { minifiedBytes: number; gzipBytes: number }>;
const baseline: Baseline = Object.fromEntries(
  rows.map((r) => [r.name, { minifiedBytes: r.minifiedBytes, gzipBytes: r.gzipBytes }]),
);
writeFileSync(
  path.join(outDir, 'bundle-feature-baseline.json'),
  JSON.stringify(baseline, null, 2) + '\n',
  'utf8',
);

// --- Markdown table ---
const pad = (s: string, w: number) => s.padStart(w);
const padL = (s: string, w: number) => s.padEnd(w);

// Load baseline for comparison if available
let prevBaseline: Baseline = {};
const prevBaselinePath = path.resolve(__dirname, '../bundle-feature-baseline.json');
try {
  prevBaseline = JSON.parse(readFileSync(prevBaselinePath, 'utf8')) as Baseline;
} catch (err) {
  if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
    console.warn('Failed to load previous baseline:', err);
  }
}

function delta(current: number, prev: number | undefined): string {
  if (prev === undefined) return ' 🆕';
  const diff = current - prev;
  if (diff === 0) return '';
  const sign = diff > 0 ? '+' : '';
  return ` (${sign}${fmt(diff)} ${diff > 0 ? '🔺' : '🔻'})`;
}

type TableRow = { name: string; minified: string; gzip: string };
const tableRows: TableRow[] = rows.map((r) => {
  const prev = prevBaseline[r.name];
  return {
    name: r.name,
    minified: fmt(r.minifiedBytes) + delta(r.minifiedBytes, prev?.minifiedBytes),
    gzip: fmt(r.gzipBytes) + delta(r.gzipBytes, prev?.gzipBytes),
  };
});

const nameW = Math.max(...tableRows.map((r) => r.name.length)) + 2; // +2 for backticks
const minW = Math.max('Minified'.length, ...tableRows.map((r) => r.minified.length));
const gzipW = Math.max('gzip (lvl 9)'.length, ...tableRows.map((r) => r.gzip.length));

const header = `| ${padL('Fixture', nameW)} | ${pad('Minified', minW)} | ${pad('gzip (lvl 9)', gzipW)} |`;
const divider = `|:${'-'.repeat(nameW)}-|-${'-'.repeat(minW)}:|-${'-'.repeat(gzipW)}:|`;
const mdRows = tableRows.map(
  (r) => `| ${padL(`\`${r.name}\``, nameW)} | ${pad(r.minified, minW)} | ${pad(r.gzip, gzipW)} |`,
);

const table = [header, divider, ...mdRows].join('\n');

console.log(table);
console.log();

// Write markdown report for CI consumption
writeFileSync(path.join(outDir, 'bundle-feature-report.md'), table + '\n', 'utf8');
