/**
 * StudySpot Mobile App - Payment Service
 * Service for handling payment-related API calls and Razorpay integration
 */

import axios, {AxiosResponse} from 'axios';
import {API_CONFIG} from '@constants/index';
import {ApiResponse, PaymentRequest, PaymentResponse, PaymentStatus} from '../types/index';

class PaymentService {
  private baseURL = API_CONFIG.BASE_URL;
  private timeout = API_CONFIG.TIMEOUT;

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        timeout: this.timeout,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  }

  /**
   * Create payment for library fee (one-time or recurring)
   * Supports both one-time payments and monthly subscriptions for library access
   */
  async createLibraryFeePayment(
    paymentData: {
      libraryId: string;
      amount: number;
      paymentType: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
      seatId?: string;
      description?: string;
    },
    headers?: Record<string, string>
  ): Promise<ApiResponse<PaymentResponse>> {
    const requestData: PaymentRequest = {
      bookingId: `lib_fee_${Date.now()}`, // Generate unique booking ID for fee payment
      amount: paymentData.amount,
      currency: 'INR',
      paymentMethod: 'online',
      paymentGateway: 'razorpay',
      description: paymentData.description || `Library fee payment - ${paymentData.paymentType}`,
      metadata: {
        libraryId: paymentData.libraryId,
        libraryName: '', // Will be filled by backend
        seatId: paymentData.seatId || '',
        seatNumber: '',
        bookingType: paymentData.paymentType === 'one_time' ? 'hourly' : 'monthly',
        recurring: paymentData.paymentType !== 'one_time',
        recurringType: paymentData.paymentType === 'monthly' ? 'monthly' :
                      paymentData.paymentType === 'quarterly' ? 'quarterly' : 'yearly',
      },
    };

    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.PAYMENTS.CREATE_ORDER, requestData, headers);
  }

  /**
   * Get library fee plans for a specific library
   */
  async getLibraryFeePlans(
    libraryId: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<{
    oneTime: { amount: number; description: string };
    monthly: { amount: number; description: string; savings?: number };
    quarterly: { amount: number; description: string; savings?: number };
    yearly: { amount: number; description: string; savings?: number };
  }>> {
    return this.makeRequest('GET', `${API_CONFIG.ENDPOINTS.PAYMENTS.LIBRARY_FEE_PLANS}/${libraryId}`, undefined, headers);
  }

  async verifyPayment(
    paymentId: string,
    signature: string,
    orderId: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<{status: PaymentStatus; message: string}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.PAYMENTS.VERIFY, {
      paymentId,
      signature,
      orderId,
    }, headers);
  }

  async getPaymentHistory(
    page: number = 1,
    limit: number = 20,
    headers?: Record<string, string>
  ): Promise<ApiResponse<{payments: any[]; pagination: any}>> {
    return this.makeRequest('GET', `${API_CONFIG.ENDPOINTS.PAYMENTS.HISTORY}?page=${page}&limit=${limit}`, undefined, headers);
  }

  async getPaymentDetails(
    paymentId: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<any>> {
    return this.makeRequest('GET', API_CONFIG.ENDPOINTS.PAYMENTS.DETAILS.replace(':id', paymentId), undefined, headers);
  }

  async requestRefund(
    paymentId: string,
    reason: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<{message: string; refundId: string}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.PAYMENTS.REFUND, {
      paymentId,
      reason,
    }, headers);
  }

  // Razorpay integration methods
  async getRazorpayConfig(headers?: Record<string, string>): Promise<ApiResponse<{
    keyId: string;
    keySecret: string;
    currency: string;
  }>> {
    return this.makeRequest('GET', API_CONFIG.ENDPOINTS.PAYMENTS.CONFIG, undefined, headers);
  }

  async capturePayment(
    paymentId: string,
    amount: number,
    headers?: Record<string, string>
  ): Promise<ApiResponse<{status: PaymentStatus; message: string}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.PAYMENTS.CAPTURE, {
      paymentId,
      amount,
    }, headers);
  }
}

export const paymentService = new PaymentService();
export default paymentService;


