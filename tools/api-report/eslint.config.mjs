import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['**/dist'],
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'warn',
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
    ignores: [
      '**/*.md',
      'LICENSE',
      'dist',
      'coverage',
      'vite.config.*.timestamp*',
      '*tsconfig.tsbuildinfo*',
    ],
  },
];
