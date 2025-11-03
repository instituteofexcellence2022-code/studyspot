import { defineConfig } from 'vite' 
import react from '@vitejs/plugin-react' 
import { VitePWA } from 'vite-plugin-pwa' 
 
export default defineConfig({ 
  plugins: [ 
    react(), 
    VitePWA({ 
      registerType: 'autoUpdate', 
      manifest: { 
        name: 'StudySpot Mobile App', 
        short_name: 'StudySpot', 
        description: 'Enterprise-Grade Library Management Platform', 
        theme_color: '#2563eb', 
        background_color: '#ffffff', 
        display: 'standalone', 
        orientation: 'portrait', 
        scope: '/', 
        start_url: '/', 
        icons: [ 
          { 
            src: 'pwa-192x192.png', 
            sizes: '192x192', 
            type: 'image/png' 
          } 
        ] 
      } 
    }) 
  ], 
  server: { 
    port: 3000, 
    host: true 
  } 
}) 











