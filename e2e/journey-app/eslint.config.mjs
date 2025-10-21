import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: [
      'node_modules',
      '*.md',
      'LICENSE',
      '.babelrc',
      '.env*',
      '.bin',
      'dist',
      '.eslintignore',
      '*.html',
      '*.svg',
      '*.css',
      'public',
      '*.json',
      '*.d.ts',
    ],
  },
  ...baseConfig,
  {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    rules: {},
  },
  {
    files: ['*.ts', '*.tsx'],
    rules: {},
  },
  {
    files: ['*.js', '*.jsx'],
    rules: {},
  },
];
