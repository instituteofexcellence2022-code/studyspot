-- ============================================
-- Migration 006: Credit Management System
-- Created by: Agent 1 (Backend Developer)
-- Date: October 21, 2025
-- Description: SMS/WhatsApp credit management with auto-topup
-- ============================================

-- ============================================
-- 1. CREDIT PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    credit_amount INTEGER NOT NULL, -- Number of credits
    price DECIMAL(10,2) NOT NULL, -- Price in INR/USD
    currency VARCHAR(3) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT true,
    is_promotional BOOLEAN DEFAULT false,
    bonus_credits INTEGER DEFAULT 0, -- Bonus credits (e.g., buy 1000 get 100 free)
    valid_days INTEGER, -- Credit validity in days (NULL = never expires)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active) WHERE is_active = true;

-- ============================================
-- 2. TENANT CREDITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tenant_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    credit_type VARCHAR(20) NOT NULL DEFAULT 'sms', -- sms, whatsapp, email
    balance INTEGER NOT NULL DEFAULT 0,
    total_purchased INTEGER DEFAULT 0,
    total_used INTEGER DEFAULT 0,
    total_bonus INTEGER DEFAULT 0,
    last_topup_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_tenant_credit_type UNIQUE(tenant_id, credit_type),
    CONSTRAINT check_balance_positive CHECK (balance >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_credits_tenant ON tenant_credits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_credits_type ON tenant_credits(credit_type);
CREATE INDEX IF NOT EXISTS idx_tenant_credits_balance ON tenant_credits(tenant_id, credit_type, balance);

-- ============================================
-- 3. CREDIT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    credit_type VARCHAR(20) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- purchase, usage, bonus, expiry, refund
    amount INTEGER NOT NULL, -- Positive for credit, negative for debit
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_id UUID, -- Package ID for purchases, booking ID for usage, etc.
    reference_type VARCHAR(50), -- package, booking, manual, etc.
    description TEXT,
    metadata JSONB,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_tenant ON credit_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(credit_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_date ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference ON credit_transactions(reference_id, reference_type);

-- ============================================
-- 4. CREDIT PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    package_id UUID REFERENCES credit_packages(id) ON DELETE SET NULL,
    credit_type VARCHAR(20) NOT NULL,
    credit_amount INTEGER NOT NULL,
    bonus_credits INTEGER DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_method VARCHAR(50), -- stripe, razorpay, manual
    payment_id VARCHAR(255), -- Stripe/Razorpay payment ID
    transaction_id VARCHAR(255), -- Payment gateway transaction ID
    purchased_by UUID REFERENCES users(id) ON DELETE SET NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- When credits expire
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_purchases_tenant ON credit_purchases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_payment_id ON credit_purchases(payment_id);

-- ============================================
-- 5. AUTO-TOPUP CONFIGURATION
-- ============================================
CREATE TABLE IF NOT EXISTS auto_topup_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    credit_type VARCHAR(20) NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    threshold_amount INTEGER NOT NULL, -- Trigger when balance falls below this
    topup_package_id UUID REFERENCES credit_packages(id),
    topup_amount INTEGER NOT NULL, -- Amount to add when triggered
    payment_method VARCHAR(50), -- stripe, razorpay
    payment_method_id VARCHAR(255), -- Saved payment method ID
    max_topups_per_month INTEGER DEFAULT 10, -- Safety limit
    topups_this_month INTEGER DEFAULT 0,
    last_topup_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_auto_topup UNIQUE(tenant_id, credit_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auto_topup_tenant ON auto_topup_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auto_topup_enabled ON auto_topup_config(is_enabled) WHERE is_enabled = true;

-- ============================================
-- 6. CREDIT USAGE LOGS (Detailed tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    credit_type VARCHAR(20) NOT NULL,
    credits_used INTEGER NOT NULL,
    service_type VARCHAR(50), -- sms, whatsapp, email
    recipient VARCHAR(255), -- Phone/email
    message_id VARCHAR(255), -- External service message ID
    status VARCHAR(20), -- sent, delivered, failed
    cost DECIMAL(10,4), -- Actual cost per message
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_usage_tenant ON credit_usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_date ON credit_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_usage_booking ON credit_usage_logs(booking_id);

-- ============================================
-- 7. SEED DEFAULT CREDIT PACKAGES
-- ============================================
INSERT INTO credit_packages (name, display_name, description, credit_amount, price, bonus_credits) VALUES
    ('starter_100', 'Starter - 100 Credits', 'Perfect for getting started', 100, 99.00, 0),
    ('basic_500', 'Basic - 500 Credits', 'Great for small libraries', 500, 450.00, 50),
    ('pro_1000', 'Pro - 1,000 Credits', 'Most popular package', 1000, 850.00, 150),
    ('business_5000', 'Business - 5,000 Credits', 'For growing businesses', 5000, 4000.00, 1000),
    ('enterprise_10000', 'Enterprise - 10,000 Credits', 'Best value for large organizations', 10000, 7500.00, 2500),
    ('mega_50000', 'Mega - 50,000 Credits', 'Ultimate package', 50000, 35000.00, 15000)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    credit_amount = EXCLUDED.credit_amount,
    price = EXCLUDED.price,
    bonus_credits = EXCLUDED.bonus_credits,
    updated_at = NOW();

-- ============================================
-- 8. INITIALIZE CREDITS FOR EXISTING TENANTS
-- ============================================

-- Give all existing tenants initial free credits
INSERT INTO tenant_credits (tenant_id, credit_type, balance, total_bonus)
SELECT 
    t.id,
    'sms',
    100, -- 100 free SMS credits
    100
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM tenant_credits tc
    WHERE tc.tenant_id = t.id AND tc.credit_type = 'sms'
)
ON CONFLICT (tenant_id, credit_type) DO NOTHING;

INSERT INTO tenant_credits (tenant_id, credit_type, balance, total_bonus)
SELECT 
    t.id,
    'whatsapp',
    50, -- 50 free WhatsApp credits
    50
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM tenant_credits tc
    WHERE tc.tenant_id = t.id AND tc.credit_type = 'whatsapp'
)
ON CONFLICT (tenant_id, credit_type) DO NOTHING;

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
    p_tenant_id UUID,
    p_credit_type VARCHAR,
    p_amount INTEGER,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- Get current balance with row lock
    SELECT balance INTO current_balance
    FROM tenant_credits
    WHERE tenant_id = p_tenant_id AND credit_type = p_credit_type
    FOR UPDATE;
    
    -- Check if sufficient balance
    IF current_balance IS NULL OR current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    new_balance := current_balance - p_amount;
    
    -- Update balance
    UPDATE tenant_credits
    SET 
        balance = new_balance,
        total_used = total_used + p_amount,
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id AND credit_type = p_credit_type;
    
    -- Log transaction
    INSERT INTO credit_transactions (
        tenant_id, credit_type, transaction_type, amount,
        balance_before, balance_after,
        reference_id, reference_type, description
    ) VALUES (
        p_tenant_id, p_credit_type, 'usage', -p_amount,
        current_balance, new_balance,
        p_reference_id, p_reference_type, p_description
    );
    
    -- Check auto-topup threshold
    PERFORM check_auto_topup(p_tenant_id, p_credit_type);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
    p_tenant_id UUID,
    p_credit_type VARCHAR,
    p_amount INTEGER,
    p_transaction_type VARCHAR DEFAULT 'purchase',
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- Get current balance with row lock
    SELECT balance INTO current_balance
    FROM tenant_credits
    WHERE tenant_id = p_tenant_id AND credit_type = p_credit_type
    FOR UPDATE;
    
    IF current_balance IS NULL THEN
        -- Create credit account if doesn't exist
        INSERT INTO tenant_credits (tenant_id, credit_type, balance, total_purchased)
        VALUES (p_tenant_id, p_credit_type, p_amount, p_amount);
        current_balance := 0;
        new_balance := p_amount;
    ELSE
        new_balance := current_balance + p_amount;
        
        -- Update balance
        UPDATE tenant_credits
        SET 
            balance = new_balance,
            total_purchased = CASE 
                WHEN p_transaction_type = 'purchase' THEN total_purchased + p_amount
                WHEN p_transaction_type = 'bonus' THEN total_purchased
                ELSE total_purchased
            END,
            total_bonus = CASE 
                WHEN p_transaction_type = 'bonus' THEN total_bonus + p_amount
                ELSE total_bonus
            END,
            last_topup_at = CASE 
                WHEN p_transaction_type IN ('purchase', 'bonus') THEN NOW()
                ELSE last_topup_at
            END,
            updated_at = NOW()
        WHERE tenant_id = p_tenant_id AND credit_type = p_credit_type;
    END IF;
    
    -- Log transaction
    INSERT INTO credit_transactions (
        tenant_id, credit_type, transaction_type, amount,
        balance_before, balance_after,
        reference_id, reference_type, description
    ) VALUES (
        p_tenant_id, p_credit_type, p_transaction_type, p_amount,
        current_balance, new_balance,
        p_reference_id, 'credit_package', p_description
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to check and trigger auto-topup
CREATE OR REPLACE FUNCTION check_auto_topup(
    p_tenant_id UUID,
    p_credit_type VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    config RECORD;
    current_balance INTEGER;
BEGIN
    -- Get auto-topup config
    SELECT * INTO config
    FROM auto_topup_config
    WHERE tenant_id = p_tenant_id
    AND credit_type = p_credit_type
    AND is_enabled = true
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get current balance
    SELECT balance INTO current_balance
    FROM tenant_credits
    WHERE tenant_id = p_tenant_id AND credit_type = p_credit_type;
    
    -- Check if below threshold
    IF current_balance >= config.threshold_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Check monthly limit
    IF config.topups_this_month >= config.max_topups_per_month THEN
        -- Disable auto-topup
        UPDATE auto_topup_config
        SET is_enabled = false
        WHERE id = config.id;
        RETURN FALSE;
    END IF;
    
    -- Trigger topup (This would integrate with payment gateway in production)
    -- For now, just log the trigger
    -- In production, this would create a payment intent and process payment
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. TRIGGERS FOR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_credit_packages_updated_at ON credit_packages;
CREATE TRIGGER update_credit_packages_updated_at
    BEFORE UPDATE ON credit_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_credits_updated_at ON tenant_credits;
CREATE TRIGGER update_tenant_credits_updated_at
    BEFORE UPDATE ON tenant_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_auto_topup_config_updated_at ON auto_topup_config;
CREATE TRIGGER update_auto_topup_config_updated_at
    BEFORE UPDATE ON auto_topup_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created:
--   1. credit_packages (6 default packages)
--   2. tenant_credits (initialized for all tenants)
--   3. credit_transactions (transaction history)
--   4. credit_purchases (purchase tracking)
--   5. auto_topup_config (auto-topup settings)
--   6. credit_usage_logs (detailed usage tracking)
--
-- Functions created:
--   1. deduct_credits() - Deduct credits with logging
--   2. add_credits() - Add credits with logging
--   3. check_auto_topup() - Check and trigger auto-topup
--
-- Indexes created for performance
-- Initial credits granted to all tenants
-- ============================================



