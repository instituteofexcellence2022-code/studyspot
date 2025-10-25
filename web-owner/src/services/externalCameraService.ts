/**
 * External Camera Integration Service
 * Support for CP Plus, Hikvision, and other IP cameras
 * Built with 20+ years of full-stack expertise
 * 
 * @author Agent 4 - Full-Stack Developer
 */

import axios from 'axios';
import { API_CONFIG } from '../constants';

// Authentication helper
const getAuthToken = (): string | null => {
  return localStorage.getItem('studyspot_auth_token');
};

// Axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor
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

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('External Camera API Error:', error.response?.data || error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('studyspot_auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Types for external camera integration
export interface ExternalCamera {
  id: string;
  name: string;
  brand: 'CP_PLUS' | 'HIKVISION' | 'DAHUA' | 'AXIS' | 'BOSCH' | 'GENERIC';
  model: string;
  ipAddress: string;
  port: number;
  username: string;
  password: string; // Encrypted
  protocol: 'RTSP' | 'HTTP' | 'ONVIF' | 'RTMP';
  streamUrl: string;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  status: 'online' | 'offline' | 'error' | 'connecting';
  lastSeen: string;
  capabilities: {
    pan: boolean;
    tilt: boolean;
    zoom: boolean;
    nightVision: boolean;
    audio: boolean;
    motionDetection: boolean;
    faceDetection: boolean;
  };
  settings: {
    brightness: number;
    contrast: number;
    saturation: number;
    sharpness: number;
    exposure: number;
    whiteBalance: string;
    nightMode: boolean;
  };
  location: {
    zone: string;
    position: string;
    angle: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CameraStream {
  id: string;
  cameraId: string;
  streamType: 'main' | 'sub' | 'audio';
  url: string;
  quality: 'high' | 'medium' | 'low';
  bitrate: number;
  active: boolean;
}

export interface CameraEvent {
  id: string;
  cameraId: string;
  type: 'motion' | 'face_detection' | 'line_crossing' | 'intrusion' | 'audio_detection';
  timestamp: string;
  confidence: number;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  imageUrl?: string;
  videoUrl?: string;
  acknowledged: boolean;
}

export interface CameraPreset {
  id: string;
  cameraId: string;
  name: string;
  position: {
    pan: number;
    tilt: number;
    zoom: number;
  };
  description: string;
  thumbnail: string;
}

export interface CameraGroup {
  id: string;
  name: string;
  description: string;
  cameraIds: string[];
  layout: 'grid' | 'single' | 'quad' | 'custom';
  createdAt: string;
}

/**
 * External Camera Integration Service
 */
export const externalCameraService = {
  /**
   * Get all external cameras
   */
  async getCameras(): Promise<ExternalCamera[]> {
    const response = await apiClient.get('/api/external-cameras');
    return (response.data as any).data;
  },

  /**
   * Add new external camera
   */
  async addCamera(cameraData: Omit<ExternalCamera, 'id' | 'createdAt' | 'updatedAt' | 'lastSeen'>): Promise<ExternalCamera> {
    const response = await apiClient.post('/api/external-cameras', cameraData);
    return (response.data as any).data;
  },

  /**
   * Update camera settings
   */
  async updateCamera(cameraId: string, updates: Partial<ExternalCamera>): Promise<ExternalCamera> {
    const response = await apiClient.put(`/api/external-cameras/${cameraId}`, updates);
    return (response.data as any).data;
  },

  /**
   * Delete camera
   */
  async deleteCamera(cameraId: string): Promise<void> {
    await apiClient.delete(`/api/external-cameras/${cameraId}`);
  },

  /**
   * Test camera connection
   */
  async testConnection(cameraData: {
    ipAddress: string;
    port: number;
    username: string;
    password: string;
    protocol: string;
  }): Promise<{
    success: boolean;
    message: string;
    capabilities?: any;
    streamUrl?: string;
  }> {
    const response = await apiClient.post('/api/external-cameras/test-connection', cameraData);
    return (response.data as any).data;
  },

  /**
   * Get camera streams
   */
  async getCameraStreams(cameraId: string): Promise<CameraStream[]> {
    const response = await apiClient.get(`/api/external-cameras/${cameraId}/streams`);
    return (response.data as any).data;
  },

  /**
   * Start camera stream
   */
  async startStream(cameraId: string, streamType: string = 'main'): Promise<{
    streamUrl: string;
    token: string;
  }> {
    const response = await apiClient.post(`/api/external-cameras/${cameraId}/start-stream`, {
      streamType
    });
    return (response.data as any).data;
  },

  /**
   * Stop camera stream
   */
  async stopStream(cameraId: string, streamType: string = 'main'): Promise<void> {
    await apiClient.post(`/api/external-cameras/${cameraId}/stop-stream`, {
      streamType
    });
  },

  /**
   * Get camera events
   */
  async getCameraEvents(cameraId: string, params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    limit?: number;
  }): Promise<CameraEvent[]> {
    const response = await apiClient.get(`/api/external-cameras/${cameraId}/events`, { params });
    return (response.data as any).data;
  },

  /**
   * Acknowledge camera event
   */
  async acknowledgeEvent(eventId: string): Promise<void> {
    await apiClient.post(`/api/external-cameras/events/${eventId}/acknowledge`);
  },

  /**
   * Get camera presets
   */
  async getCameraPresets(cameraId: string): Promise<CameraPreset[]> {
    const response = await apiClient.get(`/api/external-cameras/${cameraId}/presets`);
    return (response.data as any).data;
  },

  /**
   * Create camera preset
   */
  async createPreset(cameraId: string, presetData: Omit<CameraPreset, 'id'>): Promise<CameraPreset> {
    const response = await apiClient.post(`/api/external-cameras/${cameraId}/presets`, presetData);
    return (response.data as any).data;
  },

  /**
   * Go to camera preset
   */
  async goToPreset(cameraId: string, presetId: string): Promise<void> {
    await apiClient.post(`/api/external-cameras/${cameraId}/presets/${presetId}/goto`);
  },

  /**
   * Control camera PTZ (Pan, Tilt, Zoom)
   */
  async controlPTZ(cameraId: string, command: {
    action: 'pan' | 'tilt' | 'zoom' | 'stop';
    direction?: 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
    speed?: number;
  }): Promise<void> {
    await apiClient.post(`/api/external-cameras/${cameraId}/ptz`, command);
  },

  /**
   * Update camera settings
   */
  async updateCameraSettings(cameraId: string, settings: Partial<ExternalCamera['settings']>): Promise<void> {
    await apiClient.put(`/api/external-cameras/${cameraId}/settings`, settings);
  },

  /**
   * Get camera groups
   */
  async getCameraGroups(): Promise<CameraGroup[]> {
    const response = await apiClient.get('/api/external-cameras/groups');
    return (response.data as any).data;
  },

  /**
   * Create camera group
   */
  async createCameraGroup(groupData: Omit<CameraGroup, 'id' | 'createdAt'>): Promise<CameraGroup> {
    const response = await apiClient.post('/api/external-cameras/groups', groupData);
    return (response.data as any).data;
  },

  /**
   * Update camera group
   */
  async updateCameraGroup(groupId: string, updates: Partial<CameraGroup>): Promise<CameraGroup> {
    const response = await apiClient.put(`/api/external-cameras/groups/${groupId}`, updates);
    return (response.data as any).data;
  },

  /**
   * Delete camera group
   */
  async deleteCameraGroup(groupId: string): Promise<void> {
    await apiClient.delete(`/api/external-cameras/groups/${groupId}`);
  },

  /**
   * Get camera analytics
   */
  async getCameraAnalytics(cameraId: string, timeRange: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByHour: Array<{ hour: number; count: number }>;
    averageConfidence: number;
    topEvents: CameraEvent[];
  }> {
    const response = await apiClient.get(`/api/external-cameras/${cameraId}/analytics`, {
      params: { timeRange }
    });
    return (response.data as any).data;
  },

  /**
   * Export camera recordings
   */
  async exportRecordings(cameraId: string, params: {
    startDate: string;
    endDate: string;
    format: 'mp4' | 'avi' | 'mov';
    quality: 'high' | 'medium' | 'low';
  }): Promise<{
    downloadUrl: string;
    fileSize: number;
    duration: number;
  }> {
    const response = await apiClient.post(`/api/external-cameras/${cameraId}/export`, params);
    return (response.data as any).data;
  }
};

/**
 * Camera Brand Configuration
 */
export const cameraBrands = {
  CP_PLUS: {
    name: 'CP Plus',
    logo: '/images/camera-brands/cp-plus.png',
    defaultPort: 80,
    defaultProtocol: 'RTSP',
    streamPaths: {
      main: '/cam/realmonitor?channel=1&subtype=0',
      sub: '/cam/realmonitor?channel=1&subtype=1',
      audio: '/cam/realmonitor?channel=1&subtype=2'
    },
    capabilities: {
      pan: true,
      tilt: true,
      zoom: true,
      nightVision: true,
      audio: true,
      motionDetection: true,
      faceDetection: true
    },
    supportedResolutions: [
      { width: 1920, height: 1080, name: '1080p' },
      { width: 1280, height: 720, name: '720p' },
      { width: 640, height: 480, name: '480p' }
    ]
  },
  HIKVISION: {
    name: 'Hikvision',
    logo: '/images/camera-brands/hikvision.png',
    defaultPort: 80,
    defaultProtocol: 'RTSP',
    streamPaths: {
      main: '/Streaming/Channels/101',
      sub: '/Streaming/Channels/102',
      audio: '/Streaming/Channels/103'
    },
    capabilities: {
      pan: true,
      tilt: true,
      zoom: true,
      nightVision: true,
      audio: true,
      motionDetection: true,
      faceDetection: true
    },
    supportedResolutions: [
      { width: 3840, height: 2160, name: '4K' },
      { width: 1920, height: 1080, name: '1080p' },
      { width: 1280, height: 720, name: '720p' }
    ]
  },
  DAHUA: {
    name: 'Dahua',
    logo: '/images/camera-brands/dahua.png',
    defaultPort: 80,
    defaultProtocol: 'RTSP',
    streamPaths: {
      main: '/cam/realmonitor?channel=1&subtype=0',
      sub: '/cam/realmonitor?channel=1&subtype=1',
      audio: '/cam/realmonitor?channel=1&subtype=2'
    },
    capabilities: {
      pan: true,
      tilt: true,
      zoom: true,
      nightVision: true,
      audio: true,
      motionDetection: true,
      faceDetection: true
    },
    supportedResolutions: [
      { width: 1920, height: 1080, name: '1080p' },
      { width: 1280, height: 720, name: '720p' },
      { width: 640, height: 480, name: '480p' }
    ]
  },
  AXIS: {
    name: 'Axis',
    logo: '/images/camera-brands/axis.png',
    defaultPort: 80,
    defaultProtocol: 'RTSP',
    streamPaths: {
      main: '/axis-media/media.amp',
      sub: '/axis-media/media.amp?videocodec=h264&resolution=640x480',
      audio: '/axis-media/media.amp?audio=1'
    },
    capabilities: {
      pan: true,
      tilt: true,
      zoom: true,
      nightVision: true,
      audio: true,
      motionDetection: true,
      faceDetection: true
    },
    supportedResolutions: [
      { width: 1920, height: 1080, name: '1080p' },
      { width: 1280, height: 720, name: '720p' },
      { width: 640, height: 480, name: '480p' }
    ]
  },
  BOSCH: {
    name: 'Bosch',
    logo: '/images/camera-brands/bosch.png',
    defaultPort: 80,
    defaultProtocol: 'RTSP',
    streamPaths: {
      main: '/rtsp_tunnel',
      sub: '/rtsp_tunnel?channel=1&subtype=1',
      audio: '/rtsp_tunnel?channel=1&subtype=2'
    },
    capabilities: {
      pan: true,
      tilt: true,
      zoom: true,
      nightVision: true,
      audio: true,
      motionDetection: true,
      faceDetection: true
    },
    supportedResolutions: [
      { width: 1920, height: 1080, name: '1080p' },
      { width: 1280, height: 720, name: '720p' },
      { width: 640, height: 480, name: '480p' }
    ]
  },
  GENERIC: {
    name: 'Generic IP Camera',
    logo: '/images/camera-brands/generic.png',
    defaultPort: 80,
    defaultProtocol: 'RTSP',
    streamPaths: {
      main: '/video',
      sub: '/video2',
      audio: '/audio'
    },
    capabilities: {
      pan: false,
      tilt: false,
      zoom: false,
      nightVision: false,
      audio: false,
      motionDetection: false,
      faceDetection: false
    },
    supportedResolutions: [
      { width: 1920, height: 1080, name: '1080p' },
      { width: 1280, height: 720, name: '720p' },
      { width: 640, height: 480, name: '480p' }
    ]
  }
};

/**
 * Camera Integration Helper Functions
 */
export const cameraHelpers = {
  /**
   * Generate RTSP URL
   */
  generateRTSPUrl(camera: ExternalCamera): string {
    const brand = cameraBrands[camera.brand];
    const streamPath = brand.streamPaths.main;
    
    return `rtsp://${camera.username}:${camera.password}@${camera.ipAddress}:${camera.port}${streamPath}`;
  },

  /**
   * Generate HTTP stream URL
   */
  generateHTTPUrl(camera: ExternalCamera, streamType: string = 'main'): string {
    const brand = cameraBrands[camera.brand];
    const streamPath = brand.streamPaths[streamType as keyof typeof brand.streamPaths] || brand.streamPaths.main;
    
    return `http://${camera.ipAddress}:${camera.port}${streamPath}`;
  },

  /**
   * Validate camera configuration
   */
  validateCameraConfig(config: Partial<ExternalCamera>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!config.name) errors.push('Camera name is required');
    if (!config.ipAddress) errors.push('IP address is required');
    if (!config.username) errors.push('Username is required');
    if (!config.password) errors.push('Password is required');
    
    // Validate IP address format
    if (config.ipAddress && !/^(\d{1,3}\.){3}\d{1,3}$/.test(config.ipAddress)) {
      errors.push('Invalid IP address format');
    }
    
    // Validate port range
    if (config.port && (config.port < 1 || config.port > 65535)) {
      errors.push('Port must be between 1 and 65535');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Get camera status color
   */
  getStatusColor(status: ExternalCamera['status']): string {
    switch (status) {
      case 'online': return '#4caf50';
      case 'offline': return '#f44336';
      case 'error': return '#ff9800';
      case 'connecting': return '#2196f3';
      default: return '#9e9e9e';
    }
  },

  /**
   * Get camera status text
   */
  getStatusText(status: ExternalCamera['status']): string {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
      case 'connecting': return 'Connecting...';
      default: return 'Unknown';
    }
  },

  /**
   * Format camera resolution
   */
  formatResolution(resolution: ExternalCamera['resolution']): string {
    return `${resolution.width}x${resolution.height}`;
  },

  /**
   * Get camera capabilities summary
   */
  getCapabilitiesSummary(capabilities: ExternalCamera['capabilities']): string[] {
    const summary: string[] = [];
    
    if (capabilities.pan || capabilities.tilt || capabilities.zoom) {
      summary.push('PTZ Control');
    }
    if (capabilities.nightVision) summary.push('Night Vision');
    if (capabilities.audio) summary.push('Audio');
    if (capabilities.motionDetection) summary.push('Motion Detection');
    if (capabilities.faceDetection) summary.push('Face Detection');
    
    return summary;
  }
};

export default externalCameraService;

