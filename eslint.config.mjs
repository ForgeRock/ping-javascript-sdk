/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import packageJson from 'eslint-plugin-package-json';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import nxEslintPlugin from '@nx/eslint-plugin';
import eslintPluginImport from 'eslint-plugin-import';
import typescriptEslintParser from '@typescript-eslint/parser';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      '**/dist',
      '**/docs',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/out-tsc',
      '**/test-output',
    ],
  },
  ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
      '@nx': nxEslintPlugin,
      import: eslintPluginImport,
    },
  },
  {
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },
    },
  },
  {
    rules: {
      'import/extensions': [2, 'ignorePackages'],
      '@typescript-eslint/indent': ['error', 2],
      '@typescript-eslint/no-use-before-define': 'warn',
      'max-len': [
        'error',
        {
          code: 100,
        },
      ],
      quotes: [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'import/extensions': [2, 'ignorePackages'],
      '@nx/enforce-module-boundaries': [
        'warn',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:e2e',
              onlyDependOnLibsWithTags: ['scope:package'],
            },
            {
              sourceTag: 'scope:package',
              onlyDependOnLibsWithTags: [
                'scope:sdk-utilities',
                'scope:sdk-effects',
                'scope:sdk-types',
              ],
            },
            {
              sourceTag: 'scope:sdk-utilities',
              onlyDependOnLibsWithTags: ['scope:sdk-types'],
            },
            {
              sourceTag: 'scope:sdk-effects',
              onlyDependOnLibsWithTags: ['scope:sdk-utilities', 'scope:sdk-types'],
            },
            {
              sourceTag: 'scope:sdk-config',
              onlyDependOnLibsWithTags: ['scope:sdk-utilities', 'scope:sdk-types'],
            },
            {
              sourceTag: 'scope:sdk-types',
              onlyDependOnLibsWithTags: [],
            },
          ],
        },
      ],
    },
  },
  ...compat
    .config({
      extends: ['plugin:@nx/typescript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx', '!**/*.spec.ts', '!**/*.test*.ts', '**/*.cts', '**/*.mts'],
      rules: {
        ...config.rules,
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            ignoreRestSiblings: true,
          },
        ],
      },
    })),
  ...compat
    .config({
      extends: ['plugin:@nx/javascript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
      rules: {
        ...config.rules,
        quotes: [
          'error',
          'single',
          {
            allowTemplateLiterals: true,
          },
        ],
      },
    })),
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['./package.json', './generators.json'],
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    ignores: ['**/*.md', 'dist/*', '**/**/tsconfig.spec.vitest-temp.json'],
  },
  packageJson.configs.recommended,
  {
    rules: {
      'package-json/no-empty-fields': 'off',
    },
  },
];
