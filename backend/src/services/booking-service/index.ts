/**
 * 📚 BOOKING SERVICE
 * 
 * Handles all booking-related operations:
 * - Create/Read/Update/Delete bookings
 * - Real-time booking notifications
 * - Booking status management
 * - Library owner and student booking views
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';
import { emitBookingCreated, emitBookingUpdated, emitBookingCancelled } from '../../utils/socketHelpers';

const PORT = process.env.BOOKING_SERVICE_PORT || 3007;
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: SupabaseClient;

// Initialize Supabase client
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  logger.info('✅ Booking Service: Supabase connected');
} else {
  logger.warn('⚠️ Booking Service: Supabase credentials missing - using mock data');
}

interface Booking {
  id?: string;
  user_id: string;
  library_id: string;
  seat_id?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'completed';
  total_amount: number;
  payment_status?: 'pending' | 'paid' | 'refunded';
  created_at?: string;
  updated_at?: string;
}

// Mock bookings for development
const mockBookings: any[] = [
  {
    id: '1',
    user_id: 'user1',
    library_id: 'lib1',
    seat_id: 'seat1',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
    status: 'confirmed',
    total_amount: 500,
    payment_status: 'paid',
    studentName: 'Rajesh Kumar',
    libraryName: 'Central Study Hub',
    created_at: new Date().toISOString(),
  },
];

/**
 * Create a new booking
 */
async function createBooking(data: Booking) {
  try {
    if (supabase) {
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: data.user_id,
            library_id: data.library_id,
            seat_id: data.seat_id,
            start_time: data.start_time,
            end_time: data.end_time,
            status: data.status || 'pending',
            total_amount: data.total_amount,
            payment_status: data.payment_status || 'pending',
          },
        ])
        .select(`
          *,
          users:user_id (id, first_name, last_name, email),
          libraries:library_id (id, name, address)
        `)
        .single();

      if (error) throw error;

      // 🔴 Emit real-time event
      const enrichedBooking = {
        ...booking,
        studentName: booking.users ? `${booking.users.first_name} ${booking.users.last_name}` : 'Unknown',
        libraryName: booking.libraries?.name || 'Unknown',
      };
      emitBookingCreated(enrichedBooking);

      return { success: true, data: enrichedBooking };
    } else {
      // Mock mode
      const newBooking = {
        id: `mock-${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        studentName: 'Mock Student',
        libraryName: 'Mock Library',
      };
      mockBookings.push(newBooking);
      
      // Emit mock event
      emitBookingCreated(newBooking);
      
      return { success: true, data: newBooking };
    }
  } catch (error: any) {
    logger.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Get all bookings (with filters)
 */
async function getBookings(filters: {
  userId?: string;
  libraryId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const { userId, libraryId, status, startDate, endDate, page = 1, limit = 50 } = filters;

    if (supabase) {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          users:user_id (id, first_name, last_name, email, phone),
          libraries:library_id (id, name, address, city),
          seats:seat_id (id, seat_number, seat_type)
        `, { count: 'exact' });

      // Apply filters
      if (userId) query = query.eq('user_id', userId);
      if (libraryId) query = query.eq('library_id', libraryId);
      if (status) query = query.eq('status', status);
      if (startDate) query = query.gte('start_time', startDate);
      if (endDate) query = query.lte('end_time', endDate);

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data: bookings, error, count } = await query;

      if (error) throw error;

      // Enrich bookings with friendly names
      const enrichedBookings = bookings?.map(booking => ({
        ...booking,
        studentName: booking.users ? `${booking.users.first_name} ${booking.users.last_name}` : 'Unknown',
        libraryName: booking.libraries?.name || 'Unknown',
        date: booking.start_time?.split('T')[0],
        time: new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })) || [];

      return {
        success: true,
        data: enrichedBookings,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } else {
      // Mock mode - return mock bookings
      let filteredBookings = [...mockBookings];

      if (userId) filteredBookings = filteredBookings.filter(b => b.user_id === userId);
      if (libraryId) filteredBookings = filteredBookings.filter(b => b.library_id === libraryId);
      if (status) filteredBookings = filteredBookings.filter(b => b.status === status);

      return {
        success: true,
        data: filteredBookings,
        pagination: {
          page: 1,
          limit: filteredBookings.length,
          total: filteredBookings.length,
          totalPages: 1,
        },
      };
    }
  } catch (error: any) {
    logger.error('Error fetching bookings:', error);
    throw error;
  }
}

/**
 * Get booking by ID
 */
async function getBookingById(id: string) {
  try {
    if (supabase) {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users:user_id (id, first_name, last_name, email, phone),
          libraries:library_id (id, name, address, city),
          seats:seat_id (id, seat_number, seat_type)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          ...booking,
          studentName: booking.users ? `${booking.users.first_name} ${booking.users.last_name}` : 'Unknown',
          libraryName: booking.libraries?.name || 'Unknown',
        },
      };
    } else {
      const booking = mockBookings.find(b => b.id === id);
      return { success: true, data: booking || null };
    }
  } catch (error: any) {
    logger.error('Error fetching booking:', error);
    throw error;
  }
}

/**
 * Update booking
 */
