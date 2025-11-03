-- 🎓 STUDYSPOT PLATFORM - DATABASE SCHEMA
-- PostgreSQL Schema for Multi-Tenant SaaS Library Booking Platform
-- Created: October 21, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE tenant_status AS ENUM ('active', 'inactive', 'suspended', 'trial');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'partial_refund');
CREATE TYPE payment_method AS ENUM ('razorpay', 'stripe', 'cash', 'wallet');
CREATE TYPE transaction_type AS ENUM ('booking', 'refund', 'reward_redemption', 'wallet_topup');

-- ============================================================================
-- TENANTS TABLE (Multi-tenancy)
-- ============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    logo_url VARCHAR(500),
    website VARCHAR(255),
    status tenant_status DEFAULT 'trial',
    subscription_plan VARCHAR(50) DEFAULT 'free', -- free, basic, premium, enterprise
    subscription_expires_at TIMESTAMP,
    settings JSONB DEFAULT '{}', -- Custom settings per tenant
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}', -- User preferences for recommendations
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- LIBRARIES TABLE
-- ============================================================================

CREATE TABLE libraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    capacity INTEGER DEFAULT 0, -- Total seats
    available_seats INTEGER DEFAULT 0,
    amenities TEXT[], -- Array of amenities: ['WiFi', 'AC', 'Parking']
    pricing JSONB DEFAULT '{}', -- {hourly: 50, daily: 300, weekly: 1500, monthly: 5000}
    opening_time TIME,
    closing_time TIME,
    is_24x7 BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    gallery JSONB DEFAULT '[]', -- Array of image URLs
    features JSONB DEFAULT '{}', -- Additional features
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_libraries_tenant_id ON libraries(tenant_id);
CREATE INDEX idx_libraries_city ON libraries(city);
CREATE INDEX idx_libraries_rating ON libraries(rating DESC);
CREATE INDEX idx_libraries_name_trgm ON libraries USING gin(name gin_trgm_ops); -- Full-text search

-- ============================================================================
-- SEATS TABLE
-- ============================================================================

CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
    seat_number VARCHAR(50) NOT NULL,
    floor VARCHAR(50),
    section VARCHAR(50),
    type VARCHAR(50) DEFAULT 'regular', -- regular, premium, cabin, group
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(library_id, seat_number)
);

CREATE INDEX idx_seats_library_id ON seats(library_id);
CREATE INDEX idx_seats_available ON seats(library_id, is_available) WHERE is_active = TRUE;

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
    seat_id UUID REFERENCES seats(id) ON DELETE SET NULL,
    seat_number VARCHAR(50), -- Denormalized for historical data
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(5, 2), -- Calculated duration
    status booking_status DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_library_id ON bookings(library_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images JSONB DEFAULT '[]', -- Array of image URLs
    is_verified BOOLEAN DEFAULT FALSE, -- Verified booking
    is_flagged BOOLEAN DEFAULT FALSE,
    admin_response TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(booking_id) -- One review per booking
);

CREATE INDEX idx_reviews_library_id ON reviews(library_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- TRANSACTIONS TABLE (Payment History)
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method payment_method,
    payment_status payment_status DEFAULT 'pending',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(500),
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    metadata JSONB DEFAULT '{}', -- Additional payment metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================================================
-- GAMIFICATION TABLES
-- ============================================================================

-- User Points & Levels
CREATE TABLE user_gamification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    bookings_count INTEGER DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    referrals_count INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gamification_user_id ON user_gamification(user_id);
CREATE INDEX idx_gamification_points ON user_gamification(total_points DESC); -- For leaderboard

-- Badges
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    requirement_type VARCHAR(50), -- bookings, reviews, streak, referrals, points
    requirement_value INTEGER, -- Threshold to earn badge
    points_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Badges (Many-to-Many)
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- Rewards
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    reward_type VARCHAR(50), -- discount, free_hours, cashback
    reward_value DECIMAL(10, 2), -- Discount percentage or amount
    max_redemptions INTEGER, -- NULL = unlimited
    current_redemptions INTEGER DEFAULT 0,
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Reward Redemptions
CREATE TABLE user_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
    points_spent INTEGER NOT NULL,
    redeemed_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' -- active, used, expired
);

CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);

-- ============================================================================
-- PREFERENCES TABLE (For AI Recommendations)
-- ============================================================================

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferred_cities TEXT[],
    preferred_amenities TEXT[],
    price_range_min DECIMAL(10, 2),
    price_range_max DECIMAL(10, 2),
    preferred_times JSONB DEFAULT '{}', -- {morning: true, afternoon: false, evening: true}
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Library Analytics (Aggregated daily stats)
CREATE TABLE library_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    total_hours_booked DECIMAL(10, 2) DEFAULT 0,
    average_occupancy DECIMAL(5, 2) DEFAULT 0, -- Percentage
    unique_users INTEGER DEFAULT 0,
    peak_hour TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(library_id, date)
);

CREATE INDEX idx_library_analytics_library_id ON library_analytics(library_id);
CREATE INDEX idx_library_analytics_date ON library_analytics(date DESC);

-- ============================================================================
-- CHATBOT CONVERSATION HISTORY
-- ============================================================================

CREATE TABLE chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent VARCHAR(100), -- Detected intent
    confidence DECIMAL(3, 2), -- Intent confidence score
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chatbot_user_id ON chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_session_id ON chatbot_conversations(session_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- booking_confirmed, payment_success, reminder, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional notification data
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_libraries_updated_at BEFORE UPDATE ON libraries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seats_updated_at BEFORE UPDATE ON seats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_gamification_updated_at BEFORE UPDATE ON user_gamification FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update library rating
CREATE OR REPLACE FUNCTION update_library_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE libraries
    SET 
        rating = (SELECT AVG(rating) FROM reviews WHERE library_id = NEW.library_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE library_id = NEW.library_id)
    WHERE id = NEW.library_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_library_rating_on_review AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_library_rating();

-- Function to update user gamification on booking
CREATE OR REPLACE FUNCTION update_gamification_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        INSERT INTO user_gamification (user_id, total_points, bookings_count)
        VALUES (NEW.user_id, 10, 1)
        ON CONFLICT (user_id) DO UPDATE
        SET 
            total_points = user_gamification.total_points + 10,
            bookings_count = user_gamification.bookings_count + 1,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gamification_on_booking_trigger AFTER UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_gamification_on_booking();

-- Function to update gamification on review
CREATE OR REPLACE FUNCTION update_gamification_on_review()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_gamification (user_id, total_points, reviews_count)
    VALUES (NEW.user_id, 5, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        total_points = user_gamification.total_points + 5,
        reviews_count = user_gamification.reviews_count + 1,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gamification_on_review_trigger AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_gamification_on_review();

-- ============================================================================
-- SEED DATA (Predefined Badges)
-- ============================================================================

INSERT INTO badges (name, description, icon_url, requirement_type, requirement_value, points_reward) VALUES
('First Booking', 'Complete your first booking', '/badges/first-booking.svg', 'bookings', 1, 15),
('Regular', 'Complete 10 bookings', '/badges/regular.svg', 'bookings', 10, 50),
('Super User', 'Complete 50 bookings', '/badges/super-user.svg', 'bookings', 50, 200),
('Reviewer', 'Submit 10 reviews', '/badges/reviewer.svg', 'reviews', 10, 30),
('Critic', 'Submit 25 reviews', '/badges/critic.svg', 'reviews', 25, 75),
('Week Streak', '7-day booking streak', '/badges/week-streak.svg', 'streak', 7, 40),
('Month Streak', '30-day booking streak', '/badges/month-streak.svg', 'streak', 30, 150),
('Referral Master', 'Refer 5 friends', '/badges/referral.svg', 'referrals', 5, 100),
('Point Collector', 'Earn 500 points', '/badges/points.svg', 'points', 500, 50),
('VIP', 'Earn 2000 points', '/badges/vip.svg', 'points', 2000, 250);

-- ============================================================================
-- SEED DATA (Predefined Rewards)
-- ============================================================================

INSERT INTO rewards (name, description, points_required, reward_type, reward_value, max_redemptions, valid_until) VALUES
('10% Discount', 'Get 10% off on your next booking', 100, 'discount', 10.00, NULL, '2026-12-31 23:59:59'),
('Free 2 Hours', 'Get 2 hours of study time free', 200, 'free_hours', 2.00, NULL, '2026-12-31 23:59:59'),
('20% Discount', 'Get 20% off on your next booking', 300, 'discount', 20.00, NULL, '2026-12-31 23:59:59'),
('Free Day Pass', 'Get a full day pass for free', 500, 'free_hours', 8.00, 1000, '2026-12-31 23:59:59'),
('₹100 Cashback', 'Get ₹100 cashback on next booking', 400, 'cashback', 100.00, NULL, '2026-12-31 23:59:59');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: User statistics
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT r.id) as total_reviews,
    COALESCE(ug.total_points, 0) as points,
    COALESCE(ug.current_level, 1) as level,
    COALESCE(ug.current_streak, 0) as streak
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
LEFT JOIN reviews r ON u.id = r.user_id
LEFT JOIN user_gamification ug ON u.id = ug.user_id
GROUP BY u.id, u.first_name, u.last_name, u.email, ug.total_points, ug.current_level, ug.current_streak;

-- View: Library performance
CREATE VIEW library_performance AS
SELECT 
    l.id,
    l.name,
    l.city,
    l.rating,
    l.total_reviews,
    COUNT(DISTINCT b.id) as total_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN b.amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN b.status = 'completed' THEN b.amount ELSE NULL END) as avg_booking_value
