/**
 * 🎓 STUDYSPOT - Review Repository
 * Handles all database operations for reviews
 */

const {
  query
} = require('../config/database');
const {
  logger
} = require('../utils/logger');
class ReviewRepository {
  /**
   * Create a new review
   */
  async create(reviewData) {
    const {
      libraryId,
      userId,
      bookingId,
      rating,
      comment
    } = reviewData;
    const result = await query(`INSERT INTO reviews (library_id, user_id, booking_id, rating, comment, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [libraryId, userId, bookingId, rating, comment, bookingId ? true : false]);
    return result.rows[0];
  }

  /**
   * Get review by ID
   */
  async findById(reviewId) {
    const result = await query(`SELECT r.*, u.first_name, u.last_name, u.email,
              l.name as library_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN libraries l ON r.library_id = l.id
       WHERE r.id = $1`, [reviewId]);
    return result.rows[0];
  }

  /**
   * Get all reviews for a library
   */
  async findByLibraryId(libraryId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      minRating
    } = options;
    let queryText = `
      SELECT r.*, u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.library_id = $1 AND r.is_flagged = false
    `;
    const params = [libraryId];
    let paramIndex = 2;
    if (minRating) {
      queryText += ` AND r.rating >= $${paramIndex}`;
      params.push(minRating);
      paramIndex++;
    }
    queryText += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get all reviews by a user
   */
  async findByUserId(userId, options = {}) {
    const {
      limit = 50,
      offset = 0
    } = options;
    const result = await query(`SELECT r.*, l.name as library_name, l.city
       FROM reviews r
       JOIN libraries l ON r.library_id = l.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Update review
   */
  async update(reviewId, updateData) {
    const {
      rating,
      comment
    } = updateData;
    const result = await query(`UPDATE reviews
       SET rating = COALESCE($1, rating),
           comment = COALESCE($2, comment),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`, [rating, comment, reviewId]);
    return result.rows[0];
  }

  /**
   * Delete review
   */
  async delete(reviewId) {
    const result = await query('DELETE FROM reviews WHERE id = $1 RETURNING *', [reviewId]);
    return result.rows[0];
  }

  /**
   * Flag review as inappropriate
   */
  async flag(reviewId, reason) {
    const result = await query(`UPDATE reviews
       SET is_flagged = true,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`, [reviewId]);
    return result.rows[0];
  }

  /**
   * Add admin response to review
   */
  async addAdminResponse(reviewId, response) {
    const result = await query(`UPDATE reviews
       SET admin_response = $1,
           responded_at = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`, [response, reviewId]);
    return result.rows[0];
  }

  /**
   * Get review statistics for a library
   */
  async getLibraryStats(libraryId) {
    const result = await query(`SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews
       WHERE library_id = $1 AND is_flagged = false`, [libraryId]);
    return result.rows[0];
  }

  /**
   * Check if user can review a library (has completed booking)
   */
  async canUserReview(userId, libraryId) {
    const result = await query(`SELECT COUNT(*) as booking_count
       FROM bookings
       WHERE user_id = $1 
         AND library_id = $2 
         AND status = 'completed'
         AND id NOT IN (
           SELECT booking_id FROM reviews WHERE booking_id IS NOT NULL
         )`, [userId, libraryId]);
    return parseInt(result.rows[0].booking_count) > 0;
  }

  /**
   * Get recent reviews (all libraries)
   */
  async getRecentReviews(limit = 10) {
    const result = await query(`SELECT r.*, u.first_name, u.last_name, l.name as library_name, l.city
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN libraries l ON r.library_id = l.id
       WHERE r.is_flagged = false
       ORDER BY r.created_at DESC
       LIMIT $1`, [limit]);
    return result.rows;
  }
}
module.exports = new ReviewRepository();