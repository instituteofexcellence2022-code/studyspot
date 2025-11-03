-- ============================================
-- TENANT-SPECIFIC DATABASE SCHEMA
-- This schema is created for each tenant's database
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LIBRARIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS libraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    phone VARCHAR(20),
    email VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,
    opening_time TIME,
    closing_time TIME,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_maintenance')),
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    manager_name VARCHAR(255),
    manager_phone VARCHAR(20),
    manager_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_libraries_tenant ON libraries(tenant_id);
CREATE INDEX idx_libraries_status ON libraries(status);
CREATE INDEX idx_libraries_city ON libraries(city);

-- ============================================
-- USERS TABLE (Tenant-specific)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) CHECK (role IN ('owner', 'manager', 'staff')),
    library_id UUID REFERENCES libraries(id),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_library ON users(library_id);

-- ============================================
-- STUDENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_code VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    parent_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    education_level VARCHAR(50),
    course VARCHAR(100),
    institution VARCHAR(255),
    photo_url VARCHAR(500),
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    id_proof_url VARCHAR(500),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_plan VARCHAR(50),
    subscription_start_date DATE,
    subscription_end_date DATE,
    seat_number VARCHAR(20),
    preferred_time_slot VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_students_library ON students(library_id);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_student_code ON students(student_code);

-- ============================================
-- BOOKINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_id UUID REFERENCES students(id),
    seat_number VARCHAR(20),
    booking_type VARCHAR(50) CHECK (booking_type IN ('hourly', 'daily', 'monthly')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_library ON bookings(library_id);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_id UUID REFERENCES students(id),
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    date DATE NOT NULL,
    duration_minutes INTEGER,
    status VARCHAR(50) CHECK (status IN ('present', 'absent', 'late')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_tenant ON attendance(tenant_id);
CREATE INDEX idx_attendance_library ON attendance(library_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date DESC);

-- ============================================
-- PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_id UUID REFERENCES students(id),
    booking_id UUID REFERENCES bookings(id),
    invoice_number VARCHAR(100) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP,
    payment_gateway VARCHAR(50),
    gateway_order_id VARCHAR(255),
    transaction_id VARCHAR(255),
    payment_details JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_library ON payments(library_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);

-- ============================================
-- COMMUNICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_id UUID REFERENCES students(id),
    channel VARCHAR(20) CHECK (channel IN ('sms', 'whatsapp', 'email')),
    type VARCHAR(50),
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    template_id UUID,
    dlt_template_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    credits_used INTEGER DEFAULT 1,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_communications_tenant ON communications(tenant_id);
CREATE INDEX idx_communications_student ON communications(student_id);
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_communications_created_at ON communications(created_at DESC);

-- ============================================
-- TICKETS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_id UUID REFERENCES students(id),
    ticket_number VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id),
    resolution TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX idx_tickets_student ON tickets(student_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- ============================================
-- REFERRALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    referrer_id UUID REFERENCES students(id),
    referred_id UUID REFERENCES students(id),
    referral_code VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
    reward_type VARCHAR(50),
    reward_amount DECIMAL(10,2),
    reward_status VARCHAR(50) DEFAULT 'pending',
    converted_at TIMESTAMP,
    rewarded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_referrals_tenant ON referrals(tenant_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_libraries_updated_at BEFORE UPDATE ON libraries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

