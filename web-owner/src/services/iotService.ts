import axios from 'axios';
import { API_CONFIG } from '../constants';

/**
 * IoT Service
 * Comprehensive IoT device management and automation service
 * Built with 20+ years of full-stack expertise
 * 
 * @author Agent 4 - Full-Stack Developer
 */

// Authentication helper
const getAuthToken = (): string | null => {
  return localStorage.getItem('studyspot_auth_token');
};

// Axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('IoT API Error:', error.response?.data || error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('studyspot_auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface IoTDevice {
  id: string;
  name: string;
  type: 'light' | 'ac' | 'fan' | 'plug' | 'sensor' | 'camera' | 'lock';
  status: 'online' | 'offline' | 'error';
  zone: string;
  powerConsumption: number;
  lastSeen: string;
  settings: {
    brightness?: number;
    temperature?: number;
    speed?: number;
    isOn: boolean;
  };
  automationRules: string[];
  integration: {
    platform: 'tuya' | 'google_home' | 'alexa' | 'ifttt' | 'custom';
    deviceId: string;
    credentials?: any;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'occupancy' | 'time' | 'event' | 'sensor';
  condition: string;
  action: string;
  devices: string[];
  isActive: boolean;
  lastTriggered?: string;
  schedule?: {
    startTime: string;
    endTime: string;
    days: number[];
  };
}

export interface Zone {
  id: string;
  name: string;
  devices: IoTDevice[];
  totalPowerConsumption: number;
  occupancy: number;
  temperature: number;
  lighting: number;
  settings: {
    autoLighting: boolean;
    autoClimate: boolean;
    occupancyThreshold: number;
  };
}

export interface EnergyData {
  timestamp: string;
  consumption: number;
  cost: number;
  devices: { [deviceId: string]: number };
  zone: string;
}

export interface IntegrationConfig {
  platform: 'tuya' | 'google_home' | 'alexa' | 'ifttt';
  isConnected: boolean;
  deviceCount: number;
  credentials?: any;
  lastSync?: string;
}

/**
 * IoT Service - Main API Methods
 */
