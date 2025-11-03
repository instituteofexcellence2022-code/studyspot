/**
 * 🎓 STUDYSPOT - Database Seed Script
 * Populates the database with realistic demo data
 */

const {
  Pool
} = require('pg');
const bcrypt = require('bcryptjs');
const {
  logger
} = require('../utils/logger');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://studyspot:studyspot123@localhost:5432/studyspot_db',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});
async function seedDatabase() {
  const client = await pool.connect();
  try {
    logger.info('========================================');
    logger.info('🌱 Starting Database Seeding');
    logger.info('========================================');

    // Start transaction
    await client.query('BEGIN');

    // =========================================================================
    // 1. CREATE TENANT
    // =========================================================================
    logger.info('📦 Creating tenant...');
    const tenantResult = await client.query(`
      INSERT INTO tenants (name, slug, email, phone, status, subscription_plan)
      VALUES ('StudySpot India', 'studyspot-india', 'admin@studyspot.com', '+91-98765-43210', 'active', 'enterprise')
      RETURNING id
    `);
    const tenantId = tenantResult.rows[0].id;
    logger.info(`✅ Tenant created: ${tenantId}`);

    // =========================================================================
    // 2. CREATE USERS
    // =========================================================================
    logger.info('👥 Creating users...');
    const password = await bcrypt.hash('admin123', 10);
    const users = [{
      email: 'admin@studyspot.com',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+91-98765-43210',
      role: 'super_admin'
    }, {
      email: 'priya.sharma@studyspot.com',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91-98765-43211',
      role: 'user'
    }, {
      email: 'amit.patel@studyspot.com',
      firstName: 'Amit',
      lastName: 'Patel',
      phone: '+91-98765-43212',
      role: 'user'
    }, {
      email: 'sneha.reddy@studyspot.com',
      firstName: 'Sneha',
      lastName: 'Reddy',
      phone: '+91-98765-43213',
      role: 'user'
    }, {
      email: 'vikram.singh@studyspot.com',
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91-98765-43214',
      role: 'admin'
    }];
    const userIds = [];
    for (const user of users) {
      const result = await client.query(`
        INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, phone, role, status, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', true)
        RETURNING id
      `, [tenantId, user.email, password, user.firstName, user.lastName, user.phone, user.role]);
      userIds.push({
        ...user,
        id: result.rows[0].id
      });
      logger.info(`✅ User created: ${user.email} (${user.role})`);
    }

    // =========================================================================
    // 3. CREATE LIBRARIES
    // =========================================================================
    logger.info('📚 Creating libraries...');
    const libraries = [{
      name: 'Central Study Hub',
      slug: 'central-study-hub-bangalore',
      description: 'Premium study space in the heart of Bangalore with 24/7 access, high-speed WiFi, and comfortable seating.',
      address: '45, MG Road, Near Metro Station',
      city: 'Bangalore',
      state: 'Karnataka',
      capacity: 120,
      availableSeats: 45,
      amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Power Backup', 'CCTV'],
      pricing: {
        hourly: 50,
        daily: 300,
        weekly: 1500,
        monthly: 5000
      },
      openingTime: '06:00',
      closingTime: '23:00',
      rating: 4.5
    }, {
      name: 'Knowledge Corner',
      slug: 'knowledge-corner-delhi',
      description: 'Modern library with spacious seating, natural lighting, and a quiet environment perfect for focused study.',
      address: '123, Connaught Place, Central Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      capacity: 80,
      availableSeats: 32,
      amenities: ['WiFi', 'AC', 'Locker', 'Water Purifier', 'CCTV'],
      pricing: {
        hourly: 40,
        daily: 250,
        weekly: 1200,
        monthly: 4000
      },
      openingTime: '07:00',
      closingTime: '22:00',
      rating: 4.2
    }, {
      name: 'Smart Library Mumbai',
      slug: 'smart-library-mumbai',
      description: 'Tech-enabled study space with individual cabins, group discussion rooms, and premium amenities.',
      address: '78, Bandra West, Near Linking Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      capacity: 150,
      availableSeats: 67,
      amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Private Cabins', 'Meeting Rooms'],
      pricing: {
        hourly: 60,
        daily: 350,
        weekly: 1800,
        monthly: 6000
      },
      openingTime: '00:00',
      closingTime: '23:59',
      rating: 4.7
    }, {
      name: 'StudyBee Pune',
      slug: 'studybee-pune',
      description: 'Affordable study space near universities with excellent facilities for students and professionals.',
      address: '34, FC Road, Near Fergusson College',
      city: 'Pune',
      state: 'Maharashtra',
      capacity: 60,
      availableSeats: 25,
      amenities: ['WiFi', 'AC', 'Water Purifier', 'CCTV'],
      pricing: {
        hourly: 35,
        daily: 200,
        weekly: 1000,
        monthly: 3500
      },
      openingTime: '06:00',
      closingTime: '22:00',
      rating: 4.0
    }, {
      name: 'Focus Zone',
      slug: 'focus-zone-bangalore',
      description: 'Premium library with ergonomic furniture, individual reading lamps, and a peaceful atmosphere.',
      address: '89, Koramangala 4th Block, Near HDFC Bank',
      city: 'Bangalore',
      state: 'Karnataka',
      capacity: 100,
      availableSeats: 48,
      amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Locker', 'Power Backup'],
      pricing: {
        hourly: 55,
        daily: 320,
        weekly: 1600,
        monthly: 5500
      },
      openingTime: '06:00',
      closingTime: '23:00',
      rating: 4.6
    }, {
      name: 'The Reading Room',
      slug: 'reading-room-delhi',
      description: 'Cozy library with a home-like atmosphere, perfect for long study sessions and exam preparation.',
      address: '56, Hauz Khas Village, South Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      capacity: 50,
      availableSeats: 18,
      amenities: ['WiFi', 'AC', 'Water Purifier', 'Tea/Coffee', 'CCTV'],
      pricing: {
        hourly: 45,
        daily: 280,
        weekly: 1400,
        monthly: 4500
      },
      openingTime: '07:00',
      closingTime: '21:00',
      rating: 4.3
    }];
    const libraryIds = [];
    for (const library of libraries) {
      const result = await client.query(`
        INSERT INTO libraries (
          tenant_id, name, slug, description, address, city, state, capacity, 
          available_seats, amenities, pricing, opening_time, closing_time, rating, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
        RETURNING id
      `, [tenantId, library.name, library.slug, library.description, library.address, library.city, library.state, library.capacity, library.availableSeats, library.amenities, JSON.stringify(library.pricing), library.openingTime, library.closingTime, library.rating]);
      libraryIds.push({
        ...library,
        id: result.rows[0].id
      });
      logger.info(`✅ Library created: ${library.name} (${library.city})`);
    }

    // =========================================================================
    // 4. CREATE SEATS
    // =========================================================================
    logger.info('💺 Creating seats...');
    let totalSeats = 0;
    for (const library of libraryIds) {
      // Create seats for each library
      const sections = ['A', 'B', 'C'];
      const seatsPerSection = Math.floor(library.capacity / sections.length);
      for (const section of sections) {
        for (let i = 1; i <= seatsPerSection; i++) {
          await client.query(`
            INSERT INTO seats (library_id, seat_number, floor, section, type, is_available, is_active)
            VALUES ($1, $2, 'Ground', $3, 'regular', true, true)
          `, [library.id, `${section}-${i}`, section]);
          totalSeats++;
        }
      }
    }
    logger.info(`✅ ${totalSeats} seats created across all libraries`);

    // =========================================================================
    // 5. CREATE BOOKINGS
    // =========================================================================
    logger.info('📅 Creating bookings...');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const bookings = [{
      userId: userIds[1].id,
      // Priya
      libraryId: libraryIds[0].id,
      // Central Study Hub
      seatNumber: 'A-15',
      bookingDate: today,
      startTime: '09:00',
      endTime: '17:00',
      status: 'confirmed',
      paymentStatus: 'completed',
      amount: 300
    }, {
      userId: userIds[2].id,
      // Amit
      libraryId: libraryIds[2].id,
      // Smart Library Mumbai
      seatNumber: 'B-22',
      bookingDate: today,
      startTime: '10:00',
      endTime: '18:00',
      status: 'confirmed',
      paymentStatus: 'completed',
      amount: 350
    }, {
      userId: userIds[3].id,
      // Sneha
      libraryId: libraryIds[1].id,
      // Knowledge Corner
      seatNumber: 'C-08',
      bookingDate: yesterday,
      startTime: '08:00',
      endTime: '16:00',
      status: 'completed',
      paymentStatus: 'completed',
      amount: 250
    }];
    const bookingIds = [];
    for (const booking of bookings) {
      const result = await client.query(`
        INSERT INTO bookings (
          user_id, library_id, seat_number, booking_date, start_time, end_time,
          duration_hours, status, amount, currency, payment_status, payment_method
        )
        VALUES ($1, $2, $3, $4, $5, $6, 8, $7, $8, 'INR', $9, 'razorpay')
        RETURNING id
      `, [booking.userId, booking.libraryId, booking.seatNumber, booking.bookingDate, booking.startTime, booking.endTime, booking.status, booking.amount, booking.paymentStatus]);
      bookingIds.push({
        ...booking,
        id: result.rows[0].id
      });
    }
    logger.info(`✅ ${bookings.length} bookings created`);

    // =========================================================================
    // 6. CREATE REVIEWS
    // =========================================================================
    logger.info('⭐ Creating reviews...');
    const reviews = [{
      libraryId: libraryIds[0].id,
      userId: userIds[1].id,
      bookingId: bookingIds[0].id,
      rating: 5,
      comment: 'Excellent facility! Very clean and peaceful. The staff is very helpful.'
    }, {
      libraryId: libraryIds[2].id,
      userId: userIds[2].id,
      bookingId: bookingIds[1].id,
      rating: 5,
      comment: 'Love the private cabins! Perfect for focused work. Highly recommended.'
    }, {
      libraryId: libraryIds[1].id,
      userId: userIds[3].id,
      bookingId: bookingIds[2].id,
      rating: 4,
      comment: 'Great location and good facilities. Could use better parking though.'
    }];
    for (const review of reviews) {
      await client.query(`
        INSERT INTO reviews (library_id, user_id, booking_id, rating, comment, is_verified)
        VALUES ($1, $2, $3, $4, $5, true)
      `, [review.libraryId, review.userId, review.bookingId, review.rating, review.comment]);
    }
    logger.info(`✅ ${reviews.length} reviews created`);

    // =========================================================================
    // 7. CREATE USER PREFERENCES
    // =========================================================================
    logger.info('⚙️ Creating user preferences...');
    for (const user of userIds.slice(1)) {
      // Skip admin
      await client.query(`
        INSERT INTO user_preferences (
          user_id, preferred_cities, preferred_amenities, price_range_min, price_range_max
        )
        VALUES ($1, $2, $3, $4, $5)
      `, [user.id, ['{Bangalore,Delhi,Mumbai}'], ['{WiFi,AC,Parking}'], 200, 500]);
    }
    logger.info('✅ User preferences created');

    // Commit transaction
    await client.query('COMMIT');
    logger.info('========================================');
    logger.info('🎉 Database Seeding Completed!');
    logger.info('========================================');
    logger.info('📊 Summary:');
    logger.info(`   ✓ 1 Tenant`);
    logger.info(`   ✓ ${userIds.length} Users`);
    logger.info(`   ✓ ${libraryIds.length} Libraries`);
    logger.info(`   ✓ ${totalSeats} Seats`);
    logger.info(`   ✓ ${bookings.length} Bookings`);
    logger.info(`   ✓ ${reviews.length} Reviews`);
    logger.info(`   ✓ 10 Badges (from schema)`);
    logger.info(`   ✓ 5 Rewards (from schema)`);
    logger.info('========================================');
    logger.info('🔐 Demo Accounts:');
    logger.info('   Super Admin: admin@studyspot.com / admin123');
    logger.info('   Admin: vikram.singh@studyspot.com / admin123');
    logger.info('   User: priya.sharma@studyspot.com / admin123');
    logger.info('========================================');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('❌ Seeding failed:', error.message);
    logger.error('Stack:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    logger.info('✅ Done!');
    process.exit(0);
  }).catch(error => {
    logger.error('❌ Failed:', error);
    process.exit(1);
  });
}
module.exports = {
  seedDatabase
};