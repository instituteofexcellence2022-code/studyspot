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
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        INSERT INTO library_staff (
            id, tenant_id, library_id, email, password_hash, first_name, last_name, 
            phone, role, is_active, last_login_at, last_login_ip, metadata, created_at, updated_at
        )
        SELECT 
            id,
            tenant_id,
            library_id,
            email,
            password_hash,
            first_name,
            last_name,
            phone,
            CASE 
                WHEN role = 'manager' THEN 'manager'
                ELSE 'general'
            END as role,
            is_active,
            last_login_at,
            last_login_ip,
            COALESCE(metadata, '{}'::jsonb),
            created_at,
            updated_at
        FROM users
        WHERE role IN ('manager', 'staff')
        ON CONFLICT (tenant_id, email) DO NOTHING;
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

