import axios from 'axios';
import { API_CONFIG } from '../constants';

/**
 * Face Recognition Service
 * Comprehensive face recognition and biometric attendance service
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
      console.error('Face Recognition API Error:', error.response?.data || error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('studyspot_auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface FaceEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentDate: string;
  qualityScore: number;
  faceCount: number;
  status: 'pending' | 'completed' | 'failed' | 'needs_retake';
  images: string[];
  features: number[];
  lastUpdated: string;
  metadata: {
    angles: string[];
    lighting: string[];
    expressions: string[];
    accessories: string[];
  };
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  timestamp: string;
  confidence: number;
  cameraId: string;
  cameraName: string;
  location: string;
  status: 'verified' | 'pending' | 'failed' | 'spoof_detected';
  imageUrl?: string;
  livenessScore: number;
  maskDetected: boolean;
  temperature?: number;
  metadata: {
    faceBox: { x: number; y: number; width: number; height: number };
    landmarks: Array<{ x: number; y: number }>;
    attributes: {
      age: number;
      gender: string;
      emotion: string;
      glasses: boolean;
      mask: boolean;
    };
  };
}

export interface Camera {
  id: string;
  name: string;
  type: 'ip_camera' | 'usb_webcam' | 'mobile' | 'biometric_device';
  status: 'online' | 'offline' | 'error';
  location: string;
  resolution: string;
  fps: number;
  lastSeen: string;
  settings: {
    quality: number;
    brightness: number;
    contrast: number;
    detectionThreshold: number;
    livenessThreshold: number;
    maskDetection: boolean;
    temperatureCheck: boolean;
  };
  capabilities: {
    faceDetection: boolean;
    livenessDetection: boolean;
    maskDetection: boolean;
    temperatureCheck: boolean;
    nightVision: boolean;
    panTiltZoom: boolean;
  };
}

export interface SecurityAlert {
  id: string;
  type: 'spoof_attempt' | 'unauthorized_access' | 'system_breach' | 'data_anomaly' | 'mask_violation' | 'temperature_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  studentId?: string;
  cameraId: string;
  confidence: number;
  resolved: boolean;
  evidence: {
    imageUrl?: string;
    videoUrl?: string;
    metadata: any;
  };
}

export interface RecognitionAnalytics {
  totalRecognitions: number;
  successfulRecognitions: number;
  failedRecognitions: number;
  spoofAttempts: number;
  averageConfidence: number;
  averageLivenessScore: number;
  recognitionRate: number;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    recognitionCount: number;
    averageConfidence: number;
  }>;
  hourlyStats: Array<{
    hour: string;
    recognitions: number;
    successRate: number;
  }>;
  dailyStats: Array<{
    date: string;
    recognitions: number;
    successRate: number;
    spoofAttempts: number;
  }>;
}

export interface EnrollmentSession {
  id: string;
  studentId: string;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  capturedImages: number;
  requiredImages: number;
  qualityScores: number[];
  currentStep: 'face_capture' | 'quality_check' | 'feature_extraction' | 'verification' | 'completed';
  instructions: string[];
}

/**
 * Face Recognition Service - Main API Methods
 */
