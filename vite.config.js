import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': loadEnv(mode, '.', '').VITE_API_URL || 'http://localhost:3001' },
  },
  // Pruebas de componentes con Vitest, en un navegador simulado (jsdom).
  test: {
    environment: 'jsdom',
    setupFiles: './src/pruebas/preparar.js',
    include: ['src/**/*.test.{js,jsx}'],
  },
}))