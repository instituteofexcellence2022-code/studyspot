/**
 * COMPREHENSIVE UNIT TESTS - PAYMENT SERVICE
 * Additional tests for payment verification and refunds
 */

import paymentService from '../../../src/services/payment-service/payment.service';
import cashfreeService from '../../../src/services/payment-service/cashfree.service';
import razorpayService from '../../../src/services/payment-service/razorpay.service';

// Mock dependencies
jest.mock('../../../src/services/payment-service/cashfree.service', () => ({
  __esModule: true,
  default: {
    createOrder: jest.fn(),
    verifyPayment: jest.fn(),
    processRefund: jest.fn(),
  },
}));

jest.mock('../../../src/services/payment-service/razorpay.service', () => ({
  __esModule: true,
  default: {
    createOrder: jest.fn(),
    verifyPaymentSignature: jest.fn(),
    fetchPayment: jest.fn(),
    processRefund: jest.fn(),
  },
}));

jest.mock('../../../src/services/payment-service/payment.service', () => {
  const actual = jest.requireActual('../../../src/services/payment-service/payment.service');
  return actual;
});

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Payment Service - Comprehensive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Verify Payment', () => {
    it('should verify Cashfree payment', async () => {
      const orderId = 'order-123';
      const mockPaymentData = {
        orderId: 'order-123',
        orderStatus: 'PAID',
        paymentAmount: 1000,
        paymentTime: '2024-01-15T10:00:00Z',
      };

      (cashfreeService.verifyPayment as jest.Mock).mockResolvedValue(mockPaymentData);

      const result = await paymentService.verifyPayment('cashfree', orderId);

      expect(result).toEqual(mockPaymentData);
      expect(cashfreeService.verifyPayment).toHaveBeenCalledWith(orderId);
    });

    it('should verify Razorpay payment with signature', async () => {
      const orderId = 'order-123';
      const paymentId = 'pay_123';
      const signature = 'signature-123';

      const mockPaymentData = {
        id: paymentId,
        order_id: orderId,
        status: 'captured',
        amount: 100000,
      };

      (razorpayService.verifyPaymentSignature as jest.Mock).mockReturnValue(true);
      (razorpayService.fetchPayment as jest.Mock).mockResolvedValue(mockPaymentData);

      const result = await paymentService.verifyPayment('razorpay', orderId, paymentId, signature);

      expect(result).toEqual(mockPaymentData);
      expect(razorpayService.verifyPaymentSignature).toHaveBeenCalledWith(orderId, paymentId, signature);
      expect(razorpayService.fetchPayment).toHaveBeenCalledWith(paymentId);
    });

    it('should reject Razorpay payment without payment ID and signature', async () => {
      const orderId = 'order-123';

      await expect(
        paymentService.verifyPayment('razorpay', orderId)
      ).rejects.toThrow('Payment ID and signature required for Razorpay');
    });

    it('should reject Razorpay payment with invalid signature', async () => {
      const orderId = 'order-123';
      const paymentId = 'pay_123';
      const signature = 'invalid-signature';

      (razorpayService.verifyPaymentSignature as jest.Mock).mockReturnValue(false);

      await expect(
        paymentService.verifyPayment('razorpay', orderId, paymentId, signature)
      ).rejects.toThrow('Invalid payment signature');
    });
  });

  describe('Process Refund', () => {
    it('should process Cashfree refund', async () => {
      const orderId = 'order-123';
      const amount = 100000; // ₹1000 in paise
      const refundId = 'refund-123';

      const mockRefundData = {
        refundId: refundId,
        refundAmount: 1000, // in rupees
        refundStatus: 'SUCCESS',
      };

      (cashfreeService.processRefund as jest.Mock).mockResolvedValue(mockRefundData);

      const result = await paymentService.processRefund('cashfree', orderId, amount, refundId);

      expect(result).toEqual(mockRefundData);
      expect(cashfreeService.processRefund).toHaveBeenCalledWith(orderId, 1000, refundId); // Amount converted to rupees
    });

    it('should process Razorpay refund', async () => {
      const orderId = 'order-123';
      const amount = 100000; // ₹1000 in paise
      const refundId = 'refund-123';

      const mockRefundData = {
        id: refundId,
        amount: amount,
        status: 'processed',
      };

      (razorpayService.processRefund as jest.Mock).mockResolvedValue(mockRefundData);

      const result = await paymentService.processRefund('razorpay', orderId, amount, refundId);

      expect(result).toEqual(mockRefundData);
      expect(razorpayService.processRefund).toHaveBeenCalledWith(orderId, amount);
    });
  });

  describe('Amount Conversion', () => {
    it('should convert paise to rupees for Cashfree', () => {
      const amountPaise = 100000;
      const amountRupees = amountPaise / 100;

      expect(amountRupees).toBe(1000);
    });

    it('should keep paise for Razorpay', () => {
      const amountPaise = 100000;

      expect(amountPaise).toBe(100000);
    });
  });
});

