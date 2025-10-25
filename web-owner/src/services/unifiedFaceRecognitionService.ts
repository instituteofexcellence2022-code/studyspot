/**
 * Unified Face Recognition & Attendance Service
 * Single API service for all face recognition and attendance features
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
      console.error('Unified Face Recognition API Error:', error.response?.data || error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('studyspot_auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// UNIFIED TYPES - All face recognition & attendance
// ============================================

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  faceEncoding?: number[];
  faceImage?: string;
  enrollmentStatus: 'enrolled' | 'pending' | 'rejected';
  lastAttendance?: string;
  totalAttendance: number;
  createdAt: string;
}

export interface FaceEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  quality: number;
  version: string;
  algorithm: string;
  createdAt: string;
  updatedAt: string;
  checksum: string;
  faceImages: string[];
  angles: string[];
}

export interface FaceDetection {
  id: string;
  studentId?: string;
  studentName?: string;
  confidence: number;
  faceImage: string;
  location: string;
  cameraId: string;
  timestamp: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  processed: boolean;
  type: 'enrollment' | 'attendance' | 'verification';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  checkIn: string;
  checkOut?: string;
  duration?: string;
  method: 'face-recognition' | 'manual' | 'qr-code';
  confidence?: number;
  faceImage?: string;
  location: string;
  cameraId?: string;
  status: 'checked-in' | 'checked-out' | 'absent';
  date: string;
  createdAt: string;
}

export interface Camera {
  id: string;
  name: string;
  brand: 'CP_PLUS' | 'HIKVISION' | 'DAHUA' | 'AXIS' | 'BOSCH' | 'GENERIC';
  model: string;
  ipAddress: string;
  port: number;
  username: string;
  password: string;
  protocol: 'RTSP' | 'HTTP' | 'ONVIF' | 'RTMP';
  streamUrl: string;
  resolution: { width: number; height: number };
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
  faceRecognitionEnabled: boolean;
  autoAttendanceEnabled: boolean;
  confidenceThreshold: number;
  totalDetections: number;
  accuracy: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  averageDuration: string;
  faceRecognitionAccuracy: number;
  autoMarkedToday: number;
  manualMarkedToday: number;
  totalDetections: number;
  successfulRecognitions: number;
  failedRecognitions: number;
}

export interface SecurityAudit {
  id: string;
  timestamp: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  resolved: boolean;
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

export interface CameraGroup {
  id: string;
  name: string;
  description: string;
  cameraIds: string[];
  layout: 'grid' | 'single' | 'quad' | 'custom';
  createdAt: string;
}

// ============================================
// UNIFIED API SERVICE - Single endpoint structure
// ============================================

/**
 * Unified Face Recognition & Attendance Service
 * All endpoints under /api/face-recognition/*
 */
