const {
  Pool
} = require('pg');
const bcrypt = require('bcryptjs');
const {
  logger
} = require('../utils/logger');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});
async function seedDatabase() {
  const client = await pool.connect();
  try {
    logger.info('Starting database seeding...');

    // Check if data already exists
    const existingUsers = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count) > 1) {
      // More than just the default admin
      logger.info('Database already seeded, skipping...');
      return;
    }

    // Seed test tenants
    const tenantResult = await client.query(`
      INSERT INTO tenants (id, name, domain, subscription_plan, status)
      VALUES 
        ('11111111-1111-1111-1111-111111111111', 'Test Library Group', 'test.studyspot.com', 'pro', 'active'),
        ('22222222-2222-2222-2222-222222222222', 'Demo Library Chain', 'demo.studyspot.com', 'starter', 'active')
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `);

    // Seed test users
    const hashedPassword = await bcrypt.hash('password123', 12);
    await client.query(`
      INSERT INTO users (id, tenant_id, email, password, first_name, last_name, phone, role, status)
      VALUES 
        ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'student1@test.com', $1, 'John', 'Doe', '+1234567890', 'student', 'active'),
        ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'student2@test.com', $1, 'Jane', 'Smith', '+1234567891', 'student', 'active'),
        ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'manager@test.com', $1, 'Library', 'Manager', '+1234567892', 'branch_manager', 'active'),
        ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'staff@test.com', $1, 'Library', 'Staff', '+1234567893', 'library_staff', 'active')
      ON CONFLICT (id) DO NOTHING
    `, [hashedPassword]);

    // Seed test libraries
    await client.query(`
      INSERT INTO libraries (id, tenant_id, name, description, address, city, state, country, postal_code, latitude, longitude, capacity, amenities, pricing, operating_hours, contact_info, status)
      VALUES 
        ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'StudyHub Central', 'Modern study space in the heart of the city', '123 Main Street, Mumbai', 'Mumbai', 'Maharashtra', 'India', '400001', 19.0760, 72.8777, 100, '["wifi", "ac", "parking", "cafeteria", "printing"]', '{"hourly": 50, "daily": 300, "monthly": 5000}', '{"monday": {"open": "06:00", "close": "23:00"}, "tuesday": {"open": "06:00", "close": "23:00"}, "wednesday": {"open": "06:00", "close": "23:00"}, "thursday": {"open": "06:00", "close": "23:00"}, "friday": {"open": "06:00", "close": "23:00"}, "saturday": {"open": "08:00", "close": "22:00"}, "sunday": {"open": "08:00", "close": "22:00"}}', '{"phone": "+91-22-12345678", "email": "info@studyhub.com"}', 'active'),
        ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Quiet Corner Library', 'Peaceful study environment with premium amenities', '456 Oak Avenue, Delhi', 'Delhi', 'Delhi', 'India', '110001', 28.6139, 77.2090, 80, '["wifi", "ac", "quiet_zones", "group_study_rooms", "coffee_bar"]', '{"hourly": 60, "daily": 350, "monthly": 6000}', '{"monday": {"open": "05:00", "close": "24:00"}, "tuesday": {"open": "05:00", "close": "24:00"}, "wednesday": {"open": "05:00", "close": "24:00"}, "thursday": {"open": "05:00", "close": "24:00"}, "friday": {"open": "05:00", "close": "24:00"}, "saturday": {"open": "06:00", "close": "23:00"}, "sunday": {"open": "06:00", "close": "23:00"}}', '{"phone": "+91-11-87654321", "email": "contact@quietcorner.com"}', 'active'),
        ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Tech Study Center', 'Technology-focused study space with high-speed internet', '789 Tech Park, Bangalore', 'Bangalore', 'Karnataka', 'India', '560001', 12.9716, 77.5946, 120, '["wifi", "ac", "power_outlets", "monitors", "whiteboards", "projector_rooms"]', '{"hourly": 70, "daily": 400, "monthly": 7000}', '{"monday": {"open": "06:00", "close": "23:00"}, "tuesday": {"open": "06:00", "close": "23:00"}, "wednesday": {"open": "06:00", "close": "23:00"}, "thursday": {"open": "06:00", "close": "23:00"}, "friday": {"open": "06:00", "close": "23:00"}, "saturday": {"open": "07:00", "close": "22:00"}, "sunday": {"open": "07:00", "close": "22:00"}}', '{"phone": "+91-80-11223344", "email": "hello@techstudy.com"}', 'active')
      ON CONFLICT (id) DO NOTHING
    `);

    // Seed test seats
    const seatData = [];
    const libraries = [{
      id: '11111111-1111-1111-1111-111111111111',
      name: 'StudyHub Central'
    }, {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Quiet Corner Library'
    }, {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Tech Study Center'
    }];
    libraries.forEach(library => {
      // Generate seats for each library
      for (let i = 1; i <= 20; i++) {
        const zone = i <= 10 ? 'quiet' : i <= 15 ? 'general' : 'group';
        const seatType = zone === 'group' ? 'group_table' : 'desk';
        const amenities = zone === 'quiet' ? '["power_outlet", "lamp"]' : zone === 'group' ? '["power_outlet", "whiteboard"]' : '["power_outlet"]';
        seatData.push({
          library_id: library.id,
          seat_number: `${String.fromCharCode(65 + Math.floor((i - 1) / 5))}${(i - 1) % 5 + 1}`,
          zone,
          seat_type: seatType,
          amenities,
          location: JSON.stringify({
            floor: 1,
            section: zone,
            x: (i - 1) % 5,
            y: Math.floor((i - 1) / 5)
          })
        });
      }
    });
    for (const seat of seatData) {
      await client.query(`
        INSERT INTO seats (library_id, seat_number, zone, seat_type, amenities, location)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (library_id, seat_number) DO NOTHING
      `, [seat.library_id, seat.seat_number, seat.zone, seat.seat_type, seat.amenities, seat.location]);
    }

    // Seed test bookings
    await client.query(`
      INSERT INTO bookings (id, user_id, library_id, seat_id, booking_date, start_time, end_time, booking_type, status, payment_status, total_amount, payment_method, qr_code)
      SELECT 
        '11111111-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        s.id,
        CURRENT_DATE + INTERVAL '1 day',
        '09:00'::time,
        '17:00'::time,
        'daily',
        'confirmed',
        'completed',
        300.00,
        'online',
        'QR_' || s.seat_number || '_' || EXTRACT(EPOCH FROM NOW())::text
      FROM seats s 
      WHERE s.library_id = '11111111-1111-1111-1111-111111111111' 
      AND s.seat_number = 'A1'
      ON CONFLICT (id) DO NOTHING
    `);

    // Seed test payments
    await client.query(`
      INSERT INTO payments (booking_id, user_id, amount, currency, payment_method, payment_gateway, gateway_payment_id, status)
      VALUES 
        ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 300.00, 'INR', 'online', 'razorpay', 'pay_test123', 'completed')
      ON CONFLICT DO NOTHING
    `);

    // Seed test notifications
    await client.query(`
      INSERT INTO notifications (user_id, title, message, type, is_read)
      VALUES 
        ('11111111-1111-1111-1111-111111111111', 'Booking Confirmed', 'Your booking for StudyHub Central has been confirmed for tomorrow.', 'booking', false),
        ('22222222-2222-2222-2222-222222222222', 'Welcome to StudySpot', 'Welcome to StudySpot! Start exploring libraries near you.', 'system', false)
      ON CONFLICT DO NOTHING
    `);

    // Seed test reviews
    await client.query(`
      INSERT INTO library_reviews (library_id, user_id, rating, review_text, is_verified)
      VALUES 
        ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 5, 'Excellent study environment with great amenities!', true),
        ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 4, 'Good place to study, but could use more power outlets.', true)
      ON CONFLICT (library_id, user_id) DO NOTHING
    `);
    logger.info('Database seeded successfully');
    logger.info('Test data created:');
    logger.info('- 3 Tenants (including default)');
    logger.info('- 5 Users (including admin)');
    logger.info('- 3 Libraries');
    logger.info('- 60 Seats (20 per library)');
    logger.info('- 1 Sample booking');
    logger.info('- 1 Sample payment');
    logger.info('- 2 Sample notifications');
    logger.info('- 2 Sample reviews');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
