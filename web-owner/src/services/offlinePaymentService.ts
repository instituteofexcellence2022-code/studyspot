import apiService from './api';

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  libraryId: string;
  currentPlan?: {
    id: string;
    name: string;
    amount: number;
    duration: number;
  };
  outstandingBalance?: number;
  lastPaymentDate?: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  libraryId: string;
  isActive: boolean;
}

export interface OfflinePayment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'check' | 'upi' | 'other';
  paymentReference?: string;
  receivedBy: string;
  receivedByName: string;
  libraryId: string;
  status: 'pending' | 'verified' | 'completed' | 'failed';
  receiptNumber: string;
  notes?: string;
  description?: string;
  transactionDate?: string;
  createdAt: string;
  verifiedAt?: string;
  photoUrl?: string;
}

export interface PaymentReceipt {
  receiptNumber: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  paymentMethod: string;
  receivedBy: string;
  date: string;
  qrCode: string;
  libraryName: string;
  libraryAddress: string;
}

class OfflinePaymentService {
  // Auto-select staff member (current user or first available staff)
  async getAutoSelectedStaff(): Promise<Staff> {
    try {
      const response = await apiService.getRawResponse('/offline-payments/auto-staff');
      return response.data;
    } catch (error) {
      console.error('Error getting auto-selected staff:', error);
      throw error;
    }
  }

  // Smart student search by multiple criteria
  async searchStudents(query: string): Promise<Student[]> {
    try {
      const response = await apiService.getRawResponse(`/offline-payments/search-students?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  }

  // Get student details by ID
  async getStudentDetails(studentId: string): Promise<Student> {
    try {
      const response = await apiService.getRawResponse(`/offline-payments/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting student details:', error);
      throw error;
    }
  }

  // Create offline payment
  async createOfflinePayment(paymentData: Partial<OfflinePayment>): Promise<OfflinePayment> {
    try {
      const response = await apiService.post('/offline-payments', paymentData);
      return response as OfflinePayment;
    } catch (error) {
      console.error('Error creating offline payment:', error);
      throw error;
    }
  }

  // Generate receipt
  async generateReceipt(paymentId: string): Promise<PaymentReceipt> {
    try {
      const response = await apiService.getRawResponse(`/offline-payments/${paymentId}/receipt`);
      return response.data;
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }

  // Send automated notifications
  async sendPaymentNotification(paymentId: string, notificationType: 'sms' | 'email' | 'whatsapp'): Promise<void> {
    try {
      await apiService.post(`/offline-payments/${paymentId}/notify`, { type: notificationType });
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Verify payment with photo
  async verifyPayment(paymentId: string, photoFile: File): Promise<OfflinePayment> {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await apiService.upload(`/offline-payments/${paymentId}/verify`, formData);
      return response as OfflinePayment;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(filters?: {
    studentId?: string;
    staffId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): Promise<OfflinePayment[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await apiService.getRawResponse(`/offline-payments/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(period: 'today' | 'week' | 'month' | 'year'): Promise<{
    totalAmount: number;
    totalPayments: number;
    averageAmount: number;
    paymentMethods: { method: string; count: number; amount: number }[];
    staffPerformance: { staffName: string; count: number; amount: number }[];
  }> {
    try {
      const response = await apiService.getRawResponse(`/offline-payments/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      throw error;
    }
  }

  // Auto-generate receipt number
  generateReceiptNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `REC-${timestamp}-${random}`.toUpperCase();
  }

  // Format amount for display
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }
}

export const offlinePaymentService = new OfflinePaymentService();
