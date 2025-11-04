/**
 * 📍 ATTENDANCE SERVICE
 * 
 * QR-based attendance tracking system:
 * - Check-in/Check-out via QR code scanning
 * - Real-time attendance tracking
 * - Study duration calculation
 * - Attendance reports and analytics
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createClient } from '@supabase/supabase-js';
import { getSocketIO } from '../../utils/socketHelpers';
import { logger } from '../../utils/logger';

const PORT = parseInt(process.env.ATTENDANCE_SERVICE_PORT || '3012', 10);
const fastify = Fastify({ logger: true });

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS configuration
fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    /\.vercel\.app$/,
    /\.pages\.dev$/,
  ],
  credentials: true,
});

// Health check
fastify.get('/health', async () => {
  return {
    status: 'ok',
    service: 'attendance-service',
    timestamp: new Date().toISOString(),
  };
});

// ============================================
// QR CODE VALIDATION
// ============================================

/**
 * Validate QR code data
 * POST /api/attendance/validate-qr
 */
fastify.post('/api/attendance/validate-qr', async (request, reply) => {
  try {
    const { qrData } = request.body as any;

    if (!qrData) {
      return reply.code(400).send({ error: 'QR data required' });
    }

    // Parse QR code JSON
    let parsed;
    try {
      parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (error) {
      return reply.code(400).send({ error: 'Invalid QR code format' });
    }

    // Validate QR code structure
    if (!parsed.libraryId || !parsed.action) {
      return reply.code(400).send({ error: 'Invalid QR code data' });
    }

    // Check if action is valid
    if (!['check_in', 'check_out'].includes(parsed.action)) {
      return reply.code(400).send({ error: 'Invalid action type' });
    }

    logger.info(`✅ QR code validated: ${parsed.action} for library ${parsed.libraryId}`);

    return reply.send({
      success: true,
      data: parsed,
      message: 'QR code is valid',
    });
  } catch (error) {
    logger.error('Error validating QR code:', error);
    return reply.code(500).send({ error: 'Failed to validate QR code' });
  }
});

// ============================================
// ATTENDANCE OPERATIONS
// ============================================

/**
 * Mark check-in
 * POST /api/attendance/check-in
 */
fastify.post('/api/attendance/check-in', async (request, reply) => {
  try {
    const { userId, userName, libraryId, libraryName, qrData, location } = request.body as any;

    if (!userId || !libraryId) {
      return reply.code(400).send({ error: 'User ID and Library ID required' });
    }

    // Check if student already has an active check-in
    const { data: activeSession } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('library_id', libraryId)
      .is('check_out_time', null)
      .single();

    if (activeSession) {
      return reply.code(400).send({
        error: 'Already checked in',
        message: 'You already have an active session. Please check-out first.',
        data: activeSession,
      });
    }

    // Create new check-in record
    const { data: attendance, error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        user_name: userName,
        library_id: libraryId,
        library_name: libraryName,
        check_in_time: new Date().toISOString(),
        check_in_method: 'qr-code',
        check_in_location: location || 'QR Scanner',
        qr_data: qrData,
        status: 'checked-in',
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating check-in:', error);
      return reply.code(500).send({ error: 'Failed to check-in' });
    }

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.to(`library:${libraryId}`).emit('attendance:check-in', {
        userId,
        userName,
        libraryId,
        timestamp: new Date().toISOString(),
      });
      io.to(`user:${userId}`).emit('attendance:confirmed', {
        type: 'check-in',
        libraryName,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`✅ Check-in successful: ${userName} at ${libraryName}`);

    return reply.code(201).send({
      success: true,
      message: `Checked in successfully at ${libraryName}!`,
      data: attendance,
    });
  } catch (error) {
    logger.error('Error during check-in:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Mark check-out
 * POST /api/attendance/check-out
 */
fastify.post('/api/attendance/check-out', async (request, reply) => {
  try {
    const { userId, libraryId, qrData, location } = request.body as any;

    if (!userId || !libraryId) {
      return reply.code(400).send({ error: 'User ID and Library ID required' });
    }

    // Find active check-in session
    const { data: activeSession, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('library_id', libraryId)
      .is('check_out_time', null)
      .order('check_in_time', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !activeSession) {
      return reply.code(400).send({
        error: 'No active session',
        message: 'You need to check-in first before checking out.',
      });
    }

    // Calculate duration
    const checkInTime = new Date(activeSession.check_in_time);
    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - checkInTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}h ${minutes}m`;

    // Update check-out
    const { data: updated, error: updateError } = await supabase
      .from('attendance')
      .update({
        check_out_time: checkOutTime.toISOString(),
        check_out_method: 'qr-code',
        check_out_location: location || 'QR Scanner',
        duration_minutes: Math.floor(durationMs / (1000 * 60)),
        duration: duration,
        status: 'checked-out',
      })
      .eq('id', activeSession.id)
      .select()
      .single();

    if (updateError) {
      logger.error('Error updating check-out:', updateError);
      return reply.code(500).send({ error: 'Failed to check-out' });
    }

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.to(`library:${libraryId}`).emit('attendance:check-out', {
        userId,
        userName: activeSession.user_name,
        libraryId,
        duration,
        timestamp: checkOutTime.toISOString(),
      });
      io.to(`user:${userId}`).emit('attendance:confirmed', {
        type: 'check-out',
        libraryName: activeSession.library_name,
        duration,
        timestamp: checkOutTime.toISOString(),
      });
    }

    logger.info(`✅ Check-out successful: ${activeSession.user_name} - Duration: ${duration}`);

    return reply.send({
      success: true,
      message: `Checked out successfully! Study duration: ${duration}`,
      data: updated,
      duration,
    });
  } catch (error) {
    logger.error('Error during check-out:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get current attendance status for user
 * GET /api/attendance/status/:userId
 */
fastify.get('/api/attendance/status/:userId', async (request, reply) => {
  try {
    const { userId } = request.params as any;

    // Get active session
    const { data: activeSession } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .is('check_out_time', null)
      .order('check_in_time', { ascending: false })
      .limit(1)
      .single();

    if (activeSession) {
      // Calculate current duration
      const checkInTime = new Date(activeSession.check_in_time);
      const now = new Date();
      const durationMs = now.getTime() - checkInTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return reply.send({
        success: true,
        isCheckedIn: true,
        data: {
          ...activeSession,
          currentDuration: `${hours}h ${minutes}m`,
        },
      });
    }

    return reply.send({
      success: true,
      isCheckedIn: false,
      data: null,
    });
  } catch (error) {
    logger.error('Error fetching attendance status:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get attendance history for user
 * GET /api/attendance/history/:userId?limit=10
 */
fastify.get('/api/attendance/history/:userId', async (request, reply) => {
  try {
    const { userId } = request.params as any;
    const { limit = 10 } = request.query as any;

    const { data: history, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('check_in_time', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching attendance history:', error);
      return reply.code(500).send({ error: 'Failed to fetch history' });
    }

    return reply.send({
      success: true,
      data: history || [],
    });
  } catch (error) {
    logger.error('Error fetching attendance history:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get attendance for library (owner view)
 * GET /api/attendance/library/:libraryId?date=2025-11-04
 */
fastify.get('/api/attendance/library/:libraryId', async (request, reply) => {
  try {
    const { libraryId } = request.params as any;
    const { date } = request.query as any;

    let query = supabase
      .from('attendance')
      .select('*')
      .eq('library_id', libraryId);

    if (date) {
      query = query.eq('date', date);
    } else {
      // Default to today
      query = query.eq('date', new Date().toISOString().split('T')[0]);
    }

    const { data: attendance, error } = await query.order('check_in_time', { ascending: false });

    if (error) {
      logger.error('Error fetching library attendance:', error);
      return reply.code(500).send({ error: 'Failed to fetch attendance' });
    }

    // Calculate stats
    const stats = {
      total: attendance?.length || 0,
      checkedIn: attendance?.filter(a => a.status === 'checked-in').length || 0,
      checkedOut: attendance?.filter(a => a.status === 'checked-out').length || 0,
    };

    return reply.send({
      success: true,
      data: attendance || [],
      stats,
    });
  } catch (error) {
    logger.error('Error fetching library attendance:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`📍 Attendance Service is running on port ${PORT}`);
  } catch (err) {
    logger.error('Error starting attendance service:', err);
    process.exit(1);
  }
};

start();

