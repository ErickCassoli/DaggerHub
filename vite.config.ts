import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Permite sobrescrever o base em build (útil para custom domain).
// Padrão: /DaggerHub/ para GitHub Pages em erickcassoli.github.io/DaggerHub/
const base = process.env.VITE_BASE ?? '/DaggerHub/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
