-- ============================================
-- Migration 010: Fee Plans System
-- Created by: AI Assistant
-- Date: October 26, 2025
-- Description: Fee plans system for student pricing
-- ============================================

-- ============================================
-- 1. FEE PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fee_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'hourly', -- hourly, daily, weekly, monthly, quarterly, annual, combo
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    selected_shift VARCHAR(50), -- morning, afternoon, evening, night, custom
    selected_zone VARCHAR(50), -- ac, non-ac, custom
    custom_shift JSONB, -- {name: string, startTime: string, endTime: string}
    custom_zone JSONB, -- {name: string, description: string}
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    enable_discount BOOLEAN DEFAULT false,
    discount JSONB, -- {type: 'percentage'|'fixed', value: number, validFrom: string, validTo: string}
    is_popular BOOLEAN DEFAULT false,
    scholarship_eligible BOOLEAN DEFAULT false,
    waiver_allowed BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, draft
    max_seats INTEGER,
    max_hours INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_fee_plan_name_per_tenant UNIQUE(tenant_id, name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fee_plans_tenant ON fee_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fee_plans_status ON fee_plans(status);
CREATE INDEX IF NOT EXISTS idx_fee_plans_type ON fee_plans(type);
CREATE INDEX IF NOT EXISTS idx_fee_plans_popular ON fee_plans(is_popular) WHERE is_popular = true;

-- ============================================
-- 2. STUDENT FEE PLAN ASSIGNMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS student_fee_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fee_plan_id UUID NOT NULL REFERENCES fee_plans(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_active_student_fee_plan UNIQUE(student_id, fee_plan_id, status) 
        WHERE status = 'active'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_fee_plans_student ON student_fee_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_plans_fee_plan ON student_fee_plans(fee_plan_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_plans_status ON student_fee_plans(status);

-- ============================================
-- 3. FEE PLAN USAGE TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS fee_plan_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_plan_id UUID NOT NULL REFERENCES fee_plans(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    hours_used DECIMAL(5,2) DEFAULT 0,
    amount_charged DECIMAL(10,2) DEFAULT 0,
    discount_applied DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_daily_usage UNIQUE(fee_plan_id, student_id, usage_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fee_plan_usage_fee_plan ON fee_plan_usage(fee_plan_id);
CREATE INDEX IF NOT EXISTS idx_fee_plan_usage_student ON fee_plan_usage(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_plan_usage_date ON fee_plan_usage(usage_date);

-- ============================================
-- 4. TRIGGERS FOR UPDATED_AT
-- ============================================

-- Apply triggers to fee_plans
DROP TRIGGER IF EXISTS update_fee_plans_updated_at ON fee_plans;
CREATE TRIGGER update_fee_plans_updated_at
    BEFORE UPDATE ON fee_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply triggers to student_fee_plans
DROP TRIGGER IF EXISTS update_student_fee_plans_updated_at ON student_fee_plans;
CREATE TRIGGER update_student_fee_plans_updated_at
    BEFORE UPDATE ON student_fee_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. SEED DEFAULT FEE PLANS (Optional)
-- ============================================
-- This will be populated by the application when tenants are created

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created:
--   1. fee_plans (main fee plan definitions)
--   2. student_fee_plans (student assignments to fee plans)
--   3. fee_plan_usage (tracking usage and billing)
-- 
-- Indexes created for performance
-- Triggers added for auto-updating timestamps
-- Constraints ensure data integrity
-- ============================================

