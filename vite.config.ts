import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        unir: resolve(__dirname, 'unir.html'),
        ocr: resolve(__dirname, 'ocr.html'),
        transcricao: resolve(__dirname, 'transcricao.html'),
        dividir: resolve(__dirname, 'dividir.html'),
        comprimir: resolve(__dirname, 'comprimir.html'),
      },
    },
  },
});