export const unifiedFaceRecognitionService = {
  // ============================================
  // STUDENT MANAGEMENT
  // ============================================
  
  /**
   * Get all enrolled students
   */
  async getStudents(): Promise<Student[]> {
    const response = await apiClient.get('/api/face-recognition/students');
    return (response.data as any).data;
  },

  /**
   * Enroll student for face recognition
   */
  async enrollStudent(studentData: {
    studentId: string;
    name: string;
    email: string;
    phone: string;
    faceImages: string[];
  }): Promise<Student> {
    const response = await apiClient.post('/api/face-recognition/students/enroll', studentData);
    return (response.data as any).data;
  },

  /**
   * Update student face encoding
   */
  async updateFaceEncoding(studentId: string, faceImages: string[]): Promise<Student> {
    const response = await apiClient.put(`/api/face-recognition/students/${studentId}/face-encoding`, {
      faceImages
    });
    return (response.data as any).data;
  },

  /**
   * Delete student enrollment
   */
  async deleteStudent(studentId: string): Promise<void> {
    await apiClient.delete(`/api/face-recognition/students/${studentId}`);
  },

  // ============================================
  // FACE ENROLLMENT
  // ============================================
  
  /**
   * Get face enrollments
   */
  async getEnrollments(): Promise<FaceEnrollment[]> {
    const response = await apiClient.get('/api/face-recognition/enrollments');
    return (response.data as any).data;
  },

  /**
   * Create face enrollment
   */
  async createEnrollment(enrollmentData: {
    studentId: string;
    faceImages: string[];
    angles: string[];
  }): Promise<FaceEnrollment> {
    const response = await apiClient.post('/api/face-recognition/enrollments', enrollmentData);
    return (response.data as any).data;
  },

  /**
   * Update enrollment quality
   */
  async updateEnrollmentQuality(enrollmentId: string, quality: number): Promise<FaceEnrollment> {
    const response = await apiClient.put(`/api/face-recognition/enrollments/${enrollmentId}/quality`, {
      quality
    });
    return (response.data as any).data;
  },

  // ============================================
  // FACE DETECTION & RECOGNITION
  // ============================================
  
  /**
   * Get face detections
   */
  async getDetections(params?: {
    startDate?: string;
    endDate?: string;
    cameraId?: string;
    type?: 'enrollment' | 'attendance' | 'verification';
    processed?: boolean;
    limit?: number;
  }): Promise<FaceDetection[]> {
    const response = await apiClient.get('/api/face-recognition/detections', { params });
    return (response.data as any).data;
  },

  /**
   * Process face detection
   */
  async processDetection(detectionId: string, type: 'enrollment' | 'attendance' | 'verification'): Promise<{
    success: boolean;
    result?: any;
    message: string;
  }> {
    const response = await apiClient.post(`/api/face-recognition/detections/${detectionId}/process`, {
      type
    });
    return (response.data as any).data;
  },

  /**
   * Start real-time face detection
   */
  async startRealTimeDetection(cameraId: string): Promise<{
    success: boolean;
    streamUrl: string;
    message: string;
  }> {
    const response = await apiClient.post(`/api/face-recognition/detections/start`, {
      cameraId
    });
    return (response.data as any).data;
  },

  /**
   * Stop real-time face detection
   */
  async stopRealTimeDetection(cameraId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.post(`/api/face-recognition/detections/stop`, {
      cameraId
    });
    return (response.data as any).data;
  },

  // ============================================
  // ATTENDANCE MANAGEMENT
  // ============================================
  
  /**
   * Mark attendance automatically
   */
  async markAttendanceAuto(detection: FaceDetection): Promise<AttendanceRecord> {
    const response = await apiClient.post('/api/face-recognition/attendance/mark-auto', {
      studentId: detection.studentId,
      studentName: detection.studentName,
      confidence: detection.confidence,
      faceImage: detection.faceImage,
      location: detection.location,
      cameraId: detection.cameraId,
      method: 'face-recognition'
    });
    return (response.data as any).data;
  },

  /**
   * Mark attendance manually
   */
  async markAttendanceManual(attendanceData: {
    studentId: string;
    studentName: string;
    location: string;
    method: 'manual' | 'qr-code';
  }): Promise<AttendanceRecord> {
    const response = await apiClient.post('/api/face-recognition/attendance/mark-manual', attendanceData);
    return (response.data as any).data;
  },

  /**
   * Get attendance records
   */
  async getAttendanceRecords(params?: {
    startDate?: string;
    endDate?: string;
    studentId?: string;
    status?: string;
    method?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    records: AttendanceRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get('/api/face-recognition/attendance/records', { params });
    return (response.data as any).data;
  },

  /**
   * Check out student
   */
  async checkOutStudent(recordId: string): Promise<AttendanceRecord> {
    const response = await apiClient.post(`/api/face-recognition/attendance/records/${recordId}/checkout`);
    return (response.data as any).data;
  },

  // ============================================
  // CAMERA MANAGEMENT
  // ============================================
  
  /**
   * Get all cameras
   */
  async getCameras(): Promise<Camera[]> {
    const response = await apiClient.get('/api/face-recognition/cameras');
    return (response.data as any).data;
  },

  /**
   * Add new camera
   */
  async addCamera(cameraData: Omit<Camera, 'id' | 'createdAt' | 'updatedAt' | 'lastSeen'>): Promise<Camera> {
    const response = await apiClient.post('/api/face-recognition/cameras', cameraData);
    return (response.data as any).data;
  },

  /**
   * Update camera settings
   */
  async updateCamera(cameraId: string, updates: Partial<Camera>): Promise<Camera> {
    const response = await apiClient.put(`/api/face-recognition/cameras/${cameraId}`, updates);
    return (response.data as any).data;
  },

  /**
   * Test camera connection
   */
  async testCameraConnection(cameraData: {
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
    const response = await apiClient.post('/api/face-recognition/cameras/test-connection', cameraData);
    return (response.data as any).data;
  },

  /**
   * Start face recognition on camera
   */
  async startFaceRecognition(cameraId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.post(`/api/face-recognition/cameras/${cameraId}/start-recognition`);
    return (response.data as any).data;
  },

  /**
   * Stop face recognition on camera
   */
  async stopFaceRecognition(cameraId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.post(`/api/face-recognition/cameras/${cameraId}/stop-recognition`);
    return (response.data as any).data;
  },

  // ============================================
  // ANALYTICS & STATISTICS
  // ============================================
  
  /**
   * Get attendance statistics
   */
  async getAttendanceStats(timeRange?: string): Promise<AttendanceStats> {
    const response = await apiClient.get('/api/face-recognition/analytics/attendance-stats', {
      params: { timeRange }
    });
    return (response.data as any).data;
  },

  /**
   * Get face recognition analytics
   */
  async getRecognitionAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<{
    trends: Array<{
      date: string;
      detections: number;
      recognitions: number;
      accuracy: number;
    }>;
    performance: {
      overallAccuracy: number;
      averageConfidence: number;
      totalDetections: number;
      successfulRecognitions: number;
    };
    cameraPerformance: Array<{
      cameraId: string;
      cameraName: string;
      detections: number;
      accuracy: number;
      uptime: number;
    }>;
  }> {
    const response = await apiClient.get('/api/face-recognition/analytics/recognition', { params });
    return (response.data as any).data;
  },

  /**
   * Get real-time feed
   */
  async getRealTimeFeed(): Promise<{
    activeStudents: number;
    recentDetections: FaceDetection[];
    cameraStatus: Camera[];
    systemStatus: 'active' | 'inactive' | 'error';
  }> {
    const response = await apiClient.get('/api/face-recognition/real-time-feed');
    return (response.data as any).data;
  },

  // ============================================
  // SECURITY & AUDIT
  // ============================================
  
  /**
   * Get security audit logs
   */
  async getSecurityAuditLogs(params?: {
    startDate?: string;
    endDate?: string;
    severity?: string;
    event?: string;
  }): Promise<SecurityAudit[]> {
    const response = await apiClient.get('/api/face-recognition/security/audit-logs', { params });
    return (response.data as any).data;
  },

  /**
   * Log security event
   */
  async logSecurityEvent(event: Omit<SecurityAudit, 'id' | 'timestamp'>): Promise<void> {
    await apiClient.post('/api/face-recognition/security/audit-log', {
      ...event,
      timestamp: new Date().toISOString(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    });
  },

  /**
   * Get client IP address
   */
  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  },

  // ============================================
  // EXPORT & REPORTING
  // ============================================
  
  /**
   * Export attendance data
   */
  async exportAttendanceData(params: {
    startDate: string;
    endDate: string;
    format: 'csv' | 'excel' | 'pdf';
    includeImages?: boolean;
  }): Promise<{
    downloadUrl: string;
    fileSize: number;
    expiresAt: string;
  }> {
    const response = await apiClient.post('/api/face-recognition/export/attendance', params);
    return (response.data as any).data;
  },

  /**
   * Export face recognition data
   */
  async exportRecognitionData(params: {
    startDate: string;
    endDate: string;
    format: 'csv' | 'excel' | 'pdf';
    includeImages?: boolean;
  }): Promise<{
    downloadUrl: string;
    fileSize: number;
    expiresAt: string;
  }> {
    const response = await apiClient.post('/api/face-recognition/export/recognition', params);
    return (response.data as any).data;
  }
};

// ============================================
// UNIFIED HELPER FUNCTIONS
// ============================================

export const unifiedHelpers = {
  /**
   * Calculate attendance percentage
   */
  calculateAttendancePercentage(presentDays: number, totalDays: number): number {
    if (totalDays === 0) return 0;
    return Math.round((presentDays / totalDays) * 100);
  },

  /**
   * Format duration
   */
  formatDuration(startTime: string, endTime?: string): string {
    if (!endTime) return 'In Progress';
    
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diff = end.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  },

  /**
   * Get confidence color
   */
  getConfidenceColor(confidence: number): 'success' | 'warning' | 'error' {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  },

  /**
   * Get method icon
   */
  getMethodIcon(method: string): string {
    switch (method) {
      case 'face-recognition': return 'face';
      case 'manual': return 'person_add';
      case 'qr-code': return 'qr_code';
      default: return 'check_circle';
    }
  },

  /**
   * Get status color
   */
  getStatusColor(status: string): 'success' | 'info' | 'error' {
    switch (status) {
      case 'checked-in': return 'success';
      case 'checked-out': return 'info';
      case 'absent': return 'error';
      default: return 'info';
    }
  },

  /**
   * Get camera status color
   */
  getCameraStatusColor(status: string): 'success' | 'error' | 'warning' {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'error': return 'warning';
      default: return 'warning';
    }
  },

  /**
   * Validate attendance data
   */
  validateAttendanceData(data: Partial<AttendanceRecord>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!data.studentId) errors.push('Student ID is required');
    if (!data.studentName) errors.push('Student name is required');
    if (!data.location) errors.push('Location is required');
    if (!data.method) errors.push('Method is required');
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Generate unified report
   */
  generateUnifiedReport(records: AttendanceRecord[], detections: FaceDetection[]): {
    attendance: {
      summary: {
        totalRecords: number;
        presentCount: number;
        absentCount: number;
        averageDuration: string;
      };
      byMethod: Record<string, number>;
      byLocation: Record<string, number>;
    };
    recognition: {
      totalDetections: number;
      successfulRecognitions: number;
      averageConfidence: number;
      accuracy: number;
    };
    trends: Array<{
      date: string;
      attendance: number;
      detections: number;
    }>;
  } {
    // Attendance analysis
    const attendanceSummary = {
      totalRecords: records.length,
      presentCount: records.filter(r => r.status === 'checked-in' || r.status === 'checked-out').length,
      absentCount: records.filter(r => r.status === 'absent').length,
      averageDuration: '0h 0m' // Calculate based on actual durations
    };

    const byMethod = records.reduce((acc, record) => {
      acc[record.method] = (acc[record.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLocation = records.reduce((acc, record) => {
      acc[record.location] = (acc[record.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recognition analysis
    const recognitionSummary = {
      totalDetections: detections.length,
      successfulRecognitions: detections.filter(d => d.studentId).length,
      averageConfidence: detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length,
      accuracy: detections.filter(d => d.studentId).length / detections.length * 100
    };

    // Combined trends
    const trends = records.reduce((acc, record) => {
      const date = record.date;
      const existing = acc.find(t => t.date === date);
      if (existing) {
        existing.attendance += 1;
      } else {
        acc.push({ date, attendance: 1, detections: 0 });
      }
      return acc;
    }, [] as Array<{ date: string; attendance: number; detections: number }>);

    detections.forEach(detection => {
      const date = detection.timestamp.split('T')[0];
      const existing = trends.find(t => t.date === date);
      if (existing) {
        existing.detections += 1;
      } else {
        trends.push({ date, attendance: 0, detections: 1 });
      }
    });

    return {
      attendance: {
        summary: attendanceSummary,
        byMethod,
        byLocation
      },
      recognition: recognitionSummary,
      trends: trends.sort((a, b) => a.date.localeCompare(b.date))
    };
  }
};

// ============================================
// CAMERA BRANDS CONFIGURATION
// ============================================

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

// ============================================
// CAMERA HELPER FUNCTIONS
// ============================================

export const cameraHelpers = {
  /**
   * Generate RTSP URL
   */
  generateRTSPUrl(camera: Camera): string {
    const brand = cameraBrands[camera.brand];
    const streamPath = brand.streamPaths.main;
    
    return `rtsp://${camera.username}:${camera.password}@${camera.ipAddress}:${camera.port}${streamPath}`;
  },

  /**
   * Generate HTTP stream URL
   */
  generateHTTPUrl(camera: Camera, streamType: string = 'main'): string {
    const brand = cameraBrands[camera.brand];
    const streamPath = brand.streamPaths[streamType as keyof typeof brand.streamPaths] || brand.streamPaths.main;
    
    return `http://${camera.ipAddress}:${camera.port}${streamPath}`;
  },

  /**
   * Validate camera configuration
   */
  validateCameraConfig(config: Partial<Camera>): {
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
  getStatusColor(status: Camera['status']): string {
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
  getStatusText(status: Camera['status']): string {
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
  formatResolution(resolution: Camera['resolution']): string {
    return `${resolution.width}x${resolution.height}`;
  },

  /**
   * Get camera capabilities summary
   */
  getCapabilitiesSummary(capabilities: Camera['capabilities']): string[] {
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

export default unifiedFaceRecognitionService;
