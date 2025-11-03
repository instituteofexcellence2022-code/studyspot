// ============================================
// UNIFIED PAYMENT SERVICE
// Smart routing between Cashfree and Razorpay
// ============================================

import cashfreeService from './cashfree.service';
import razorpayService from './razorpay.service';
import { PAYMENT_GATEWAY_LOGIC } from '../../config/payment.config';
import { logger } from '../../utils/logger';

type PaymentGateway = 'cashfree' | 'razorpay';

interface PaymentRequest {
  amount: number; // in paise
  currency: 'INR';
  orderId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  returnUrl: string;
  gateway?: PaymentGateway;
}

interface PaymentResponse {
  success: boolean;
  gateway: PaymentGateway;
  orderId: string;
  gatewayOrderId: string;
  paymentSessionId?: string;
  data: any;
}

class PaymentService {
  /**
   * Select best payment gateway based on transaction amount
   * Breakeven point: ₹600
   * - Cashfree: 1.5% + ₹3
   * - Razorpay: 2% + ₹0
   * 
   * For ₹600: Cashfree = ₹12, Razorpay = ₹12
   * For < ₹600: Use Razorpay (no fixed fee)
   * For > ₹600: Use Cashfree (lower percentage)
   */
  private selectGateway(amount: number, preferredGateway?: PaymentGateway): PaymentGateway {
    // If preferred gateway specified, use it
    if (preferredGateway) {
      logger.info('Using preferred gateway', { gateway: preferredGateway });
      return preferredGateway;
    }

    // Smart selection based on cost
    if (amount <= PAYMENT_GATEWAY_LOGIC.BREAKEVEN_AMOUNT) {
      logger.info('Selected Razorpay (amount <= ₹600)', { amount: amount / 100 });
      return 'razorpay';
    } else {
      logger.info('Selected Cashfree (amount > ₹600)', { amount: amount / 100 });
      return 'cashfree';
    }
  }

  /**
   * Create payment order with automatic gateway selection
   */
  async createOrder(request: PaymentRequest): Promise<PaymentResponse> {
    const gateway = this.selectGateway(request.amount, request.gateway);

    try {
      if (gateway === 'cashfree') {
        return await this.createCashfreeOrder(request);
      } else {
        return await this.createRazorpayOrder(request);
      }
    } catch (error: any) {
      // Failover: Try alternate gateway
      logger.warn(`${gateway} failed, attempting failover...`, { error: error.message });

      const alternateGateway = gateway === 'cashfree' ? 'razorpay' : 'cashfree';

      try {
        if (alternateGateway === 'cashfree') {
          return await this.createCashfreeOrder(request);
        } else {
          return await this.createRazorpayOrder(request);
        }
      } catch (failoverError: any) {
        logger.error('Failover also failed', { error: failoverError.message });
        throw new Error('Both payment gateways failed');
      }
    }
  }

  /**
   * Create Cashfree order
   */
  private async createCashfreeOrder(request: PaymentRequest): Promise<PaymentResponse> {
    const orderData = {
      orderId: request.orderId,
      orderAmount: request.amount / 100, // Convert paise to rupees
      orderCurrency: request.currency,
      customerDetails: {
        customerId: request.customer.id,
        customerName: request.customer.name,
        customerEmail: request.customer.email,
        customerPhone: request.customer.phone,
      },
      orderMeta: {
        returnUrl: request.returnUrl,
      },
    };

    const response = await cashfreeService.createOrder(orderData);

    return {
      success: true,
      gateway: 'cashfree',
      orderId: request.orderId,
      gatewayOrderId: response.cfOrderId,
      paymentSessionId: response.paymentSessionId,
      data: response,
    };
  }

  /**
   * Create Razorpay order
   */
  private async createRazorpayOrder(request: PaymentRequest): Promise<PaymentResponse> {
    const orderData = {
      amount: request.amount, // Amount in paise
      currency: request.currency,
      receipt: request.orderId,
      notes: {
        customerId: request.customer.id,
        customerName: request.customer.name,
      },
    };

    const response = await razorpayService.createOrder(orderData);

    return {
      success: true,
      gateway: 'razorpay',
      orderId: request.orderId,
      gatewayOrderId: response.id,
      data: response,
    };
  }

  /**
   * Verify payment
   */
  async verifyPayment(
    gateway: PaymentGateway,
    orderId: string,
    paymentId?: string,
    signature?: string
  ): Promise<any> {
    if (gateway === 'cashfree') {
      return await cashfreeService.verifyPayment(orderId);
    } else {
      if (!paymentId || !signature) {
        throw new Error('Payment ID and signature required for Razorpay');
      }
      const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);
      if (!isValid) {
        throw new Error('Invalid payment signature');
      }
      return await razorpayService.fetchPayment(paymentId);
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    gateway: PaymentGateway,
    orderId: string,
    amount: number,
    refundId: string
  ): Promise<any> {
    if (gateway === 'cashfree') {
      return await cashfreeService.processRefund(orderId, amount / 100, refundId);
    } else {
      return await razorpayService.processRefund(orderId, amount);
    }
  }
}

export default new PaymentService();

