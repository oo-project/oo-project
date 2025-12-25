import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevtools from 'vite-plugin-vue-devtools';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevtools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 👇👇👇 關鍵設定：代理伺服器 👇👇👇
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 後端網址
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // 這一行通常不用加，除非你後端路由沒寫 /api
      }
    }
  }
})