import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'warn',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          ignoredDependencies: ['vitest', 'vitest-canvas-mock'],
        },
      ],
    },
    languageOptions: {
      parser: (await import('jsonc-eslint-parser')).default,
    },
  },
];
