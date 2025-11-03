// ============================================
// INPUT VALIDATION UTILITIES
// Zod schemas for request validation
// ============================================

import { z } from 'zod';

// ============================================
// COMMON SCHEMAS
// ============================================

export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');
export const uuidSchema = z.string().uuid('Invalid UUID');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
  role: z.enum(['super_admin', 'admin', 'manager', 'support']).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================
// TENANT SCHEMAS
// ============================================

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
  email: emailSchema,
  phone: phoneSchema,
  subscription_plan: z.enum(['free', 'starter', 'professional', 'enterprise']).default('free'),
  max_libraries: z.number().int().positive().optional(),
  max_students: z.number().int().positive().optional(),
  max_staff: z.number().int().positive().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postal_code: z.string().optional(),
    })
    .optional(),
});

export const updateTenantSchema = createTenantSchema.partial();

export const suspendTenantSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

// ============================================
// USER SCHEMAS
// ============================================

export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2).max(100),
  role: z.enum(['super_admin', 'admin', 'manager', 'support']),
  department: z.string().optional(),
  permissions: z.record(z.boolean()).optional(),
});

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['super_admin', 'admin', 'manager', 'support']).optional(),
  department: z.string().optional(),
  permissions: z.record(z.boolean()).optional(),
  is_active: z.boolean().optional(),
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
});

// ============================================
// STUDENT SCHEMAS
// ============================================

export const createStudentSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema,
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: phoneSchema.optional(),
  library_id: uuidSchema.optional(),
  subscription_plan: z.string().optional(),
  registration_fee: z.number().optional(),
  id_proof_type: z.string().optional(),
  id_proof_number: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const bulkImportSchema = z.object({
  students: z.array(createStudentSchema).min(1).max(1000),
});

// ============================================
// LIBRARY SCHEMAS
// ============================================

export const createLibrarySchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(10),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
  phone: phoneSchema,
  email: emailSchema,
  capacity: z.number().int().positive(),
  facilities: z.array(z.string()).optional(),
  operating_hours: z
    .object({
      open: z.string(),
      close: z.string(),
    })
    .optional(),
});

export const updateLibrarySchema = createLibrarySchema.partial();

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['INR', 'USD']).default('INR'),
  student_id: uuidSchema.optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(10),
});

// ============================================
// CREDIT SCHEMAS
// ============================================

export const purchaseCreditsSchema = z.object({
  vendor_id: uuidSchema,
  sms_credits: z.number().int().nonnegative().optional(),
  whatsapp_credits: z.number().int().nonnegative().optional(),
  email_credits: z.number().int().nonnegative().optional(),
  amount_paid: z.number().positive(),
  payment_method: z.enum(['card', 'upi', 'netbanking', 'wallet']),
});

export const allocateCreditsSchema = z.object({
  tenant_id: uuidSchema,
  sms_credits: z.number().int().nonnegative().optional(),
  whatsapp_credits: z.number().int().nonnegative().optional(),
  email_credits: z.number().int().nonnegative().optional(),
  price_per_credit: z.number().positive(),
  notes: z.string().optional(),
});

// ============================================
// SUBSCRIPTION SCHEMAS
// ============================================

export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50),
  description: z.string().optional(),
  type: z.enum(['free', 'starter', 'professional', 'enterprise']),
  price_monthly: z.number().nonnegative(),
  price_quarterly: z.number().nonnegative().optional(),
  price_half_yearly: z.number().nonnegative().optional(),
  price_annual: z.number().nonnegative().optional(),
  max_libraries: z.number().int().positive(),
  max_students: z.number().int().positive(),
  max_staff: z.number().int().positive(),
  features: z.array(z.string()).optional(),
  permissions: z.record(z.boolean()).optional(),
  is_popular: z.boolean().optional(),
});

export const subscribeSchema = z.object({
  plan_id: uuidSchema,
  billing_cycle: z.enum(['monthly', 'quarterly', 'half_yearly', 'annual']),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().min(10),
});

// ============================================
// MESSAGING SCHEMAS
// ============================================

export const sendSMSSchema = z.object({
  phone: phoneSchema,
  templateType: z.enum([
    'otp',
    'welcome',
    'payment_success',
    'payment_reminder',
    'booking_confirmed',
    'subscription_expiry',
  ]),
  variables: z.array(z.string()).optional(),
});

export const sendOTPSchema = z.object({
  phone: phoneSchema,
});

export const verifyOTPSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

// ============================================
// VALIDATION HELPER
// ============================================

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Fastify middleware for validation
 */
export function validateRequest(schema: z.ZodSchema) {
  return async (request: any, reply: any) => {
    const result = validate(schema, request.body);
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: result.errors?.errors,
        },
      });
    }
    request.validatedBody = result.data;
  };
}

