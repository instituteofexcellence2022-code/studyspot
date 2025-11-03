-- ============================================
-- Migration 007: Issue Management System
-- Created by: AI Assistant
-- Date: October 24, 2025
-- Description: Comprehensive issue management system for library owners
-- ============================================

-- ============================================
-- 1. ISSUE CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issue_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#2196F3',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ISSUE PRIORITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issue_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL UNIQUE, -- 1=Critical, 2=High, 3=Medium, 4=Low
    color VARCHAR(7) DEFAULT '#F44336',
    sla_hours INTEGER, -- Service Level Agreement in hours
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. ISSUE STATUSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issue_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#9E9E9E',
    is_final BOOLEAN DEFAULT false, -- true for closed/resolved statuses
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ISSUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
    
    -- Issue Details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES issue_categories(id),
    priority_id UUID NOT NULL REFERENCES issue_priorities(id),
    status_id UUID NOT NULL REFERENCES issue_statuses(id),
    
    -- Reporting
    reported_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_by_name VARCHAR(255),
    reported_by_email VARCHAR(255),
    reported_by_phone VARCHAR(20),
    
    -- Assignment
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    student_count INTEGER DEFAULT 1, -- Number of students affected
    duplicate_of_issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
    is_duplicate BOOLEAN DEFAULT false,
    
    -- Timestamps
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- SLA Tracking
    sla_deadline TIMESTAMP WITH TIME ZONE,
    sla_breached BOOLEAN DEFAULT false,
    
    -- Satisfaction
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    satisfaction_feedback TEXT,
    satisfaction_submitted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tags TEXT[], -- Array of tags
    attachments JSONB DEFAULT '[]', -- File attachments
    metadata JSONB DEFAULT '{}', -- Additional metadata
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. ISSUE COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issue_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal staff comments
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ISSUE RESPONSE TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issue_response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category_id UUID REFERENCES issue_categories(id),
    priority_id UUID REFERENCES issue_priorities(id),
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. ISSUE ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issue_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
    
    -- Time Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    
    -- Metrics
    total_issues INTEGER DEFAULT 0,
    resolved_issues INTEGER DEFAULT 0,
    open_issues INTEGER DEFAULT 0,
    overdue_issues INTEGER DEFAULT 0,
    
    -- By Category
    category_breakdown JSONB DEFAULT '{}',
    
    -- By Priority
    priority_breakdown JSONB DEFAULT '{}',
    
    -- Response Times
    avg_first_response_time_hours DECIMAL(10,2),
    avg_resolution_time_hours DECIMAL(10,2),
    
    -- Satisfaction
    avg_satisfaction_rating DECIMAL(3,2),
    satisfaction_count INTEGER DEFAULT 0,
    
    -- SLA Performance
    sla_met_count INTEGER DEFAULT 0,
    sla_breached_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, library_id, period_start, period_end, period_type)
);

