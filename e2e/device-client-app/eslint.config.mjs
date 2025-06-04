import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: [
      'node_modules',
      '*.md',
      'LICENSE',
      '.swcrc',
      '.babelrc',
      '.env*',
      '.bin',
      'dist',
      '.eslintignore',
      '**/*.html',
      '**/*.svg',
      '**/*.css',
      'public',
      '*.json',
      '*.d.ts',
      '.gitignore',
    ],
  },
  ...baseConfig,
];
