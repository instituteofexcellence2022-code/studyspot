/**
 * StudySpot Mobile App - Payment Service
 * Service for handling payment-related API calls and Razorpay integration
 */

import axios, {AxiosResponse} from 'axios';
import {API_CONFIG} from '@constants/index';
import {ApiResponse, PaymentRequest, PaymentResponse, PaymentStatus} from '@types/index';

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

  async createPaymentOrder(
    paymentData: PaymentRequest,
    headers?: Record<string, string>
  ): Promise<ApiResponse<PaymentResponse>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.PAYMENTS.CREATE_ORDER, paymentData, headers);
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


