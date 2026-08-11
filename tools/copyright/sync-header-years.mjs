#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function isCliExecution() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

function run() {
  const args = new Set(process.argv.slice(2));
  const checkOnly = args.has('--check');
  const fixMode = args.has('--fix');

  if (!checkOnly && !fixMode) {
    console.error('Usage: sync-header-years.mjs --check | --fix');
    process.exit(1);
  }

  const currentYear = new Date().getFullYear();

  const stagedFileData = [];
  const invalidFiles = [];
  const missingHeaderFiles = [];
  const changedFiles = [];

  for (const file of getStagedFiles()) {
    if (isExcluded(file)) {
      continue;
    }

    let original;
    try {
      if (!statSync(resolve(process.cwd(), file)).isFile()) {
        continue;
      }
      original = readFileSync(resolve(process.cwd(), file), 'utf8');
    } catch {
      continue;
    }

    const absolutePath = resolve(process.cwd(), file);
    const { present, invalid } = inspectPingCopyrightHeader(original);

    if (invalid) {
      invalidFiles.push(file);
    }
    if (SOURCE_FILE_PATTERN.test(file) && !present) {
      missingHeaderFiles.push(file);
    }

    const updated = updateCopyrightYears(original, currentYear);
    if (updated !== original) {
      changedFiles.push(file);
    }
    stagedFileData.push({ file, absolutePath, updated });
  }

  if (invalidFiles.length > 0) {
    console.error('Invalid Ping copyright header year format in staged files:');
    for (const file of invalidFiles) {
      console.error(`- ${file}`);
    }
    process.exit(1);
  }

  if (checkOnly) {
    if (missingHeaderFiles.length > 0) {
      console.error('Missing Ping copyright header in staged files:');
      for (const file of missingHeaderFiles) {
        console.error(`- ${file}`);
      }
      process.exit(1);
    }
    if (changedFiles.length > 0) {
      console.error('Stale Ping copyright years found in staged files:');
      for (const file of changedFiles) {
        console.error(`- ${file}`);
      }
      process.exit(1);
    }
    return;
  }

  for (const { file, absolutePath, updated } of stagedFileData) {
    if (changedFiles.includes(file)) {
      writeFileSync(absolutePath, updated, 'utf8');
    }
  }

  if (changedFiles.length > 0) {
    execFileSync('git', ['add', '--', ...changedFiles], { stdio: 'inherit' });
  }
}

function getStagedFiles() {
  const output = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
  }).trim();

  if (!output) {
    return [];
  }
  return output.split('\n').filter(Boolean);
}

export function isExcluded(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
}

const EXCLUDE_PATTERNS = [
  /(^|[/\\])dist[/\\]/,
  /(^|[/\\])vendor[/\\]/,
  /(^|[/\\])node_modules[/\\]/,
  /(^|[/\\])tools[/\\]/,
  /(^|[/\\])_polyfills[/\\]/,
  /(^|[/\\])vite[^/\\]*\.config\.[cm]?[jt]sx?$/i,
  /(^|[/\\])vitest\.setup\.[cm]?[jt]sx?$/i,
  /(^|[/\\])playwright\.config\.[cm]?[jt]sx?$/i,
];

export function updateCopyrightYears(content, year) {
  const regex =
    /(^.*(?:©\s*|&copy;\s*)?Copyright(?:\s*\(c\))?\s+)(\d{4})(?:([ \t]*-[ \t]*)(\d{4}))?(\s+Ping Identity(?: Corporation)?\b.*$)/gim;

  return content.replace(regex, (match, prefix, startYear, separator, endYear, suffix) => {
    if (!HEADER_COMMENT_LINE_REGEX.test(prefix)) {
      return match;
    }

    const start = Number.parseInt(startYear, 10);
    const end = endYear ? Number.parseInt(endYear, 10) : start;

    if (Number.isNaN(start) || Number.isNaN(end)) {
      return `${prefix}${startYear}${endYear ? `${separator}${endYear}` : ''}${suffix}`;
    }

    const resolvedEnd = end >= year ? end : year;

    if (!endYear) {
      // Single year already current — no range needed
      if (resolvedEnd === start) {
        return `${prefix}${startYear}${suffix}`;
      }
      return `${prefix}${startYear} - ${resolvedEnd}${suffix}`;
    }

    // Always normalize separator to ' - ' and bump end year when stale
    return `${prefix}${startYear} - ${resolvedEnd}${suffix}`;
  });
}

export function inspectPingCopyrightHeader(content) {
  const lines = content.split(/\r?\n/);
  let present = false;
  let invalid = false;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      continue;
    }

    const isHeaderLine = inBlockComment || HEADER_COMMENT_LINE_REGEX.test(line);
    if (!isHeaderLine) {
      break;
    }

    if (/^\/\*/.test(trimmed)) {
      inBlockComment = true;
    }
    if (inBlockComment && /\*\//.test(trimmed)) {
      inBlockComment = false;
    }

    if (!MAYBE_PING_COPYRIGHT_LINE_REGEX.test(line)) {
      continue;
    }
    present = true;
    if (!VALID_PING_COPYRIGHT_LINE_REGEX.test(line)) {
      invalid = true;
    }
  }

  return { present, invalid };
}

const SOURCE_FILE_PATTERN = /\.[cm]?[jt]sx?$/i;

const MAYBE_PING_COPYRIGHT_LINE_REGEX =
  /(?:©\s*|&copy;\s*)?Copyright(?:\s*\(c\))?.*Ping Identity(?: Corporation)?/i;
const HEADER_COMMENT_LINE_REGEX = /^\s*(?:\/\*+|\*+|\/\/+|#+|<!--)\s*/;
const VALID_PING_COPYRIGHT_LINE_REGEX =
  /^.*(?:©\s*|&copy;\s*)?Copyright(?:\s*\(c\))?\s+\d{4}(?:[ \t]*-[ \t]*\d{4})?\s+Ping Identity(?: Corporation)?\b.*$/i;

if (isCliExecution()) {
  run();
}
