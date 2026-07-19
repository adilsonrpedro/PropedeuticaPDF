import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  optimizeDeps: { include: ['pdfjs-dist', 'html2canvas', 'jspdf', 'jszip'] },
});
