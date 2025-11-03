/**
 * Bundle Optimization Utilities
 * Advanced code splitting, lazy loading, and performance optimization
 */

import { lazy, ComponentType } from 'react';

// Bundle analysis interface
export interface BundleAnalysis {
  totalSize: number;
  chunkSizes: { [chunkName: string]: number };
  duplicateModules: string[];
  unusedModules: string[];
  recommendations: string[];
}

// Lazy loading configuration
interface LazyLoadConfig {
  fallback?: ComponentType<any>;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
}

// Preload strategy
export type PreloadStrategy = 'on-hover' | 'on-visible' | 'on-route' | 'immediate';

/**
 * Enhanced lazy loading with preloading and error recovery
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyLoadConfig = {}
): T {
  const {
    fallback: FallbackComponent,
    preload = false,
    priority = 'medium',
    timeout = 10000,
  } = config;

  const LazyComponent = lazy(() => {
    const loadPromise = importFn();
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Component load timeout')), timeout);
    });

    return Promise.race([loadPromise, timeoutPromise]).catch((error) => {
      console.error('Failed to load component:', error);
      
      // Return a fallback component for chunk loading errors
      if (error.message.includes('Loading chunk') || error.message.includes('timeout')) {
        // Return null component to let React suspense handle it
        return {
          default: (() => null) as T,
        };
      }
      
      throw error;
    });
  });

  // Add preloading capability
  if (preload) {
    (LazyComponent as any).preload = importFn;
  }

  // Add priority metadata
  (LazyComponent as any).priority = priority;

  return LazyComponent as T;
}

/**
 * Route-based code splitting with preloading
 */
export const createRouteLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  routeName: string,
  strategy: PreloadStrategy = 'on-route'
) => {
  const LazyComponent = createLazyComponent(importFn, {
    preload: true,
    priority: 'high',
  });

  // Add route-specific metadata
  (LazyComponent as any).routeName = routeName;
  (LazyComponent as any).preloadStrategy = strategy;

  return LazyComponent;
};

/**
 * Component preloader with intersection observer
 */
export class ComponentPreloader {
  private static instance: ComponentPreloader;
  private preloadQueue: Set<string> = new Set();
  private intersectionObserver: IntersectionObserver | null = null;
  private hoverTimeouts: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): ComponentPreloader {
    if (!ComponentPreloader.instance) {
      ComponentPreloader.instance = new ComponentPreloader();
    }
    return ComponentPreloader.instance;
  }

  /**
   * Preload component on hover
   */
  preloadOnHover(componentName: string, importFn: () => Promise<any>, delay = 500) {
    const timeout = this.hoverTimeouts.get(componentName);
    if (timeout) {
      clearTimeout(timeout);
    }

    const newTimeout = setTimeout(() => {
      this.preloadComponent(componentName, importFn);
    }, delay);

    this.hoverTimeouts.set(componentName, newTimeout);
  }

  /**
   * Preload component when visible
   */
  preloadOnVisible(element: HTMLElement, componentName: string, importFn: () => Promise<any>) {
    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const componentName = entry.target.getAttribute('data-component-name');
              if (componentName) {
                this.preloadComponent(componentName, importFn);
                this.intersectionObserver?.unobserve(entry.target);
              }
            }
          });
        },
        { rootMargin: '50px' }
      );
    }

    element.setAttribute('data-component-name', componentName);
    this.intersectionObserver.observe(element);
  }

  /**
   * Preload component immediately
   */
  preloadImmediate(componentName: string, importFn: () => Promise<any>) {
    this.preloadComponent(componentName, importFn);
  }

  private async preloadComponent(componentName: string, importFn: () => Promise<any>) {
    if (this.preloadQueue.has(componentName)) {
      return;
    }

    this.preloadQueue.add(componentName);

    try {
      await importFn();
      console.log(`✅ Preloaded component: ${componentName}`);
    } catch (error) {
      console.error(`❌ Failed to preload component ${componentName}:`, error);
      this.preloadQueue.delete(componentName);
    }
  }

  /**
   * Cancel hover preload
   */
  cancelHoverPreload(componentName: string) {
    const timeout = this.hoverTimeouts.get(componentName);
    if (timeout) {
      clearTimeout(timeout);
      this.hoverTimeouts.delete(componentName);
    }
  }

  /**
   * Get preload status
   */
  isPreloaded(componentName: string): boolean {
    return this.preloadQueue.has(componentName);
  }

  /**
   * Clear all preloads
   */
  clear() {
    this.preloadQueue.clear();
    this.hoverTimeouts.forEach(timeout => clearTimeout(timeout));
    this.hoverTimeouts.clear();
    this.intersectionObserver?.disconnect();
  }
}

