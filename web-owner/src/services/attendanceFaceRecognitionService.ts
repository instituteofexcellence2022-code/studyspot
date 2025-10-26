/**
 * Attendance Face Recognition Service
 * AI-powered automatic attendance marking using face recognition
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
      console.error('Attendance Face Recognition API Error:', error.response?.data || error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('studyspot_auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Types for attendance face recognition
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

export interface FaceDetection {
  id: string;
  studentId: string;
  studentName: string;
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

export interface CameraConfig {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  faceDetectionEnabled: boolean;
  autoAttendanceEnabled: boolean;
  confidenceThreshold: number;
  lastSeen: string;
  totalDetections: number;
  accuracy: number;
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

/**
 * Attendance Face Recognition Service
 */
export const attendanceFaceRecognitionService = {
  /**
   * Get all enrolled students
   */
  async getEnrolledStudents(): Promise<Student[]> {
    const response = await apiClient.get('/api/attendance/students');
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
    faceImage: string;
  }): Promise<Student> {
    const response = await apiClient.post('/api/attendance/students/enroll', studentData);
    return (response.data as any).data;
  },

  /**
   * Update student face encoding
   */
  async updateFaceEncoding(studentId: string, faceImage: string): Promise<Student> {
    const response = await apiClient.put(`/api/attendance/students/${studentId}/face-encoding`, {
      faceImage
    });
    return (response.data as any).data;
  },

  /**
   * Get face detections
   */
  async getFaceDetections(params?: {
    startDate?: string;
    endDate?: string;
    cameraId?: string;
    processed?: boolean;
    limit?: number;
  }): Promise<FaceDetection[]> {
    const response = await apiClient.get('/api/attendance/face-detections', { params });
    return (response.data as any).data;
  },

  /**
   * Process face detection for attendance
   */
  async processFaceDetection(detectionId: string): Promise<{
    success: boolean;
    attendanceRecord?: AttendanceRecord;
    message: string;
  }> {
    const response = await apiClient.post(`/api/attendance/face-detections/${detectionId}/process`);
    return (response.data as any).data;
  },

  /**
   * Mark attendance automatically
   */
  async markAttendanceAuto(detection: FaceDetection): Promise<AttendanceRecord> {
    const response = await apiClient.post('/api/attendance/mark-auto', {
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
    const response = await apiClient.post('/api/attendance/mark-manual', attendanceData);
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
    const response = await apiClient.get('/api/attendance/records', { params });
    return (response.data as any).data;
  },

  /**
   * Check out student
   */
  async checkOutStudent(recordId: string): Promise<AttendanceRecord> {
    const response = await apiClient.post(`/api/attendance/records/${recordId}/checkout`);
    return (response.data as any).data;
  },

  /**
   * Get camera configurations
   */
  async getCameraConfigs(): Promise<CameraConfig[]> {
    const response = await apiClient.get('/api/attendance/cameras');
    return (response.data as any).data;
  },

  /**
   * Update camera configuration
   */
  async updateCameraConfig(cameraId: string, config: Partial<CameraConfig>): Promise<CameraConfig> {
    const response = await apiClient.put(`/api/attendance/cameras/${cameraId}`, config);
    return (response.data as any).data;
  },

  /**
   * Start face recognition on camera
   */
  async startFaceRecognition(cameraId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.post(`/api/attendance/cameras/${cameraId}/start-recognition`);
    return (response.data as any).data;
  },

  /**
   * Stop face recognition on camera
   */
  async stopFaceRecognition(cameraId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.post(`/api/attendance/cameras/${cameraId}/stop-recognition`);
    return (response.data as any).data;
  },

  /**
   * Get attendance statistics
   */
  async getAttendanceStats(timeRange?: string): Promise<AttendanceStats> {
    const response = await apiClient.get('/api/attendance/stats', {
      params: { timeRange }
    });
    return (response.data as any).data;
  },

  /**
   * Get attendance analytics
   */
  async getAttendanceAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<{
    trends: Array<{
      date: string;
      present: number;
      absent: number;
      autoMarked: number;
      manualMarked: number;
    }>;
    methods: Array<{
      method: string;
      count: number;
      percentage: number;
    }>;
    accuracy: {
      faceRecognition: number;
      manual: number;
      overall: number;
    };
  }> {
    const response = await apiClient.get('/api/attendance/analytics', { params });
    return (response.data as any).data;
  },

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
    const response = await apiClient.post('/api/attendance/export', params);
    return (response.data as any).data;
  },

  /**
   * Get real-time attendance feed
   */
  async getRealTimeFeed(): Promise<{
    activeStudents: number;
    recentDetections: FaceDetection[];
    cameraStatus: CameraConfig[];
    systemStatus: 'active' | 'inactive' | 'error';
  }> {
    const response = await apiClient.get('/api/attendance/real-time-feed');
    return (response.data as any).data;
  },

  /**
   * Validate face image quality
   */
  async validateFaceImage(imageData: string): Promise<{
    valid: boolean;
    quality: number;
    issues: string[];
    recommendations: string[];
  }> {
    const response = await apiClient.post('/api/attendance/validate-face-image', {
      imageData
    });
    return (response.data as any).data;
  },

  /**
   * Get student attendance history
   */
  async getStudentAttendanceHistory(studentId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{
    student: Student;
    attendance: AttendanceRecord[];
    stats: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      averageDuration: string;
      attendancePercentage: number;
    };
  }> {
    const response = await apiClient.get(`/api/attendance/students/${studentId}/history`, { params });
    return (response.data as any).data;
  }
};

/**
 * Attendance Helper Functions
 */
export const attendanceHelpers = {
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
   * Generate attendance report
   */
  generateAttendanceReport(records: AttendanceRecord[]): {
    summary: {
      totalRecords: number;
      presentCount: number;
      absentCount: number;
      averageDuration: string;
    };
    byMethod: Record<string, number>;
    byLocation: Record<string, number>;
    trends: Array<{
      date: string;
      count: number;
    }>;
  } {
    const summary = {
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

    const trends = records.reduce((acc, record) => {
      const date = record.date;
      const existing = acc.find(t => t.date === date);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, [] as Array<{ date: string; count: number }>);

    return {
      summary,
      byMethod,
      byLocation,
      trends: trends.sort((a, b) => a.date.localeCompare(b.date))
    };
  }
};

export default attendanceFaceRecognitionService;



