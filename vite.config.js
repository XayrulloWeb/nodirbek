import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Smart Room Monitor',
        short_name: 'SmartRoom',
        description: 'ESP32 IoT Monitor',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone', // Убирает интерфейс браузера (выглядит как приложение)
        icons: [
          {
            src: '/android-chrome-192x192.png', // Тебе нужно будет положить картинку 192x192 в папку public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png', // И картинку 512x512 в папку public
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})