/**
 * Bundle analyzer for development
 */
export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private analysis: BundleAnalysis | null = null;

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  /**
   * Analyze bundle size and provide recommendations
   */
  async analyzeBundle(): Promise<BundleAnalysis> {
    if (this.analysis) {
      return this.analysis;
    }

    try {
      // This would typically use webpack-bundle-analyzer or similar
      // For now, we'll provide a mock analysis
      this.analysis = {
        totalSize: 0,
        chunkSizes: {},
        duplicateModules: [],
        unusedModules: [],
        recommendations: [],
      };

      // In a real implementation, this would analyze the actual bundle
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Bundle analysis would run here in production');
      }

      return this.analysis;
    } catch (error) {
      console.error('Failed to analyze bundle:', error);
      throw error;
    }
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(): string[] {
    return [
      'Consider code splitting for large components',
      'Remove unused dependencies',
      'Use dynamic imports for heavy libraries',
      'Optimize images and assets',
      'Enable gzip compression',
      'Use tree shaking for better dead code elimination',
    ];
  }

  /**
   * Check if bundle size is within acceptable limits
   */
  isBundleSizeAcceptable(totalSize: number): boolean {
    const maxSize = 2 * 1024 * 1024; // 2MB
    return totalSize <= maxSize;
  }
}

/**
 * Dynamic import with retry logic
 */
export async function dynamicImportWithRetry<T>(
  importFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error as Error;
      
      // Only retry for chunk loading errors
      if (error instanceof Error && 
          (error.message.includes('Loading chunk') || 
           error.message.includes('Loading CSS chunk'))) {
        
        if (attempt < maxRetries) {
          console.warn(`Retrying dynamic import (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
          continue;
        }
      }
      
      throw error;
    }
  }

  throw lastError || new Error('Dynamic import failed after all retries');
}

/**
 * Resource hints for better loading performance
 */
export class ResourceHints {
  /**
   * Add preload hint for critical resources
   */
  static preload(href: string, as: string, crossorigin?: string) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }
    document.head.appendChild(link);
  }

  /**
   * Add prefetch hint for likely next resources
   */
  static prefetch(href: string) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * Add preconnect hint for external domains
   */
  static preconnect(href: string, crossorigin?: string) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }
    document.head.appendChild(link);
  }
}

/**
 * Performance budget checker
 */
export class PerformanceBudget {
  private static budgets = {
    js: 2 * 1024 * 1024, // 2MB
    css: 200 * 1024, // 200KB
    images: 5 * 1024 * 1024, // 5MB
    fonts: 500 * 1024, // 500KB
  };

  static checkBudget(type: keyof typeof PerformanceBudget.budgets, size: number): boolean {
    return size <= this.budgets[type];
  }

  static getBudget(type: keyof typeof PerformanceBudget.budgets): number {
    return this.budgets[type];
  }

  static getRecommendations(type: keyof typeof PerformanceBudget.budgets, size: number): string[] {
    const budget = this.budgets[type];
    const percentage = (size / budget) * 100;
    
    if (percentage > 100) {
      return [
        `⚠️ ${type.toUpperCase()} size (${this.formatBytes(size)}) exceeds budget (${this.formatBytes(budget)})`,
        'Consider code splitting or removing unused code',
        'Optimize assets and enable compression',
      ];
    } else if (percentage > 80) {
      return [
        `⚠️ ${type.toUpperCase()} size (${this.formatBytes(size)}) is close to budget (${this.formatBytes(budget)})`,
        'Monitor bundle size in future updates',
      ];
    }
    
    return [];
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instances
export const componentPreloader = ComponentPreloader.getInstance();
export const bundleAnalyzer = BundleAnalyzer.getInstance();
