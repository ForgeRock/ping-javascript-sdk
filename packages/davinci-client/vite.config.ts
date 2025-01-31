import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import * as pkg from './package.json';
import { codecovVitePlugin } from '@codecov/vite-plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/davinci-client',

  plugins: [
    dts({
      rollupTypes: false,
      insertTypesEntry: false,
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
    codecovVitePlugin({
      enableBundleAnalysis: process.env['CODECOV_TOKEN'] !== undefined,
      bundleName: 'davinci-client',
      uploadToken: process.env['CODECOV_TOKEN'],
    }),
  ],

  build: {
    outDir: './dist',
    target: ['esnext', 'es2020'],
    rollupOptions: {
      output: {
        // This is the directory your library will be compiled to.
        dir: './dist',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      external: Array.from(Object.keys(pkg.dependencies) || []).concat([
        './src/lib/mock-data/*',
        '@reduxjs/toolkit/query',
        '@forgerock/javascript-sdk',
        '@forgerock/javascript-sdk/src/oauth2-client/state-pkce',
        'javascript-sdk',
      ]),
    },
    lib: {
      entry: 'src/index.ts',
      name: 'davinci-client',
      fileName: (format, fileName) => {
        const extension = format === 'es' ? 'js' : 'cjs';
        return `${fileName}.${extension}`;
      },
      formats: ['es'],
    },
    reportCompressedSize: true,
    commonjsOptions: { transformMixedEsModules: true },
  },
  test: {
    cache: {
      dir: '../../node_modules/.vitest',
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
