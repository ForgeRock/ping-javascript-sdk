import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['**/dist'],
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
            '{projectRoot}/eslint.config.{js,cjs,mjs}',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    ignores: ['README.md'],
  },
  {
    ignores: [
      '**/*.md',
      'LICENSE',
      '.babelrc',
      '.env*',
      '.bin',
      'dist',
      '.eslintignore',
      'docs',
      'coverage',
      'vite.config.*.timestamp*',
      '*tsconfig.tsbuildinfo*',
      '**/**/mock-data/*.d.ts*',
    ],
  },
];
