/**
 * Route Preloader Component
 * Preloads components based on navigation patterns
 */

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { smartPreloader } from '../../utils/preloader';


interface RoutePreloaderProps {
  children: React.ReactNode;
}

const RoutePreloader: React.FC<RoutePreloaderProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Initialize preloader
    smartPreloader.init();
    
    // Preload based on current route
    smartPreloader.preloadBasedOnUsage(location.pathname);
  }, [location.pathname]);

  return <>{children}</>;
};

export default RoutePreloader;


