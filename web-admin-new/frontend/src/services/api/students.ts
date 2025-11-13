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
    const { data } = await api.get<Student[]>('/students', { params: filters });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch students' };
  }
};

export const getStudentById = async (id: string): Promise<ApiResponse<Student>> => {
  try {
    const { data } = await api.get<Student>(`/students/${id}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch student' };
  }
};

export const createStudent = async (data: Partial<Student>): Promise<ApiResponse<Student>> => {
  try {
    const result = await api.post<Student>('/students', data);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to create student' };
  }
};

export const updateStudent = async (id: string, data: Partial<Student>): Promise<ApiResponse<Student>> => {
  try {
    const result = await api.put<Student>(`/students/${id}`, data);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to update student' };
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
    const { data } = await api.get<StudentBooking[]>(`/students/${studentId}/bookings`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch bookings' };
  }
};

export const getStudentPayments = async (studentId: string): Promise<ApiResponse<StudentPayment[]>> => {
  try {
    const { data } = await api.get<StudentPayment[]>(`/students/${studentId}/payments`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch payments' };
  }
};

export const getStudentAttendance = async (
  studentId: string,
  dateRange?: { startDate: string; endDate: string }
): Promise<ApiResponse<StudentAttendance[]>> => {
  try {
    const { data } = await api.get<StudentAttendance[]>(`/students/${studentId}/attendance`, { params: dateRange });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch attendance' };
  }
};

export const getStudentCommunications = async (studentId: string): Promise<ApiResponse<StudentCommunication[]>> => {
  try {
    const { data } = await api.get<StudentCommunication[]>(`/students/${studentId}/communications`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch communications' };
  }
};

export const getStudentComplaints = async (studentId: string): Promise<ApiResponse<StudentComplaint[]>> => {
  try {
    const { data } = await api.get<StudentComplaint[]>(`/students/${studentId}/complaints`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch complaints' };
  }
};

// ============================================
// ANALYTICS & INSIGHTS
// ============================================

export const getStudentAnalytics = async (
  filters?: Partial<StudentFilters>
): Promise<ApiResponse<StudentAnalytics>> => {
  try {
    const { data } = await api.get<StudentAnalytics>('/students/analytics', { params: filters });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch analytics' };
  }
};

export const getDashboardData = async (): Promise<ApiResponse<StudentDashboardData>> => {
  try {
    const { data } = await api.get<StudentDashboardData>('/students/dashboard');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch student dashboard data' };
  }
};

export const getChurnRiskStudents = async (): Promise<ApiResponse<Student[]>> => {
  try {
    const { data } = await api.get<Student[]>('/students/churn-risk');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch churn risk students' };
  }
};

export const getTopActiveStudents = async (limit: number = 10): Promise<ApiResponse<Student[]>> => {
  try {
    const { data } = await api.get<Student[]>('/students/top-active', { params: { limit } });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to fetch top active students' };
  }
};

// ============================================
// BULK OPERATIONS
// ============================================

export const bulkUpdateStudents = async (
  operation: StudentBulkOperation
): Promise<ApiResponse<{ updated: number }>> => {
  try {
    const { data } = await api.post<{ updated: number }>('/students/bulk-update', operation);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to run bulk update' };
  }
};

export const bulkSendMessage = async (data: {
  studentIds: string[];
  channel: 'sms' | 'whatsapp' | 'email';
  message: string;
  subject?: string;
}): Promise<ApiResponse<{ sent: number }>> => {
  try {
    const result = await api.post<{ sent: number }>('/students/bulk-message', data);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to send bulk message' };
  }
};

export const exportStudents = async (
  filters?: Partial<StudentFilters>,
  format: 'csv' | 'excel' | 'pdf' = 'csv'
): Promise<ApiResponse<Blob>> => {
  try {
    const { data } = await api.get<Blob>('/students/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to export students' };
  }
};

// ============================================
// STUDENT ACTIONS
// ============================================

export const suspendStudent = async (id: string, reason: string): Promise<ApiResponse<Student>> => {
  try {
    const { data } = await api.post<Student>(`/students/${id}/suspend`, { reason });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to suspend student' };
  }
};

export const reactivateStudent = async (id: string): Promise<ApiResponse<Student>> => {
  try {
    const { data } = await api.post<Student>(`/students/${id}/reactivate`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to reactivate student' };
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

