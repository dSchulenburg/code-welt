import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Basis-Pfad ist build-konfigurierbar, damit EIN Code zwei Ziele bedient:
//   Standalone-Image        -> CODEWELT_BASE=/
//   hinter Traefik          -> CODEWELT_BASE=/code-welt/  (Default, auch lokal)
export default defineConfig({
  plugins: [react()],
  base: process.env.CODEWELT_BASE || '/code-welt/',
  server: { port: 3030 },
  build: {
    rollupOptions: { output: { manualChunks: { vendor: ['react', 'react-dom'] } } },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
  },
});
