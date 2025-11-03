/**
 * Performance Monitoring Hook
 * Tracks page load times and user interactions
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PerformanceMonitor from '../utils/performanceMonitor';

export const usePerformance = () => {
  const location = useLocation();
  const pageLoadStart = useRef<number>(0);

  useEffect(() => {
    // Track page load start
    pageLoadStart.current = performance.now();
    
    // Track page load completion
    const handleLoad = () => {
      const loadTime = performance.now() - pageLoadStart.current;
      PerformanceMonitor.end(`Page Load: ${location.pathname}`);
      
      // Log slow pages
      if (loadTime > 1000) {
        console.warn(`🐌 Slow page load: ${location.pathname} took ${loadTime.toFixed(2)}ms`);
      }
    };

    // Track when page is fully loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [location.pathname]);

  // Track user interactions
  const trackInteraction = (action: string, details?: any) => {
    PerformanceMonitor.start(`Interaction: ${action}`);
    setTimeout(() => {
      PerformanceMonitor.end(`Interaction: ${action}`);
    }, 100);
  };

  return { trackInteraction };
};

export default usePerformance;


