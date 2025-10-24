import baseConfig from '../../eslint.config.mjs';
import playwright from 'eslint-plugin-playwright';

export default [
  ...baseConfig,
  {
    ignores: [
      '.playwright/',
      'node_modules',
      '*.md',
      'LICENSE',
      '.babelrc',
      '.env*',
      '.bin',
      'dist',
    ],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    // Override or add rules here
    rules: {},
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['src/*.spec.ts', 'src/utils/async-events.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Customize Playwright rules
      // ...
    },
  },
];
