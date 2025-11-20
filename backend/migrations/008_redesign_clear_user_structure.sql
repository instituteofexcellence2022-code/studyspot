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
-- Identify library owners: users with tenant_id (not platform admins)
-- Check if metadata and user_type columns exist
DO $$
BEGIN
    -- Check which columns exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' AND column_name = 'user_type'
    ) THEN
        -- user_type column exists - use it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_users' AND column_name = 'metadata'
        ) THEN
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
            WHERE (user_type = 'library_owner' OR (tenant_id IS NOT NULL AND user_type IS NULL))
            AND tenant_id IS NOT NULL
            ON CONFLICT (id) DO NOTHING;
        ELSE
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
                '{}'::jsonb as metadata,
                created_at,
                updated_at
            FROM admin_users
            WHERE (user_type = 'library_owner' OR (tenant_id IS NOT NULL AND user_type IS NULL))
            AND tenant_id IS NOT NULL
            ON CONFLICT (id) DO NOTHING;
        END IF;
    ELSE
        -- user_type column doesn't exist - identify by tenant_id and role
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_users' AND column_name = 'metadata'
        ) THEN
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
            WHERE tenant_id IS NOT NULL
            AND role NOT IN ('super_admin', 'admin', 'support', 'analyst', 'sales', 'finance')
            ON CONFLICT (id) DO NOTHING;
        ELSE
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
                '{}'::jsonb as metadata,
                created_at,
                updated_at
            FROM admin_users
            WHERE tenant_id IS NOT NULL
            AND role NOT IN ('super_admin', 'admin', 'support', 'analyst', 'sales', 'finance')
            ON CONFLICT (id) DO NOTHING;
        END IF;
    END IF;
END $$;

-- Migrate platform super admins
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' AND column_name = 'metadata'
    ) THEN
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
        WHERE role = 'super_admin' 
        AND (tenant_id IS NULL OR 
             (EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'user_type') 
              AND (user_type = 'platform_admin' OR user_type IS NULL)))
        ON CONFLICT (id) DO NOTHING;
    ELSE
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
            '{}'::jsonb as metadata,
            created_at,
            updated_at
        FROM admin_users
        WHERE role = 'super_admin' 
        AND tenant_id IS NULL
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Migrate platform staff
-- Check for existence of metadata, department, and permissions columns
DO $$
BEGIN
    -- Check which columns exist
    DECLARE
        has_metadata BOOLEAN;
        has_department BOOLEAN;
        has_permissions BOOLEAN;
    BEGIN
        -- Check column existence
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_users' AND column_name = 'metadata'
        ) INTO has_metadata;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_users' AND column_name = 'department'
        ) INTO has_department;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_users' AND column_name = 'permissions'
        ) INTO has_permissions;
        
        -- Build and execute INSERT based on available columns
        IF has_metadata AND has_department AND has_permissions THEN
            -- All columns exist
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
            AND tenant_id IS NULL
            ON CONFLICT (id) DO NOTHING;
            
        ELSIF has_metadata AND has_department AND NOT has_permissions THEN
            -- metadata and department exist, but permissions doesn't
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
                '[]'::jsonb as permissions, -- Default empty array
                is_active,
                last_login_at,
                last_login_ip,
                COALESCE(metadata, '{}'::jsonb),
                created_at,
                updated_at
            FROM admin_users
            WHERE role IN ('admin', 'support', 'analyst', 'sales', 'finance') 
            AND tenant_id IS NULL
            ON CONFLICT (id) DO NOTHING;
            
        ELSIF has_metadata AND NOT has_department AND has_permissions THEN
            -- metadata and permissions exist, but department doesn't
            INSERT INTO platform_staff (id, email, password_hash, first_name, last_name, phone, role, department, permissions, is_active, last_login_at, last_login_ip, metadata, created_at, updated_at)
            SELECT 
                id,
                email,
                password_hash,
                first_name,
                last_name,
                phone,
                role,
                NULL as department,
                COALESCE(permissions, '[]'::jsonb),
                is_active,
                last_login_at,
                last_login_ip,
                COALESCE(metadata, '{}'::jsonb),
                created_at,
                updated_at
            FROM admin_users
            WHERE role IN ('admin', 'support', 'analyst', 'sales', 'finance') 
            AND tenant_id IS NULL
            ON CONFLICT (id) DO NOTHING;
            
        ELSIF has_metadata AND NOT has_department AND NOT has_permissions THEN
            -- Only metadata exists
            INSERT INTO platform_staff (id, email, password_hash, first_name, last_name, phone, role, department, permissions, is_active, last_login_at, last_login_ip, metadata, created_at, updated_at)
            SELECT 
                id,
                email,
                password_hash,
                first_name,
                last_name,
                phone,
                role,
                NULL as department,
                '[]'::jsonb as permissions,
                is_active,
                last_login_at,
                last_login_ip,
                COALESCE(metadata, '{}'::jsonb),
                created_at,
                updated_at
            FROM admin_users
            WHERE role IN ('admin', 'support', 'analyst', 'sales', 'finance') 
            AND tenant_id IS NULL
            ON CONFLICT (id) DO NOTHING;
            
        ELSIF NOT has_metadata AND has_department AND has_permissions THEN
            -- department and permissions exist, but metadata doesn't
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
                '{}'::jsonb as metadata,
                created_at,
                updated_at
            FROM admin_users
            WHERE role IN ('admin', 'support', 'analyst', 'sales', 'finance') 
            AND tenant_id IS NULL
            ON CONFLICT (id) DO NOTHING;
            
        ELSIF NOT has_metadata AND has_department AND NOT has_permissions THEN
            -- Only department exists
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
                '[]'::jsonb as permissions,
                is_active,
                last_login_at,
                last_login_ip,
                '{}'::jsonb as metadata,
                created_at,
                updated_at
            FROM admin_users
            WHERE role IN ('admin', 'support', 'analyst', 'sales', 'finance') 
            AND tenant_id IS NULL
            ON CONFLICT (id) DO NOTHING;
            
        ELSIF NOT has_metadata AND NOT has_department AND has_permissions THEN
            -- Only permissions exists
            INSERT INTO platform_staff (id, email, password_hash, first_name, last_name, phone, role, department, permissions, is_active, last_login_at, last_login_ip, metadata, created_at, updated_at)
            SELECT 
                id,
                email,
                password_hash,
                first_name,
                last_name,
                phone,
                role,
                NULL as department,
                COALESCE(permissions, '[]'::jsonb),
                is_active,
                last_login_at,
                last_login_ip,
                '{}'::jsonb as metadata,
                created_at,
                updated_at
            FROM admin_users
            WHERE role IN ('admin', 'support', 'analyst', 'sales', 'finance') 
            AND tenant_id IS NULL
            ON CONFLICT (id) DO NOTHING;
            
        ELSE
            -- None of the optional columns exist
            INSERT INTO platform_staff (id, email, password_hash, first_name, last_name, phone, role, department, permissions, is_active, last_login_at, last_login_ip, metadata, created_at, updated_at)
            SELECT 
                id,
                email,
                password_hash,
                first_name,
                last_name,
                phone,
                role,
                NULL as department,
                '[]'::jsonb as permissions,
                is_active,
                last_login_at,
                last_login_ip,
                '{}'::jsonb as metadata,
                created_at,
                updated_at
            FROM admin_users
            WHERE role IN ('admin', 'support', 'analyst', 'sales', 'finance') 
            AND tenant_id IS NULL
            ON CONFLICT (id) DO NOTHING;
        END IF;
    END;
