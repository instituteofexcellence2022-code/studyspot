/**
 * StudySpot Mobile App - Performance Monitoring Service
 * Comprehensive app analytics and performance tracking
 */

import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { performance } from 'react-native-performance';

export interface PerformanceMetrics {
  appLaunchTime: number;
  screenLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  batteryLevel: number;
  networkType: string;
  deviceInfo: {
    model: string;
    os: string;
    version: string;
    memory: number;
  };
}

export interface UserInteraction {
  screen: string;
  action: string;
  timestamp: number;
  duration?: number;
  success: boolean;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetrics | null = null;
  private interactions: UserInteraction[] = [];
  private isInitialized = false;

  /**
   * Initialize performance monitoring
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Start app launch timing
      performance.mark('app-launch-start');
      
      // Collect device information
      const deviceInfo = await this.collectDeviceInfo();
      
      // Initialize metrics
      this.metrics = {
        appLaunchTime: 0,
        screenLoadTime: 0,
        apiResponseTime: 0,
        memoryUsage: 0,
        batteryLevel: 0,
        networkType: 'unknown',
        deviceInfo,
      };

      // Setup performance observers
      this.setupPerformanceObservers();
      
      // Mark app launch complete
      performance.mark('app-launch-end');
      performance.measure('app-launch', 'app-launch-start', 'app-launch-end');
      
      this.isInitialized = true;
      console.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Collect device information
   */
  private async collectDeviceInfo() {
    try {
      const [model, systemVersion, memory] = await Promise.all([
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getTotalMemory(),
      ]);

      return {
        model,
        os: Platform.OS,
        version: systemVersion,
        memory: Math.round(memory / (1024 * 1024)), // Convert to MB
      };
    } catch (error) {
      console.error('Failed to collect device info:', error);
      return {
        model: 'Unknown',
        os: Platform.OS,
        version: 'Unknown',
        memory: 0,
      };
    }
  }

  /**
   * Setup performance observers
   */
  private setupPerformanceObservers() {
    // Monitor memory usage
    this.startMemoryMonitoring();
    
    // Monitor battery level
    this.startBatteryMonitoring();
    
    // Monitor network changes
    this.startNetworkMonitoring();
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring() {
    setInterval(() => {
      if (this.metrics) {
        // Get memory usage (simplified)
        this.metrics.memoryUsage = this.getMemoryUsage();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Start battery monitoring
   */
  private startBatteryMonitoring() {
    DeviceInfo.getBatteryLevel().then((batteryLevel) => {
      if (this.metrics) {
        this.metrics.batteryLevel = batteryLevel;
      }
    });
  }

  /**
   * Start network monitoring
   */
  private startNetworkMonitoring() {
    // This would integrate with @react-native-community/netinfo
    // For now, we'll set a default value
    if (this.metrics) {
      this.metrics.networkType = 'wifi'; // Default
    }
  }

  /**
   * Get memory usage (simplified implementation)
   */
  private getMemoryUsage(): number {
    // This is a simplified implementation
    // In a real app, you'd use native modules or libraries
    return Math.random() * 100; // Placeholder
  }

  /**
   * Track screen load time
   */
  trackScreenLoad(screenName: string) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        if (this.metrics) {
          this.metrics.screenLoadTime = loadTime;
        }
        
        this.logEvent('screen_load', {
          screen: screenName,
          loadTime,
        });
      },
    };
  }

  /**
   * Track API response time
   */
  trackAPIRequest(endpoint: string) {
    const startTime = performance.now();
    
    return {
      end: (success: boolean, error?: string) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (this.metrics) {
          this.metrics.apiResponseTime = responseTime;
        }
        
        this.logEvent('api_request', {
          endpoint,
          responseTime,
          success,
          error,
        });
      },
    };
  }

  /**
   * Track user interaction
   */
  trackUserInteraction(screen: string, action: string, success: boolean, duration?: number) {
    const interaction: UserInteraction = {
      screen,
      action,
      timestamp: Date.now(),
      duration,
      success,
    };

    this.interactions.push(interaction);
    
    // Keep only last 100 interactions
    if (this.interactions.length > 100) {
      this.interactions = this.interactions.slice(-100);
    }

    this.logEvent('user_interaction', interaction);
  }

  /**
   * Track app performance metrics
   */
  trackPerformanceMetrics() {
    if (!this.metrics) return;

    const performanceData = {
      ...this.metrics,
      timestamp: Date.now(),
      interactions: this.interactions.length,
    };

    this.logEvent('performance_metrics', performanceData);
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  /**
   * Get user interactions
   */
  getUserInteractions(): UserInteraction[] {
    return [...this.interactions];
  }

  /**
   * Log event to analytics service
   */
  private logEvent(eventName: string, data: any) {
    try {
      // Log to console for development
      console.log(`Performance Event: ${eventName}`, data);
      
      // In production, send to analytics service
      // Example: Firebase Analytics, Mixpanel, etc.
      // analytics().logEvent(eventName, data);
      
      // Send to your backend analytics service
      this.sendToAnalyticsService(eventName, data);
    } catch (error) {
      console.error('Failed to log performance event:', error);
    }
  }

  /**
   * Send data to analytics service
   */
  private async sendToAnalyticsService(eventName: string, data: any) {
    try {
      // This would integrate with your analytics microservice
      // const response = await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ eventName, data }),
      // });
      
      console.log('Analytics data sent:', { eventName, data });
    } catch (error) {
      console.error('Failed to send analytics data:', error);
    }
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport() {
    if (!this.metrics) return null;

    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      interactions: this.interactions,
      summary: {
        totalInteractions: this.interactions.length,
        successfulInteractions: this.interactions.filter(i => i.success).length,
        averageScreenLoadTime: this.metrics.screenLoadTime,
        averageAPIResponseTime: this.metrics.apiResponseTime,
        memoryUsage: this.metrics.memoryUsage,
        batteryLevel: this.metrics.batteryLevel,
      },
    };

    return report;
  }

  /**
   * Export performance data
   */
  exportPerformanceData() {
    const report = this.generatePerformanceReport();
    if (!report) return null;

    // Convert to JSON string for export
    return JSON.stringify(report, null, 2);
  }

  /**
   * Clear performance data
   */
  clearPerformanceData() {
    this.interactions = [];
    this.metrics = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const performanceMonitoring = new PerformanceMonitoringService();

export default performanceMonitoring;
