import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512] as const;

const manifestIcons = [
  ...ICON_SIZES.map((size) => ({
    src: `icons/icon-${size}.png`,
    sizes: `${size}x${size}`,
    type: 'image/png',
    purpose: 'any',
  })),
  {
    src: 'icons/icon-maskable-512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable',
  },
];

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon-16.png',
        'favicon-32.png',
        'icons/icon.svg',
        'icons/icon-maskable.svg',
        ...ICON_SIZES.map((s) => `icons/icon-${s}.png`),
        'splash/apple-splash-1170x2532.png',
        'splash/apple-splash-1284x2778.png',
        'splash/apple-splash-750x1334.png',
        'splash/apple-splash-2048x2732.png',
      ],
      manifest: {
        id: '/',
        name: 'SwipeJobs - Job Discovery',
        short_name: 'SwipeJobs',
        description: 'Discover jobs, swipe to match, and apply in seconds.',
        lang: 'en',
        dir: 'ltr',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'window-controls-overlay'],
        orientation: 'portrait-primary',
        theme_color: '#FFD600',
        background_color: '#FAFAFA',
        categories: ['business', 'productivity'],
        icons: manifestIcons,
        shortcuts: [
          {
            name: 'Swipe Jobs',
            short_name: 'Swipe',
            url: '/swipe?source=pwa-shortcut',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Saved Jobs',
            short_name: 'Saved',
            url: '/saved?source=pwa-shortcut',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/hubs/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5123',
        changeOrigin: true,
      },
      '/hubs': {
        target: 'http://localhost:5123',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
