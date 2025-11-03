-- =====================================================
-- Migration: Create Seat Management Tables
-- Version: 006
-- Date: 2025-10-23
-- Description: Tables for seat layouts, zones, and booking rules
-- =====================================================

-- Drop tables if they exist
DROP TABLE IF EXISTS seat_layouts CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS booking_rules CASCADE;

-- =====================================================
-- ZONES TABLE
-- =====================================================
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  library_id UUID,
  
  -- Zone Information
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'ac', 'non-ac', 'quiet', 'group', 'premium', 'vip'
  description TEXT,
  
  -- Capacity
  capacity INTEGER NOT NULL DEFAULT 0,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  
  -- Visual
  color VARCHAR(7) NOT NULL DEFAULT '#4CAF50',
  
  -- Features
  features JSONB DEFAULT '[]',
  
  -- Pricing
  price_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Shift Timings
  shift_timings JSONB DEFAULT '{"morning": true, "afternoon": true, "evening": true, "night": false}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SEAT LAYOUTS TABLE
-- =====================================================
CREATE TABLE seat_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  library_id UUID,
  
  -- Layout Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configuration
  config JSONB NOT NULL, -- {width, height, gridSize, snapToGrid}
  
  -- Seats data (stored as JSON for flexibility)
  seats JSONB NOT NULL DEFAULT '[]',
  
  -- Zones reference (optional, zones can be managed separately)
  zone_mapping JSONB DEFAULT '{}',
  
  -- Version control
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SEATS TABLE (Individual Seat Records)
-- =====================================================
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  library_id UUID,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  layout_id UUID REFERENCES seat_layouts(id) ON DELETE CASCADE,
  
  -- Seat Information
  seat_number VARCHAR(50) NOT NULL,
  
  -- Position (for layout designer)
  position_x DECIMAL(10, 2),
  position_y DECIMAL(10, 2),
  width DECIMAL(10, 2) DEFAULT 60,
  height DECIMAL(10, 2) DEFAULT 60,
  
  -- Attributes
  attributes JSONB DEFAULT '{"hasPower": false, "hasWindow": false, "size": "medium", "isCorner": false}',
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'available', -- 'available', 'occupied', 'reserved', 'maintenance'
  
  -- Current Booking
  current_booking_id UUID,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(tenant_id, library_id, seat_number)
);

-- =====================================================
-- BOOKING RULES TABLE
-- =====================================================
CREATE TABLE booking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  library_id UUID,
  
  -- Rule Information
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'timing', 'payment', 'cancellation', 'restriction'
  description TEXT,
  
  -- Configuration (stored as JSON for flexibility)
  config JSONB NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Zones indexes
CREATE INDEX idx_zones_tenant ON zones(tenant_id);
CREATE INDEX idx_zones_library ON zones(library_id);
CREATE INDEX idx_zones_type ON zones(type);
CREATE INDEX idx_zones_active ON zones(is_active);

-- Layouts indexes
CREATE INDEX idx_layouts_tenant ON seat_layouts(tenant_id);
CREATE INDEX idx_layouts_library ON seat_layouts(library_id);
CREATE INDEX idx_layouts_active ON seat_layouts(is_active);

-- Seats indexes
CREATE INDEX idx_seats_tenant ON seats(tenant_id);
CREATE INDEX idx_seats_library ON seats(library_id);
CREATE INDEX idx_seats_zone ON seats(zone_id);
CREATE INDEX idx_seats_layout ON seats(layout_id);
CREATE INDEX idx_seats_status ON seats(status);
CREATE INDEX idx_seats_number ON seats(seat_number);

-- Booking Rules indexes
CREATE INDEX idx_rules_tenant ON booking_rules(tenant_id);
CREATE INDEX idx_rules_library ON booking_rules(library_id);
CREATE INDEX idx_rules_category ON booking_rules(category);
CREATE INDEX idx_rules_active ON booking_rules(is_active);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Create updated_at trigger for zones
CREATE TRIGGER update_zones_updated_at
  BEFORE UPDATE ON zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for seat_layouts
CREATE TRIGGER update_seat_layouts_updated_at
  BEFORE UPDATE ON seat_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for seats
CREATE TRIGGER update_seats_updated_at
  BEFORE UPDATE ON seats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for booking_rules
CREATE TRIGGER update_booking_rules_updated_at
  BEFORE UPDATE ON booking_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample zones
INSERT INTO zones (tenant_id, name, type, capacity, color, features, price_multiplier, shift_timings) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'AC Zone - Central Hall',
  'ac',
  50,
  '#4CAF50',
  '["Air Conditioning", "Power Backup", "WiFi", "CCTV"]',
  1.5,
  '{"morning": true, "afternoon": true, "evening": true, "night": false}'
),
(
  '00000000-0000-0000-0000-000000000000',
  'Non-AC Zone - North Wing',
  'non-ac',
  80,
  '#FF9800',
  '["Fans", "WiFi", "CCTV"]',
  1.0,
  '{"morning": true, "afternoon": true, "evening": true, "night": true}'
),
(
  '00000000-0000-0000-0000-000000000000',
  'Silent Study Zone',
  'quiet',
  30,
  '#2196F3',
  '["Absolute Silence", "Individual Cabins", "AC", "Power"]',
  1.8,
  '{"morning": true, "afternoon": true, "evening": true, "night": true}'
),
(
  '00000000-0000-0000-0000-000000000000',
  'Premium Executive Zone',
  'premium',
  20,
  '#FFD700',
  '["AC", "Premium Furniture", "Locker", "Coffee", "Private Cabin"]',
  2.5,
  '{"morning": true, "afternoon": true, "evening": true, "night": true}'
);

-- Insert sample booking rules
INSERT INTO booking_rules (tenant_id, name, category, description, config, is_active) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'Advance Booking Window',
  'timing',
  'How far in advance students can book seats',
  '{"maxDays": 30, "minHours": 2}',
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Cancellation Policy',
  'cancellation',
  'Refund rules for cancellations',
  '{"before24Hours": 100, "before12Hours": 75, "before6Hours": 50, "before2Hours": 25, "after": 0}',
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Payment Deadline',
  'payment',
  'Payment must be completed within specified time',
  '{"hoursAfterBooking": 24, "autoCancel": true}',
  true
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE zones IS 'Different zones/areas in the library with specific characteristics';
COMMENT ON TABLE seat_layouts IS 'Visual layouts for seat arrangement in the library';
COMMENT ON TABLE seats IS 'Individual seat records with position and attributes';
COMMENT ON TABLE booking_rules IS 'Configurable rules for booking policies';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Seat Management tables created successfully!';
  RAISE NOTICE '✅ Created 4 zones with sample data';
  RAISE NOTICE '✅ Created 3 booking rules';
END $$;















