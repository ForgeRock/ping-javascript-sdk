import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/davinci-client',
  test: {
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.spec.json',
    },
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'src/**/*.test-d.ts'],
    reporters: ['default'],
    coverage: {
      include: ['src/**/*.{js,ts}'],
      /**
       * You have to extend the vite defaults to include the files you want to exclude from coverage.
       */
      exclude: [
        'src/**/*.mock.{js,ts}',
        'src/**/*.data.{js,ts}',
        'src/**/*.test.{js,ts}',
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__x00__*',
        '**/\x00*',
        'cypress/**',
        'test?(s)/**',
        'test?(-*).?(c|m)[jt]s?(x)',
        '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
        '**/vitest.{workspace,projects}.[jt]s?(on)',
        '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
      ],
      reporter: [
        ['text', { skipEmpty: true }],
        ['html', { skipEmpty: true }],
        ['json', { skipEmpty: true }],
      ],
      enabled: Boolean(process.env['CI']),
      reportsDirectory: './coverage',
      provider: 'v8',
    },
  },
});