FROM libraries l
LEFT JOIN bookings b ON l.id = b.library_id
GROUP BY l.id, l.name, l.city, l.rating, l.total_reviews;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE tenants IS 'Multi-tenant organizations';
COMMENT ON TABLE users IS 'Platform users (super_admin, admin, user)';
COMMENT ON TABLE libraries IS 'Library/study spaces';
COMMENT ON TABLE seats IS 'Individual seats in libraries';
COMMENT ON TABLE bookings IS 'User bookings/reservations';
COMMENT ON TABLE reviews IS 'Library reviews and ratings';
COMMENT ON TABLE transactions IS 'Payment transaction history';
COMMENT ON TABLE user_gamification IS 'User points, levels, and streaks';
COMMENT ON TABLE badges IS 'Available badges users can earn';
COMMENT ON TABLE user_badges IS 'Badges earned by users';
COMMENT ON TABLE rewards IS 'Rewards available for redemption';
COMMENT ON TABLE user_rewards IS 'Rewards redeemed by users';
COMMENT ON TABLE user_preferences IS 'User preferences for recommendations';
COMMENT ON TABLE library_analytics IS 'Daily aggregated library statistics';
COMMENT ON TABLE chatbot_conversations IS 'Chatbot conversation history';
COMMENT ON TABLE notifications IS 'User notifications';

-- ============================================================================
-- PHASE 6: SAAS FOUNDATION (SUBSCRIPTION, RBAC, CREDITS)
-- ============================================================================

-- ============================================================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    features JSONB DEFAULT '{}'::jsonb,
    limits JSONB DEFAULT '{}'::jsonb, -- {max_libraries: 5, max_users: 100, max_bookings_per_month: 1000}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'active', -- active, cancelled, past_due, trialing, incomplete
    billing_cycle VARCHAR(20) NOT NULL, -- monthly, yearly
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- ============================================================================
-- SUBSCRIPTION USAGE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    metric VARCHAR(100) NOT NULL, -- libraries, users, bookings, storage, api_calls
    value INTEGER DEFAULT 0,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscription_usage_subscription ON subscription_usage(subscription_id);
CREATE INDEX idx_subscription_usage_period ON subscription_usage(period_start, period_end);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    amount_due DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    invoice_pdf_url TEXT,
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================================================
-- PERMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'libraries.create', 'bookings.delete'
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL, -- libraries, bookings, users, settings
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, manage
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);