export const iotService = {
  /**
   * Get all IoT devices
   */
  async getDevices(): Promise<IoTDevice[]> {
    const response = await apiClient.get('/api/iot/devices');
    return (response.data as any).data;
  },

  /**
   * Get device by ID
   */
  async getDevice(id: string): Promise<IoTDevice> {
    const response = await apiClient.get(`/api/iot/devices/${id}`);
    return (response.data as any).data;
  },

  /**
   * Add new IoT device
   */
  async addDevice(device: Partial<IoTDevice>): Promise<IoTDevice> {
    const response = await apiClient.post('/api/iot/devices', device);
    return (response.data as any).data;
  },

  /**
   * Update device settings
   */
  async updateDevice(id: string, settings: Partial<IoTDevice['settings']>): Promise<IoTDevice> {
    const response = await apiClient.put(`/api/iot/devices/${id}/settings`, settings);
    return (response.data as any).data;
  },

  /**
   * Control device (turn on/off, adjust settings)
   */
  async controlDevice(id: string, command: any): Promise<IoTDevice> {
    const response = await apiClient.post(`/api/iot/devices/${id}/control`, command);
    return (response.data as any).data;
  },

  /**
   * Delete device
   */
  async deleteDevice(id: string): Promise<void> {
    await apiClient.delete(`/api/iot/devices/${id}`);
  },

  /**
   * Get all zones
   */
  async getZones(): Promise<Zone[]> {
    const response = await apiClient.get('/api/iot/zones');
    return (response.data as any).data;
  },

  /**
   * Create new zone
   */
  async createZone(zone: Partial<Zone>): Promise<Zone> {
    const response = await apiClient.post('/api/iot/zones', zone);
    return (response.data as any).data;
  },

  /**
   * Update zone settings
   */
  async updateZone(id: string, settings: Partial<Zone['settings']>): Promise<Zone> {
    const response = await apiClient.put(`/api/iot/zones/${id}/settings`, settings);
    return (response.data as any).data;
  },

  /**
   * Get automation rules
   */
  async getAutomationRules(): Promise<AutomationRule[]> {
    const response = await apiClient.get('/api/iot/automation-rules');
    return (response.data as any).data;
  },

  /**
   * Create automation rule
   */
  async createAutomationRule(rule: Partial<AutomationRule>): Promise<AutomationRule> {
    const response = await apiClient.post('/api/iot/automation-rules', rule);
    return (response.data as any).data;
  },

  /**
   * Update automation rule
   */
  async updateAutomationRule(id: string, rule: Partial<AutomationRule>): Promise<AutomationRule> {
    const response = await apiClient.put(`/api/iot/automation-rules/${id}`, rule);
    return (response.data as any).data;
  },

  /**
   * Delete automation rule
   */
  async deleteAutomationRule(id: string): Promise<void> {
    await apiClient.delete(`/api/iot/automation-rules/${id}`);
  },

  /**
   * Toggle automation rule
   */
  async toggleAutomationRule(id: string, isActive: boolean): Promise<AutomationRule> {
    const response = await apiClient.patch(`/api/iot/automation-rules/${id}/toggle`, { isActive });
    return (response.data as any).data;
  },

  /**
   * Get energy consumption data
   */
  async getEnergyData(params?: {
    startDate?: string;
    endDate?: string;
    zone?: string;
    device?: string;
  }): Promise<EnergyData[]> {
    const response = await apiClient.get('/api/iot/energy-data', { params });
    return (response.data as any).data;
  },

  /**
   * Get real-time energy consumption
   */
  async getRealTimeEnergy(): Promise<{
    totalConsumption: number;
    totalCost: number;
    devices: { [deviceId: string]: number };
    zones: { [zoneId: string]: number };
  }> {
    const response = await apiClient.get('/api/iot/energy-data/realtime');
    return (response.data as any).data;
  },

  /**
   * Get integration configurations
   */
  async getIntegrations(): Promise<IntegrationConfig[]> {
    const response = await apiClient.get('/api/iot/integrations');
    return (response.data as any).data;
  },

  /**
   * Connect to integration platform
   */
  async connectIntegration(platform: string, credentials: any): Promise<IntegrationConfig> {
    const response = await apiClient.post(`/api/iot/integrations/${platform}/connect`, credentials);
    return (response.data as any).data;
  },

  /**
   * Disconnect integration platform
   */
  async disconnectIntegration(platform: string): Promise<void> {
    await apiClient.post(`/api/iot/integrations/${platform}/disconnect`);
  },

  /**
   * Sync devices from integration platform
   */
  async syncDevices(platform: string): Promise<IoTDevice[]> {
    const response = await apiClient.post(`/api/iot/integrations/${platform}/sync`);
    return (response.data as any).data;
  },

  /**
   * Get device health status
   */
  async getDeviceHealth(): Promise<{
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    errorDevices: number;
    healthScore: number;
  }> {
    const response = await apiClient.get('/api/iot/health');
    return (response.data as any).data;
  },

  /**
   * Get automation analytics
   */
  async getAutomationAnalytics(): Promise<{
    totalRules: number;
    activeRules: number;
    triggeredToday: number;
    energySaved: number;
    topRules: Array<{
      ruleId: string;
      ruleName: string;
      triggerCount: number;
      lastTriggered: string;
    }>;
  }> {
    const response = await apiClient.get('/api/iot/automation-analytics');
    return (response.data as any).data;
  },

  /**
   * Test automation rule
   */
  async testAutomationRule(id: string): Promise<{
    success: boolean;
    message: string;
    triggeredDevices: string[];
  }> {
    const response = await apiClient.post(`/api/iot/automation-rules/${id}/test`);
    return (response.data as any).data;
  },

  /**
   * Bulk control devices
   */
  async bulkControlDevices(deviceIds: string[], command: any): Promise<IoTDevice[]> {
    const response = await apiClient.post('/api/iot/devices/bulk-control', {
      deviceIds,
      command
    });
    return (response.data as any).data;
  },

  /**
   * Get device logs
   */
  async getDeviceLogs(deviceId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Array<{
    timestamp: string;
    action: string;
    value: any;
    status: 'success' | 'error';
  }>> {
    const response = await apiClient.get(`/api/iot/devices/${deviceId}/logs`, { params });
    return (response.data as any).data;
  },

  /**
   * Schedule device action
   */
  async scheduleDeviceAction(deviceId: string, action: any, schedule: {
    startTime: string;
    endTime?: string;
    days: number[];
    repeat: boolean;
  }): Promise<{
    scheduleId: string;
    status: 'scheduled' | 'active' | 'completed' | 'failed';
  }> {
    const response = await apiClient.post(`/api/iot/devices/${deviceId}/schedule`, {
      action,
      schedule
    });
    return (response.data as any).data;
  },

  /**
   * Cancel scheduled action
   */
  async cancelScheduledAction(scheduleId: string): Promise<void> {
    await apiClient.delete(`/api/iot/schedules/${scheduleId}`);
  },

  /**
   * Get energy savings report
   */
  async getEnergySavingsReport(params?: {
    startDate?: string;
    endDate?: string;
    zone?: string;
  }): Promise<{
    totalSavings: number;
    percentageSaved: number;
    comparison: {
      withAutomation: number;
      withoutAutomation: number;
    };
    breakdown: Array<{
      ruleId: string;
      ruleName: string;
      savings: number;
      percentage: number;
    }>;
  }> {
    const response = await apiClient.get('/api/iot/energy-savings', { params });
    return (response.data as any).data;
  }
};

/**
 * IoT Helper Functions
 */
export const iotHelpers = {
  /**
   * Calculate energy cost
   */
  calculateEnergyCost(consumption: number, rate: number = 0.12): number {
    return (consumption / 1000) * rate; // Convert watts to kWh and multiply by rate
  },

  /**
   * Format power consumption
   */
  formatPowerConsumption(watts: number): string {
    if (watts >= 1000) {
      return `${(watts / 1000).toFixed(1)}kW`;
    }
    return `${watts.toFixed(0)}W`;
  },

  /**
   * Get device type icon
   */
  getDeviceTypeIcon(type: string): string {
    const icons = {
      light: '💡',
      ac: '❄️',
      fan: '🌀',
      plug: '🔌',
      sensor: '📡',
      camera: '📹',
      lock: '🔒'
    };
    return icons[type as keyof typeof icons] || '🔧';
  },

  /**
   * Validate device settings
   */
  validateDeviceSettings(type: string, settings: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (type) {
      case 'light':
        if (settings.brightness !== undefined && (settings.brightness < 0 || settings.brightness > 100)) {
          errors.push('Brightness must be between 0 and 100');
        }
        break;
      case 'ac':
        if (settings.temperature !== undefined && (settings.temperature < 16 || settings.temperature > 30)) {
          errors.push('Temperature must be between 16°C and 30°C');
        }
        break;
      case 'fan':
        if (settings.speed !== undefined && (settings.speed < 0 || settings.speed > 100)) {
          errors.push('Speed must be between 0 and 100');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Generate automation rule condition examples
   */
  getConditionExamples(trigger: string): string[] {
    const examples = {
      occupancy: [
        'motion_detected = true',
        'occupancy_count > 5',
        'occupancy_count = 0',
        'last_motion > 30 minutes ago'
      ],
      time: [
        'time = "08:00"',
        'time between "18:00" and "22:00"',
        'day_of_week = "monday"',
        'time = "sunset"'
      ],
      event: [
        'booking_confirmed = true',
        'maintenance_mode = true',
        'emergency_alert = true',
        'payment_received = true'
      ],
      sensor: [
        'temperature > 26',
        'humidity < 40',
        'light_level < 200 lux',
        'noise_level > 70 dB'
      ]
    };
    return examples[trigger as keyof typeof examples] || [];
  },

  /**
   * Generate automation rule action examples
   */
  getActionExamples(): string[] {
    return [
      'turn_on_lights',
      'turn_off_lights',
      'set_brightness_80',
      'turn_on_ac',
      'set_temperature_24',
      'turn_off_all_devices',
      'send_notification',
      'log_event'
    ];
  }
};

export default iotService;
