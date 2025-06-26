/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/e2e/mock-api-v2',

  test: {
    globals: false,
    watch: false,
    environment: 'jsdom',
    passWithNoTests: true,
    pool: 'forks',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default', 'json', 'html'],
    coverage: {
      enabled: !process.env['CI'],
      reportsDirectory: './coverage',
      provider: 'v8',
    },
  },
});
