import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png',
        'screenshot-wide.png',
        'screenshot-mobile.png'
      ],
      manifest: {
        name: 'Kalkivo - Free Online Calculators',
        short_name: 'Kalkivo',
        description: 'Smart calculators and everyday utilities for math, finance, GST, and conversions.',
        theme_color: '#2F4BFF',
        background_color: '#111827',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        id: '/',
        categories: ['utilities', 'productivity', 'finance'],
        launch_handler: {
          client_mode: ['navigate-existing', 'auto']
        },
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Kalkivo Calculators'
          },
          {
            src: '/screenshot-mobile.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Kalkivo Mobile View'
          }
        ],
        shortcuts: [
          {
            name: 'GST Calculator',
            short_name: 'GST',
            description: 'Calculate GST tax easily',
            url: '/#/gst-calculator',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Scientific Calculator',
            short_name: 'Scientific',
            description: 'Scientific and math calculator',
            url: '/#/scientific-calculator',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});