export const faceRecognitionService = {
  /**
   * Get all face enrollments
   */
  async getEnrollments(): Promise<FaceEnrollment[]> {
    const response = await apiClient.get('/api/face-recognition/enrollments');
    return (response.data as any).data;
  },

  /**
   * Get enrollment by ID
   */
  async getEnrollment(id: string): Promise<FaceEnrollment> {
    const response = await apiClient.get(`/api/face-recognition/enrollments/${id}`);
    return (response.data as any).data;
  },

  /**
   * Start new enrollment session
   */
  async startEnrollment(studentId: string, studentName: string, studentEmail?: string): Promise<EnrollmentSession> {
    const response = await apiClient.post('/api/face-recognition/enrollments', {
      studentId,
      studentName,
      studentEmail
    });
    return (response.data as any).data;
  },

  /**
   * Capture face image during enrollment
   */
  async captureFaceImage(sessionId: string, imageData: string): Promise<{
    success: boolean;
    qualityScore: number;
    imageId: string;
    feedback: string;
  }> {
    const response = await apiClient.post(`/api/face-recognition/enrollments/${sessionId}/capture`, {
      imageData
    });
    return (response.data as any).data;
  },

  /**
   * Complete enrollment session
   */
  async completeEnrollment(sessionId: string): Promise<FaceEnrollment> {
    const response = await apiClient.post(`/api/face-recognition/enrollments/${sessionId}/complete`);
    return (response.data as any).data;
  },

  /**
   * Cancel enrollment session
   */
  async cancelEnrollment(sessionId: string): Promise<void> {
    await apiClient.post(`/api/face-recognition/enrollments/${sessionId}/cancel`);
  },

  /**
   * Delete enrollment
   */
  async deleteEnrollment(id: string): Promise<void> {
    await apiClient.delete(`/api/face-recognition/enrollments/${id}`);
  },

  /**
   * Get attendance records
   */
  async getAttendanceRecords(params?: {
    startDate?: string;
    endDate?: string;
    studentId?: string;
    cameraId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<AttendanceRecord[]> {
    const response = await apiClient.get('/api/face-recognition/attendance', { params });
    return (response.data as any).data;
  },

  /**
   * Get real-time attendance feed
   */
  async getRealTimeAttendance(): Promise<AttendanceRecord[]> {
    const response = await apiClient.get('/api/face-recognition/attendance/realtime');
    return (response.data as any).data;
  },

  /**
   * Verify attendance record
   */
  async verifyAttendance(recordId: string, verified: boolean, notes?: string): Promise<AttendanceRecord> {
    const response = await apiClient.post(`/api/face-recognition/attendance/${recordId}/verify`, {
      verified,
      notes
    });
    return (response.data as any).data;
  },

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
  async addCamera(camera: Partial<Camera>): Promise<Camera> {
    const response = await apiClient.post('/api/face-recognition/cameras', camera);
    return (response.data as any).data;
  },

  /**
   * Update camera settings
   */
  async updateCameraSettings(cameraId: string, settings: Partial<Camera['settings']>): Promise<Camera> {
    const response = await apiClient.put(`/api/face-recognition/cameras/${cameraId}/settings`, settings);
    return (response.data as any).data;
  },

  /**
   * Test camera connection
   */
  async testCamera(cameraId: string): Promise<{
    success: boolean;
    responseTime: number;
    imageQuality: number;
    error?: string;
  }> {
    const response = await apiClient.post(`/api/face-recognition/cameras/${cameraId}/test`);
    return (response.data as any).data;
  },

  /**
   * Delete camera
   */
  async deleteCamera(cameraId: string): Promise<void> {
    await apiClient.delete(`/api/face-recognition/cameras/${cameraId}`);
  },

  /**
   * Get security alerts
   */
  async getSecurityAlerts(params?: {
    type?: string;
    severity?: string;
    resolved?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<SecurityAlert[]> {
    const response = await apiClient.get('/api/face-recognition/security-alerts', { params });
    return (response.data as any).data;
  },

  /**
   * Resolve security alert
   */
  async resolveSecurityAlert(alertId: string, resolution: string): Promise<SecurityAlert> {
    const response = await apiClient.post(`/api/face-recognition/security-alerts/${alertId}/resolve`, {
      resolution
    });
    return (response.data as any).data;
  },

  /**
   * Get recognition analytics
   */
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<RecognitionAnalytics> {
    const response = await apiClient.get('/api/face-recognition/analytics', { params });
    return (response.data as any).data;
  },

  /**
   * Get live recognition feed
   */
  async getLiveFeed(cameraId?: string): Promise<{
    isActive: boolean;
    currentRecognitions: AttendanceRecord[];
    cameraStatus: { [cameraId: string]: 'online' | 'offline' | 'error' };
  }> {
    const response = await apiClient.get('/api/face-recognition/live-feed', {
      params: { cameraId }
    });
    return (response.data as any).data;
  },

  /**
   * Start live recognition
   */
  async startLiveRecognition(cameraIds: string[]): Promise<{
    success: boolean;
    activeCameras: string[];
    error?: string;
  }> {
    const response = await apiClient.post('/api/face-recognition/live-feed/start', {
      cameraIds
    });
    return (response.data as any).data;
  },

  /**
   * Stop live recognition
   */
  async stopLiveRecognition(): Promise<void> {
    await apiClient.post('/api/face-recognition/live-feed/stop');
  },

  /**
   * Detect face in image
   */
  async detectFace(imageData: string): Promise<{
    faces: Array<{
      box: { x: number; y: number; width: number; height: number };
      landmarks: Array<{ x: number; y: number }>;
      confidence: number;
    }>;
    livenessScore: number;
    spoofDetected: boolean;
  }> {
    const response = await apiClient.post('/api/face-recognition/detect', {
      imageData
    });
    return (response.data as any).data;
  },

  /**
   * Recognize face in image
   */
  async recognizeFace(imageData: string, cameraId?: string): Promise<{
    matches: Array<{
      studentId: string;
      studentName: string;
      confidence: number;
      enrollmentId: string;
    }>;
    livenessScore: number;
    spoofDetected: boolean;
    maskDetected: boolean;
  }> {
    const response = await apiClient.post('/api/face-recognition/recognize', {
      imageData,
      cameraId
    });
    return (response.data as any).data;
  },

  /**
   * Get enrollment quality metrics
   */
  async getEnrollmentQuality(enrollmentId: string): Promise<{
    overallScore: number;
    angleCoverage: number;
    lightingQuality: number;
    imageClarity: number;
    recommendations: string[];
  }> {
    const response = await apiClient.get(`/api/face-recognition/enrollments/${enrollmentId}/quality`);
    return (response.data as any).data;
  },

  /**
   * Retake enrollment images
   */
  async retakeEnrollmentImages(enrollmentId: string, imageIds: string[]): Promise<FaceEnrollment> {
    const response = await apiClient.post(`/api/face-recognition/enrollments/${enrollmentId}/retake`, {
      imageIds
    });
    return (response.data as any).data;
  },

  /**
   * Export attendance data
   */
  async exportAttendanceData(params?: {
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'excel' | 'pdf';
    includeImages?: boolean;
  }): Promise<{ downloadUrl: string }> {
    const response = await apiClient.post('/api/face-recognition/attendance/export', params);
    return (response.data as any).data;
  },

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<{
    overallHealth: 'healthy' | 'warning' | 'critical';
    components: {
      faceDetection: 'healthy' | 'warning' | 'critical';
      livenessDetection: 'healthy' | 'warning' | 'critical';
      database: 'healthy' | 'warning' | 'critical';
      cameras: 'healthy' | 'warning' | 'critical';
    };
    metrics: {
      averageResponseTime: number;
      errorRate: number;
      activeConnections: number;
    };
  }> {
    const response = await apiClient.get('/api/face-recognition/health');
    return (response.data as any).data;
  }
};

/**
 * Face Recognition Helper Functions
 */
export const faceRecognitionHelpers = {
  /**
   * Calculate enrollment quality score
   */
  calculateQualityScore(scores: number[]): number {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  },

  /**
   * Get quality score color
   */
  getQualityScoreColor(score: number): 'success' | 'warning' | 'error' {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  },

  /**
   * Format confidence score
   */
  formatConfidence(confidence: number): string {
    return `${confidence.toFixed(1)}%`;
  },

  /**
   * Get status color
   */
  getStatusColor(status: string): 'success' | 'warning' | 'error' | 'info' {
    switch (status) {
      case 'completed':
      case 'verified':
      case 'online':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'offline':
      case 'error':
        return 'error';
      case 'needs_retake':
        return 'info';
      default:
        return 'warning';
    }
  },

  /**
   * Get severity color
   */
  getSeverityColor(severity: string): 'success' | 'warning' | 'error' | 'info' {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'warning';
    }
  },

  /**
   * Validate image quality
   */
  validateImageQuality(imageData: string): {
    valid: boolean;
    quality: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let quality = 100;

    // Basic validation (in real implementation, this would use image processing)
    if (!imageData || imageData.length < 1000) {
      issues.push('Image too small or corrupted');
      quality -= 50;
    }

    return {
      valid: issues.length === 0,
      quality: Math.max(0, quality),
      issues
    };
  },

  /**
   * Generate enrollment instructions
   */
  generateEnrollmentInstructions(step: string): string[] {
    const instructions = {
      face_capture: [
        'Position your face in the center of the frame',
        'Ensure good lighting on your face',
        'Look directly at the camera',
        'Keep a neutral expression',
        'Remove glasses and masks if possible'
      ],
      quality_check: [
        'Review the captured images',
        'Ensure all angles are covered',
        'Check image clarity and lighting',
        'Retake any poor quality images'
      ],
      feature_extraction: [
        'Processing facial features...',
        'Creating biometric template...',
        'This may take a few moments'
      ],
      verification: [
        'Verifying enrollment quality...',
        'Checking for duplicates...',
        'Finalizing enrollment...'
      ],
      completed: [
        'Enrollment completed successfully!',
        'Your face is now registered in the system',
        'You can now use face recognition for attendance'
      ]
    };

    return instructions[step as keyof typeof instructions] || [];
  },

  /**
   * Format camera type
   */
  formatCameraType(type: string): string {
    return type.replace('_', ' ').toUpperCase();
  },

  /**
   * Calculate recognition rate
   */
  calculateRecognitionRate(successful: number, total: number): number {
    if (total === 0) return 0;
    return (successful / total) * 100;
  },

  /**
   * Get time ago string
   */
  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
};

export default faceRecognitionService;



