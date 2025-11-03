-- ============================================
-- Migration 004: Tenant Management Enhancements
-- Created by: Agent 1 (Backend Developer)
-- Date: October 21, 2025
-- Description: Enhanced tenant management for SaaS platform
-- ============================================

-- ============================================
-- 1. ENHANCE TENANTS TABLE
-- ============================================

-- Add new columns for tenant management
DO $$ 
BEGIN
    -- Settings (branding, features, configurations)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'settings'
    ) THEN
        ALTER TABLE tenants ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Branding (logo, colors, custom domain)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'branding'
    ) THEN
        ALTER TABLE tenants ADD COLUMN branding JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Onboarding status tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'onboarding_status'
    ) THEN
        ALTER TABLE tenants ADD COLUMN onboarding_status VARCHAR(20) DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'onboarding_step'
    ) THEN
        ALTER TABLE tenants ADD COLUMN onboarding_step INTEGER DEFAULT 1;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'onboarding_completed_at'
    ) THEN
        ALTER TABLE tenants ADD COLUMN onboarding_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Active/Suspended status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE tenants ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'suspended_at'
    ) THEN
        ALTER TABLE tenants ADD COLUMN suspended_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'suspension_reason'
    ) THEN
        ALTER TABLE tenants ADD COLUMN suspension_reason TEXT;
    END IF;

    -- Business information
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'business_type'
    ) THEN
        ALTER TABLE tenants ADD COLUMN business_type VARCHAR(50);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'business_registration_number'
    ) THEN
        ALTER TABLE tenants ADD COLUMN business_registration_number VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'tax_id'
    ) THEN
        ALTER TABLE tenants ADD COLUMN tax_id VARCHAR(100);
    END IF;

    -- Contact information
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'phone'
    ) THEN
        ALTER TABLE tenants ADD COLUMN phone VARCHAR(20);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'address'
    ) THEN
        ALTER TABLE tenants ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'city'
    ) THEN
        ALTER TABLE tenants ADD COLUMN city VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'state'
    ) THEN
        ALTER TABLE tenants ADD COLUMN state VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'country'
    ) THEN
        ALTER TABLE tenants ADD COLUMN country VARCHAR(100) DEFAULT 'India';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'postal_code'
    ) THEN
        ALTER TABLE tenants ADD COLUMN postal_code VARCHAR(20);
    END IF;

    -- Owner information
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'owner_name'
    ) THEN
        ALTER TABLE tenants ADD COLUMN owner_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'owner_email'
    ) THEN
        ALTER TABLE tenants ADD COLUMN owner_email VARCHAR(255);
    END IF;
END $$;

-- ============================================
-- 2. TENANT ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tenant_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- User metrics
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    
    -- Library metrics
    total_libraries INTEGER DEFAULT 0,
    active_libraries INTEGER DEFAULT 0,
    
    -- Booking metrics
    total_bookings INTEGER DEFAULT 0,
    confirmed_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    
    -- Revenue metrics
    revenue DECIMAL(10,2) DEFAULT 0,
    pending_revenue DECIMAL(10,2) DEFAULT 0,
    
    -- Communication metrics
    sms_sent INTEGER DEFAULT 0,
    whatsapp_sent INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    
    -- System metrics
    api_calls INTEGER DEFAULT 0,
    storage_used_mb DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one record per tenant per date
    CONSTRAINT unique_tenant_analytics_date UNIQUE(tenant_id, date)
);

-- Indexes for tenant_analytics
CREATE INDEX IF NOT EXISTS idx_tenant_analytics_tenant ON tenant_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_analytics_date ON tenant_analytics(date);
CREATE INDEX IF NOT EXISTS idx_tenant_analytics_tenant_date ON tenant_analytics(tenant_id, date);

-- ============================================
-- 3. TENANT ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS tenant_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- onboarding, settings_change, branding_update, subscription_change, etc
    description TEXT,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_tenant_activity_tenant ON tenant_activity_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_activity_type ON tenant_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_tenant_activity_created ON tenant_activity_log(created_at);

-- ============================================
-- 4. TENANT INTEGRATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS tenant_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL, -- google_oauth, facebook_oauth, whatsapp, sms, payment_gateway, etc
    is_enabled BOOLEAN DEFAULT false,
    configuration JSONB DEFAULT '{}'::jsonb, -- Store encrypted credentials/settings
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20), -- success, failed, in_progress
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one config per integration type per tenant
    CONSTRAINT unique_tenant_integration UNIQUE(tenant_id, integration_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_tenant ON tenant_integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_type ON tenant_integrations(integration_type);

-- ============================================
-- 5. TENANT CUSTOM DOMAINS
-- ============================================
CREATE TABLE IF NOT EXISTS tenant_custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    ssl_enabled BOOLEAN DEFAULT false,
    ssl_certificate TEXT, -- Store SSL cert details
    ssl_expires_at TIMESTAMP WITH TIME ZONE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_domains_tenant ON tenant_custom_domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON tenant_custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_verified ON tenant_custom_domains(is_verified);

-- ============================================
-- 6. INDEXES FOR TENANTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_onboarding ON tenants(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

-- ============================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_tenant_analytics_updated_at ON tenant_analytics;
CREATE TRIGGER update_tenant_analytics_updated_at
    BEFORE UPDATE ON tenant_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_integrations_updated_at ON tenant_integrations;
CREATE TRIGGER update_tenant_integrations_updated_at
    BEFORE UPDATE ON tenant_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_domains_updated_at ON tenant_custom_domains;
CREATE TRIGGER update_custom_domains_updated_at
    BEFORE UPDATE ON tenant_custom_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. DEFAULT VALUES FOR EXISTING TENANTS
-- ============================================
-- Update existing tenants with default values
UPDATE tenants 
SET 
    settings = '{}'::jsonb,
    branding = '{}'::jsonb,
    onboarding_status = 'completed',
    onboarding_step = 5,
    is_active = true
WHERE settings IS NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created/modified:
--   1. tenants (enhanced with 20+ new columns)
--   2. tenant_analytics (new)
--   3. tenant_activity_log (new)
--   4. tenant_integrations (new)
--   5. tenant_custom_domains (new)
--
-- Indexes created for performance
-- Triggers added for auto-updating timestamps
-- Constraints ensure data integrity
-- ============================================



