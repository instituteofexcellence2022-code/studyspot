-- =============================================
-- ⚠️ DEPRECATED - USE COMPLETE_SCHEMA_SETUP.sql INSTEAD
-- =============================================
-- This file assumed tables already existed, causing the error:
-- "relation 'community_members' does not exist"
-- 
-- ✅ USE THIS INSTEAD: COMPLETE_SCHEMA_SETUP.sql
-- =============================================

-- =============================================
-- 1. COMMUNITY MEMBERS - Privacy & Management
-- =============================================

-- Add privacy mode column (individual student choice)
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS privacy_enabled BOOLEAN DEFAULT FALSE;

-- Add blocking functionality
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;

ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- Add member tracking
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS added_by VARCHAR(255);

ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS joined_via VARCHAR(50) DEFAULT 'manual';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_members_privacy 
ON community_members(community_id, user_id, privacy_enabled);

CREATE INDEX IF NOT EXISTS idx_community_members_blocked 
ON community_members(community_id, is_blocked);

-- =============================================
-- 2. COMMUNITY MESSAGES - Display Names & Privacy
-- =============================================

-- Add display name for privacy mode
ALTER TABLE community_messages 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

-- Track sender's privacy choice at message time
ALTER TABLE community_messages 
ADD COLUMN IF NOT EXISTS privacy_enabled BOOLEAN DEFAULT FALSE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_messages_privacy 
ON community_messages(community_id, privacy_enabled);

-- =============================================
-- 3. COMMUNITY INVITES - Invite Link System
-- =============================================

CREATE TABLE IF NOT EXISTS community_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL,
  invite_code VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invites_code 
ON community_invites(invite_code);

CREATE INDEX IF NOT EXISTS idx_invites_community 
ON community_invites(community_id);

CREATE INDEX IF NOT EXISTS idx_invites_active 
ON community_invites(is_active, expires_at);

-- =============================================
-- 4. ATTENDANCE - QR-Based Attendance Tracking
-- =============================================

CREATE TABLE IF NOT EXISTS attendance (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Student information
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  
  -- Library information
  library_id VARCHAR(255) NOT NULL,
  library_name VARCHAR(255),
  
  -- Check-in details
  check_in_time TIMESTAMP NOT NULL,
  check_in_method VARCHAR(50) DEFAULT 'qr-code',
  check_in_location VARCHAR(255),
  
  -- Check-out details
  check_out_time TIMESTAMP,
  check_out_method VARCHAR(50) DEFAULT 'qr-code',
  check_out_location VARCHAR(255),
  
  -- Duration calculation
  duration_minutes INT,
  duration VARCHAR(50),
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'checked-in',  -- 'checked-in' or 'checked-out'
  date DATE NOT NULL,
  
  -- QR code data (for audit trail)
  qr_data TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_user 
ON attendance(user_id);

CREATE INDEX IF NOT EXISTS idx_attendance_library 
ON attendance(library_id);

CREATE INDEX IF NOT EXISTS idx_attendance_date 
ON attendance(date);

CREATE INDEX IF NOT EXISTS idx_attendance_status 
ON attendance(status);

-- Index for finding active sessions (no check-out yet)
CREATE INDEX IF NOT EXISTS idx_attendance_active 
ON attendance(user_id, library_id, check_out_time) 
WHERE check_out_time IS NULL;

-- =============================================
-- 5. VERIFICATION QUERIES
-- =============================================

-- Check if tables exist
SELECT 
  'community_members' as table_name,
  COUNT(*) as row_count
FROM community_members
UNION ALL
SELECT 
  'community_messages',
  COUNT(*)
FROM community_messages
UNION ALL
SELECT 
  'community_invites',
  COUNT(*)
FROM community_invites
UNION ALL
SELECT 
  'attendance',
  COUNT(*)
FROM attendance;

-- Check new columns exist
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'community_members'
  AND column_name IN ('privacy_enabled', 'is_blocked', 'blocked_at', 'block_reason', 'added_by', 'joined_via')
ORDER BY column_name;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'community_messages'
  AND column_name IN ('display_name', 'privacy_enabled')
ORDER BY column_name;

-- =============================================
-- 6. SAMPLE DATA (Optional - for testing)
-- =============================================

-- Uncomment to add sample attendance record
/*
INSERT INTO attendance (
  user_id,
  user_name,
  library_id,
  library_name,
  check_in_time,
  check_in_method,
  status,
  date
) VALUES (
  'student-001',
  'Test Student',
  'lib-001',
  'Test Library',
  NOW(),
  'qr-code',
  'checked-in',
  CURRENT_DATE
);
*/

-- =============================================
-- MIGRATION COMPLETE!
-- =============================================

-- Run this final query to verify everything is ready:
SELECT 
  'Migration Complete!' as status,
  'All tables and columns added successfully' as message,
  NOW() as completed_at;

