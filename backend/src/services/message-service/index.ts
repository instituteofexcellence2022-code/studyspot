/**
 * 💬 MESSAGE SERVICE
 * 
 * Handles in-app messaging between students and library owners
 * Features:
 * - Send messages
 * - Receive messages
 * - Mark as read
 * - Delete messages
 * - Real-time notifications via WebSocket
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createClient } from '@supabase/supabase-js';
import { getSocketIO } from '../../utils/socketHelpers';
import { logger } from '../../utils/logger';

const PORT = parseInt(process.env.MESSAGE_SERVICE_PORT || '3010', 10);
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
    service: 'message-service',
    timestamp: new Date().toISOString(),
  };
});

/**
 * Send a message from student to library owner
 * POST /api/messages/send
 */
fastify.post('/api/messages/send', async (request, reply) => {
  try {
    const { libraryId, senderId, senderName, senderRole, message } = request.body as any;

    if (!libraryId || !senderId || !message) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    // Get library owner ID
    const { data: library, error: libraryError } = await supabase
      .from('libraries')
      .select('owner_id')
      .eq('id', libraryId)
      .single();

    if (libraryError || !library) {
      logger.error('Library not found:', libraryError);
      return reply.code(404).send({ error: 'Library not found' });
    }

    // Insert message into database
    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        library_id: libraryId,
        sender_id: senderId,
        sender_name: senderName,
        sender_role: senderRole || 'student',
        receiver_id: library.owner_id,
        receiver_role: 'library_owner',
        message: message,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Error inserting message:', insertError);
      return reply.code(500).send({ error: 'Failed to send message' });
    }

    // Send real-time notification via WebSocket
    const io = getSocketIO();
    if (io) {
      io.to(`user:${library.owner_id}`).emit('message:new', {
        id: newMessage.id,
        libraryId,
        senderId,
        senderName,
        message,
        timestamp: newMessage.created_at,
      });
      logger.info(`Real-time notification sent to owner: ${library.owner_id}`);
    }

    return reply.code(201).send({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get all messages for a library (owner view)
 * GET /api/messages/library/:libraryId
 */
fastify.get('/api/messages/library/:libraryId', async (request, reply) => {
  try {
    const { libraryId } = request.params as any;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('library_id', libraryId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching messages:', error);
      return reply.code(500).send({ error: 'Failed to fetch messages' });
    }

    return reply.send({
      success: true,
      data: messages || [],
    });
  } catch (error) {
    logger.error('Error fetching library messages:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get all messages for a user (student view - sent messages)
 * GET /api/messages/user/:userId
 */
fastify.get('/api/messages/user/:userId', async (request, reply) => {
  try {
    const { userId } = request.params as any;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user messages:', error);
      return reply.code(500).send({ error: 'Failed to fetch messages' });
    }

    return reply.send({
      success: true,
      data: messages || [],
    });
  } catch (error) {
    logger.error('Error fetching user messages:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get unread message count for owner
 * GET /api/messages/unread/:ownerId
 */
fastify.get('/api/messages/unread/:ownerId', async (request, reply) => {
  try {
    const { ownerId } = request.params as any;

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', ownerId)
      .eq('is_read', false);

    if (error) {
      logger.error('Error counting unread messages:', error);
      return reply.code(500).send({ error: 'Failed to count messages' });
    }

    return reply.send({
      success: true,
      unreadCount: count || 0,
    });
  } catch (error) {
    logger.error('Error counting unread messages:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Mark message as read
 * PUT /api/messages/:messageId/read
 */
fastify.put('/api/messages/:messageId/read', async (request, reply) => {
  try {
    const { messageId } = request.params as any;

    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      logger.error('Error marking message as read:', error);
      return reply.code(500).send({ error: 'Failed to mark message as read' });
    }

    // Notify sender that message was read (optional)
    const io = getSocketIO();
    if (io && data) {
      io.to(`user:${data.sender_id}`).emit('message:read', {
        messageId,
        readAt: data.read_at,
      });
    }

    return reply.send({
      success: true,
      message: 'Message marked as read',
      data,
    });
  } catch (error) {
    logger.error('Error marking message as read:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Delete a message
 * DELETE /api/messages/:messageId
 */
fastify.delete('/api/messages/:messageId', async (request, reply) => {
  try {
    const { messageId } = request.params as any;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      logger.error('Error deleting message:', error);
      return reply.code(500).send({ error: 'Failed to delete message' });
    }

    return reply.send({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting message:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Reply to a message (owner to student)
 * POST /api/messages/:messageId/reply
 */
fastify.post('/api/messages/:messageId/reply', async (request, reply) => {
  try {
    const { messageId } = request.params as any;
    const { senderId, senderName, message } = request.body as any;

    // Get original message
    const { data: originalMessage, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError || !originalMessage) {
      return reply.code(404).send({ error: 'Original message not found' });
    }

    // Insert reply
    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        library_id: originalMessage.library_id,
        sender_id: senderId,
        sender_name: senderName,
        sender_role: 'library_owner',
        receiver_id: originalMessage.sender_id,
        receiver_role: 'student',
        message: message,
        is_read: false,
        parent_message_id: messageId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Error sending reply:', insertError);
      return reply.code(500).send({ error: 'Failed to send reply' });
    }

    // Send real-time notification to student
    const io = getSocketIO();
    if (io) {
      io.to(`user:${originalMessage.sender_id}`).emit('message:new', {
        id: newMessage.id,
        libraryId: originalMessage.library_id,
        senderId,
        senderName,
        message,
        timestamp: newMessage.created_at,
        isReply: true,
      });
      logger.info(`Reply notification sent to student: ${originalMessage.sender_id}`);
    }

    return reply.code(201).send({
      success: true,
      message: 'Reply sent successfully',
      data: newMessage,
    });
  } catch (error) {
    logger.error('Error sending reply:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`💬 Message Service is running on port ${PORT}`);
  } catch (err) {
    logger.error('Error starting message service:', err);
    process.exit(1);
  }
};

start();

