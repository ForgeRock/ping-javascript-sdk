/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';

const pages = ['oath', 'push', 'webauthn', 'device-binding', 'device-profile'];

export default defineConfig(() => ({
  root: __dirname + '/src',
  cacheDir: '../../node_modules/.vite/e2e/device-client-app',
  publicDir: __dirname + '/public',
  server: {
    cors: true,
    port: 8443,
    host: 'localhost',
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Headers': 'x-authorize-middleware',
    },
  },
  preview: {
    port: 8443,
    host: 'localhost',
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:8443',
    },
  },
  plugins: [],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: __dirname + '/dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname + '/src', 'index.html'),
        ...pages.reduce(
          (acc, page) => {
            acc[page as keyof typeof pages] = path.resolve(
              __dirname + '/src',
              `${page}/index.html`,
            );
            return acc;
          },
          {} as Record<keyof typeof pages, string>,
        ),
      },
      output: {
        entryFileNames: '[name]/main.js',
      },
    },
  },
}));
