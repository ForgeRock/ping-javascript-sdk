import baseConfig from '../../eslint.config.mjs';

export default [{ ignores: ['**/dist'] }, ...baseConfig, { files: ['**/*.ts'], rules: {} }];
