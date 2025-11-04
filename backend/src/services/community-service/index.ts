/**
 * 👥 COMMUNITY & GROUPS SERVICE
 * 
 * Telegram-like messaging system with:
 * - Admin-created Communities (Exam-based: UPSC, SSC, Railway, etc.)
 * - Owner-created Groups (Library-specific)
 * - Real-time messaging with Socket.io
 * - File sharing (PDF, images, videos)
 * - Member management
 * - Message history
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { createClient } from '@supabase/supabase-js';
import { getSocketIO } from '../../utils/socketHelpers';
import { logger } from '../../utils/logger';

const PORT = parseInt(process.env.COMMUNITY_SERVICE_PORT || '3011', 10);
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

// File upload support
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Health check
fastify.get('/health', async () => {
  return { 
    status: 'ok', 
    service: 'community-service',
    timestamp: new Date().toISOString(),
  };
});

// ============================================
// COMMUNITY MANAGEMENT (Admin-created)
// ============================================

/**
 * Create a new community (Admin only)
 * POST /api/communities
 */
fastify.post('/api/communities', async (request, reply) => {
  try {
    const { name, description, category, examType, icon, createdBy } = request.body as any;

    if (!name || !category || !createdBy) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    const { data: community, error } = await supabase
      .from('communities')
      .insert({
        name,
        description,
        category, // 'exam_prep', 'general', 'announcement'
        exam_type: examType, // 'UPSC', 'SSC', 'Railway', 'Banking', etc.
        icon,
        created_by: createdBy,
        type: 'community', // vs 'group'
        member_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating community:', error);
      return reply.code(500).send({ error: 'Failed to create community' });
    }

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.emit('community:created', community);
    }

    return reply.code(201).send({
      success: true,
      message: 'Community created successfully',
      data: community,
    });
  } catch (error) {
    logger.error('Error creating community:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get all communities
 * GET /api/communities
 */
fastify.get('/api/communities', async (request, reply) => {
  try {
    const { data: communities, error } = await supabase
      .from('communities')
      .select('*')
      .eq('type', 'community')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching communities:', error);
      return reply.code(500).send({ error: 'Failed to fetch communities' });
    }

    return reply.send({
      success: true,
      data: communities || [],
    });
  } catch (error) {
    logger.error('Error fetching communities:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// ============================================
// GROUP MANAGEMENT (Library Owner-created)
// ============================================

/**
 * Create a new group (Library Owner)
 * POST /api/groups
 */
fastify.post('/api/groups', async (request, reply) => {
  try {
    const { name, description, libraryId, createdBy, isPrivate } = request.body as any;

    if (!name || !libraryId || !createdBy) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    const { data: group, error } = await supabase
      .from('communities')
      .insert({
        name,
        description,
        library_id: libraryId,
        created_by: createdBy,
        type: 'group', // vs 'community'
        is_private: isPrivate || false,
        member_count: 1, // Creator is automatically a member
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating group:', error);
      return reply.code(500).send({ error: 'Failed to create group' });
    }

    // Auto-add creator as admin member
    await supabase.from('community_members').insert({
      community_id: group.id,
      user_id: createdBy,
      role: 'admin',
      joined_at: new Date().toISOString(),
    });

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.to(`library:${libraryId}`).emit('group:created', group);
    }

    return reply.code(201).send({
      success: true,
      message: 'Group created successfully',
      data: group,
    });
  } catch (error) {
    logger.error('Error creating group:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get all groups for a library
 * GET /api/groups/library/:libraryId
 */
fastify.get('/api/groups/library/:libraryId', async (request, reply) => {
  try {
    const { libraryId } = request.params as any;

    const { data: groups, error } = await supabase
      .from('communities')
      .select('*')
      .eq('type', 'group')
      .eq('library_id', libraryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching groups:', error);
      return reply.code(500).send({ error: 'Failed to fetch groups' });
    }

    return reply.send({
      success: true,
      data: groups || [],
    });
  } catch (error) {
    logger.error('Error fetching groups:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get all communities and groups (Student view)
 * GET /api/communities/all
 */
fastify.get('/api/communities/all', async (request, reply) => {
  try {
    const { data: all, error } = await supabase
      .from('communities')
      .select('*')
      .eq('is_active', true)
      .order('member_count', { ascending: false });

    if (error) {
      logger.error('Error fetching all communities:', error);
      return reply.code(500).send({ error: 'Failed to fetch communities' });
    }

    return reply.send({
      success: true,
      data: all || [],
    });
  } catch (error) {
    logger.error('Error fetching communities:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// ============================================
// MEMBER MANAGEMENT
// ============================================

/**
 * Join a community/group
 * POST /api/communities/:id/join
 */
fastify.post('/api/communities/:id/join', async (request, reply) => {
  try {
    const { id } = request.params as any;
    const { userId, userName } = request.body as any;

    if (!userId) {
      return reply.code(400).send({ error: 'User ID required' });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return reply.code(400).send({ error: 'Already a member' });
    }

    // Add member
    const { error: memberError } = await supabase
      .from('community_members')
      .insert({
        community_id: id,
        user_id: userId,
        user_name: userName,
        role: 'member',
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      logger.error('Error adding member:', memberError);
      return reply.code(500).send({ error: 'Failed to join community' });
    }

    // Increment member count
    const { data: updated } = await supabase
      .from('communities')
      .update({ member_count: supabase.rpc('increment', { column_name: 'member_count' }) })
      .eq('id', id)
      .select()
      .single();

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.to(`community:${id}`).emit('member:joined', { userId, userName, communityId: id });
    }

    return reply.send({
      success: true,
      message: 'Joined successfully',
      data: updated,
    });
  } catch (error) {
    logger.error('Error joining community:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Leave a community/group
 * POST /api/communities/:id/leave
 */
fastify.post('/api/communities/:id/leave', async (request, reply) => {
  try {
    const { id } = request.params as any;
    const { userId } = request.body as any;

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error leaving community:', error);
      return reply.code(500).send({ error: 'Failed to leave community' });
    }

    // Decrement member count
    await supabase
      .from('communities')
      .update({ member_count: supabase.rpc('decrement', { column_name: 'member_count' }) })
      .eq('id', id);

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.to(`community:${id}`).emit('member:left', { userId, communityId: id });
    }

    return reply.send({
      success: true,
      message: 'Left successfully',
    });
  } catch (error) {
    logger.error('Error leaving community:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get members of a community/group
 * GET /api/communities/:id/members
 */
fastify.get('/api/communities/:id/members', async (request, reply) => {
  try {
    const { id } = request.params as any;

    const { data: members, error } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', id)
      .order('joined_at', { ascending: false });

    if (error) {
      logger.error('Error fetching members:', error);
      return reply.code(500).send({ error: 'Failed to fetch members' });
    }

    return reply.send({
      success: true,
      data: members || [],
    });
  } catch (error) {
    logger.error('Error fetching members:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// ============================================
// MESSAGING (Telegram-like)
// ============================================

/**
 * Send message to community/group
 * POST /api/communities/:id/messages
 */
fastify.post('/api/communities/:id/messages', async (request, reply) => {
  try {
    const { id } = request.params as any;
    const { userId, userName, message, messageType, fileUrl, fileName, fileType } = request.body as any;

    if (!userId || !message) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    // Verify user is a member
    const { data: membership } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', id)
      .eq('user_id', userId)
      .single();

    if (!membership) {
      return reply.code(403).send({ error: 'Not a member of this community' });
    }

    // Insert message
    const { data: newMessage, error } = await supabase
      .from('community_messages')
      .insert({
        community_id: id,
        user_id: userId,
        user_name: userName,
        message,
        message_type: messageType || 'text', // text, file, image, video
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error sending message:', error);
      return reply.code(500).send({ error: 'Failed to send message' });
    }

    // Emit real-time message to all community members
    const io = getSocketIO();
    if (io) {
      io.to(`community:${id}`).emit('message:new', {
        ...newMessage,
        communityId: id,
      });
      logger.info(`Real-time message sent to community: ${id}`);
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
 * Get messages for a community/group
 * GET /api/communities/:id/messages
 */
fastify.get('/api/communities/:id/messages', async (request, reply) => {
  try {
    const { id } = request.params as any;
    const { limit = 100, offset = 0 } = request.query as any;

    const { data: messages, error } = await supabase
      .from('community_messages')
      .select('*')
      .eq('community_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching messages:', error);
      return reply.code(500).send({ error: 'Failed to fetch messages' });
    }

    return reply.send({
      success: true,
      data: (messages || []).reverse(), // Return in chronological order
    });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Upload file to Supabase Storage
 * POST /api/communities/upload
 */
fastify.post('/api/communities/upload', async (request, reply) => {
  try {
    const data = await request.file();
    
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const buffer = await data.toBuffer();
    const filename = `${Date.now()}_${data.filename}`;
    const filepath = `community-files/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error } = await supabase.storage
      .from('studyspot-files')
      .upload(filepath, buffer, {
        contentType: data.mimetype,
        upsert: false,
      });

    if (error) {
      logger.error('Error uploading file:', error);
      return reply.code(500).send({ error: 'Failed to upload file' });
    }

    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('studyspot-files')
      .getPublicUrl(filepath);

    return reply.send({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: publicURL.publicUrl,
        filename: data.filename,
        fileType: data.mimetype,
        size: buffer.length,
      },
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get user's joined communities/groups
 * GET /api/communities/user/:userId
 */
fastify.get('/api/communities/user/:userId', async (request, reply) => {
  try {
    const { userId } = request.params as any;

    const { data: memberships, error } = await supabase
      .from('community_members')
      .select('community_id, communities(*)')
      .eq('user_id', userId);

    if (error) {
      logger.error('Error fetching user communities:', error);
      return reply.code(500).send({ error: 'Failed to fetch communities' });
    }

    const communities = memberships?.map(m => m.communities) || [];

    return reply.send({
      success: true,
      data: communities,
    });
  } catch (error) {
    logger.error('Error fetching user communities:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Delete community/group (Admin/Owner only)
 * DELETE /api/communities/:id
 */
fastify.delete('/api/communities/:id', async (request, reply) => {
  try {
    const { id } = request.params as any;

    // Soft delete - mark as inactive
    const { error } = await supabase
      .from('communities')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      logger.error('Error deleting community:', error);
      return reply.code(500).send({ error: 'Failed to delete community' });
    }

    return reply.send({
      success: true,
      message: 'Community deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting community:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// ============================================
// MEMBER MANAGEMENT (Owner Features)
// ============================================

/**
 * Add student to group (Owner action)
 * POST /api/communities/:id/add-member
 */
fastify.post('/api/communities/:id/add-member', async (request, reply) => {
  try {
    const { id } = request.params as any;
    const { userId, userName, addedBy } = request.body as any;

    if (!userId) {
      return reply.code(400).send({ error: 'User ID required' });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return reply.code(400).send({ error: 'User is already a member' });
    }

    // Add member
    const { data: newMember, error } = await supabase
      .from('community_members')
      .insert({
        community_id: id,
        user_id: userId,
        user_name: userName,
        role: 'member',
        added_by: addedBy,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error adding member:', error);
      return reply.code(500).send({ error: 'Failed to add member' });
    }

    // Increment member count
    await supabase
      .from('communities')
      .update({ member_count: supabase.rpc('increment', { column_name: 'member_count' }) })
      .eq('id', id);

    // Emit real-time notification
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:added', { communityId: id, addedBy });
      io.to(`community:${id}`).emit('member:added', { userId, userName });
    }

    return reply.code(201).send({
      success: true,
      message: 'Member added successfully',
      data: newMember,
    });
  } catch (error) {
    logger.error('Error adding member:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Remove member from group (Owner action)
 * DELETE /api/communities/:id/members/:userId
 */
fastify.delete('/api/communities/:id/members/:userId', async (request, reply) => {
  try {
    const { id, userId } = request.params as any;

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error removing member:', error);
      return reply.code(500).send({ error: 'Failed to remove member' });
    }

    // Decrement member count
    await supabase
      .from('communities')
      .update({ member_count: supabase.rpc('decrement', { column_name: 'member_count' }) })
      .eq('id', id);

    // Notify user
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:removed', { communityId: id });
      io.to(`community:${id}`).emit('member:removed', { userId });
    }

    return reply.send({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    logger.error('Error removing member:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Block user from group
 * POST /api/communities/:id/block/:userId
 */
fastify.post('/api/communities/:id/block/:userId', async (request, reply) => {
  try {
    const { id, userId } = request.params as any;
    const { reason } = request.body as any;

    // Update member status to blocked
    const { error: updateError } = await supabase
      .from('community_members')
      .update({ 
        is_blocked: true,
        blocked_at: new Date().toISOString(),
        block_reason: reason,
      })
      .eq('community_id', id)
      .eq('user_id', userId);

    if (updateError) {
      logger.error('Error blocking user:', updateError);
      return reply.code(500).send({ error: 'Failed to block user' });
    }

    // Notify user
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:blocked', { communityId: id, reason });
    }

    return reply.send({
      success: true,
      message: 'User blocked successfully',
    });
  } catch (error) {
    logger.error('Error blocking user:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Unblock user from group
 * POST /api/communities/:id/unblock/:userId
 */
fastify.post('/api/communities/:id/unblock/:userId', async (request, reply) => {
  try {
    const { id, userId } = request.params as any;

    const { error } = await supabase
      .from('community_members')
      .update({ 
        is_blocked: false,
        blocked_at: null,
        block_reason: null,
      })
      .eq('community_id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error unblocking user:', error);
      return reply.code(500).send({ error: 'Failed to unblock user' });
    }

    // Notify user
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:unblocked', { communityId: id });
    }

    return reply.send({
      success: true,
      message: 'User unblocked successfully',
    });
  } catch (error) {
    logger.error('Error unblocking user:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Generate invite link for group
 * POST /api/communities/:id/invite-link
 */
fastify.post('/api/communities/:id/invite-link', async (request, reply) => {
  try {
    const { id } = request.params as any;
    const { expiresIn } = request.body as any; // hours

    // Generate unique invite code
    const inviteCode = `${id.substring(0, 8)}-${Date.now().toString(36)}`;
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString()
      : null;

    // Store invite link
    const { data: invite, error } = await supabase
      .from('community_invites')
      .insert({
        community_id: id,
        invite_code: inviteCode,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating invite:', error);
      return reply.code(500).send({ error: 'Failed to create invite link' });
    }

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${inviteCode}`;

    return reply.send({
      success: true,
      message: 'Invite link created',
      data: {
        inviteCode,
        inviteLink,
        expiresAt,
      },
    });
  } catch (error) {
    logger.error('Error creating invite link:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Join via invite link
 * POST /api/communities/join/:inviteCode
 */
fastify.post('/api/communities/join/:inviteCode', async (request, reply) => {
  try {
    const { inviteCode } = request.params as any;
    const { userId, userName } = request.body as any;

    // Validate invite
    const { data: invite, error: inviteError } = await supabase
      .from('community_invites')
      .select('*, communities(*)')
      .eq('invite_code', inviteCode)
      .eq('is_active', true)
      .single();

    if (inviteError || !invite) {
      return reply.code(404).send({ error: 'Invalid or expired invite link' });
    }

    // Check expiration
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return reply.code(400).send({ error: 'Invite link has expired' });
    }

    // Add member
    const { error: memberError } = await supabase
      .from('community_members')
      .insert({
        community_id: invite.community_id,
        user_id: userId,
        user_name: userName,
        role: 'member',
        joined_via: 'invite',
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      // Check if already a member
      if (memberError.code === '23505') {
        return reply.code(400).send({ error: 'Already a member' });
      }
      logger.error('Error joining via invite:', memberError);
      return reply.code(500).send({ error: 'Failed to join' });
    }

    // Increment member count and usage count
    await supabase
      .from('communities')
      .update({ member_count: supabase.rpc('increment', { column_name: 'member_count' }) })
      .eq('id', invite.community_id);

    await supabase
      .from('community_invites')
      .update({ usage_count: supabase.rpc('increment', { column_name: 'usage_count' }) })
      .eq('id', invite.id);

    // Notify
    const io = getSocketIO();
    if (io) {
      io.to(`community:${invite.community_id}`).emit('member:joined', { 
        userId, 
        userName, 
        joinedVia: 'invite' 
      });
    }

    return reply.send({
      success: true,
      message: 'Joined successfully via invite',
      data: invite.communities,
    });
  } catch (error) {
    logger.error('Error joining via invite:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Get all students (for owner to add to group)
 * GET /api/students/search
 */
fastify.get('/api/students/search', async (request, reply) => {
  try {
    const { q, libraryId } = request.query as any;

    let query = supabase
      .from('users')
      .select('id, first_name, last_name, email, phone')
      .eq('role', 'student');

    if (q) {
      query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    if (libraryId) {
      // Filter students who have bookings at this library
      query = query.in('id', 
        supabase.from('bookings').select('user_id').eq('library_id', libraryId)
      );
    }

    const { data: students, error } = await query.limit(50);

    if (error) {
      logger.error('Error searching students:', error);
      return reply.code(500).send({ error: 'Failed to search students' });
    }

    return reply.send({
      success: true,
      data: students || [],
    });
  } catch (error) {
    logger.error('Error searching students:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Make user admin of group
 * POST /api/communities/:id/make-admin/:userId
 */
fastify.post('/api/communities/:id/make-admin/:userId', async (request, reply) => {
  try {
    const { id, userId } = request.params as any;

    const { error } = await supabase
      .from('community_members')
      .update({ role: 'admin' })
      .eq('community_id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error making admin:', error);
      return reply.code(500).send({ error: 'Failed to make admin' });
    }

    // Notify user
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:promoted', { communityId: id, role: 'admin' });
    }

    return reply.send({
      success: true,
      message: 'User promoted to admin',
    });
  } catch (error) {
    logger.error('Error making admin:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

/**
 * Remove admin privileges
 * POST /api/communities/:id/remove-admin/:userId
 */
fastify.post('/api/communities/:id/remove-admin/:userId', async (request, reply) => {
  try {
    const { id, userId } = request.params as any;

    const { error } = await supabase
      .from('community_members')
      .update({ role: 'member' })
      .eq('community_id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error removing admin:', error);
      return reply.code(500).send({ error: 'Failed to remove admin' });
    }

    // Notify user
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:demoted', { communityId: id, role: 'member' });
    }

    return reply.send({
      success: true,
      message: 'Admin privileges removed',
    });
  } catch (error) {
    logger.error('Error removing admin:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`👥 Community Service is running on port ${PORT}`);
  } catch (err) {
    logger.error('Error starting community service:', err);
    process.exit(1);
  }
};

start();

