-- Migration: Audit & Security System
-- Description: Comprehensive audit trail, session management, and security monitoring
-- Date: 2024

-- ========================================
-- AUDIT LOGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_resource_type VARCHAR(50),  -- 'student', 'booking', 'payment', etc.
    target_resource_id INTEGER,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),  -- Supports IPv4 and IPv6
    user_agent TEXT,
    metadata JSONB,  -- Additional context
    severity VARCHAR(20) DEFAULT 'info',  -- 'info', 'warning', 'critical'
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    tenant_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_library_id ON audit_logs(library_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(target_resource_type, target_resource_id);

-- Composite index for common queries
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_library_date ON audit_logs(library_id, created_at DESC);

-- ========================================
-- USER SESSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSONB,  -- Device type, OS, browser
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Indexes for session management
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at);
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, is_active);

-- ========================================
-- SECURITY EVENTS TABLE (Failed logins, etc.)
-- ========================================
CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,  -- 'failed_login', 'brute_force', 'suspicious_ip'
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),  -- Store email even if user doesn't exist
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    reason TEXT,
    metadata JSONB,
    severity VARCHAR(20) DEFAULT 'warning',  -- 'info', 'warning', 'critical'
    blocked_until TIMESTAMP WITH TIME ZONE,  -- For rate limiting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for security monitoring
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
CREATE INDEX idx_security_events_email ON security_events(email);
CREATE INDEX idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX idx_security_events_severity ON security_events(severity);

-- ========================================
-- DATA ACCESS LOGS (Sensitive data tracking)
-- ========================================
CREATE TABLE IF NOT EXISTS data_access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL NOT NULL,
    access_type VARCHAR(50) NOT NULL,  -- 'view', 'export', 'download'
    resource_type VARCHAR(50) NOT NULL,  -- 'student', 'payment', 'report'
    resource_id INTEGER,
    field_accessed VARCHAR(100),  -- Specific field (e.g., 'phone', 'email', 'payment_details')
    reason TEXT,  -- Why was this data accessed?
    ip_address VARCHAR(45),
    user_agent TEXT,
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    tenant_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for data access tracking
CREATE INDEX idx_data_access_user ON data_access_logs(user_id);
CREATE INDEX idx_data_access_resource ON data_access_logs(resource_type, resource_id);
CREATE INDEX idx_data_access_created ON data_access_logs(created_at DESC);
CREATE INDEX idx_data_access_library ON data_access_logs(library_id);

-- ========================================
-- SYSTEM SETTINGS CHANGE HISTORY
-- ========================================
CREATE TABLE IF NOT EXISTS settings_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    ip_address VARCHAR(45),
    library_id INTEGER REFERENCES libraries(id) ON DELETE SET NULL,
    tenant_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for settings tracking
CREATE INDEX idx_settings_history_key ON settings_history(setting_key);
CREATE INDEX idx_settings_history_user ON settings_history(user_id);
CREATE INDEX idx_settings_history_created ON settings_history(created_at DESC);

-- ========================================
-- ACTIVITY SUMMARY (Pre-aggregated for performance)
-- ========================================
CREATE TABLE IF NOT EXISTS activity_summary (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    library_id INTEGER REFERENCES libraries(id) ON DELETE CASCADE,
    tenant_id INTEGER,
    total_logins INTEGER DEFAULT 0,
    failed_logins INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_payments DECIMAL(15,2) DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    suspicious_events INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, library_id, tenant_id)
);

-- Indexes for activity summary
CREATE INDEX idx_activity_summary_date ON activity_summary(date DESC);
CREATE INDEX idx_activity_summary_library ON activity_summary(library_id, date DESC);

-- ========================================
-- FUNCTIONS FOR AUTOMATED LOGGING
-- ========================================

-- Function to update last_activity timestamp
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update session activity
CREATE TRIGGER trigger_update_session_activity
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- Function to log user changes
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Log role changes
        IF OLD.role != NEW.role THEN
            INSERT INTO audit_logs (
                event_type,
                user_id,
                target_user_id,
                action,
                description,
                metadata
            ) VALUES (
                'role_changed',
                NEW.updated_by,
                NEW.id,
                'update_user_role',
                'User role changed from ' || OLD.role || ' to ' || NEW.role,
                jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user changes (if updated_by field exists)
-- CREATE TRIGGER trigger_log_user_changes
--     AFTER UPDATE ON users
--     FOR EACH ROW
--     EXECUTE FUNCTION log_user_changes();

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- Recent security events view
CREATE OR REPLACE VIEW recent_security_events AS
SELECT 
    se.*,
    u.name as user_name,
    u.email as user_email
FROM security_events se
LEFT JOIN users u ON se.user_id = u.id
WHERE se.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY se.created_at DESC;

-- Active sessions view
CREATE OR REPLACE VIEW active_sessions_view AS
SELECT 
    us.*,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role
FROM user_sessions us
INNER JOIN users u ON us.user_id = u.id
WHERE us.is_active = true 
    AND us.expires_at > CURRENT_TIMESTAMP;

-- Audit summary by user
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    al.user_id,
    u.name,
    u.email,
    COUNT(*) as total_actions,
    COUNT(DISTINCT DATE(al.created_at)) as active_days,
    MAX(al.created_at) as last_activity,
    COUNT(*) FILTER (WHERE al.severity = 'critical') as critical_events,
    COUNT(*) FILTER (WHERE al.severity = 'warning') as warning_events
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY al.user_id, u.name, u.email;

-- ========================================
-- CLEANUP FUNCTIONS (For maintenance)
-- ========================================

-- Function to archive old audit logs
CREATE OR REPLACE FUNCTION archive_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- In production, you might move to an archive table instead of deleting
    DELETE FROM audit_logs
    WHERE created_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL
        AND severity = 'info';  -- Only archive info-level logs
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    UPDATE user_sessions
    SET is_active = false,
        ended_at = CURRENT_TIMESTAMP
    WHERE is_active = true 
        AND expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- SAMPLE DATA (For testing)
-- ========================================

-- Insert sample audit event types reference (optional)
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system actions';
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions for security monitoring';
COMMENT ON TABLE security_events IS 'Logs security-related events like failed logins';
COMMENT ON TABLE data_access_logs IS 'Tracks access to sensitive data for compliance';
COMMENT ON TABLE settings_history IS 'Maintains history of system settings changes';
COMMENT ON TABLE activity_summary IS 'Pre-aggregated daily activity metrics for performance';

-- ========================================
-- GRANTS (Adjust based on your user roles)
-- ========================================

-- Grant SELECT to read-only users
-- GRANT SELECT ON audit_logs, user_sessions, security_events TO readonly_role;

-- Grant INSERT to application user
-- GRANT INSERT ON audit_logs, user_sessions, security_events, data_access_logs TO app_user;

COMMIT;

