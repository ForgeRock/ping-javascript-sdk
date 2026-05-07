import baseConfig from '../../eslint.config.mjs';

export default [
  { ignores: ['**/dist', '**/elm-stuff'] },
  ...baseConfig,
  { files: ['**/*.ts'], rules: {} },
];
