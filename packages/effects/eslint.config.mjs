import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/*.test.{js,cjs,mjs,ts}',
            '{projectRoot}/eslint.config.{js,cjs,mjs}',
            '{projectRoot}/vite.config.ts',
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
      'out-tsc',
      'node_modules',
    ],
  },
];
