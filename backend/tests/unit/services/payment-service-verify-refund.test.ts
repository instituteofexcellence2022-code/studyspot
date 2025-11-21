/**
 * UNIT TESTS - PAYMENT SERVICE VERIFY & REFUND
 * Tests for payment verification and refund functions
 */

import paymentService from '../../../src/services/payment-service/payment.service';
import cashfreeService from '../../../src/services/payment-service/cashfree.service';
import razorpayService from '../../../src/services/payment-service/razorpay.service';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/services/payment-service/cashfree.service');
jest.mock('../../../src/services/payment-service/razorpay.service');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedCashfreeService = cashfreeService as jest.Mocked<typeof cashfreeService>;
const mockedRazorpayService = razorpayService as jest.Mocked<typeof razorpayService>;

describe('Payment Service - Verify & Refund', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyPayment', () => {
    it('should verify Cashfree payment', async () => {
      const orderId = 'ORD_123';
      const gateway = 'cashfree';

      mockedCashfreeService.verifyPayment.mockResolvedValue({
        orderId,
        orderStatus: 'PAID',
        paymentStatus: 'SUCCESS',
      });

      const result = await paymentService.verifyPayment(gateway, orderId);

      expect(mockedCashfreeService.verifyPayment).toHaveBeenCalledWith(orderId);
      expect(result).toBeDefined();
    });

    it('should verify Razorpay payment', async () => {
      const orderId = 'ORD_123';
      const paymentId = 'pay_123';
      const signature = 'signature_123';
      const gateway = 'razorpay';

      mockedRazorpayService.verifyPaymentSignature.mockReturnValue(true);
      mockedRazorpayService.fetchPayment.mockResolvedValue({
        id: paymentId,
        status: 'captured',
        amount: 100000,
      });

      const result = await paymentService.verifyPayment(gateway, orderId, paymentId, signature);

      expect(mockedRazorpayService.verifyPaymentSignature).toHaveBeenCalledWith(
        orderId,
        paymentId,
        signature
      );
      expect(result).toBeDefined();
    });

    it('should reject Razorpay payment with missing paymentId or signature', async () => {
      const orderId = 'ORD_123';
      const gateway = 'razorpay';

      await expect(
        paymentService.verifyPayment(gateway, orderId)
      ).rejects.toThrow('Payment ID and signature required for Razorpay');
    });

    it('should reject Razorpay payment with invalid signature', async () => {
      const orderId = 'ORD_123';
      const paymentId = 'pay_123';
      const signature = 'invalid_signature';
      const gateway = 'razorpay';

      mockedRazorpayService.verifyPaymentSignature.mockReturnValue(false);

      await expect(
        paymentService.verifyPayment(gateway, orderId, paymentId, signature)
      ).rejects.toThrow('Invalid payment signature');
    });

    it('should handle Cashfree verification errors', async () => {
      const orderId = 'ORD_123';
      const gateway = 'cashfree';

      mockedCashfreeService.verifyPayment.mockRejectedValue(new Error('Verification failed'));

      await expect(paymentService.verifyPayment(gateway, orderId)).rejects.toThrow();
    });
  });

  describe('processRefund', () => {
    it('should process Cashfree refund', async () => {
      const orderId = 'ORD_123';
      const refundAmount = 50000; // ₹500
      const refundId = 'REF_123';
      const gateway = 'cashfree';

      mockedCashfreeService.processRefund.mockResolvedValue({
        refundId,
        refundAmount: refundAmount / 100, // Converted to rupees
        status: 'SUCCESS',
      });

      const result = await paymentService.processRefund(gateway, orderId, refundAmount, refundId);

      expect(mockedCashfreeService.processRefund).toHaveBeenCalledWith(
        orderId,
        refundAmount / 100, // Converted to rupees
        refundId
      );
      expect(result).toBeDefined();
    });

    it('should process Razorpay refund', async () => {
      const orderId = 'ORD_123';
      const paymentId = 'pay_123';
      const refundAmount = 50000; // ₹500
      const gateway = 'razorpay';

      mockedRazorpayService.processRefund.mockResolvedValue({
        id: 'refund_123',
        amount: refundAmount,
        status: 'processed',
      });

      // For Razorpay, orderId is used as paymentId
      const result = await paymentService.processRefund(gateway, orderId, refundAmount, 'refund_123');

      expect(mockedRazorpayService.processRefund).toHaveBeenCalledWith(orderId, refundAmount);
      expect(result).toBeDefined();
    });

    it('should process full Razorpay refund when amount not specified', async () => {
      const orderId = 'ORD_123';
      const paymentId = 'pay_123';
      const gateway = 'razorpay';

      mockedRazorpayService.processRefund.mockResolvedValue({
        id: 'refund_123',
        amount: 100000,
        status: 'processed',
      });

      const result = await paymentService.processRefund(gateway, orderId, 0, 'refund_123');

      expect(mockedRazorpayService.processRefund).toHaveBeenCalledWith(orderId, 0);
      expect(result).toBeDefined();
    });

    it('should handle refund errors', async () => {
      const orderId = 'ORD_123';
      const refundAmount = 50000;
      const gateway = 'cashfree';

      mockedCashfreeService.processRefund.mockRejectedValue(new Error('Refund failed'));

      await expect(paymentService.processRefund(gateway, orderId, refundAmount, 'refund_123')).rejects.toThrow();
    });
  });
});

