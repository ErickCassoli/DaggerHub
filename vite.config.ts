import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// Permite sobrescrever o base em build (útil para custom domain).
// Padrão: /DaggerHub/ para GitHub Pages em erickcassoli.github.io/DaggerHub/
const base = process.env.VITE_BASE ?? '/DaggerHub/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // bestiario.ts compila em chunk grande — inclui explicitamente
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'DaggerHub',
        short_name: 'DaggerHub',
        description: 'Gerador de adversários e encontros para Daggerheart (pt-BR)',
        theme_color: '#2b1a1a',
        background_color: '#f5f0e8',
        display: 'standalone',
        start_url: base,
        scope: base,
        lang: 'pt-BR',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
