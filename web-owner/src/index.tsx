import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Handle chunk loading errors (common after deployments)
window.addEventListener('error', (event) => {
  const chunkFailedMessage = /Loading chunk [\d]+ failed/;
  
  if (chunkFailedMessage.test(event.message)) {
    console.log('🔄 Chunk loading failed, reloading page...');
    
    // Prevent multiple reloads
    const hasReloaded = sessionStorage.getItem('chunk-reload');
    
    if (!hasReloaded) {
      sessionStorage.setItem('chunk-reload', 'true');
      window.location.reload();
    } else {
      console.error('❌ Chunk loading failed after reload. Please clear cache and try again.');
      sessionStorage.removeItem('chunk-reload');
    }
  }
});

// Clear reload flag on successful load
window.addEventListener('load', () => {
  sessionStorage.removeItem('chunk-reload');
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();








