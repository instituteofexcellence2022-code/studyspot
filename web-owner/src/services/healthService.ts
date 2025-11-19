/**
 * Health Check Service
 * Checks backend connectivity and health status
 * Uses fetch directly to avoid circular dependencies
 */

export interface HealthStatus {
  isHealthy: boolean;
  isConnected: boolean;
  status: 'healthy' | 'unhealthy' | 'checking' | 'unknown';
  message: string;
  timestamp: number;
  latency?: number;
  error?: string;
}

class HealthService {
  private cache: HealthStatus | null = null;
  private cacheExpiry = 30000; // 30 seconds
  private lastCheck = 0;

  /**
   * Check backend health
   * Uses fetch directly to avoid circular dependencies with apiClient
   */
  async checkHealth(forceRefresh = false): Promise<HealthStatus> {
    const now = Date.now();
    
    // Return cached result if still valid and not forcing refresh
    if (!forceRefresh && this.cache && (now - this.lastCheck) < this.cacheExpiry) {
      return this.cache;
    }

    const startTime = Date.now();
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const healthEndpoint = `${baseURL}/health`;
    
    console.log('[HealthService] Checking backend health at:', healthEndpoint);
    
    try {
      // Use fetch directly to avoid circular dependency with apiClient
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const fetchResponse = await fetch(healthEndpoint, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
      }
      
      const healthData = await fetchResponse.json();
      const response = { status: fetchResponse.status, data: healthData };
      console.log('[HealthService] Health check successful:', fetchResponse.status);

      const latency = Date.now() - startTime;
      
      // Parse response - handle various formats
      const rawData = healthData || response?.data || response.data;
      const nestedData = rawData?.data;
      const topLevel = rawData;
      
      // Check health from multiple possible locations
      const isHealthy = 
        (topLevel?.success === true && nestedData?.status === 'healthy') ||
        (topLevel?.success === true && nestedData?.status !== 'unhealthy') ||
        (topLevel?.status === 'healthy') ||
        (nestedData?.status === 'healthy') ||
        (response.status >= 200 && response.status < 300 && topLevel?.success === true);
      
      console.log('[HealthService] Parsed health data:', {
        rawData,
        topLevel,
        nestedData,
        topLevelSuccess: topLevel?.success,
        nestedStatus: nestedData?.status,
        topLevelStatus: topLevel?.status,
        isHealthy,
        responseStatus: response.status,
      });
      
      // Get message from response
      const statusMessage = nestedData?.status === 'healthy' 
        ? 'Backend is healthy and accessible'
        : isHealthy 
          ? 'Backend is responding'
          : nestedData?.message || topLevel?.message || 'Backend responded but may have issues';
      
      this.cache = {
        isHealthy,
        isConnected: true,
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: statusMessage,
        timestamp: now,
        latency,
      };
      
      console.log('[HealthService] Final health status:', this.cache);

      this.lastCheck = now;
      return this.cache;
    } catch (error: any) {
      const latency = Date.now() - startTime;
      
      console.error('[HealthService] Health check failed:', {
        url: healthEndpoint,
        error: error?.message,
        code: error?.code,
        name: error?.name,
      });
      
      // Determine error type
      let status: HealthStatus['status'] = 'unknown';
      let message = 'Unable to reach backend';
      
      if (!error?.response) {
        // Network error
        const errorCode = error?.code || 'UNKNOWN';
        const errorMessage = error?.message || 'Network Error';
        
        if (errorCode === 'ECONNREFUSED' || errorMessage.includes('ECONNREFUSED')) {
          status = 'unhealthy';
          message = `Cannot connect to backend at ${baseURL}. Please ensure the backend is running.`;
        } else if (errorCode === 'ECONNABORTED' || errorCode === 'ETIMEDOUT' || errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
          status = 'unhealthy';
          if (baseURL.includes('render.com') || baseURL.includes('onrender.com')) {
            message = `Backend timeout. Render services may be sleeping (free tier). The first request can take 30-60 seconds to wake up the service. Please wait and try again, or check the Render dashboard.`;
          } else {
            message = `Backend timeout. The server at ${baseURL} is not responding.`;
          }
        } else if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
          status = 'unhealthy';
          message = `CORS error: The backend at ${baseURL} is blocking requests from this origin. The backend needs to allow requests from ${typeof window !== 'undefined' ? window.location.origin : 'your frontend origin'}. Please check the CORS_ORIGIN environment variable on the backend.`;
        } else if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
          status = 'unhealthy';
          const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown';
          message = `Network error: Cannot reach ${baseURL}. This usually means:\n1. Backend is not running or sleeping (Render free tier)\n2. API URL is incorrect\n3. CORS is blocking the request from ${frontendOrigin}\n\nCheck your .env file and ensure REACT_APP_API_URL is set correctly. Also verify the backend CORS configuration allows requests from ${frontendOrigin}.`;
        } else {
          status = 'unhealthy';
          message = `Network error (${errorCode}): ${errorMessage}`;
        }
      } else {
        // HTTP error
        status = error.response.status >= 500 ? 'unhealthy' : 'unknown';
        message = `Backend returned error: ${error.response.status} ${error.response.statusText}`;
      }

      this.cache = {
        isHealthy: false,
        isConnected: false,
        status,
        message,
        timestamp: now,
        latency,
        error: error?.message || error?.code || 'Unknown error',
      };

      this.lastCheck = now;
      return this.cache;
    }
  }

  /**
   * Get cached health status
   */
  getCachedHealth(): HealthStatus | null {
    return this.cache;
  }

  /**
   * Clear health cache
   */
  clearCache(): void {
    this.cache = null;
    this.lastCheck = 0;
  }

  /**
   * Check if backend is likely accessible (quick check)
   */
  async quickCheck(): Promise<boolean> {
    try {
      const health = await this.checkHealth(true);
      return health.isConnected && health.isHealthy;
    } catch {
      return false;
    }
  }
}

// Export instance after class definition to avoid initialization issues
const healthService = new HealthService();
export { healthService };
