/**
 * 🎓 STUDYSPOT - Review Service
 * Business logic for review operations
 */

const reviewRepository = require('../repositories/reviewRepository');
const { logger } = require('../utils/logger');

class ReviewService {
  /**
   * Create a new review
   */
  async createReview(userId, reviewData) {
    try {
      const { libraryId, bookingId, rating, comment } = reviewData;

      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Check if user can review (optional - you can remove this check if you want to allow all reviews)
      if (bookingId) {
        const canReview = await reviewRepository.canUserReview(userId, libraryId);
        if (!canReview) {
          logger.warn(`User ${userId} attempted to review without completed booking`);
          // We'll allow it but mark as not verified
        }
      }

      const review = await reviewRepository.create({
        libraryId,
        userId,
        bookingId,
        rating,
        comment
      });

      logger.info(`Review created: ${review.id} for library ${libraryId}`);
      return review;
    } catch (error) {
      logger.error('Create review error:', error);
      throw error;
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId) {
    return await reviewRepository.findById(reviewId);
  }

  /**
   * Get library reviews
   */
  async getLibraryReviews(libraryId, options = {}) {
    const reviews = await reviewRepository.findByLibraryId(libraryId, options);
    const stats = await reviewRepository.getLibraryStats(libraryId);

    return {
      reviews: reviews.map(r => ({
        id: r.id,
        userId: r.user_id,
        userName: `${r.first_name} ${r.last_name}`,
        rating: r.rating,
        comment: r.comment,
        isVerified: r.is_verified,
        adminResponse: r.admin_response,
        createdAt: r.created_at
      })),
      stats: {
        totalReviews: parseInt(stats.total_reviews) || 0,
        averageRating: parseFloat(stats.average_rating) || 0,
        distribution: {
          5: parseInt(stats.five_star) || 0,
          4: parseInt(stats.four_star) || 0,
          3: parseInt(stats.three_star) || 0,
          2: parseInt(stats.two_star) || 0,
          1: parseInt(stats.one_star) || 0
        }
      }
    };
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(userId, options = {}) {
    return await reviewRepository.findByUserId(userId, options);
  }

  /**
   * Update review
   */
  async updateReview(reviewId, userId, updateData) {
    try {
      const review = await reviewRepository.findById(reviewId);

      if (!review) {
        throw new Error('Review not found');
      }

      if (review.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      // Validate rating if provided
      if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
      }

      const updated = await reviewRepository.update(reviewId, updateData);
      
      logger.info(`Review updated: ${reviewId}`);
      return updated;
    } catch (error) {
      logger.error('Update review error:', error);
      throw error;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId, userId, isAdmin = false) {
    try {
      const review = await reviewRepository.findById(reviewId);

      if (!review) {
        throw new Error('Review not found');
      }

      if (!isAdmin && review.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      await reviewRepository.delete(reviewId);
      
      logger.info(`Review deleted: ${reviewId}`);
      return { success: true, message: 'Review deleted successfully' };
    } catch (error) {
      logger.error('Delete review error:', error);
      throw error;
    }
  }

  /**
   * Flag review as inappropriate
   */
  async flagReview(reviewId, userId, reason) {
    try {
      await reviewRepository.flag(reviewId, reason);
      
      logger.warn(`Review flagged: ${reviewId} by user ${userId}, reason: ${reason}`);
      return { success: true, message: 'Review flagged for moderation' };
    } catch (error) {
      logger.error('Flag review error:', error);
      throw error;
    }
  }

  /**
   * Add admin response to review
   */
  async addAdminResponse(reviewId, response) {
    try {
      const updated = await reviewRepository.addAdminResponse(reviewId, response);
      
      logger.info(`Admin response added to review: ${reviewId}`);
      return updated;
    } catch (error) {
      logger.error('Add admin response error:', error);
      throw error;
    }
  }

  /**
   * Get recent reviews across all libraries
   */
  async getRecentReviews(limit = 10) {
    const reviews = await reviewRepository.getRecentReviews(limit);
    
    return reviews.map(r => ({
      id: r.id,
      libraryId: r.library_id,
      libraryName: r.library_name,
      city: r.city,
      userId: r.user_id,
      userName: `${r.first_name} ${r.last_name}`,
      rating: r.rating,
      comment: r.comment,
      isVerified: r.is_verified,
      createdAt: r.created_at
    }));
  }

  /**
   * Check if user can review a library
   */
  async canUserReview(userId, libraryId) {
    return await reviewRepository.canUserReview(userId, libraryId);
  }
}

module.exports = new ReviewService();



