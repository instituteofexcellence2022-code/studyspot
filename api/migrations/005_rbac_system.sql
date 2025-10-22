-- ============================================
-- Migration 005: RBAC (Role-Based Access Control) System
-- Created by: Agent 1 (Backend Developer)
-- Date: October 21, 2025
-- Description: Complete RBAC with roles, permissions, and assignments
-- ============================================

-- ============================================
-- 1. PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'libraries.create', 'bookings.view'
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL, -- libraries, bookings, users, etc.
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, manage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_permission_resource_action UNIQUE(resource, action)
);

-- Index for permissions
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);

-- ============================================
-- 2. ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for system roles
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false, -- true for super_admin, library_owner, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- System roles are unique globally, custom roles are unique per tenant
    CONSTRAINT unique_system_role UNIQUE(name) WHERE is_system = true,
    CONSTRAINT unique_tenant_role UNIQUE(tenant_id, name) WHERE is_system = false
);

-- Indexes for roles
CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roles_system ON roles(is_system) WHERE is_system = true;
CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(is_active) WHERE is_active = true;

-- ============================================
-- 3. ROLE PERMISSIONS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_role_permission UNIQUE(role_id, permission_id)
);

-- Indexes for role_permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

-- ============================================
-- 4. USER ROLES (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_user_role UNIQUE(user_id, role_id)
);