-- ============================================
-- 8. ISSUE NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issue_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- assigned, updated, resolved, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Issues table indexes
CREATE INDEX IF NOT EXISTS idx_issues_tenant_id ON issues(tenant_id);
CREATE INDEX IF NOT EXISTS idx_issues_library_id ON issues(library_id);
CREATE INDEX IF NOT EXISTS idx_issues_status_id ON issues(status_id);
CREATE INDEX IF NOT EXISTS idx_issues_priority_id ON issues(priority_id);
CREATE INDEX IF NOT EXISTS idx_issues_category_id ON issues(category_id);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_issues_reported_at ON issues(reported_at);
CREATE INDEX IF NOT EXISTS idx_issues_duplicate_of ON issues(duplicate_of_issue_id);
CREATE INDEX IF NOT EXISTS idx_issues_sla_deadline ON issues(sla_deadline);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user_id ON issue_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_created_at ON issue_comments(created_at);

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS idx_issue_analytics_tenant_id ON issue_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_issue_analytics_library_id ON issue_analytics(library_id);
CREATE INDEX IF NOT EXISTS idx_issue_analytics_period ON issue_analytics(period_start, period_end);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_issue_notifications_issue_id ON issue_notifications(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_notifications_user_id ON issue_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_notifications_is_read ON issue_notifications(is_read);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default issue categories
INSERT INTO issue_categories (name, display_name, description, icon, color) VALUES
('technical', 'Technical Issues', 'Hardware, software, and technical problems', '🔧', '#FF9800'),
('facility', 'Facility Issues', 'Building, equipment, and infrastructure problems', '🏢', '#2196F3'),
('booking', 'Booking Issues', 'Seat booking, scheduling, and reservation problems', '📅', '#4CAF50'),
('payment', 'Payment Issues', 'Billing, payment processing, and refund problems', '💳', '#9C27B0'),
('student', 'Student Issues', 'Student behavior, complaints, and service issues', '👥', '#F44336'),
('staff', 'Staff Issues', 'Staff-related problems and concerns', '👨‍💼', '#607D8B'),
('security', 'Security Issues', 'Safety, security, and access control problems', '🔒', '#795548'),
('other', 'Other Issues', 'Miscellaneous issues and general concerns', '📋', '#9E9E9E')
ON CONFLICT (name) DO NOTHING;

-- Insert default issue priorities
INSERT INTO issue_priorities (name, display_name, level, color, sla_hours) VALUES
('critical', 'Critical', 1, '#F44336', 2),
('high', 'High', 2, '#FF9800', 8),
('medium', 'Medium', 3, '#2196F3', 24),
('low', 'Low', 4, '#4CAF50', 72)
ON CONFLICT (name) DO NOTHING;

-- Insert default issue statuses
INSERT INTO issue_statuses (name, display_name, description, color, is_final) VALUES
('open', 'Open', 'Issue has been reported and is awaiting assignment', '#FF9800', false),
('assigned', 'Assigned', 'Issue has been assigned to a staff member', '#2196F3', false),
('in_progress', 'In Progress', 'Issue is being actively worked on', '#9C27B0', false),
('pending_feedback', 'Pending Feedback', 'Waiting for additional information or feedback', '#FF5722', false),
('resolved', 'Resolved', 'Issue has been resolved and is awaiting confirmation', '#4CAF50', false),
('closed', 'Closed', 'Issue has been closed and confirmed as resolved', '#9E9E9E', true),
('cancelled', 'Cancelled', 'Issue has been cancelled or is no longer relevant', '#607D8B', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_issue_categories_updated_at BEFORE UPDATE ON issue_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issue_priorities_updated_at BEFORE UPDATE ON issue_priorities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issue_statuses_updated_at BEFORE UPDATE ON issue_statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issue_comments_updated_at BEFORE UPDATE ON issue_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issue_response_templates_updated_at BEFORE UPDATE ON issue_response_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issue_analytics_updated_at BEFORE UPDATE ON issue_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic tenant-based isolation)
-- Note: These would need to be customized based on your specific security requirements

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE issue_categories IS 'Categories for organizing different types of issues';
COMMENT ON TABLE issue_priorities IS 'Priority levels for issues with SLA tracking';
COMMENT ON TABLE issue_statuses IS 'Status workflow for issue resolution';
COMMENT ON TABLE issues IS 'Main issues table with comprehensive tracking';
COMMENT ON TABLE issue_comments IS 'Comments and updates on issues';
COMMENT ON TABLE issue_response_templates IS 'Templates for common issue responses';
COMMENT ON TABLE issue_analytics IS 'Analytics and reporting data for issues';
COMMENT ON TABLE issue_notifications IS 'Notifications for issue updates';

COMMENT ON COLUMN issues.student_count IS 'Number of students affected by this issue';
COMMENT ON COLUMN issues.duplicate_of_issue_id IS 'Reference to the original issue if this is a duplicate';
COMMENT ON COLUMN issues.sla_deadline IS 'Service Level Agreement deadline for resolution';
COMMENT ON COLUMN issues.sla_breached IS 'Whether the SLA has been breached';
COMMENT ON COLUMN issues.satisfaction_rating IS 'Student satisfaction rating (1-5)';
COMMENT ON COLUMN issue_response_templates.usage_count IS 'How many times this template has been used';















