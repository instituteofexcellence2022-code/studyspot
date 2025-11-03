/**
 * Performance Monitoring Utility
 * Track and optimize application performance
 */

import React from 'react';

class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  /**
   * Start performance measurement
   * @param label - Measurement label
   */
  static start(label: string): void {
    if (process.env.NODE_ENV === 'development') {
      this.marks.set(label, performance.now());
    }
  }

  /**
   * End performance measurement and log result
   * @param label - Measurement label
   */
  static end(label: string): number | null {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`Performance mark "${label}" not found`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    // Color code based on duration
    const color = duration < 100 ? 'green' : duration < 500 ? 'orange' : 'red';
    console.log(
      `%c⚡ Performance: ${label} took ${duration.toFixed(2)}ms`,
      `color: ${color}; font-weight: bold;`
    );

    return duration;
  }

  /**
   * Measure component render time
   * @param componentName - Name of the component
   * @param callback - Render callback
   */
  static measureRender<T>(componentName: string, callback: () => T): T {
    this.start(`Render: ${componentName}`);
    const result = callback();
    this.end(`Render: ${componentName}`);
    return result;
  }

  /**
   * Measure API call time
   * @param endpoint - API endpoint
   * @param promise - API promise
   */
  static async measureAPI<T>(endpoint: string, promise: Promise<T>): Promise<T> {
    this.start(`API: ${endpoint}`);
    try {
      const result = await promise;
      this.end(`API: ${endpoint}`);
      return result;
    } catch (error) {
      this.end(`API: ${endpoint}`);
      throw error;
    }
  }

  /**
   * Get Web Vitals metrics
   */
  static getWebVitals(): void {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          console.log(`%c📊 LCP: ${lastEntry.renderTime.toFixed(2)}ms`, 'color: blue; font-weight: bold;');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Observer not supported
      }
    }

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            console.log(`%c📊 FID: ${entry.processingStart - entry.startTime}ms`, 'color: purple; font-weight: bold;');
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Observer not supported
      }
    }
  }

  /**
   * Log bundle size information
   */
  static logBundleInfo(): void {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    console.log('%c📦 Bundle Information:', 'color: teal; font-weight: bold; font-size: 14px;');
    console.log('  - React Version:', React.version);
    console.log('  - Environment:', process.env.NODE_ENV);
    console.log('  - Portal Type:', process.env.REACT_APP_PORTAL_TYPE);
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  PerformanceMonitor.getWebVitals();
  PerformanceMonitor.logBundleInfo();
}

export default PerformanceMonitor;

