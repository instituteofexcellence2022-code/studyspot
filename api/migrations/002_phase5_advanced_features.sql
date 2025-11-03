-- Phase 5: Advanced Features Database Schema
-- Study Sessions, Timers, Gamification, Community Features, IoT, and Analytics

-- ============================================
-- STUDY TOOLS & PRODUCTIVITY
-- ============================================

-- Study Sessions Table
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    session_type VARCHAR(50) NOT NULL DEFAULT 'pomodoro', -- pomodoro, custom, flexible
    settings JSONB, -- Timer settings
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, completed, cancelled
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    total_focus_time DECIMAL(10, 2) DEFAULT 0, -- in minutes
    total_break_time DECIMAL(10, 2) DEFAULT 0, -- in minutes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Study Timers Table
CREATE TABLE IF NOT EXISTS study_timers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timer_type VARCHAR(20) NOT NULL, -- focus, break, short_break, long_break
    duration_minutes INTEGER NOT NULL,
    actual_duration DECIMAL(10, 2), -- Actual duration completed
    started_at TIMESTAMP NOT NULL,
    paused_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'running', -- running, paused, completed, cancelled
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for study tools
CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_status ON study_sessions(status);
CREATE INDEX idx_study_sessions_started ON study_sessions(started_at);
CREATE INDEX idx_study_timers_session ON study_timers(session_id);
CREATE INDEX idx_study_timers_user ON study_timers(user_id);

-- ============================================
-- GAMIFICATION SYSTEM
-- ============================================

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- study, booking, social, milestone
    points INTEGER DEFAULT 0,
    badge_icon VARCHAR(255),
    badge_color VARCHAR(50),
    requirement JSONB, -- Requirements to unlock
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    progress DECIMAL(5, 2) DEFAULT 0, -- Progress percentage
    is_completed BOOLEAN DEFAULT false,
    UNIQUE(user_id, achievement_id)
);

-- User Points Table
CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    study_points INTEGER DEFAULT 0,
    booking_points INTEGER DEFAULT 0,
    social_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Points History Table
CREATE TABLE IF NOT EXISTS points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason VARCHAR(255),
    category VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for gamification
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(is_completed);
CREATE INDEX idx_user_points_user ON user_points(user_id);
CREATE INDEX idx_user_points_total ON user_points(total_points);
CREATE INDEX idx_points_history_user ON points_history(user_id);

-- ============================================
-- COMMUNITY FEATURES
-- ============================================

-- Study Groups Table
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    library_id UUID REFERENCES libraries(id) ON DELETE SET NULL,
    max_members INTEGER DEFAULT 10,
    is_private BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active', -- active, archived
    cover_image VARCHAR(500),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Study Group Members Table
CREATE TABLE IF NOT EXISTS study_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- admin, moderator, member
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Shared Notes Table
CREATE TABLE IF NOT EXISTS shared_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
    library_id UUID REFERENCES libraries(id) ON DELETE SET NULL,
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Discussion Forums Table
CREATE TABLE IF NOT EXISTS forum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
    category VARCHAR(100),
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Forum Replies Table
CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT false,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for community features
CREATE INDEX idx_study_groups_creator ON study_groups(created_by);
CREATE INDEX idx_study_groups_status ON study_groups(status);
CREATE INDEX idx_group_members_group ON study_group_members(group_id);
CREATE INDEX idx_group_members_user ON study_group_members(user_id);
CREATE INDEX idx_shared_notes_user ON shared_notes(user_id);
CREATE INDEX idx_shared_notes_group ON shared_notes(group_id);
CREATE INDEX idx_shared_notes_public ON shared_notes(is_public);
CREATE INDEX idx_forum_topics_user ON forum_topics(user_id);
CREATE INDEX idx_forum_topics_group ON forum_topics(group_id);
CREATE INDEX idx_forum_replies_topic ON forum_replies(topic_id);

-- ============================================
-- IoT & SMART LIBRARY FEATURES
-- ============================================

-- IoT Devices Table
CREATE TABLE IF NOT EXISTS iot_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- light, ac, sensor, lock, camera
    device_id VARCHAR(255) UNIQUE NOT NULL, -- Hardware device ID
    location VARCHAR(255), -- Physical location in library
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, maintenance
    is_online BOOLEAN DEFAULT false,
    last_heartbeat TIMESTAMP,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Device Telemetry Table (Time-series data)
