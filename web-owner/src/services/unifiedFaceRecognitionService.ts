// Unified Face Recognition Service

// Types
export interface Camera {
  id: string;
  name: string;
  brand: string;
  model: string;
  status: 'active' | 'inactive' | 'error' | 'online' | 'offline' | 'connecting';
  capabilities: string[];
  streamUrl?: string;
  resolution?: { width: number; height: number };
  fps?: number;
  lastSeen?: string;
  ipAddress?: string;
  port?: number;
  username?: string;
  password?: string;
  protocol?: string;
  location?: {
    zone: string;
    position: string;
    angle?: number;
    height?: number;
  };
  settings?: {
    brightness: number;
    contrast: number;
    saturation: number;
    sharpness: number;
    exposure: number;
    whiteBalance: string;
    nightMode: boolean;
  };
  faceRecognitionEnabled?: boolean;
  autoAttendanceEnabled?: boolean;
  confidenceThreshold?: number;
  totalDetections?: number;
  accuracy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CameraEvent {
  id: string;
  cameraId: string;
  timestamp: Date | string;
  type: 'motion' | 'face_detected' | 'face_detection' | 'error' | 'connection_lost';
  data?: any;
  confidence?: number;
  coordinates?: { x: number; y: number; width: number; height: number };
  imageUrl?: string;
  acknowledged?: boolean;
}

export interface CameraGroup {
  id: string;
  name: string;
  cameras: Camera[];
  settings: any;
}

// Services
export const unifiedFaceRecognitionService = {
  // Add service methods here
};

export const unifiedHelpers = {
  // Add helper methods here
};

// Camera brands
export const cameraBrands = [
  'Hikvision',
  'Dahua',
  'Axis',
  'Bosch',
  'Sony',
  'Panasonic',
  'Samsung',
  'Uniview',
  'Tiandy',
  'Other'
];

// Camera brand details
export const cameraBrandDetails = {
  'Hikvision': { name: 'Hikvision', capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection', 'faceDetection'] },
  'Dahua': { name: 'Dahua', capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'] },
  'Axis': { name: 'Axis', capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection', 'faceDetection'] },
  'Bosch': { name: 'Bosch', capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio'] },
  'Sony': { name: 'Sony', capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'] },
  'Panasonic': { name: 'Panasonic', capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'] },
  'Samsung': { name: 'Samsung', capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'] },
  'Uniview': { name: 'Uniview', capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'] },
  'Tiandy': { name: 'Tiandy', capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'] },
  'Other': { name: 'Other', capabilities: ['nightVision', 'audio', 'motionDetection'] }
};

// Camera helpers
export const cameraHelpers = {
  validateCameraConfig: (config: any) => {
    const errors: string[] = [];
    
    if (!config.name || config.name.trim() === '') {
      errors.push('Camera name is required');
    }
    
    if (!config.brand || config.brand.trim() === '') {
      errors.push('Camera brand is required');
    }
    
    if (!config.model || config.model.trim() === '') {
      errors.push('Camera model is required');
    }
    
    if (!config.ipAddress || config.ipAddress.trim() === '') {
      errors.push('IP address is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  testConnection: async (config: any) => {
    // Mock connection test
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection', 'faceDetection'],
          streamUrl: `rtsp://${config.ipAddress}:554/stream`
        });
      }, 1000);
    });
  },
  
  getCapabilitiesFromBrand: (brand: string) => {
    const brandCapabilities: { [key: string]: string[] } = {
      'Hikvision': ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection', 'faceDetection'],
      'Dahua': ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'],
      'Axis': ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection', 'faceDetection'],
      'Bosch': ['pan', 'tilt', 'zoom', 'nightVision', 'audio'],
      'Sony': ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'],
      'Panasonic': ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'],
      'Samsung': ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'],
      'Uniview': ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'],
      'Tiandy': ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection'],
      'Other': ['nightVision', 'audio', 'motionDetection']
    };
    
    return brandCapabilities[brand] || brandCapabilities['Other'];
  },
  
  getStatusColor: (status: string) => {
    const statusColors: { [key: string]: string } = {
      'active': '#4caf50',
      'online': '#4caf50',
      'inactive': '#ff9800',
      'offline': '#f44336',
      'error': '#f44336',
      'connecting': '#2196f3'
    };
    return statusColors[status] || '#9e9e9e';
  },
  
  getStatusText: (status: string) => {
    const statusTexts: { [key: string]: string } = {
      'active': 'Active',
      'online': 'Online',
      'inactive': 'Inactive',
      'offline': 'Offline',
      'error': 'Error',
      'connecting': 'Connecting'
    };
    return statusTexts[status] || 'Unknown';
  },
  
  formatResolution: (resolution?: { width: number; height: number }) => {
    if (!resolution) return 'Unknown';
    return `${resolution.width}x${resolution.height}`;
  },

  getCapabilitiesSummary: (capabilities: string[]) => {
    return capabilities.slice(0, 3); // Show first 3 capabilities
  }
};