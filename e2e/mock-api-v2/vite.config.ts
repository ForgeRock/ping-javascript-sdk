import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/e2e/mock-api-v2',

  test: {
    globals: false,
    watch: !process.env['CI'],
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default', 'json', 'html'],
    coverage: {
      enabled: false, //Boolean(process.env['CI']),
      reportsDirectory: './coverage',
      provider: 'v8',
    },
  },
});
