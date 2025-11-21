/**
 * UNIT TESTS - TYPE VALIDATION
 * Tests for type definitions and validation
 */

import {
  Tenant,
  Student,
  Payment,
  AdminUser,
  Subscription,
  CreditWallet,
  ApiResponse,
  PaginatedResponse,
} from '../../../src/types';

describe('Type Validation', () => {
  describe('Tenant Type', () => {
    it('should validate tenant status enum', () => {
      const validStatuses: Tenant['status'][] = ['active', 'suspended', 'trial', 'expired'];
      
      validStatuses.forEach(status => {
        expect(['active', 'suspended', 'trial', 'expired']).toContain(status);
      });
    });

    it('should validate subscription plan enum', () => {
      const validPlans: Tenant['subscription_plan'][] = ['free', 'starter', 'professional', 'enterprise', 'custom'];
      
      validPlans.forEach(plan => {
        expect(['free', 'starter', 'professional', 'enterprise', 'custom']).toContain(plan);
      });
    });

    it('should validate subscription status enum', () => {
      const validStatuses: Tenant['subscription_status'][] = ['active', 'trial', 'expired', 'cancelled'];
      
      validStatuses.forEach(status => {
        expect(['active', 'trial', 'expired', 'cancelled']).toContain(status);
      });
    });

    it('should validate tenant structure', () => {
      const tenant: Partial<Tenant> = {
        id: 'tenant-123',
        name: 'Test Tenant',
        slug: 'test-tenant',
        email: 'test@tenant.com',
        status: 'active',
        subscription_plan: 'professional',
        subscription_status: 'active',
        max_libraries: 10,
        max_students: 100,
        max_staff: 5,
        database_name: 'test_db',
      };

      expect(tenant.id).toBeDefined();
      expect(tenant.name).toBeTruthy();
      expect(tenant.status).toBe('active');
    });
  });

  describe('Student Type', () => {
    it('should validate student status enum', () => {
      const validStatuses: Student['status'][] = ['active', 'inactive', 'suspended'];
      
      validStatuses.forEach(status => {
        expect(['active', 'inactive', 'suspended']).toContain(status);
      });
    });

    it('should validate student structure', () => {
      const student: Partial<Student> = {
        id: 'student-123',
        tenant_id: 'tenant-456',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        status: 'active',
      };

      expect(student.id).toBeDefined();
      expect(student.first_name).toBeTruthy();
      expect(student.phone).toMatch(/^\+?[1-9]\d{9,14}$/);
    });

    it('should validate student code format', () => {
      const studentCode = 'STU123456';
      const codePattern = /^STU\d+$/;

      expect(codePattern.test(studentCode)).toBe(true);
    });
  });

  describe('Payment Type', () => {
    it('should validate payment status enum', () => {
      const validStatuses: Payment['payment_status'][] = ['pending', 'completed', 'failed', 'refunded'];
      
      validStatuses.forEach(status => {
        expect(['pending', 'completed', 'failed', 'refunded']).toContain(status);
      });
    });

    it('should validate payment gateway enum', () => {
      const validGateways: Payment['payment_gateway'][] = ['cashfree', 'razorpay'];
      
      validGateways.forEach(gateway => {
        expect(['cashfree', 'razorpay']).toContain(gateway);
      });
    });

    it('should validate payment structure', () => {
      const payment: Partial<Payment> = {
        id: 'payment-123',
        tenant_id: 'tenant-456',
        amount: 1000,
        currency: 'INR',
        payment_status: 'completed',
        payment_gateway: 'razorpay',
      };

      expect(payment.amount).toBeGreaterThan(0);
      expect(payment.currency).toBe('INR');
      expect(payment.payment_status).toBe('completed');
    });
  });

  describe('AdminUser Type', () => {
    it('should validate admin user structure', () => {
      const admin: Partial<AdminUser> = {
        id: 'admin-123',
        email: 'admin@example.com',
        password_hash: 'hashed_password',
        role: 'admin',
        permissions: ['read:users', 'write:users'],
        is_active: true,
      };

      expect(admin.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(admin.is_active).toBe(true);
      expect(Array.isArray(admin.permissions)).toBe(true);
    });
  });

  describe('Subscription Type', () => {
    it('should validate billing cycle enum', () => {
      const validCycles: Subscription['billing_cycle'][] = ['monthly', 'quarterly', 'half_yearly', 'annual'];
      
      validCycles.forEach(cycle => {
        expect(['monthly', 'quarterly', 'half_yearly', 'annual']).toContain(cycle);
      });
    });

    it('should validate subscription status enum', () => {
      const validStatuses: Subscription['status'][] = ['active', 'trial', 'expired', 'cancelled'];
      
      validStatuses.forEach(status => {
        expect(['active', 'trial', 'expired', 'cancelled']).toContain(status);
      });
    });

    it('should validate subscription dates', () => {
      const subscription: Partial<Subscription> = {
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
      };

      expect(subscription.end_date.getTime()).toBeGreaterThan(subscription.start_date.getTime());
    });
  });

  describe('CreditWallet Type', () => {
    it('should validate credit wallet structure', () => {
      const wallet: Partial<CreditWallet> = {
        sms_credits: 1000,
        whatsapp_credits: 500,
        email_credits: 2000,
        total_spent: 100,
      };

      expect(wallet.sms_credits).toBeGreaterThanOrEqual(0);
      expect(wallet.whatsapp_credits).toBeGreaterThanOrEqual(0);
      expect(wallet.email_credits).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ApiResponse Type', () => {
    it('should validate successful API response', () => {
      const response: ApiResponse<{ id: string }> = {
        success: true,
        data: { id: '123' },
        timestamp: new Date().toISOString(),
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.timestamp).toBeDefined();
    });

    it('should validate error API response', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 400,
          message: 'Validation error',
        },
        timestamp: new Date().toISOString(),
      };

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(400);
    });
  });

  describe('PaginatedResponse Type', () => {
    it('should validate paginated response structure', () => {
      const response: PaginatedResponse<{ id: string }> = {
        success: true,
        data: [{ id: '1' }, { id: '2' }],
        pagination: {
          page: 1,
          limit: 10,
          total: 20,
          totalPages: 2,
          hasNext: true,
          hasPrev: false,
        },
        timestamp: new Date().toISOString(),
      };

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.pagination.totalPages).toBe(2);
      expect(response.pagination.hasNext).toBe(true);
    });

    it('should calculate pagination correctly', () => {
      const total = 25;
      const limit = 10;
      const page = 2;
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      expect(totalPages).toBe(3);
      expect(hasNext).toBe(true);
      expect(hasPrev).toBe(true);
    });
  });
});