END $$;

-- ============================================
-- STEP 5: UPDATE TENANTS TABLE
-- Link to library_owners instead of admin_users
-- ============================================

-- Update owner_id to reference library_owners
-- Only if tenants table exists and has owner_id column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tenants'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'owner_id'
    ) THEN
        -- Update owner_id to reference library_owners
        UPDATE tenants t
        SET owner_id = (
            SELECT lo.id FROM library_owners lo
            WHERE lo.tenant_id = t.id
            LIMIT 1
        )
        WHERE owner_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM library_owners WHERE tenant_id = t.id);
        
        -- Drop old foreign key if it exists
        ALTER TABLE tenants 
        DROP CONSTRAINT IF EXISTS tenants_owner_id_fkey;
        
        -- Add new foreign key constraint if owner_id column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tenants' AND column_name = 'owner_id'
        ) THEN
            -- Check if constraint already exists
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'tenants' 
                AND constraint_name = 'tenants_owner_id_fkey'
            ) THEN
                ALTER TABLE tenants 
                ADD CONSTRAINT tenants_owner_id_fkey 
                FOREIGN KEY (owner_id) REFERENCES library_owners(id);
            END IF;
        END IF;
    END IF;
END $$;

-- ============================================
-- STEP 6: UPDATE AUDIT LOGS
-- Add user_table column to track which table the user is in
-- ============================================

-- Only update if audit_logs table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'audit_logs'
    ) THEN
        -- Add user_table column if it doesn't exist
        ALTER TABLE audit_logs 
        ADD COLUMN IF NOT EXISTS user_table VARCHAR(50);
        
        -- Add check constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage 
            WHERE table_name = 'audit_logs' 
            AND constraint_name = 'audit_logs_user_table_check'
        ) THEN
            ALTER TABLE audit_logs 
            ADD CONSTRAINT audit_logs_user_table_check 
            CHECK (user_table IN ('platform_admins', 'platform_staff', 'library_owners', 'library_staff', 'students'));
        END IF;
        
        -- Update existing audit logs
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'audit_logs' AND column_name = 'user_type'
        ) THEN
            -- user_type column exists - use it
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
        ELSE
            -- user_type column doesn't exist - identify by user_id
            UPDATE audit_logs 
            SET user_table = CASE 
                WHEN user_id IN (SELECT id FROM platform_admins) THEN 'platform_admins'
                WHEN user_id IN (SELECT id FROM platform_staff) THEN 'platform_staff'
                WHEN user_id IN (SELECT id FROM library_owners) THEN 'library_owners'
                ELSE 'platform_staff' -- Default fallback
            END
            WHERE user_table IS NULL;
        END IF;
    END IF;
END $$;

-- ============================================
-- STEP 7: UPDATE REFRESH TOKENS
-- Add user_table column
-- ============================================

-- Only update if refresh_tokens table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'refresh_tokens'
    ) THEN
        -- Add user_table column if it doesn't exist
        ALTER TABLE refresh_tokens 
        ADD COLUMN IF NOT EXISTS user_table VARCHAR(50);
        
        -- Add check constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage 
            WHERE table_name = 'refresh_tokens' 
            AND constraint_name = 'refresh_tokens_user_table_check'
        ) THEN
            ALTER TABLE refresh_tokens 
            ADD CONSTRAINT refresh_tokens_user_table_check
            CHECK (user_table IN ('platform_admins', 'platform_staff', 'library_owners', 'library_staff', 'students'));
        END IF;
    END IF;
END $$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE library_owners IS 'Library business owners - one per tenant';
COMMENT ON TABLE platform_admins IS 'Platform super administrators - full system access';
COMMENT ON TABLE platform_staff IS 'Platform staff with specific roles (admin, support, analyst, sales, finance)';
COMMENT ON COLUMN audit_logs.user_table IS 'Which table the user belongs to for proper foreign key reference';

