// ============================================
// GLOBAL TYPE DEFINITIONS
// ============================================

import { Request } from 'fastify';
import { Pool } from 'pg';

// ============================================
// REQUEST EXTENSIONS
// ============================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    tenantId?: string;
  };
  tenantId?: string;
  tenantDb?: Pool;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ErrorResponse;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface ErrorResponse {
  code: number;
  message: string;
  details?: any;
}

// ============================================
// TENANT TYPES
// ============================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  subscription_plan: 'free' | 'starter' | 'professional' | 'enterprise' | 'custom';
  subscription_status: 'active' | 'trial' | 'expired' | 'cancelled';
  subscription_start_date?: Date;
  subscription_end_date?: Date;
  max_libraries: number;
  max_students: number;
  max_staff: number;
  database_name: string;
  database_host?: string;
  features?: Record<string, any>;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  deleted_at?: Date | null;
}

// ============================================
// USER TYPES
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  department?: string;
  permissions: string[];
  is_active: boolean;
  last_login_at?: Date;
  last_login_ip?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  library_id?: string;
  permissions: Record<string, any>;
  is_active: boolean;
  last_login_at?: Date;
  last_login_ip?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// STUDENT TYPES
// ============================================

export interface Student {
  id: string;
  tenant_id: string;
  library_id?: string;
  student_code?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone: string;
  parent_phone?: string;
  date_of_birth?: Date;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  education_level?: string;
  course?: string;
  institution?: string;
  photo_url?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  id_proof_url?: string;
  enrollment_date: Date;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan?: string;
  subscription_start_date?: Date;
  subscription_end_date?: Date;
  seat_number?: string;
  preferred_time_slot?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface Payment {
  id: string;
  tenant_id: string;
  library_id?: string;
  student_id?: string;
  booking_id?: string;
  invoice_number?: string;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date?: Date;
  payment_gateway?: 'cashfree' | 'razorpay';
  gateway_order_id?: string;
  transaction_id?: string;
  payment_details?: Record<string, any>;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// CREDIT TYPES
// ============================================

export interface CreditWallet {
  id: string;
  tenant_id: string;
  sms_credits: number;
  whatsapp_credits: number;
  email_credits: number;
  sms_rate: number;
  whatsapp_rate: number;
  email_rate: number;
  total_spent: number;
  low_balance_threshold: number;
  auto_alert_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  billing_cycle: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
  start_date: Date;
  end_date: Date;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  amount: number;
  currency: string;
  auto_renew: boolean;
  cancellation_date?: Date;
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export interface AuditLog {
  id: string;
  tenant_id?: string;
  user_id?: string;
  user_type?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

