import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  root: __dirname,
  base: '/ping-javascript-sdk/coverage-matrix/',
  plugins: [svelte()],
  build: {
    outDir: './dist',
    target: 'esnext',
  },
  server: {
    port: 4200,
  },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['scripts/__tests__/**/*.{test,spec}.ts'],
    reporters: ['default'],
    coverage: {
      include: ['scripts/lib/**/*.ts'],
      reporter: ['text', 'html', 'json'],
      enabled: Boolean(process.env['CI']),
      reportsDirectory: './coverage',
      provider: 'v8' as const,
    },
  },
});
