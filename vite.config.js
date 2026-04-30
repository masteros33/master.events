import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react:    ['react', 'react-dom'],
          motion:   ['framer-motion'],
          lucide:   ['lucide-react'],
          zustand:  ['zustand'],
        }
      }
    }
  }
})