-- ============================================================================
-- STUDYSPOT COMPLETE DATABASE SCHEMA SETUP
-- ============================================================================
-- This script creates ALL necessary tables for the StudySpot platform
-- Run this ONCE in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. COMMUNITIES TABLE (Groups & Communities)
-- ============================================================================
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'community', -- 'community' or 'group'
    library_id UUID REFERENCES libraries(id) ON DELETE CASCADE, -- NULL for exam communities, set for library groups
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    member_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_communities_type ON communities(type);
CREATE INDEX IF NOT EXISTS idx_communities_library_id ON communities(library_id);
CREATE INDEX IF NOT EXISTS idx_communities_is_active ON communities(is_active);

-- ============================================================================
-- 2. COMMUNITY MEMBERS TABLE (Privacy + Membership)
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'moderator', 'member'
    privacy_enabled BOOLEAN DEFAULT false, -- Individual privacy setting
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_privacy ON community_members(privacy_enabled);

-- ============================================================================
-- 3. COMMUNITY MESSAGES TABLE (Chat Messages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL, -- Real name (always stored)
    display_name VARCHAR(255), -- Anonymous name if privacy enabled
    message TEXT NOT NULL,
    privacy_enabled BOOLEAN DEFAULT false, -- Snapshot of sender's privacy choice at message time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_messages_community_id ON community_messages(community_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at DESC);

-- ============================================================================
-- 4. ATTENDANCE TABLE (QR-Based Attendance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- Auto-calculated on check-out
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_library_id ON attendance(library_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON attendance(check_in_time DESC);

-- ============================================================================
-- 5. ADD MISSING COLUMNS TO EXISTING TABLES (If they exist)
-- ============================================================================

-- Add privacy_enabled to community_members (if column doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'community_members' AND column_name = 'privacy_enabled'
    ) THEN
        ALTER TABLE community_members ADD COLUMN privacy_enabled BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add display_name to community_messages (if column doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'community_messages' AND column_name = 'display_name'
    ) THEN
        ALTER TABLE community_messages ADD COLUMN display_name VARCHAR(255);
    END IF;
END $$;

-- Add privacy_enabled to community_messages (if column doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'community_messages' AND column_name = 'privacy_enabled'
    ) THEN
        ALTER TABLE community_messages ADD COLUMN privacy_enabled BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Communities: Everyone can read active communities
CREATE POLICY "Communities are viewable by everyone" 
ON communities FOR SELECT 
USING (is_active = true);

-- Communities: Only owners can create
CREATE POLICY "Library owners can create communities" 
ON communities FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Community Members: Members can view their memberships
CREATE POLICY "Members can view their memberships" 
ON community_members FOR SELECT 
USING (auth.uid() = user_id);

-- Community Members: Members can update their own privacy
CREATE POLICY "Members can update their own privacy" 
ON community_members FOR UPDATE 
USING (auth.uid() = user_id);

-- Community Messages: Members can view messages in their communities
CREATE POLICY "Members can view messages in their communities" 
ON community_messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM community_members 
        WHERE community_members.community_id = community_messages.community_id 
        AND community_members.user_id = auth.uid()
    )
);

-- Community Messages: Members can send messages
CREATE POLICY "Members can send messages" 
ON community_messages FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members 
        WHERE community_members.community_id = community_messages.community_id 
        AND community_members.user_id = auth.uid()
    )
);

-- Attendance: Users can view their own attendance
CREATE POLICY "Users can view their own attendance" 
ON attendance FOR SELECT 
USING (auth.uid() = user_id);

-- Attendance: Users can create their own attendance
CREATE POLICY "Users can create their own attendance" 
ON attendance FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Attendance: Users can update their own attendance
CREATE POLICY "Users can update their own attendance" 
ON attendance FOR UPDATE 
USING (auth.uid() = user_id);

-- ============================================================================
-- 7. FUNCTIONS & TRIGGERS (Auto-update timestamps)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for communities table
DROP TRIGGER IF EXISTS update_communities_updated_at ON communities;
CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON communities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for attendance table
DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;
CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Create a sample exam community (NEET)
INSERT INTO communities (name, description, type, is_active)
VALUES 
    ('NEET Preparation 2025', 'Connect with fellow NEET aspirants, share resources, and study together!', 'community', true),
    ('JEE Advanced 2025', 'Collaborate with JEE Advanced students, discuss problems, and prepare together!', 'community', true),
    ('UPSC Civil Services', 'A community for UPSC aspirants to share strategies, resources, and motivation!', 'community', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE '✅ StudySpot Database Schema Setup Complete!';
    RAISE NOTICE '📊 Tables created: communities, community_members, community_messages, attendance';
    RAISE NOTICE '🔒 Row Level Security (RLS) policies applied';
    RAISE NOTICE '⚙️ Triggers and functions configured';
    RAISE NOTICE '🎉 Your database is ready for all features!';
END $$;