async function clearDatabase() {
  const client = await pool.connect();
  try {
    logger.info('Clearing database...');

    // Clear data in reverse dependency order
    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM waitlist');
    await client.query('DELETE FROM library_reviews');
    await client.query('DELETE FROM user_documents');
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM payments');
    await client.query('DELETE FROM bookings');
    await client.query('DELETE FROM seats');
    await client.query('DELETE FROM libraries');
    await client.query('DELETE FROM users WHERE id != \'00000000-0000-0000-0000-000000000001\''); // Keep admin
    await client.query('DELETE FROM tenants WHERE id != \'00000000-0000-0000-0000-000000000000\''); // Keep default

    logger.info('Database cleared successfully');
  } catch (error) {
    logger.error('Clearing failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
async function main() {
  const command = process.argv[2];
  try {
    switch (command) {
      case 'seed':
        await seedDatabase();
        break;
      case 'clear':
        await clearDatabase();
        break;
      case 'reset':
        await clearDatabase();
        await seedDatabase();
        break;
      default:
        logger.info('Usage: node seed.js [seed|clear|reset]');
        process.exit(1);
    }
  } catch (error) {
    logger.error('Seed command failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
if (require.main === module) {
  main();
}
module.exports = {
  seedDatabase,
  clearDatabase
};