async function updateBooking(id: string, updates: Partial<Booking>) {
  try {
    if (supabase) {
      const { data: booking, error } = await supabase
        .from('bookings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          users:user_id (id, first_name, last_name, email),
          libraries:library_id (id, name, address)
        `)
        .single();

      if (error) throw error;

      // 🔴 Emit real-time event
      const enrichedBooking = {
        ...booking,
        studentName: booking.users ? `${booking.users.first_name} ${booking.users.last_name}` : 'Unknown',
        libraryName: booking.libraries?.name || 'Unknown',
      };
      emitBookingUpdated(enrichedBooking);

      return { success: true, data: enrichedBooking };
    } else {
      const index = mockBookings.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBookings[index] = { ...mockBookings[index], ...updates, updated_at: new Date().toISOString() };
        emitBookingUpdated(mockBookings[index]);
        return { success: true, data: mockBookings[index] };
      }
      throw new Error('Booking not found');
    }
  } catch (error: any) {
    logger.error('Error updating booking:', error);
    throw error;
  }
}

/**
 * Cancel booking
 */
async function cancelBooking(id: string) {
  try {
    const result = await updateBooking(id, { status: 'cancelled' });
    
    // 🔴 Emit cancellation event
    if (result.data) {
      emitBookingCancelled(result.data);
    }
    
    return result;
  } catch (error: any) {
    logger.error('Error cancelling booking:', error);
    throw error;
  }
}

/**
 * Initialize Booking Service
 */
export async function startBookingService() {
  const fastify: FastifyInstance = Fastify({
    logger: false,
  });

  // CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // Health check
  fastify.get('/health', async () => {
    return {
      service: 'booking-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: supabase ? 'connected' : 'mock',
    };
  });

  // ============================================
  // BOOKING ROUTES
  // ============================================

  // Get all bookings
  fastify.get('/api/v1/bookings', async (request, reply) => {
    try {
      const { userId, libraryId, status, startDate, endDate, page, limit } = request.query as any;
      const result = await getBookings({ userId, libraryId, status, startDate, endDate, page, limit });
      return reply.send(result);
    } catch (error: any) {
      logger.error('GET /api/v1/bookings error:', error);
      return reply.code(500).send({
        success: false,
        error: { message: error.message },
      });
    }
  });

  // Get booking by ID
  fastify.get('/api/v1/bookings/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const result = await getBookingById(id);
      return reply.send(result);
    } catch (error: any) {
      logger.error('GET /api/v1/bookings/:id error:', error);
      return reply.code(500).send({
        success: false,
        error: { message: error.message },
      });
    }
  });

  // Create booking
  fastify.post('/api/v1/bookings', async (request, reply) => {
    try {
      const bookingData = request.body as Booking;
      const result = await createBooking(bookingData);
      return reply.code(201).send(result);
    } catch (error: any) {
      logger.error('POST /api/v1/bookings error:', error);
      return reply.code(500).send({
        success: false,
        error: { message: error.message },
      });
    }
  });

  // Update booking
  fastify.put('/api/v1/bookings/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const updates = request.body as Partial<Booking>;
      const result = await updateBooking(id, updates);
      return reply.send(result);
    } catch (error: any) {
      logger.error('PUT /api/v1/bookings/:id error:', error);
      return reply.code(500).send({
        success: false,
        error: { message: error.message },
      });
    }
  });

  // Cancel booking
  fastify.patch('/api/v1/bookings/:id/cancel', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const result = await cancelBooking(id);
      return reply.send(result);
    } catch (error: any) {
      logger.error('PATCH /api/v1/bookings/:id/cancel error:', error);
      return reply.code(500).send({
        success: false,
        error: { message: error.message },
      });
    }
  });

  // Delete booking
  fastify.delete('/api/v1/bookings/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      
      if (supabase) {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) throw error;
      } else {
        const index = mockBookings.findIndex(b => b.id === id);
        if (index !== -1) {
          mockBookings.splice(index, 1);
        }
      }

      return reply.send({ success: true, message: 'Booking deleted' });
    } catch (error: any) {
      logger.error('DELETE /api/v1/bookings/:id error:', error);
      return reply.code(500).send({
        success: false,
        error: { message: error.message },
      });
    }
  });

  // Get bookings by user
  fastify.get('/api/v1/bookings/user/:userId', async (request, reply) => {
    try {
      const { userId } = request.params as any;
      const result = await getBookings({ userId });
      return reply.send(result);
    } catch (error: any) {
      logger.error('GET /api/v1/bookings/user/:userId error:', error);
      return reply.code(500).send({
        success: false,
        error: { message: error.message },
      });
    }
  });

  // Get bookings by library
  fastify.get('/api/v1/bookings/library/:libraryId', async (request, reply) => {
    try {
      const { libraryId } = request.params as any;
      const result = await getBookings({ libraryId });
      return reply.send(result);
    } catch (error: any) {
      logger.error('GET /api/v1/bookings/library/:libraryId error:', error);
      return reply.code(500).send({
        success: false,
        error: { message: error.message },
      });
    }
  });

  // Start server
  try {
    await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });
    logger.info(`🚀 Booking Service running on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Booking Service:', err);
    process.exit(1);
  }
}

// Start service if run directly
if (require.main === module) {
  startBookingService();
}

