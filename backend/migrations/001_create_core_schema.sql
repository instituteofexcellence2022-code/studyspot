-- ============================================
-- CORE DATABASE SCHEMA
-- Platform-level tables for multi-tenant SaaS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TENANTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'expired')),
    subscription_plan VARCHAR(50) CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise', 'custom')),
    subscription_status VARCHAR(50) CHECK (subscription_status IN ('active', 'trial', 'expired', 'cancelled')),
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    max_libraries INTEGER DEFAULT 1,
    max_students INTEGER DEFAULT 100,
    max_staff INTEGER DEFAULT 10,
    database_name VARCHAR(100) UNIQUE NOT NULL,
    database_host VARCHAR(255),
    features JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_subscription ON tenants(subscription_plan, subscription_status);
CREATE INDEX idx_tenants_created_at ON tenants(created_at);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) CHECK (role IN ('super_admin', 'admin', 'support', 'analyst', 'sales', 'finance')),
    department VARCHAR(50) CHECK (department IN ('management', 'sales', 'finance', 'operations', 'hr', 'support')),
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);

-- ============================================
-- PLATFORM ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS platform_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_tenants INTEGER DEFAULT 0,
    active_tenants INTEGER DEFAULT 0,
    trial_tenants INTEGER DEFAULT 0,
    total_libraries INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_platform_analytics_date ON platform_analytics(date DESC);

-- ============================================
-- CREDIT MASTER WALLET TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS credit_master_wallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_sms_credits BIGINT DEFAULT 0,
    total_whatsapp_credits BIGINT DEFAULT 0,
    total_email_credits BIGINT DEFAULT 0,
    available_sms_credits BIGINT DEFAULT 0,
    available_whatsapp_credits BIGINT DEFAULT 0,
    available_email_credits BIGINT DEFAULT 0,
    allocated_sms_credits BIGINT DEFAULT 0,
    allocated_whatsapp_credits BIGINT DEFAULT 0,
    allocated_email_credits BIGINT DEFAULT 0,
    total_purchased DECIMAL(15,2) DEFAULT 0,
    total_sold DECIMAL(15,2) DEFAULT 0,
    profit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CREDIT VENDORS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS credit_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    sms_rate DECIMAL(10,4),
    whatsapp_rate DECIMAL(10,4),
    email_rate DECIMAL(10,4),
    minimum_order INTEGER,
    payment_terms VARCHAR(100),
    rating DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_vendors_is_active ON credit_vendors(is_active);

-- ============================================
-- CREDIT PURCHASE HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS credit_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES credit_vendors(id),
    purchase_date TIMESTAMP DEFAULT NOW(),
    sms_credits BIGINT DEFAULT 0,
    whatsapp_credits BIGINT DEFAULT 0,
    email_credits BIGINT DEFAULT 0,
    total_cost DECIMAL(15,2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'completed', 'failed')),
    invoice_number VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_purchases_vendor ON credit_purchases(vendor_id);
CREATE INDEX idx_credit_purchases_date ON credit_purchases(purchase_date DESC);

-- ============================================
-- TENANT CREDIT WALLETS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tenant_credit_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sms_credits BIGINT DEFAULT 0,
    whatsapp_credits BIGINT DEFAULT 0,
    email_credits BIGINT DEFAULT 0,
    sms_rate DECIMAL(10,4),
    whatsapp_rate DECIMAL(10,4),
    email_rate DECIMAL(10,4),
    total_spent DECIMAL(15,2) DEFAULT 0,
    low_balance_threshold INTEGER DEFAULT 1000,
    auto_alert_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id)
);

CREATE INDEX idx_tenant_credit_wallets_tenant ON tenant_credit_wallets(tenant_id);
CREATE INDEX idx_tenant_credit_wallets_low_balance ON tenant_credit_wallets(sms_credits, whatsapp_credits, email_credits);

