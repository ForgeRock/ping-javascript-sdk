import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import packageJson from 'eslint-plugin-package-json/configs/recommended';
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
    ignores: ['**/dist', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
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
              onlyDependOnLibsWithTags: ['scope:utilities', 'scope:effects', 'scope:shared-types'],
            },
            {
              sourceTag: 'scope:utilities',
              onlyDependOnLibsWithTags: ['scope:shared-types'],
            },
            {
              sourceTag: 'scope:effects',
              onlyDependOnLibsWithTags: ['scope:utilities', 'scope:shared-types'],
            },
            {
              sourceTag: 'scope:config',
              onlyDependOnLibsWithTags: ['scope:utilities', 'scope:shared-types'],
            },
            {
              sourceTag: 'scope:shared-types',
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
  {
    ...packageJson,
    rules: {
      ...packageJson.rules,
      'package-json/no-empty-fields': 'off',
    },
  },
];
