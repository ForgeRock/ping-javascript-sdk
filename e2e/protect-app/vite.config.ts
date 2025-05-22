import * as path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname + '/src',
  publicDir: __dirname + '/public',
  build: {
    outDir: __dirname + '/dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    target: 'esnext',
    minify: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname + '/src', 'index.html'),
        protectNative: path.resolve(__dirname + '/src', 'protect-native.html'),
        protectMarketplace: path.resolve(__dirname + '/src', 'protect-marketplace.html'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  preview: {
    port: 8443,
  },
  server: {
    port: 8443,
    headers: {
      'Service-Worker-Allowed': '/',
      'Service-Worker': 'script',
    },
    strictPort: true,
  },
});
