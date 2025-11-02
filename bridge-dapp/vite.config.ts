import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    proxy: {
      '/api/node': {
        target: 'http://localhost:8547',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/node/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})