CREATE TABLE IF NOT EXISTS device_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- temperature, humidity, energy, occupancy
    metric_value DECIMAL(10, 2),
    unit VARCHAR(50),
    metadata JSONB,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Automation Rules Table
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL, -- time, sensor, event, manual
    trigger_conditions JSONB NOT NULL,
    actions JSONB NOT NULL, -- What to do when triggered
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Energy Consumption Table
CREATE TABLE IF NOT EXISTS energy_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    device_id UUID REFERENCES iot_devices(id) ON DELETE SET NULL,
    consumption_kwh DECIMAL(10, 4) NOT NULL,
    cost_amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    reading_date DATE NOT NULL,
    reading_time TIME,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for IoT
CREATE INDEX idx_iot_devices_library ON iot_devices(library_id);
CREATE INDEX idx_iot_devices_type ON iot_devices(device_type);
CREATE INDEX idx_iot_devices_status ON iot_devices(status);
CREATE INDEX idx_device_telemetry_device ON device_telemetry(device_id);
CREATE INDEX idx_device_telemetry_recorded ON device_telemetry(recorded_at);
CREATE INDEX idx_automation_rules_library ON automation_rules(library_id);
CREATE INDEX idx_energy_consumption_library ON energy_consumption(library_id);
CREATE INDEX idx_energy_consumption_date ON energy_consumption(reading_date);

-- ============================================
-- ADVANCED ANALYTICS
-- ============================================

-- Analytics Events Table (For ML/AI tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    metadata JSONB,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Goals Table
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- study_hours, sessions_per_week, focus_score
    target_value DECIMAL(10, 2) NOT NULL,
    current_value DECIMAL(10, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, failed, cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_user_goals_user ON user_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);

-- ============================================
-- SEED DATA FOR ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (code, name, description, category, points, requirement) VALUES
('first_booking', 'First Steps', 'Complete your first booking', 'booking', 10, '{"bookings": 1}'),
('study_marathon', 'Study Marathon', 'Study for 10 hours in a single session', 'study', 100, '{"single_session_hours": 10}'),
('consistency_king', 'Consistency King', 'Book study sessions for 7 consecutive days', 'study', 50, '{"consecutive_days": 7}'),
('social_butterfly', 'Social Butterfly', 'Join 5 study groups', 'social', 30, '{"groups_joined": 5}'),
('helpful_student', 'Helpful Student', 'Share 10 notes with the community', 'social', 40, '{"notes_shared": 10}'),
('pomodoro_master', 'Pomodoro Master', 'Complete 100 Pomodoro sessions', 'study', 75, '{"pomodoro_sessions": 100}'),
('early_bird', 'Early Bird', 'Book 10 morning sessions (6 AM - 9 AM)', 'study', 25, '{"morning_sessions": 10}'),
('night_owl', 'Night Owl', 'Book 10 late night sessions (9 PM - 12 AM)', 'study', 25, '{"night_sessions": 10}'),
('library_explorer', 'Library Explorer', 'Visit 5 different libraries', 'booking', 35, '{"unique_libraries": 5}'),
('perfect_week', 'Perfect Week', 'Maintain 100% attendance for a week', 'study', 60, '{"perfect_weeks": 1}')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update user points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_points (user_id, total_points)
    VALUES (NEW.user_id, NEW.points)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_points = user_points.total_points + NEW.points,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for points history
CREATE TRIGGER trigger_update_user_points
AFTER INSERT ON points_history
FOR EACH ROW
EXECUTE FUNCTION update_user_points();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables with updated_at
CREATE TRIGGER update_study_sessions_updated_at BEFORE UPDATE ON study_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shared_notes_updated_at BEFORE UPDATE ON shared_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_iot_devices_updated_at BEFORE UPDATE ON iot_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- User Study Statistics View
CREATE OR REPLACE VIEW user_study_stats AS
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT ss.id) as total_sessions,
    SUM(ss.total_focus_time) as total_focus_hours,
    AVG(ss.total_focus_time) as avg_session_duration,
    COUNT(DISTINCT b.id) as total_bookings,
    COALESCE(up.total_points, 0) as total_points,
    COALESCE(up.level, 1) as level
FROM users u
LEFT JOIN study_sessions ss ON u.id = ss.user_id
LEFT JOIN bookings b ON u.id = b.user_id
LEFT JOIN user_points up ON u.id = up.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name, up.total_points, up.level;

-- Library Energy Efficiency View
CREATE OR REPLACE VIEW library_energy_efficiency AS
SELECT 
    l.id as library_id,
    l.name as library_name,
    SUM(ec.consumption_kwh) as total_consumption_kwh,
    AVG(ec.consumption_kwh) as avg_daily_consumption,
    SUM(ec.cost_amount) as total_cost,
    COUNT(DISTINCT ec.reading_date) as days_monitored
FROM libraries l
LEFT JOIN energy_consumption ec ON l.id = ec.library_id
WHERE ec.reading_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY l.id, l.name;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
