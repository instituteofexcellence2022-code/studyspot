/**
 * 🎓 STUDYSPOT - Booking Service
 * Business logic for booking operations
 */

const bookingRepository = require('../repositories/bookingRepository');
const paymentService = require('./paymentService');
const { logger } = require('../utils/logger');

class BookingService {
  /**
   * Create a new booking with payment
   */
  async createBooking(userId, bookingData) {
    try {
      const {
        libraryId,
        seatId,
        seatNumber,
        bookingDate,
        startTime,
        endTime,
        paymentMethod = 'razorpay'
      } = bookingData;

      // Calculate duration
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      const durationHours = (end - start) / (1000 * 60 * 60);

      if (durationHours <= 0) {
        throw new Error('Invalid time range');
      }

      // Check availability
      const isAvailable = await bookingRepository.checkAvailability(
        libraryId,
        seatId,
        bookingDate,
        startTime,
        endTime
      );

      if (!isAvailable) {
        throw new Error('Seat not available for selected time');
      }

      // Calculate amount (you can add pricing logic here)
      // For now, using a simple hourly rate
      const hourlyRate = 50; // ₹50 per hour
      const amount = durationHours * hourlyRate;

      // Create booking
      const booking = await bookingRepository.create({
        userId,
        libraryId,
        seatId,
        seatNumber,
        bookingDate,
        startTime,
        endTime,
        durationHours,
        amount,
        paymentMethod
      });

      // Create payment order
      if (paymentMethod === 'razorpay') {
        const order = await paymentService.createRazorpayOrder(booking.id, amount);
        await bookingRepository.updatePaymentStatus(booking.id, 'pending', {
          razorpayOrderId: order.id
        });
        booking.razorpay_order_id = order.id;
        booking.razorpay_key_id = order.key_id;
      }

      logger.info(`Booking created: ${booking.id}`);
      return booking;
    } catch (error) {
      logger.error('Create booking error:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId) {
    return await bookingRepository.findById(bookingId);
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId, options = {}) {
    return await bookingRepository.findByUserId(userId, options);
  }

  /**
   * Get library bookings
   */
  async getLibraryBookings(libraryId, options = {}) {
    return await bookingRepository.findByLibraryId(libraryId, options);
  }

  /**
   * Verify payment and confirm booking
   */
  async verifyPayment(bookingId, paymentData) {
    try {
      const booking = await bookingRepository.findById(bookingId);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Verify payment based on method
      if (paymentData.paymentMethod === 'razorpay') {
        const isValid = await paymentService.verifyRazorpaySignature(paymentData);
        
        if (!isValid) {
          throw new Error('Invalid payment signature');
        }

        // Update booking
        await bookingRepository.updatePaymentStatus(bookingId, 'completed', {
          razorpayPaymentId: paymentData.razorpay_payment_id
        });
        await bookingRepository.updateStatus(bookingId, 'confirmed');

        logger.info(`Payment verified for booking: ${bookingId}`);
        return { success: true, message: 'Payment verified successfully' };
      }

      throw new Error('Unsupported payment method');
    } catch (error) {
      logger.error('Verify payment error:', error);
      // Update booking to failed
      await bookingRepository.updatePaymentStatus(bookingId, 'failed');
      throw error;
    }
  }

  /**
   * Cancel booking and process refund
   */
  async cancelBooking(bookingId, userId, reason) {
    try {
      const booking = await bookingRepository.findById(bookingId);

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      if (!['pending', 'confirmed'].includes(booking.status)) {
        throw new Error('Booking cannot be cancelled');
      }

      // Check if refund is applicable
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
      const now = new Date();
      const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

      let refundAmount = 0;
      let refundPercentage = 0;

      if (hoursUntilBooking >= 24) {
        refundPercentage = 100; // Full refund
      } else if (hoursUntilBooking >= 12) {
        refundPercentage = 75; // 75% refund
      } else if (hoursUntilBooking >= 6) {
        refundPercentage = 50; // 50% refund
      } else {
        refundPercentage = 0; // No refund
      }

      refundAmount = (parseFloat(booking.amount) * refundPercentage) / 100;

      // Cancel booking
      await bookingRepository.cancel(bookingId, reason);

      // Process refund if applicable
      if (refundAmount > 0 && booking.payment_status === 'completed') {
        await paymentService.processRefund(
          booking.razorpay_payment_id,
          refundAmount,
          'Booking cancellation'
        );
      }

      logger.info(`Booking cancelled: ${bookingId}, Refund: ₹${refundAmount}`);
      return {
        success: true,
        refundAmount,
        refundPercentage,
        message: `Booking cancelled. Refund of ₹${refundAmount} will be processed.`
      };
    } catch (error) {
      logger.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Get available seats
   */
  async getAvailableSeats(libraryId, bookingDate, startTime, endTime) {
    return await bookingRepository.getAvailableSeats(libraryId, bookingDate, startTime, endTime);
  }

  /**
   * Check-in booking
   */
  async checkIn(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    if (booking.status !== 'confirmed') {
      throw new Error('Booking is not confirmed');
    }

    return await bookingRepository.checkIn(bookingId);
  }

  /**
   * Check-out booking
   */
  async checkOut(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    if (!booking.check_in_time) {
      throw new Error('Booking not checked in');
    }

    return await bookingRepository.checkOut(bookingId);
  }

  /**
   * Get user booking statistics
   */
  async getUserStats(userId) {
    const stats = await bookingRepository.getUserStats(userId);
    
    return {
      totalBookings: parseInt(stats.total_bookings) || 0,
      completedBookings: parseInt(stats.completed_bookings) || 0,
      cancelledBookings: parseInt(stats.cancelled_bookings) || 0,
      totalSpent: parseFloat(stats.total_spent) || 0,
      avgDuration: parseFloat(stats.avg_duration) || 0
    };
  }
}

module.exports = new BookingService();



