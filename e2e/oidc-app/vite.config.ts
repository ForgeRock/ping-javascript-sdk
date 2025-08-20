/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pages = ['ping-am', 'ping-one'];
export default defineConfig(() => ({
  root: __dirname + '/src',
  cacheDir: '../../node_modules/.vite/e2e/oidc-app',
  publicDir: __dirname + '/public',
  server: {
    port: 8443,
    host: 'localhost',
  },
  preview: {
    port: 8443,
    host: 'localhost',
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
        main: resolve(__dirname + '/src', 'index.html'),
        ...pages.reduce(
          (acc, page) => {
            acc[page as keyof typeof pages] = resolve(__dirname + '/src', `${page}/index.html`);
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
