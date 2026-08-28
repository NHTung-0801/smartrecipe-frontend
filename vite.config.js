import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Test chạy trong jsdom vì phần lớn component đọc/ghi DOM
    // (document.body.style.overflow, addEventListener trong các modal).
    environment: 'jsdom',
    // Cho phép dùng describe/it/expect không cần import ở từng file
    globals: true,
    setupFiles: './src/test/setup.js',
    // Chỉ nhận file test trong src, tránh quét node_modules
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    css: false,
  },
})
