import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  root: __dirname + '/src',
  cacheDir: '../../node_modules/.vite/e2e/recognize-app',
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
  build: {
    outDir: __dirname + '/dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname + '/src', 'index.html'),
      },
      output: {
        entryFileNames: '[name]/main.js',
      },
    },
  },
}));
