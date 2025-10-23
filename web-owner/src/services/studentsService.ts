import apiClient from './api';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  status: 'active' | 'inactive' | 'suspended' | 'graduated' | 'withdrawn';
  currentPlan?: string;
  feeStatus: 'paid' | 'pending' | 'overdue' | 'exempt' | 'partial';
  enrollmentDate: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface StudentsListResponse {
  students: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  currentPlan?: string;
  feeStatus?: string;
  status?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {}

export interface StudentsFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;  // comma-separated
  feeStatus?: string;  // comma-separated
  plan?: string;  // comma-separated
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class StudentsService {
  private baseURL = '/api/students';

  /**
   * Get list of students with filters and pagination
   */
  async getStudents(filters: StudentsFilters = {}): Promise<StudentsListResponse> {
    const response = await apiClient.get(this.baseURL, { params: filters }) as any;
    return response.data.data;
  }

  /**
   * Get single student by ID
   */
  async getStudent(id: string): Promise<Student> {
    const response = await apiClient.get(`${this.baseURL}/${id}`) as any;
    return response.data.data.student;
  }

  /**
   * Create new student
   */
  async createStudent(data: CreateStudentData): Promise<Student> {
    const response = await apiClient.post(this.baseURL, data) as any;
    return response.data.data.student;
  }

  /**
   * Update existing student
   */
  async updateStudent(id: string, data: UpdateStudentData): Promise<Student> {
    const response = await apiClient.put(`${this.baseURL}/${id}`, data) as any;
    return response.data.data.student;
  }

  /**
   * Delete student (soft delete)
   */
  async deleteStudent(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Export students to CSV
   */
  async exportToCSV(filters: StudentsFilters = {}): Promise<Blob> {
    const response = await apiClient.get(`${this.baseURL}/export/csv`, {
      params: filters,
      responseType: 'blob',
    }) as any;
    return response.data;
  }

  /**
   * Search students (convenience method)
   */
  async searchStudents(searchTerm: string, limit: number = 10): Promise<Student[]> {
    const response = await this.getStudents({ search: searchTerm, limit });
    return response.students;
  }

  /**
   * Get students by status
   */
  async getStudentsByStatus(status: string): Promise<Student[]> {
    const response = await this.getStudents({ status, limit: 100 });
    return response.students;
  }

  /**
   * Get students by fee status
   */
  async getStudentsByFeeStatus(feeStatus: string): Promise<Student[]> {
    const response = await this.getStudents({ feeStatus, limit: 100 });
    return response.students;
  }
}

// Export singleton instance
const studentsService = new StudentsService();
export default studentsService;

