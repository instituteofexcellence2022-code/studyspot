-- ============================================
-- AUDIT LOGS TABLE
-- Security and compliance logging
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES admin_users(id),
    tenant_id UUID REFERENCES tenants(id),
    action VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    request_body JSONB,
    response_status INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Partition by month for better performance (optional, for high-volume systems)
-- CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

