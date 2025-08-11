import baseConfig from '../../eslint.config.mjs';

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
];
