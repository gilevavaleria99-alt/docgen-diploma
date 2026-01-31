import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // 1. Импортируем плагин

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 2. Добавляем плагин с настройками
    VitePWA({
      registerType: 'autoUpdate', // Автоматически обновлять приложение
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'LABGEN',
        short_name: 'LABGEN',
        description: 'Генератор отчетов за одну сессию',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})