-- ============================================
-- CREATE LIBRARY STAFF TABLE (Tenant Schema)
-- Library staff with different roles
-- This should be run on tenant databases
-- ============================================

-- Note: This migration should be run on each tenant database
-- Or if using shared database, it will be in the tenant schema

CREATE TABLE IF NOT EXISTS library_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('manager', 'receptionist', 'attendance_staff', 'finance_staff', 'general')),
    staff_type VARCHAR(50) CHECK (staff_type IN ('manager', 'receptionist', 'attendance_staff', 'finance_staff', 'general')),
    employee_id VARCHAR(50) UNIQUE,
    hire_date DATE,
    salary DECIMAL(10,2),
    employment_status VARCHAR(50) DEFAULT 'active' 
        CHECK (employment_status IN ('active', 'on_leave', 'terminated', 'resigned')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_library_staff_tenant ON library_staff(tenant_id);
CREATE INDEX idx_library_staff_library ON library_staff(library_id);
CREATE INDEX idx_library_staff_email ON library_staff(email);
CREATE INDEX idx_library_staff_role ON library_staff(role);
CREATE INDEX idx_library_staff_employment_status ON library_staff(employment_status);
CREATE INDEX idx_library_staff_employee_id ON library_staff(employee_id);

-- Migrate from users table if it exists (optional - only if users table has data)
DO $$
DECLARE
    has_library_id BOOLEAN;
    has_password_hash BOOLEAN;
    has_metadata BOOLEAN;
    has_last_login_at BOOLEAN;
    has_last_login_ip BOOLEAN;
    has_is_active BOOLEAN;
    has_first_name BOOLEAN;
    has_last_name BOOLEAN;
    has_phone BOOLEAN;
    has_permissions BOOLEAN;
    has_staff_type BOOLEAN;
    has_employee_id BOOLEAN;
    has_hire_date BOOLEAN;
    has_salary BOOLEAN;
    has_employment_status BOOLEAN;
    has_created_at BOOLEAN;
    has_updated_at BOOLEAN;
    column_list TEXT;
    select_list TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Check which columns exist in users table
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'library_id'
        ) INTO has_library_id;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'password_hash'
        ) INTO has_password_hash;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'metadata'
        ) INTO has_metadata;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'last_login_at'
        ) INTO has_last_login_at;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'last_login_ip'
        ) INTO has_last_login_ip;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'is_active'
        ) INTO has_is_active;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'first_name'
        ) INTO has_first_name;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'last_name'
        ) INTO has_last_name;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'phone'
        ) INTO has_phone;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'permissions'
        ) INTO has_permissions;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'staff_type'
        ) INTO has_staff_type;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'employee_id'
        ) INTO has_employee_id;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'hire_date'
        ) INTO has_hire_date;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'salary'
        ) INTO has_salary;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'employment_status'
        ) INTO has_employment_status;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'created_at'
        ) INTO has_created_at;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'updated_at'
        ) INTO has_updated_at;
        
        -- Build dynamic column and select lists based on what exists
        column_list := 'id, tenant_id';
        select_list := 'id, tenant_id';
        
        IF has_library_id THEN
            column_list := column_list || ', library_id';
            select_list := select_list || ', library_id';
        ELSE
            column_list := column_list || ', library_id';
            select_list := select_list || ', NULL as library_id';
        END IF;
        
        column_list := column_list || ', email';
        select_list := select_list || ', email';
        
        IF has_password_hash THEN
            column_list := column_list || ', password_hash';
            select_list := select_list || ', password_hash';
        ELSE
            -- Generate a placeholder password hash if password_hash doesn't exist
            -- This should never be used for login, but allows migration to complete
            column_list := column_list || ', password_hash';
            select_list := select_list || ', ''$2b$10$PLACEHOLDER.DO.NOT.USE.FOR.LOGIN'' as password_hash';
        END IF;
        
        -- Handle first_name (NOT NULL in library_staff, so provide default)
        column_list := column_list || ', first_name';
        IF has_first_name THEN
            select_list := select_list || ', COALESCE(first_name, ''Staff'')';
        ELSE
            select_list := select_list || ', ''Staff'' as first_name';
        END IF;
        
        -- Handle last_name
        column_list := column_list || ', last_name';
        IF has_last_name THEN
            select_list := select_list || ', last_name';
        ELSE
            select_list := select_list || ', NULL as last_name';
        END IF;
        
        -- Handle phone
        column_list := column_list || ', phone';
        IF has_phone THEN
            select_list := select_list || ', phone';
        ELSE
            select_list := select_list || ', NULL as phone';
        END IF;
        
        -- Handle role (always required, map manager/staff to appropriate roles)
        column_list := column_list || ', role';
        select_list := select_list || ', CASE WHEN role = ''manager'' THEN ''manager'' ELSE ''general'' END as role';
        
        -- Handle staff_type (new column from migration 006)
        column_list := column_list || ', staff_type';
        IF has_staff_type THEN
            select_list := select_list || ', staff_type';
        ELSE
            -- Map role to staff_type if staff_type doesn't exist
            select_list := select_list || ', CASE WHEN role = ''manager'' THEN ''manager'' ELSE ''general'' END as staff_type';
        END IF;
        
        -- Handle employee_id (new column from migration 006)
        column_list := column_list || ', employee_id';
        IF has_employee_id THEN
            select_list := select_list || ', employee_id';
        ELSE
            select_list := select_list || ', NULL as employee_id';
        END IF;
        
        -- Handle hire_date (new column from migration 006)
        column_list := column_list || ', hire_date';
        IF has_hire_date THEN
            select_list := select_list || ', hire_date';
        ELSE
            select_list := select_list || ', NULL as hire_date';
        END IF;
        
        -- Handle salary (new column from migration 006)
        column_list := column_list || ', salary';
        IF has_salary THEN
            select_list := select_list || ', salary';
        ELSE
            select_list := select_list || ', NULL as salary';
        END IF;
        
        -- Handle employment_status (new column from migration 006)
        column_list := column_list || ', employment_status';
        IF has_employment_status THEN
            select_list := select_list || ', employment_status';
        ELSIF has_is_active THEN
            -- Use is_active to determine employment_status if employment_status doesn't exist
            select_list := select_list || ', CASE WHEN is_active THEN ''active'' ELSE ''terminated'' END as employment_status';
        ELSE
            -- Default to 'active' if neither exists
            select_list := select_list || ', ''active'' as employment_status';
        END IF;
        
        -- Handle permissions
        column_list := column_list || ', permissions';
        IF has_permissions THEN
            select_list := select_list || ', COALESCE(permissions, ''{}''::jsonb)';
        ELSE
            select_list := select_list || ', ''{}''::jsonb as permissions';
        END IF;
        
        -- Handle is_active
        column_list := column_list || ', is_active';
        IF has_is_active THEN
            select_list := select_list || ', is_active';
        ELSE
            select_list := select_list || ', true as is_active';
        END IF;
        
        IF has_last_login_at THEN
            column_list := column_list || ', last_login_at';
            select_list := select_list || ', last_login_at';
        ELSE
            column_list := column_list || ', last_login_at';
            select_list := select_list || ', NULL as last_login_at';
        END IF;
        
        IF has_last_login_ip THEN
            column_list := column_list || ', last_login_ip';
            select_list := select_list || ', last_login_ip';
        ELSE
            column_list := column_list || ', last_login_ip';
            select_list := select_list || ', NULL as last_login_ip';
        END IF;
        
        IF has_metadata THEN
            column_list := column_list || ', metadata';
            select_list := select_list || ', COALESCE(metadata, ''{}''::jsonb)';
        ELSE
            column_list := column_list || ', metadata';
            select_list := select_list || ', ''{}''::jsonb as metadata';
        END IF;
        
        -- Handle created_at
        column_list := column_list || ', created_at';
        IF has_created_at THEN
            select_list := select_list || ', created_at';
        ELSE
            select_list := select_list || ', NOW() as created_at';
        END IF;
        
        -- Handle updated_at
        column_list := column_list || ', updated_at';
        IF has_updated_at THEN
            select_list := select_list || ', updated_at';
        ELSE
            select_list := select_list || ', NOW() as updated_at';
        END IF;
        
        -- Execute dynamic migration
        EXECUTE format('
            INSERT INTO library_staff (%s)
            SELECT %s
            FROM users
            WHERE role IN (''manager'', ''staff'')
            ON CONFLICT (tenant_id, email) DO NOTHING
        ', column_list, select_list);
        
        RAISE NOTICE 'Migrated data from users table to library_staff';
    END IF;
END $$;

-- Add trigger for updated_at
CREATE TRIGGER update_library_staff_updated_at 
BEFORE UPDATE ON library_staff 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE library_staff IS 'Library staff members (managers, receptionists, etc.) - NOT library owners';
COMMENT ON COLUMN library_staff.role IS 'manager: Can manage library operations, others: Limited access';
COMMENT ON COLUMN library_staff.staff_type IS 'Specific staff role for granular permissions';

