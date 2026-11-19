import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = typeof import.meta.dirname !== 'undefined' 
  ? import.meta.dirname 
  : path.dirname(fileURLToPath(import.meta.url));

// Auto-heal entry HTML if user renamed to Index.html or moved it into src/
const targetIndex = path.resolve(__dirname, 'index.html');
if (!fs.existsSync(targetIndex)) {
  const fallbacks = [
    path.resolve(__dirname, 'Index.html'),
    path.resolve(__dirname, 'src/index.html'),
    path.resolve(__dirname, 'src/Index.html'),
    path.resolve(__dirname, 'public/index.html'),
  ];
  for (const fb of fallbacks) {
    if (fs.existsSync(fb)) {
      try {
        fs.copyFileSync(fb, targetIndex);
        break;
      } catch (e) {
        // ignore
      }
    }
  }
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
