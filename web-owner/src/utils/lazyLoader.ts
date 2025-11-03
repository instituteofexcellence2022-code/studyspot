/**
 * Lazy Loading Utilities
 * Optimizes bundle size and initial load time
 */

import { lazy, ComponentType } from 'react';

/**
 * Lazy load component with retry logic
 * @param componentImport - Component import function
 * @param retries - Number of retries on failure
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> => {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let attempt = 0;

      const tryLoad = () => {
        attempt++;
        
        componentImport()
          .then(resolve)
          .catch((error) => {
            if (attempt < retries) {
              console.warn(`Failed to load component (attempt ${attempt}/${retries}), retrying...`);
              setTimeout(tryLoad, 1000 * attempt); // Exponential backoff
            } else {
              console.error('Failed to load component after', retries, 'attempts:', error);
              reject(error);
            }
          });
      };

      tryLoad();
    });
  });
};

/**
 * Preload component for better UX
 * @param componentImport - Component import function
 */
export const preloadComponent = (componentImport: () => Promise<any>) => {
  componentImport().catch((error) => {
    console.warn('Failed to preload component:', error);
  });
};

export default {
  lazyWithRetry,
  preloadComponent,
};


