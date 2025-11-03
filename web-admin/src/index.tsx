import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { smartPreloader } from './utils/preloader';

// import { initSentry } from './config/sentry';

// Initialize Sentry before rendering the app
// Temporarily commented out to fix white screen
// initSentry();

// Handle chunk loading errors (common after deployments and bundle optimizations)
window.addEventListener('error', (event) => {
  const chunkFailedMessage = /Loading chunk .* failed|ChunkLoadError|Loading CSS chunk .* failed/;
  const isChunkError = chunkFailedMessage.test(event.message) || 
                      (event.message && event.message.includes('chunk')) ||
                      (event.filename && event.filename.includes('chunk'));

  if (isChunkError && process.env.NODE_ENV === 'production') {

    // Prevent multiple reloads with exponential backoff
    const reloadKey = 'chunk-reload-attempts';
    const attempts = parseInt(sessionStorage.getItem(reloadKey) || '0');
    const maxAttempts = 2;

    if (attempts < maxAttempts) {
      sessionStorage.setItem(reloadKey, (attempts + 1).toString());
      
      // Clear only our app's caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('studyspot-admin-cache')) {
              caches.delete(name);
            }
          });
        });
      }
      
      // Delay reload to prevent rapid reloads
      setTimeout(() => {
        window.location.reload();
      }, 1000 * (attempts + 1));
    } else {
      console.error('❌ Chunk loading failed after multiple attempts. Please clear cache and try again.');
      sessionStorage.removeItem(reloadKey);
    }
  }
});

// Handle unhandled promise rejections (chunk loading errors)
window.addEventListener('unhandledrejection', (event) => {
  const isChunkError = event.reason && 
                      event.reason.message && 
                      (event.reason.message.includes('chunk') || 
                       event.reason.message.includes('Loading chunk'));

  if (isChunkError && process.env.NODE_ENV === 'production') {

    const reloadKey = 'chunk-reload-attempts';
    const attempts = parseInt(sessionStorage.getItem(reloadKey) || '0');
    const maxAttempts = 2;

    if (attempts < maxAttempts) {
      sessionStorage.setItem(reloadKey, (attempts + 1).toString());
      
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('studyspot-admin-cache')) {
              caches.delete(name);
            }
          });
        });
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 1000 * (attempts + 1));
    }
  }
});

// Clear reload flag on successful load
window.addEventListener('load', () => {
  sessionStorage.removeItem('chunk-reload');
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // Start smart preloading a moment after first render to avoid blocking FCP
  setTimeout(() => smartPreloader.init(), 1500);
} catch (error) {
  console.error('❌ Error rendering app:', error);
}

reportWebVitals();








