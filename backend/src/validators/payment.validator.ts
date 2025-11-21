// ============================================
// PAYMENT SERVICE VALIDATION SCHEMAS
// ============================================

import { z } from 'zod';

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Create Payment Order Schema
export const createPaymentOrderSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.enum(['INR']).default('INR').optional(),
  customer: z.object({
    id: z.string().min(1, 'Customer ID is required'),
    name: z.string().min(1, 'Customer name is required').max(200),
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  }),
  returnUrl: z.string().url('Invalid return URL'),
  gateway: z.enum(['cashfree', 'razorpay']).optional(),
  studentId: uuidSchema.optional().nullable(),
  libraryId: uuidSchema.optional().nullable(),
});

// Verify Payment Schema
export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().min(1, 'Signature is required'),
  gateway: z.enum(['cashfree', 'razorpay']),
});

// Process Refund Schema
export const processRefundSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive').optional(),
  reason: z.string().max(500).optional(),
});

// Payment Params Schema
export const paymentParamsSchema = z.object({
  id: z.string().min(1, 'Payment ID is required'),
});

