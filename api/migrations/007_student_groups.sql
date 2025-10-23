-- Migration: Student Groups and Enhanced Student Fields
-- Version: 002
-- Description: Adds student groups, KYC fields, and enhanced student management

-- ============================================
-- Student Groups Table
-- ============================================
CREATE TABLE IF NOT EXISTS student_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  library_id INTEGER REFERENCES libraries(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(library_id, name)
);

-- ============================================
-- Student Group Members (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS student_group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES student_groups(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);

-- ============================================
-- Add KYC Fields to Users Table
-- ============================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_documents JSONB,
ADD COLUMN IF NOT EXISTS kyc_verified_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS kyc_notes TEXT;

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_student_groups_library ON student_groups(library_id);
CREATE INDEX IF NOT EXISTS idx_student_group_members_group ON student_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_student_group_members_user ON student_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_kyc_verified ON users(kyc_verified) WHERE role = 'student';
CREATE INDEX IF NOT EXISTS idx_users_library_role ON users(library_id, role);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE student_groups IS 'Student groups for organizing and managing students';
COMMENT ON TABLE student_group_members IS 'Many-to-many relationship between students and groups';
COMMENT ON COLUMN users.student_id IS 'Unique student identifier (e.g., STU-000001)';
COMMENT ON COLUMN users.kyc_verified IS 'Whether student KYC verification is complete';
COMMENT ON COLUMN users.kyc_documents IS 'JSON array of KYC document URLs and metadata';

