// ============================================
// STUDENT MANAGEMENT SERVICE
// Platform-wide student data and operations
// ============================================

import api from './client';
import type {
  Student,
  StudentBooking,
  StudentPayment,
  StudentAttendance,
  StudentCommunication,
  StudentComplaint,
  StudentAnalytics,
  StudentFilters,
  StudentDashboardData,
  StudentBulkOperation,
} from '../../modules/students/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// STUDENT CRUD OPERATIONS
// ============================================

export const getAllStudents = async (
  filters?: Partial<StudentFilters>
): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await api.get('/students', { params: filters });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getStudentById = async (id: string): Promise<ApiResponse<Student>> => {
  try {
    const response = await api.get(`/students/${id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const createStudent = async (data: Partial<Student>): Promise<ApiResponse<Student>> => {
  try {
    const response = await api.post('/students', data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateStudent = async (id: string, data: Partial<Student>): Promise<ApiResponse<Student>> => {
  try {
    const response = await api.put(`/students/${id}`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteStudent = async (id: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/students/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// STUDENT HISTORY & RECORDS
// ============================================

export const getStudentBookings = async (studentId: string): Promise<ApiResponse<StudentBooking[]>> => {
  try {
    const response = await api.get(`/students/${studentId}/bookings`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getStudentPayments = async (studentId: string): Promise<ApiResponse<StudentPayment[]>> => {
  try {
    const response = await api.get(`/students/${studentId}/payments`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getStudentAttendance = async (
  studentId: string,
  dateRange?: { startDate: string; endDate: string }
): Promise<ApiResponse<StudentAttendance[]>> => {
  try {
    const response = await api.get(`/students/${studentId}/attendance`, { params: dateRange });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getStudentCommunications = async (studentId: string): Promise<ApiResponse<StudentCommunication[]>> => {
  try {
    const response = await api.get(`/students/${studentId}/communications`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getStudentComplaints = async (studentId: string): Promise<ApiResponse<StudentComplaint[]>> => {
  try {
    const response = await api.get(`/students/${studentId}/complaints`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// ANALYTICS & INSIGHTS
// ============================================

export const getStudentAnalytics = async (
  filters?: Partial<StudentFilters>
): Promise<ApiResponse<StudentAnalytics>> => {
  try {
    const response = await api.get('/students/analytics', { params: filters });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getDashboardData = async (): Promise<ApiResponse<StudentDashboardData>> => {
  try {
    const response = await api.get('/students/dashboard');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getChurnRiskStudents = async (): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await api.get('/students/churn-risk');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getTopActiveStudents = async (limit: number = 10): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await api.get('/students/top-active', { params: { limit } });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// BULK OPERATIONS
// ============================================

export const bulkUpdateStudents = async (
  operation: StudentBulkOperation
): Promise<ApiResponse<{ updated: number }>> => {
  try {
    const response = await api.post('/students/bulk-update', operation);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const bulkSendMessage = async (data: {
  studentIds: string[];
  channel: 'sms' | 'whatsapp' | 'email';
  message: string;
  subject?: string;
}): Promise<ApiResponse<{ sent: number }>> => {
  try {
    const response = await api.post('/students/bulk-message', data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const exportStudents = async (
  filters?: Partial<StudentFilters>,
  format: 'csv' | 'excel' | 'pdf' = 'csv'
): Promise<ApiResponse<Blob>> => {
  try {
    const response = await api.get('/students/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// STUDENT ACTIONS
// ============================================

export const suspendStudent = async (id: string, reason: string): Promise<ApiResponse<Student>> => {
  try {
    const response = await api.post(`/students/${id}/suspend`, { reason });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const reactivateStudent = async (id: string): Promise<ApiResponse<Student>> => {
  try {
    const response = await api.post(`/students/${id}/reactivate`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const sendReminderToStudent = async (
  id: string,
  type: 'payment' | 'booking' | 'renewal'
): Promise<ApiResponse<void>> => {
  try {
    await api.post(`/students/${id}/send-reminder`, { type });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const studentService = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentBookings,
  getStudentPayments,
  getStudentAttendance,
  getStudentCommunications,
  getStudentComplaints,
  getStudentAnalytics,
  getDashboardData,
  getChurnRiskStudents,
  getTopActiveStudents,
  bulkUpdateStudents,
  bulkSendMessage,
  exportStudents,
  suspendStudent,
  reactivateStudent,
  sendReminderToStudent,
};

export default studentService;

