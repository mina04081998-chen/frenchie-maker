import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 相對路徑：建置結果可放在任何子路徑（預覽頁、日後的部署平台）
  base: './',
})
