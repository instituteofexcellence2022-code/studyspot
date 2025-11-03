/**
 * 🎓 STUDYSPOT - Booking Repository
 * Handles all database operations for bookings
 */

const {
  query,
  getClient
} = require('../config/database');
const {
  logger
} = require('../utils/logger');
class BookingRepository {
  /**
   * Create a new booking
   */
  async create(bookingData) {
    const {
      userId,
      libraryId,
      seatId,
      seatNumber,
      bookingDate,
      startTime,
      endTime,
      durationHours,
      amount,
      paymentMethod = 'razorpay'
    } = bookingData;
    const result = await query(`INSERT INTO bookings (
        user_id, library_id, seat_id, seat_number, booking_date, 
        start_time, end_time, duration_hours, status, amount, 
        currency, payment_status, payment_method
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, 'INR', 'pending', $10)
      RETURNING *`, [userId, libraryId, seatId, seatNumber, bookingDate, startTime, endTime, durationHours, amount, paymentMethod]);
    return result.rows[0];
  }

  /**
   * Get booking by ID
   */
  async findById(bookingId) {
    const result = await query(`SELECT b.*, l.name as library_name, l.address, l.city, l.state,
              u.first_name, u.last_name, u.email
       FROM bookings b
       JOIN libraries l ON b.library_id = l.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`, [bookingId]);
    return result.rows[0];
  }

  /**
   * Get all bookings for a user
   */
  async findByUserId(userId, options = {}) {
    const {
      status,
      limit = 50,
      offset = 0
    } = options;
    let queryText = `
      SELECT b.*, l.name as library_name, l.address, l.city
      FROM bookings b
      JOIN libraries l ON b.library_id = l.id
      WHERE b.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;
    if (status) {
      queryText += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    queryText += ` ORDER BY b.booking_date DESC, b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get all bookings for a library
   */
  async findByLibraryId(libraryId, options = {}) {
    const {
      bookingDate,
      status
    } = options;
    let queryText = `
      SELECT b.*, u.first_name, u.last_name, u.email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.library_id = $1
    `;
    const params = [libraryId];
    let paramIndex = 2;
    if (bookingDate) {
      queryText += ` AND b.booking_date = $${paramIndex}`;
      params.push(bookingDate);
      paramIndex++;
    }
    if (status) {
      queryText += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    queryText += ` ORDER BY b.booking_date ASC, b.start_time ASC`;
    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Update booking status
   */
  async updateStatus(bookingId, status) {
    const result = await query(`UPDATE bookings 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`, [status, bookingId]);
    return result.rows[0];
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(bookingId, paymentStatus, paymentData = {}) {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      stripePaymentIntentId
    } = paymentData;
    const result = await query(`UPDATE bookings 
       SET payment_status = $1, 
           razorpay_order_id = COALESCE($2, razorpay_order_id),
           razorpay_payment_id = COALESCE($3, razorpay_payment_id),
           stripe_payment_intent_id = COALESCE($4, stripe_payment_intent_id),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`, [paymentStatus, razorpayOrderId, razorpayPaymentId, stripePaymentIntentId, bookingId]);
    return result.rows[0];
  }

  /**
   * Cancel booking
   */
  async cancel(bookingId, reason) {
    const result = await query(`UPDATE bookings 
       SET status = 'cancelled', 
           cancellation_reason = $1,
           cancelled_at = NOW(),
           updated_at = NOW()
       WHERE id = $2 AND status IN ('pending', 'confirmed')
       RETURNING *`, [reason, bookingId]);
    return result.rows[0];
  }

  /**
   * Check seat availability
   */
  async checkAvailability(libraryId, seatId, bookingDate, startTime, endTime) {
    const result = await query(`SELECT COUNT(*) as conflict_count
       FROM bookings
       WHERE library_id = $1
         AND seat_id = $2
         AND booking_date = $3
         AND status IN ('pending', 'confirmed')
         AND (
           (start_time <= $4 AND end_time > $4) OR
           (start_time < $5 AND end_time >= $5) OR
           (start_time >= $4 AND end_time <= $5)
         )`, [libraryId, seatId, bookingDate, startTime, endTime]);
    return parseInt(result.rows[0].conflict_count) === 0;
  }

  /**
   * Get available seats for a library on a specific date/time
   */
  async getAvailableSeats(libraryId, bookingDate, startTime, endTime) {
    const result = await query(`SELECT s.*
       FROM seats s
       WHERE s.library_id = $1
         AND s.is_available = true
         AND s.is_active = true
         AND s.id NOT IN (
           SELECT b.seat_id
           FROM bookings b
           WHERE b.library_id = $1
             AND b.booking_date = $2
             AND b.status IN ('pending', 'confirmed')
             AND (
               (b.start_time <= $3 AND b.end_time > $3) OR
               (b.start_time < $4 AND b.end_time >= $4) OR
               (b.start_time >= $3 AND b.end_time <= $4)
             )
         )
       ORDER BY s.section, s.seat_number`, [libraryId, bookingDate, startTime, endTime]);
    return result.rows;
  }

  /**
   * Get booking statistics for a user
   */
  async getUserStats(userId) {
    const result = await query(`SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_spent,
        AVG(CASE WHEN status = 'completed' THEN duration_hours ELSE NULL END) as avg_duration
       FROM bookings
       WHERE user_id = $1`, [userId]);
    return result.rows[0];
  }

  /**
   * Mark booking as checked in
   */
  async checkIn(bookingId) {
    const result = await query(`UPDATE bookings 
       SET check_in_time = NOW(), 
           status = 'confirmed',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`, [bookingId]);
    return result.rows[0];
  }

  /**
   * Mark booking as checked out
   */
  async checkOut(bookingId) {
    const result = await query(`UPDATE bookings 
       SET check_out_time = NOW(), 
           status = 'completed',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`, [bookingId]);
    return result.rows[0];
  }
}
module.exports = new BookingRepository();