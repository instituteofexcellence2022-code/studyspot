-- ============================================
-- Migration 003: Subscription System
-- Created by: Agent 1 (Backend Developer)
-- Date: October 21, 2025
-- Description: Complete subscription system with Stripe integration
-- ============================================

-- ============================================
-- 1. SUBSCRIPTION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE, -- free, starter, pro, enterprise
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    stripe_price_id_monthly VARCHAR(255), -- Stripe price ID for monthly
    stripe_price_id_yearly VARCHAR(255), -- Stripe price ID for yearly
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    limits JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = true;

-- ============================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing, unpaid
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_active_subscription UNIQUE(tenant_id, status) 
        WHERE status IN ('active', 'trialing')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- ============================================
-- 3. SUBSCRIPTION USAGE TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    metric VARCHAR(50) NOT NULL, -- libraries, users, bookings, sms_sent, whatsapp_sent, storage_gb
    value INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one record per metric per period
    CONSTRAINT unique_usage_metric_period UNIQUE(subscription_id, metric, period_start, period_end)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription ON subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON subscription_usage(period_start, period_end);

-- ============================================
-- 4. INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, open, paid, void, uncollectible
    invoice_pdf TEXT, -- URL to PDF
    hosted_invoice_url TEXT, -- Stripe hosted invoice URL
    payment_intent VARCHAR(255), -- Stripe payment intent ID
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe ON invoices(stripe_invoice_id);

-- ============================================
-- 5. UPDATE TENANTS TABLE
-- ============================================
-- Add stripe_customer_id if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE tenants ADD COLUMN stripe_customer_id VARCHAR(255) UNIQUE;
    END IF;
END $$;

-- ============================================
-- 6. SEED DEFAULT SUBSCRIPTION PLANS
-- ============================================
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits)
VALUES 
    (
        'free',
        'Free',
        'Perfect for getting started with basic features',
        0.00,
        0.00,
        '["1 Library", "Up to 100 users", "500 SMS credits/month", "Basic analytics", "Email support"]'::jsonb,
        '{"max_libraries": 1, "max_users": 100, "max_bookings_per_month": 500, "max_seats": 50, "sms_credits": 500, "ai_features": false, "analytics": false, "api_access": false}'::jsonb
    ),
    (
        'starter',
        'Starter',
        'Great for small libraries and study centers',
        29.99,
        299.90,
        '["3 Libraries", "Up to 500 users", "2,000 SMS credits/month", "Standard analytics", "Priority email support", "Custom branding"]'::jsonb,
        '{"max_libraries": 3, "max_users": 500, "max_bookings_per_month": 2000, "max_seats": 200, "sms_credits": 2000, "ai_features": false, "analytics": true, "api_access": false}'::jsonb
    ),
    (
        'pro',
        'Pro',
        'For growing businesses with advanced needs',
        99.99,
        999.90,
        '["10 Libraries", "Up to 2,000 users", "10,000 SMS credits/month", "Advanced analytics", "AI-powered features", "API access", "Phone & email support", "Custom domain"]'::jsonb,
        '{"max_libraries": 10, "max_users": 2000, "max_bookings_per_month": 10000, "max_seats": 1000, "sms_credits": 10000, "ai_features": true, "analytics": true, "api_access": true}'::jsonb
    ),
    (
        'enterprise',
        'Enterprise',
        'Custom solutions for large organizations',
        0.00,
        0.00,
        '["Unlimited libraries", "Unlimited users", "Custom SMS credits", "Enterprise analytics", "AI-powered features", "Full API access", "Dedicated account manager", "Custom integrations", "SLA guarantee"]'::jsonb,
        '{"max_libraries": -1, "max_users": -1, "max_bookings_per_month": -1, "max_seats": -1, "sms_credits": -1, "ai_features": true, "analytics": true, "api_access": true, "priority_support": true, "custom_branding": true}'::jsonb
    )
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    updated_at = NOW();

-- ============================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_usage_updated_at ON subscription_usage;
CREATE TRIGGER update_subscription_usage_updated_at
    BEFORE UPDATE ON subscription_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. GRANT PERMISSIONS (if using specific database user)
-- ============================================
-- GRANT ALL PRIVILEGES ON subscription_plans TO studyspot_user;
-- GRANT ALL PRIVILEGES ON subscriptions TO studyspot_user;
-- GRANT ALL PRIVILEGES ON subscription_usage TO studyspot_user;
-- GRANT ALL PRIVILEGES ON invoices TO studyspot_user;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created:
--   1. subscription_plans (with 4 default plans)
--   2. subscriptions
--   3. subscription_usage
--   4. invoices
-- 
-- Indexes created for performance
-- Triggers added for auto-updating timestamps
-- Constraints ensure data integrity
-- ============================================



