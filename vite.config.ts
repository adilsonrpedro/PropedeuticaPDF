import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    modulePreload: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        unir: resolve(__dirname, 'unir.html'),
        ocr: resolve(__dirname, 'ocr.html'),
        transcricao: resolve(__dirname, 'transcricao.html'),
        dividir: resolve(__dirname, 'dividir.html'),
        comprimir: resolve(__dirname, 'comprimir.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdf-lib') || id.includes('pdfjs-dist')) return 'vendor-pdf';
            if (id.includes('tesseract.js')) return 'vendor-ocr';
            if (id.includes('lucide-react')) return 'vendor-ui';
            return 'vendor-core';
          }
        },
      },
    },
  },
});