-- Indexes for user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- 5. PERMISSION OVERRIDES (User-specific permissions)
-- ============================================
CREATE TABLE IF NOT EXISTS user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN NOT NULL DEFAULT true, -- true = grant, false = revoke
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_user_permission UNIQUE(user_id, permission_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_user ON user_permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_permission ON user_permission_overrides(permission_id);

-- ============================================
-- 6. SEED SYSTEM PERMISSIONS
-- ============================================
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
    -- Library Management
    ('libraries.create', 'Create Libraries', 'Create new library locations', 'libraries', 'create'),
    ('libraries.read', 'View Libraries', 'View library details', 'libraries', 'read'),
    ('libraries.update', 'Update Libraries', 'Edit library information', 'libraries', 'update'),
    ('libraries.delete', 'Delete Libraries', 'Remove libraries', 'libraries', 'delete'),
    ('libraries.manage', 'Manage Libraries', 'Full library management access', 'libraries', 'manage'),
    
    -- Booking Management
    ('bookings.create', 'Create Bookings', 'Create new bookings', 'bookings', 'create'),
    ('bookings.read', 'View Bookings', 'View booking details', 'bookings', 'read'),
    ('bookings.update', 'Update Bookings', 'Modify bookings', 'bookings', 'update'),
    ('bookings.delete', 'Cancel Bookings', 'Cancel/delete bookings', 'bookings', 'delete'),
    ('bookings.manage', 'Manage Bookings', 'Full booking management', 'bookings', 'manage'),
    
    -- User Management
    ('users.create', 'Create Users', 'Add new users', 'users', 'create'),
    ('users.read', 'View Users', 'View user information', 'users', 'read'),
    ('users.update', 'Update Users', 'Edit user details', 'users', 'update'),
    ('users.delete', 'Delete Users', 'Remove users', 'users', 'delete'),
    ('users.manage', 'Manage Users', 'Full user management', 'users', 'manage'),
    
    -- Subscription Management
    ('subscriptions.read', 'View Subscriptions', 'View subscription details', 'subscriptions', 'read'),
    ('subscriptions.update', 'Update Subscriptions', 'Change subscription plans', 'subscriptions', 'update'),
    ('subscriptions.manage', 'Manage Subscriptions', 'Full subscription management', 'subscriptions', 'manage'),
    
    -- Tenant Management
    ('tenants.create', 'Create Tenants', 'Onboard new tenants', 'tenants', 'create'),
    ('tenants.read', 'View Tenants', 'View tenant information', 'tenants', 'read'),
    ('tenants.update', 'Update Tenants', 'Modify tenant details', 'tenants', 'update'),
    ('tenants.delete', 'Delete Tenants', 'Remove tenants', 'tenants', 'delete'),
    ('tenants.manage', 'Manage Tenants', 'Full tenant management', 'tenants', 'manage'),
    
    -- Analytics & Reports
    ('analytics.read', 'View Analytics', 'Access analytics and reports', 'analytics', 'read'),
    ('analytics.export', 'Export Analytics', 'Export analytics data', 'analytics', 'export'),
    
    -- Settings Management
    ('settings.read', 'View Settings', 'View system settings', 'settings', 'read'),
    ('settings.update', 'Update Settings', 'Modify system settings', 'settings', 'update'),
    
    -- Role Management
    ('roles.create', 'Create Roles', 'Create custom roles', 'roles', 'create'),
    ('roles.read', 'View Roles', 'View role information', 'roles', 'read'),
    ('roles.update', 'Update Roles', 'Modify roles', 'roles', 'update'),
    ('roles.delete', 'Delete Roles', 'Remove roles', 'roles', 'delete'),
    ('roles.assign', 'Assign Roles', 'Assign roles to users', 'roles', 'assign')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 7. SEED SYSTEM ROLES
-- ============================================
INSERT INTO roles (name, display_name, description, is_system, is_active) VALUES
    ('super_admin', 'Super Administrator', 'Full platform access - can manage all tenants', true, true),
    ('library_owner', 'Library Owner', 'Tenant owner - can manage their library', true, true),
    ('library_manager', 'Library Manager', 'Can manage library operations and bookings', true, true),
    ('staff', 'Staff Member', 'Can manage bookings and users', true, true),
    ('customer', 'Customer', 'Regular customer - can make bookings', true, true)
ON CONFLICT ON CONSTRAINT unique_system_role DO NOTHING;

-- ============================================
-- 8. ASSIGN PERMISSIONS TO SYSTEM ROLES
-- ============================================

-- Super Admin: ALL PERMISSIONS
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Library Owner: Full access to own tenant
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'library_owner'
AND p.resource IN ('libraries', 'bookings', 'users', 'subscriptions', 'analytics', 'settings')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Library Manager: Manage libraries and bookings
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'library_manager'
AND p.name IN (
    'libraries.read', 'libraries.update',
    'bookings.manage',
    'users.read', 'users.create', 'users.update',
    'analytics.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Staff: Manage bookings and view users
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'staff'
AND p.name IN (
    'libraries.read',
    'bookings.create', 'bookings.read', 'bookings.update',
    'users.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Customer: Create and view own bookings
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'customer'
AND p.name IN (
    'libraries.read',
    'bookings.create', 'bookings.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================
-- 9. MIGRATE EXISTING USERS TO ROLE SYSTEM
-- ============================================

-- Assign roles based on existing user.role column
DO $$
DECLARE
    super_admin_role_id UUID;
    library_owner_role_id UUID;
    customer_role_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO super_admin_role_id FROM roles WHERE name = 'super_admin';
    SELECT id INTO library_owner_role_id FROM roles WHERE name = 'library_owner';
    SELECT id INTO customer_role_id FROM roles WHERE name = 'customer';
    
    -- Assign super_admin role
    INSERT INTO user_roles (user_id, role_id)
    SELECT id, super_admin_role_id
    FROM users
    WHERE role = 'super_admin'
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    -- Assign library_owner role
    INSERT INTO user_roles (user_id, role_id)
    SELECT id, library_owner_role_id
    FROM users
    WHERE role = 'library_owner'
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    -- Assign customer role
    INSERT INTO user_roles (user_id, role_id)
    SELECT id, customer_role_id
    FROM users
    WHERE role = 'customer' OR role IS NULL OR role NOT IN ('super_admin', 'library_owner')
    ON CONFLICT (user_id, role_id) DO NOTHING;
END $$;

-- ============================================
-- 10. HELPER FUNCTIONS
-- ============================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN;
BEGIN
    -- Check user permission overrides first
    SELECT granted INTO has_perm
    FROM user_permission_overrides upo
    JOIN permissions p ON upo.permission_id = p.id
    WHERE upo.user_id = p_user_id
    AND p.name = p_permission_name
    AND (upo.expires_at IS NULL OR upo.expires_at > NOW());
    
    IF has_perm IS NOT NULL THEN
        RETURN has_perm;
    END IF;
    
    -- Check role permissions
    SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
        AND p.name = p_permission_name
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    ) INTO has_perm;
    
    RETURN COALESCE(has_perm, false);
END;
$$ LANGUAGE plpgsql;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(permission_name VARCHAR, permission_display_name VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name, p.display_name
    FROM permissions p
    WHERE 
        -- From roles
        EXISTS (
            SELECT 1
            FROM user_roles ur
            JOIN role_permissions rp ON ur.role_id = rp.role_id
            WHERE ur.user_id = p_user_id
            AND rp.permission_id = p.id
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
        -- Or from overrides (granted = true)
        OR EXISTS (
            SELECT 1
            FROM user_permission_overrides upo
            WHERE upo.user_id = p_user_id
            AND upo.permission_id = p.id
            AND upo.granted = true
            AND (upo.expires_at IS NULL OR upo.expires_at > NOW())
        )
    -- Exclude if explicitly revoked
    AND NOT EXISTS (
        SELECT 1
        FROM user_permission_overrides upo
        WHERE upo.user_id = p_user_id
        AND upo.permission_id = p.id
        AND upo.granted = false
        AND (upo.expires_at IS NULL OR upo.expires_at > NOW())
    )
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. TRIGGERS FOR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created:
--   1. permissions (33 system permissions)
--   2. roles (5 system roles)
--   3. role_permissions (role-permission mappings)
--   4. user_roles (user-role assignments)
--   5. user_permission_overrides (granular permissions)
--
-- Functions created:
--   1. user_has_permission() - Check permission
--   2. get_user_permissions() - Get all user permissions
--
-- Indexes created for performance
-- Existing users migrated to role system
-- ============================================



