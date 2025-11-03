import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa' // Temporarily disabled for dev

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA plugin temporarily disabled for dev - will enable for production
    // VitePWA({ ... })
  ],
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material']
        }
      }
    }
  }
})

