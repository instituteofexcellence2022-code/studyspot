// ============================================
// CASHFREE SERVICE
// Cashfree Payment Gateway Integration
// ============================================

import axios from 'axios';
import crypto from 'crypto';
import { CASHFREE_CONFIG } from '../../config/payment.config';
import { logger } from '../../utils/logger';

interface CashfreeOrderRequest {
  orderId: string;
  orderAmount: number;
  orderCurrency: 'INR';
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  orderMeta?: {
    returnUrl: string;
    notifyUrl?: string;
  };
}

interface CashfreeOrderResponse {
  orderId: string;
  orderStatus: string;
  paymentSessionId: string;
  cfOrderId: string;
}

class CashfreeService {
  private config = CASHFREE_CONFIG.active;

  /**
   * Generate signature for API requests
   */
  private generateSignature(timestamp: string, data: string): string {
    const signatureData = `${timestamp}${data}`;
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(signatureData)
      .digest('base64');
  }

  /**
   * Create payment order
   */
  async createOrder(orderData: CashfreeOrderRequest): Promise<CashfreeOrderResponse> {
    try {
      const url = `${this.config.apiUrl}/orders`;
      
      const response = await axios.post(url, orderData, {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': this.config.appId,
          'x-client-secret': this.config.secretKey,
          'Content-Type': 'application/json',
        },
      });

      logger.info('Cashfree order created', { orderId: orderData.orderId });
      return response.data;
    } catch (error: any) {
      logger.error('Cashfree create order error:', error.response?.data || error.message);
      throw new Error(`Cashfree order creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(orderId: string): Promise<any> {
    try {
      const url = `${this.config.apiUrl}/orders/${orderId}`;

      const response = await axios.get(url, {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': this.config.appId,
          'x-client-secret': this.config.secretKey,
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error('Cashfree verify payment error:', error);
      throw new Error('Payment verification failed');
    }
  }

  /**
   * Process refund
   */
  async processRefund(orderId: string, refundAmount: number, refundId: string): Promise<any> {
    try {
      const url = `${this.config.apiUrl}/orders/${orderId}/refunds`;

      const refundData = {
        refund_id: refundId,
        refund_amount: refundAmount,
        refund_note: 'Customer requested refund',
      };

      const response = await axios.post(url, refundData, {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': this.config.appId,
          'x-client-secret': this.config.secretKey,
          'Content-Type': 'application/json',
        },
      });

      logger.info('Cashfree refund processed', { refundId });
      return response.data;
    } catch (error: any) {
      logger.error('Cashfree refund error:', error);
      throw new Error('Refund processing failed');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(signature: string, timestamp: string, rawBody: string): boolean {
    const expectedSignature = this.generateSignature(timestamp, rawBody);
    return signature === expectedSignature;
  }
}

export default new CashfreeService();

