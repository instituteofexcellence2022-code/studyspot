-- Migration for Issue Workflow Automation & Rules Engine

-- Table for Workflow Rules
CREATE TABLE IF NOT EXISTS issue_workflow_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(100) NOT NULL, -- 'issue_created', 'status_changed', 'priority_changed', 'sla_breach', 'assignment_changed'
    conditions JSONB NOT NULL DEFAULT '{}', -- Conditions that must be met
    actions JSONB NOT NULL DEFAULT '{}', -- Actions to perform
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 100, -- Lower number = higher priority
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Issue Escalation Rules
CREATE TABLE IF NOT EXISTS issue_escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_conditions JSONB NOT NULL DEFAULT '{}', -- When to escalate
    escalation_path JSONB NOT NULL DEFAULT '{}', -- Who to escalate to
    escalation_delay_hours INTEGER DEFAULT 24,
    max_escalations INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Issue Escalation History
CREATE TABLE IF NOT EXISTS issue_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    escalation_rule_id UUID REFERENCES issue_escalation_rules(id) ON DELETE SET NULL,
    escalated_from UUID REFERENCES users(id) ON DELETE SET NULL,
    escalated_to UUID REFERENCES users(id) ON DELETE SET NULL,
    escalation_level INTEGER NOT NULL DEFAULT 1,
    reason TEXT,
    escalated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' -- 'pending', 'acknowledged', 'resolved', 'rejected'
);

-- Table for Issue Workflow History
CREATE TABLE IF NOT EXISTS issue_workflow_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    workflow_rule_id UUID REFERENCES issue_workflow_rules(id) ON DELETE SET NULL,
    trigger_event VARCHAR(100) NOT NULL,
    conditions_met JSONB NOT NULL DEFAULT '{}',
    actions_performed JSONB NOT NULL DEFAULT '{}',
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'success' -- 'success', 'failed', 'partial'
);

-- Table for Issue SLA Tracking
CREATE TABLE IF NOT EXISTS issue_sla_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    sla_type VARCHAR(100) NOT NULL, -- 'first_response', 'resolution', 'escalation'
    target_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_time TIMESTAMP WITH TIME ZONE,
    is_breached BOOLEAN DEFAULT FALSE,
    breach_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Issue Automation Templates
CREATE TABLE IF NOT EXISTS issue_automation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL, -- 'workflow_rule', 'escalation_rule', 'notification_template'
    template_data JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add new columns to issues table for enhanced tracking
ALTER TABLE issues ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT FALSE;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(100) DEFAULT 'manual';
ALTER TABLE issues ADD COLUMN IF NOT EXISTS last_automation_run TIMESTAMP WITH TIME ZONE;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS automation_metadata JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_issue_workflow_rules_tenant_trigger ON issue_workflow_rules(tenant_id, trigger_event);
CREATE INDEX IF NOT EXISTS idx_issue_escalation_rules_tenant ON issue_escalation_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_issue_escalations_issue ON issue_escalations(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_workflow_history_issue ON issue_workflow_history(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_sla_tracking_issue ON issue_sla_tracking(issue_id);
CREATE INDEX IF NOT EXISTS idx_issues_escalation_level ON issues(escalation_level);
CREATE INDEX IF NOT EXISTS idx_issues_workflow_status ON issues(workflow_status);

-- Insert default workflow rules
INSERT INTO issue_workflow_rules (tenant_id, name, description, trigger_event, conditions, actions, priority) VALUES
-- Auto-assign urgent issues
(gen_random_uuid(), 'Auto-assign Urgent Issues', 'Automatically assign urgent issues to available staff', 'issue_created', 
 '{"priority_level": {"gte": 4}, "assigned_to": null}', 
 '{"action": "auto_assign", "assignment_rule": "round_robin", "notification": true}', 10),

-- Escalate overdue issues
(gen_random_uuid(), 'Escalate Overdue Issues', 'Escalate issues that are past their SLA deadline', 'sla_breach',
 '{"sla_type": "resolution", "breach_duration_hours": {"gte": 2}}',
 '{"action": "escalate", "escalation_level": 1, "notification": true}', 20),

-- Auto-close resolved issues
(gen_random_uuid(), 'Auto-close Resolved Issues', 'Automatically close issues that have been resolved for 24 hours', 'status_changed',
 '{"new_status": "resolved", "resolved_duration_hours": {"gte": 24}}',
 '{"action": "change_status", "new_status": "closed", "notification": true}', 30),

-- Send reminder notifications
(gen_random_uuid(), 'Send Reminder Notifications', 'Send reminders for issues approaching SLA deadline', 'sla_breach',
 '{"sla_type": "resolution", "breach_duration_hours": {"gte": -2, "lt": 0}}',
 '{"action": "send_notification", "template": "sla_reminder", "recipients": ["assignee", "reporter"]}', 40);

-- Insert default escalation rules
INSERT INTO issue_escalation_rules (tenant_id, name, description, trigger_conditions, escalation_path, escalation_delay_hours) VALUES
(gen_random_uuid(), 'Standard Escalation Path', 'Standard escalation for unresolved issues', 
 '{"status": "open", "age_hours": {"gte": 48}}',
 '{"levels": [{"role": "library_staff", "delay_hours": 24}, {"role": "library_owner", "delay_hours": 48}, {"role": "super_admin", "delay_hours": 72}]}', 24);

-- Insert default automation templates
INSERT INTO issue_automation_templates (tenant_id, name, description, template_type, template_data) VALUES
(gen_random_uuid(), 'Urgent Issue Workflow', 'Template for handling urgent issues', 'workflow_rule',
 '{"trigger_event": "issue_created", "conditions": {"priority_level": {"gte": 4}}, "actions": {"auto_assign": true, "notification": true}}'),

(gen_random_uuid(), 'SLA Breach Escalation', 'Template for escalating SLA breaches', 'escalation_rule',
 '{"trigger_conditions": {"sla_breach": true}, "escalation_path": {"levels": [{"role": "library_owner"}, {"role": "super_admin"}]}}'),

(gen_random_uuid(), 'Issue Resolution Notification', 'Template for notifying issue resolution', 'notification_template',
 '{"event": "issue_resolved", "recipients": ["reporter", "assignee"], "template": "resolution_notification"}');















