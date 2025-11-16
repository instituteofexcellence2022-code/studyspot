import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Updated: 2025-01-17 - Trigger Vercel redeploy with latest fixes

// PWA Service Worker registration (disabled for dev)
// import { registerSW } from 'virtual:pwa-register'
// const updateSW = registerSW({
//   onNeedRefresh() {
//     if (confirm('New version available! Reload to update?')) {
//       updateSW(true)
//     }
//   },
//   onOfflineReady() {
//     console.log('App ready to work offline')
//   },
// })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

