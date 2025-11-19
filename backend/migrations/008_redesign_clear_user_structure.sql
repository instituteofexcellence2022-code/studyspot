-- ============================================
-- CLEAR USER STRUCTURE REDESIGN
-- 5 distinct user types with clear separation:
-- 1. Students (tenant database: students table)
-- 2. Library Owners (core database: library_owners table)
-- 3. Library Staff (tenant database: library_staff table)
-- 4. Platform Super Admin (core database: platform_admins table)
-- 5. Platform Staff (core database: platform_staff table)
-- ============================================

-- ============================================
-- STEP 1: CREATE LIBRARY OWNERS TABLE
-- Separate from admin_users for clarity
-- ============================================

CREATE TABLE IF NOT EXISTS library_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_library_owners_tenant ON library_owners(tenant_id);
CREATE INDEX idx_library_owners_email ON library_owners(email);
CREATE INDEX idx_library_owners_is_active ON library_owners(is_active);

-- ============================================
-- STEP 2: CREATE PLATFORM ADMINS TABLE
-- Super admins only
-- ============================================

CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_platform_admins_email ON platform_admins(email);
CREATE INDEX idx_platform_admins_is_active ON platform_admins(is_active);

-- ============================================
-- STEP 3: CREATE PLATFORM STAFF TABLE
-- Platform staff with different roles
-- ============================================

CREATE TABLE IF NOT EXISTS platform_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'support', 'analyst', 'sales', 'finance')),
    department VARCHAR(50) CHECK (department IN ('management', 'sales', 'finance', 'operations', 'hr', 'support')),
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_platform_staff_email ON platform_staff(email);
CREATE INDEX idx_platform_staff_role ON platform_staff(role);
CREATE INDEX idx_platform_staff_is_active ON platform_staff(is_active);

-- ============================================
-- STEP 4: MIGRATE DATA FROM admin_users
-- ============================================

-- Migrate library owners
INSERT INTO library_owners (id, tenant_id, email, password_hash, first_name, last_name, phone, is_active, last_login_at, last_login_ip, metadata, created_at, updated_at)
SELECT 
    id,
    tenant_id,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    is_active,
    last_login_at,
    last_login_ip,
    COALESCE(metadata, '{}'::jsonb),
    created_at,
    updated_at
FROM admin_users
WHERE user_type = 'library_owner' OR (tenant_id IS NOT NULL AND user_type IS NULL)
ON CONFLICT (id) DO NOTHING;

-- Migrate platform super admins
INSERT INTO platform_admins (id, email, password_hash, first_name, last_name, phone, is_active, last_login_at, last_login_ip, metadata, created_at, updated_at)
SELECT 
    id,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    is_active,
    last_login_at,
    last_login_ip,
    COALESCE(metadata, '{}'::jsonb),
    created_at,
    updated_at
FROM admin_users
WHERE role = 'super_admin' AND (user_type = 'platform_admin' OR user_type IS NULL OR tenant_id IS NULL)
ON CONFLICT (id) DO NOTHING;

-- Migrate platform staff
INSERT INTO platform_staff (id, email, password_hash, first_name, last_name, phone, role, department, permissions, is_active, last_login_at, last_login_ip, metadata, created_at, updated_at)
SELECT 
    id,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    role,
    department,
    COALESCE(permissions, '[]'::jsonb),
    is_active,
    last_login_at,
    last_login_ip,
    COALESCE(metadata, '{}'::jsonb),
    created_at,
    updated_at
FROM admin_users
WHERE role IN ('admin', 'support', 'analyst', 'sales', 'finance') 
AND (user_type = 'platform_admin' OR user_type IS NULL OR tenant_id IS NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 5: UPDATE TENANTS TABLE
-- Link to library_owners instead of admin_users
-- ============================================

-- Update owner_id to reference library_owners
UPDATE tenants t
SET owner_id = (
    SELECT lo.id FROM library_owners lo
    WHERE lo.tenant_id = t.id
    LIMIT 1
)
WHERE owner_id IS NOT NULL
AND EXISTS (SELECT 1 FROM library_owners WHERE tenant_id = t.id);

-- Drop old foreign key and add new one
ALTER TABLE tenants 
DROP CONSTRAINT IF EXISTS tenants_owner_id_fkey;

ALTER TABLE tenants 
ADD CONSTRAINT tenants_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES library_owners(id);

-- ============================================
-- STEP 6: UPDATE AUDIT LOGS
-- Add user_table column to track which table the user is in
-- ============================================

ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS user_table VARCHAR(50) 
CHECK (user_table IN ('platform_admins', 'platform_staff', 'library_owners', 'library_staff', 'students'));

-- Update existing audit logs
UPDATE audit_logs 
SET user_table = CASE 
    WHEN user_type = 'platform_admin' AND user_id IN (SELECT id FROM platform_admins) THEN 'platform_admins'
    WHEN user_type = 'platform_admin' AND user_id IN (SELECT id FROM platform_staff) THEN 'platform_staff'
    WHEN user_type = 'library_owner' AND user_id IN (SELECT id FROM library_owners) THEN 'library_owners'
    WHEN user_type = 'library_staff' THEN 'library_staff'
    WHEN user_type = 'student' THEN 'students'
    ELSE 'platform_staff' -- Default fallback
END
WHERE user_table IS NULL;

-- ============================================
-- STEP 7: UPDATE REFRESH TOKENS
-- Add user_table column
-- ============================================

ALTER TABLE refresh_tokens 
ADD COLUMN IF NOT EXISTS user_table VARCHAR(50)
CHECK (user_table IN ('platform_admins', 'platform_staff', 'library_owners', 'library_staff', 'students'));

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE library_owners IS 'Library business owners - one per tenant';
COMMENT ON TABLE platform_admins IS 'Platform super administrators - full system access';
COMMENT ON TABLE platform_staff IS 'Platform staff with specific roles (admin, support, analyst, sales, finance)';
COMMENT ON COLUMN audit_logs.user_table IS 'Which table the user belongs to for proper foreign key reference';