-- ============================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('free', 'trial', 'starter', 'professional', 'enterprise', 'custom')),
    price_monthly DECIMAL(10,2),
    price_quarterly DECIMAL(10,2),
    price_half_yearly DECIMAL(10,2),
    price_annual DECIMAL(10,2),
    max_libraries INTEGER,
    max_students INTEGER,
    max_staff INTEGER,
    features JSONB DEFAULT '[]',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_subscription_plans_type ON subscription_plans(type);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'quarterly', 'half_yearly', 'annual')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) CHECK (status IN ('active', 'trial', 'expired', 'cancelled')),
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    auto_renew BOOLEAN DEFAULT true,
    cancellation_date TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    user_id UUID,
    user_type VARCHAR(50) CHECK (user_type IN ('admin', 'tenant_owner', 'tenant_manager', 'tenant_staff')),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Partition by month for performance
CREATE TABLE IF NOT EXISTS audit_logs_2025 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- ============================================
-- SYSTEM NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('success', 'info', 'warning', 'error')),
    category VARCHAR(50) CHECK (category IN ('payment', 'tenant', 'student', 'subscription', 'credit', 'system', 'security', 'report')),
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    tenant_id UUID,
    action_required BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_notifications_tenant ON system_notifications(tenant_id);
CREATE INDEX idx_system_notifications_type ON system_notifications(type);
CREATE INDEX idx_system_notifications_is_read ON system_notifications(is_read);
CREATE INDEX idx_system_notifications_created_at ON system_notifications(created_at DESC);

-- ============================================
-- REFRESH TOKENS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_type VARCHAR(20) CHECK (user_type IN ('admin', 'tenant')),
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id, user_type);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to all tables with updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_master_wallet_updated_at BEFORE UPDATE ON credit_master_wallet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_vendors_updated_at BEFORE UPDATE ON credit_vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_credit_wallets_updated_at BEFORE UPDATE ON tenant_credit_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default super admin (password: Admin@123 - CHANGE IN PRODUCTION!)
INSERT INTO admin_users (email, password_hash, first_name, last_name, role, department, permissions, is_active)
VALUES (
    'admin@studyspot.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIb8r5sO5y', -- bcrypt hash of 'Admin@123'
    'Super',
    'Admin',
    'super_admin',
    'management',
    '["*"]'::jsonb,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, type, price_monthly, price_quarterly, price_half_yearly, price_annual, max_libraries, max_students, max_staff, features, is_active, is_popular, display_order)
VALUES
    ('Free Plan', 'free', 'Get started with basic features', 'free', 0, 0, 0, 0, 1, 50, 5, '["basic_dashboard", "student_management", "attendance_tracking"]'::jsonb, true, false, 1),
    ('Starter Plan', 'starter', 'Perfect for small libraries', 'starter', 999, 2697, 4995, 8990, 2, 200, 10, '["all_free_features", "analytics", "reports", "sms_notifications"]'::jsonb, true, false, 2),
    ('Professional Plan', 'professional', 'For growing businesses', 'professional', 2499, 6747, 12495, 22490, 5, 1000, 25, '["all_starter_features", "advanced_analytics", "whatsapp", "email", "multi_library"]'::jsonb, true, true, 3),
    ('Enterprise Plan', 'enterprise', 'Custom solutions for large organizations', 'enterprise', 9999, 26997, 49995, 89990, 20, 5000, 100, '["all_professional_features", "api_access", "custom_branding", "dedicated_support", "custom_integrations"]'::jsonb, true, false, 4)
ON CONFLICT (slug) DO NOTHING;

-- Initialize master credit wallet
INSERT INTO credit_master_wallet (total_sms_credits, total_whatsapp_credits, total_email_credits, available_sms_credits, available_whatsapp_credits, available_email_credits)
VALUES (0, 0, 0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE tenants IS 'Multi-tenant platform - tenant registration and configuration';
COMMENT ON TABLE admin_users IS 'Platform administrators and staff';
COMMENT ON TABLE platform_analytics IS 'Aggregated platform-wide analytics';
COMMENT ON TABLE credit_master_wallet IS 'Platform-level credit inventory for reselling';
COMMENT ON TABLE tenant_credit_wallets IS 'Tenant-specific credit balances';
COMMENT ON TABLE subscription_plans IS 'Available subscription plans';
COMMENT ON TABLE subscriptions IS 'Tenant subscription history';
COMMENT ON TABLE audit_logs IS 'Platform-wide audit trail';
COMMENT ON TABLE system_notifications IS 'System notifications and alerts';