-- ============================================================================
-- ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE, -- System roles cannot be deleted
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

CREATE INDEX idx_roles_tenant ON roles(tenant_id);
CREATE INDEX idx_roles_system ON roles(is_system);

-- ============================================================================
-- ROLE PERMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- ============================================================================
-- USER ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- ============================================================================
-- CREDIT PACKAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    credit_type VARCHAR(50) NOT NULL, -- sms, whatsapp, email
    credit_amount INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    bonus_credits INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_packages_type ON credit_packages(credit_type);
CREATE INDEX idx_credit_packages_active ON credit_packages(is_active);

-- ============================================================================
-- TENANT CREDITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    credit_type VARCHAR(50) NOT NULL, -- sms, whatsapp, email
    balance INTEGER DEFAULT 0,
    total_purchased INTEGER DEFAULT 0,
    total_used INTEGER DEFAULT 0,
    last_topup_at TIMESTAMP,
    auto_topup_enabled BOOLEAN DEFAULT FALSE,
    auto_topup_threshold INTEGER DEFAULT 100,
    auto_topup_package_id UUID REFERENCES credit_packages(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, credit_type)
);

CREATE INDEX idx_tenant_credits_tenant ON tenant_credits(tenant_id);
CREATE INDEX idx_tenant_credits_type ON tenant_credits(credit_type);

-- ============================================================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    credit_type VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- purchase, usage, refund, bonus
    amount INTEGER NOT NULL, -- Positive for credits added, negative for credits used
    balance_after INTEGER NOT NULL,
    reference_id UUID, -- Reference to related entity (booking, notification, etc.)
    reference_type VARCHAR(50), -- booking, notification, campaign
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_tenant ON credit_transactions(tenant_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(credit_type);
CREATE INDEX idx_credit_transactions_created ON credit_transactions(created_at DESC);

-- ============================================================================
-- AUDIT LOG TABLE (For RBAC and compliance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout
    resource_type VARCHAR(50) NOT NULL, -- user, booking, library, subscription
    resource_id UUID,
    changes JSONB, -- Before/after values
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================================
-- UPDATE TENANTS TABLE (Add Stripe customer ID)
-- ============================================================================

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe ON tenants(stripe_customer_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER set_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_subscription_usage_updated_at ON subscription_usage;
CREATE TRIGGER set_subscription_usage_updated_at
    BEFORE UPDATE ON subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_invoices_updated_at ON invoices;
CREATE TRIGGER set_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_permissions_updated_at ON permissions;
CREATE TRIGGER set_permissions_updated_at
    BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_roles_updated_at ON roles;
CREATE TRIGGER set_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_credit_packages_updated_at ON credit_packages;
CREATE TRIGGER set_credit_packages_updated_at
    BEFORE UPDATE ON credit_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_tenant_credits_updated_at ON tenant_credits;
CREATE TRIGGER set_tenant_credits_updated_at
    BEFORE UPDATE ON tenant_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR PHASE 6 TABLES
-- ============================================================================

COMMENT ON TABLE subscription_plans IS 'SaaS subscription plan definitions';
COMMENT ON TABLE subscriptions IS 'Tenant subscription records';
COMMENT ON TABLE subscription_usage IS 'Subscription usage metrics tracking';
COMMENT ON TABLE invoices IS 'Billing invoices for subscriptions';
COMMENT ON TABLE permissions IS 'System-wide permission definitions';
COMMENT ON TABLE roles IS 'Role definitions (system and tenant-specific)';
COMMENT ON TABLE role_permissions IS 'Permissions assigned to roles';
COMMENT ON TABLE user_roles IS 'Roles assigned to users';
COMMENT ON TABLE credit_packages IS 'Credit packages for SMS/WhatsApp/Email';
COMMENT ON TABLE tenant_credits IS 'Tenant credit balances';
COMMENT ON TABLE credit_transactions IS 'Credit purchase and usage history';
COMMENT ON TABLE audit_logs IS 'Audit trail for compliance and security';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

