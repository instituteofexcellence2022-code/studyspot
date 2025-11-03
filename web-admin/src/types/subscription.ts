/**
 * Subscription Types
 * Complete TypeScript definitions for subscription management
 * @author Agent 1 - Senior Full Stack Developer
 */

export type BillingCycle = 'monthly' | 'yearly';

export type SubscriptionStatus = 
  | 'active'
  | 'inactive'
  | 'past_due'
  | 'canceled'
  | 'cancelled'
  | 'trialing'
  | 'unpaid';

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly?: number;
  price_yearly?: number;
  features: string[];
  limits: {
    max_libraries?: number;
    max_users?: number;
    max_bookings_per_month?: number;
    max_seats?: number;
    max_storage_gb?: number;
    ai_features?: boolean;
    analytics?: boolean;
    api_access?: boolean;
    priority_support?: boolean;
    custom_branding?: boolean;
    [key: string]: any;
  };
  is_active: boolean;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end?: boolean;
  cancelled_at?: string | null;
  trial_end?: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data from subscription_plans
  plan_name?: string;
  plan_display_name?: string;
  features?: string[];
  limits?: Record<string, any>;
  
  // Usage data
  usage?: SubscriptionUsage;
}

export interface SubscriptionUsage {
  libraries?: number;
  users?: number;
  bookings?: number;
  seats?: number;
  storage_gb?: number;
  api_calls?: number;
  [key: string]: number | undefined;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  subscription_id: string;
  stripe_invoice_id: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  payment_intent?: string;
  period_start: string;
  period_end: string;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  billingCycle: BillingCycle;
  paymentMethodId?: string;
}

export interface CreateSubscriptionResponse {
  subscription: Subscription;
  clientSecret?: string;
  stripeSubscriptionId: string;
}

export interface UpgradeSubscriptionRequest {
  newPlanId: string;
}

export interface DowngradeSubscriptionRequest {
  newPlanId: string;
}

export interface CancelSubscriptionRequest {
  immediate?: boolean;
}

export interface PortalSessionResponse {
  url: string;
}

// Redux State
export interface SubscriptionState {
  // Plans
  plans: SubscriptionPlan[];
  plansLoading: boolean;
  plansError: string | null;
  
  // Current subscription
  currentSubscription: Subscription | null;
  subscriptionLoading: boolean;
  subscriptionError: string | null;
  
  // Invoices
  invoices: Invoice[];
  invoicesLoading: boolean;
  invoicesError: string | null;
  
  // UI State
  selectedPlan: SubscriptionPlan | null;
  selectedBillingCycle: BillingCycle;
  billingInterval: BillingCycle;
  checkoutLoading: boolean;
  checkoutError: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PlansApiResponse extends ApiResponse<SubscriptionPlan[]> {}
export interface SubscriptionApiResponse extends ApiResponse<Subscription> {}
export interface InvoicesApiResponse extends ApiResponse<Invoice[]> {}
export interface PortalApiResponse extends ApiResponse<PortalSessionResponse> {}


