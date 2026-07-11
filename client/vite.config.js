import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'VCall Video Calling App',
        short_name: 'VCall',
        description: 'A modern, peer-to-peer video calling application with secure local recordings.',
        theme_color: '#0f1115',
        background_color: '#0f1115',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512 any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
