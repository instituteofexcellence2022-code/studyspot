-- Migration for Referral & Discount System

-- Table for Referral Programs
CREATE TABLE IF NOT EXISTS referral_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    referrer_bonus_type VARCHAR(20) DEFAULT 'percentage' CHECK (referrer_bonus_type IN ('percentage', 'fixed', 'credits')),
    referrer_bonus_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    referee_bonus_type VARCHAR(20) DEFAULT 'percentage' CHECK (referee_bonus_type IN ('percentage', 'fixed', 'credits')),
    referee_bonus_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    min_referral_amount DECIMAL(10, 2) DEFAULT 0,
    max_referral_amount DECIMAL(10, 2),
    validity_days INTEGER DEFAULT 365,
    max_referrals_per_user INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    terms_and_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Referral Tracking
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    referral_program_id UUID NOT NULL REFERENCES referral_programs(id) ON DELETE CASCADE,
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_code VARCHAR(50) NOT NULL,
    referee_email VARCHAR(255),
    referee_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'completed', 'expired', 'cancelled')),
    referrer_bonus_amount DECIMAL(10, 2) DEFAULT 0,
    referee_bonus_amount DECIMAL(10, 2) DEFAULT 0,
    referrer_bonus_paid BOOLEAN DEFAULT FALSE,
    referee_bonus_paid BOOLEAN DEFAULT FALSE,
    first_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    total_referral_value DECIMAL(10, 2) DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Discount Coupons
CREATE TABLE IF NOT EXISTS discount_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_hours')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    usage_limit_per_user INTEGER DEFAULT 1,
    applicable_to VARCHAR(50) DEFAULT 'all' CHECK (applicable_to IN ('all', 'new_users', 'existing_users', 'specific_libraries')),
    applicable_libraries UUID[],
    applicable_services VARCHAR(50)[] DEFAULT ARRAY['booking'],
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    terms_and_conditions TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Coupon Usage Tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    coupon_id UUID NOT NULL REFERENCES discount_coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    final_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Promotional Campaigns
CREATE TABLE IF NOT EXISTS promotional_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('referral', 'discount', 'loyalty', 'seasonal', 'event')),
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'new_users', 'existing_users', 'premium_users', 'specific_segment')),
    target_segment JSONB DEFAULT '{}',
    budget DECIMAL(10, 2),
    spent_amount DECIMAL(10, 2) DEFAULT 0,
    expected_reach INTEGER,
    actual_reach INTEGER DEFAULT 0,
    expected_conversions INTEGER,
    actual_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0,
    roi DECIMAL(5, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Campaign Performance Tracking
CREATE TABLE IF NOT EXISTS campaign_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    cost DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, date)
);

-- Table for User Referral Statistics
CREATE TABLE IF NOT EXISTS user_referral_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_referrals INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,
    total_referral_value DECIMAL(10, 2) DEFAULT 0,
    total_bonus_earned DECIMAL(10, 2) DEFAULT 0,
    last_referral_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id)
);

-- Table for Referral Rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('referrer_bonus', 'referee_bonus')),
    reward_amount DECIMAL(10, 2) NOT NULL,
    reward_status VARCHAR(20) DEFAULT 'pending' CHECK (reward_status IN ('pending', 'processed', 'paid', 'cancelled')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_programs_tenant ON referral_programs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_referral_programs_code ON referral_programs(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_tenant ON discount_coupons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_active ON discount_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_tenant ON promotional_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_status ON promotional_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_campaign ON campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_stats_user ON user_referral_stats(user_id);

-- Insert default referral program
INSERT INTO referral_programs (tenant_id, name, description, referral_code, referrer_bonus_type, referrer_bonus_value, referee_bonus_type, referee_bonus_value, validity_days, max_referrals_per_user, terms_and_conditions) VALUES
(gen_random_uuid(), 'Default Referral Program', 'Standard referral program for all users', 'REFER2024', 'percentage', 10.00, 'percentage', 15.00, 365, 10, 'Refer friends and earn rewards. Both referrer and referee get bonuses on successful referrals.');

-- Insert sample discount coupons
INSERT INTO discount_coupons (tenant_id, code, name, description, discount_type, discount_value, min_order_amount, usage_limit, usage_limit_per_user, applicable_to, terms_and_conditions) VALUES
(gen_random_uuid(), 'WELCOME10', 'Welcome Discount', '10% off for new users', 'percentage', 10.00, 100.00, 1000, 1, 'new_users', 'Valid for first booking only. Minimum order amount ₹100.'),
(gen_random_uuid(), 'STUDENT20', 'Student Special', '20% off for students', 'percentage', 20.00, 200.00, 500, 2, 'all', 'Valid for students only. Minimum order amount ₹200.'),
(gen_random_uuid(), 'FREEFIRST', 'First Hour Free', 'First hour free for new users', 'free_hours', 1.00, 0.00, 200, 1, 'new_users', 'First hour of booking is free. Valid for new users only.');

-- Insert sample promotional campaign
INSERT INTO promotional_campaigns (tenant_id, name, description, campaign_type, target_audience, budget, expected_reach, expected_conversions, status, start_date, end_date) VALUES
(gen_random_uuid(), 'Summer Study Campaign', 'Promote study sessions during summer', 'seasonal', 'all', 50000.00, 10000, 1000, 'draft', '2024-06-01 00:00:00', '2024-08-31 23:59:59');















