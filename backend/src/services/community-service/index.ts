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
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { tenantDbManager, coreDb } from '../../config/database';
import { getSocketIO } from '../../utils/socketHelpers';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import { authenticate, AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { z } from 'zod';
import { config } from '../../config/env';

dotenv.config();

const PORT = config.ports.community;
const fastify = Fastify({ 
  logger: false,
  requestIdLogLabel: 'reqId',
  requestIdHeader: 'x-request-id',
});

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: config.cors.origins.length > 0 ? config.cors.origins : [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    /\.vercel\.app$/,
    /\.pages\.dev$/,
    /\.netlify\.app$/,
    /\.onrender\.com$/,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'X-Requested-With'],
});

fastify.register(helmet);

// File upload support
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// ============================================
// RATE LIMITING
// ============================================

(async () => {
  await registerRateLimit(fastify, SERVICE_RATE_LIMITS.default);
})();

// ============================================
// REQUEST LOGGING
// ============================================

fastify.addHook('onRequest', requestLogger);

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

fastify.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
  if (request.url === '/health') {
    return;
  }
  return authenticate(request, reply);
});

// ============================================
// ERROR HANDLING
// ============================================

fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createCommunitySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['exam_prep', 'general', 'announcement']),
  examType: z.string().max(100).optional(),
  icon: z.string().max(200).optional(),
  createdBy: z.string().uuid(),
});

const createGroupSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  libraryId: z.string().uuid(),
  createdBy: z.string().uuid(),
  isPrivate: z.boolean().optional().default(false),
});

const communityParamsSchema = z.object({
  id: z.string().uuid(),
});

const communityUserParamsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});

const communityQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

const joinCommunitySchema = z.object({
  userId: z.string().uuid(),
});

const updatePrivacySchema = z.object({
  privacyEnabled: z.boolean(),
});

const sendMessageSchema = z.object({
  userId: z.string().uuid(),
  message: z.string().min(1).max(5000),
  fileUrl: z.string().url().optional(),
  fileType: z.string().max(50).optional(),
});

const addMemberSchema = z.object({
  userId: z.string().uuid(),
});

const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  libraryId: z.string().uuid().optional(),
});

// ============================================
// ROUTES
// ============================================

// Health check
fastify.get('/health', async () => {
  try {
    await coreDb.query('SELECT 1');
    return {
      success: true,
      data: {
        status: 'healthy',
        service: 'community-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  } catch (error: any) {
    logger.error('Health check failed:', error);
    return {
      success: false,
      data: {
        status: 'unhealthy',
        service: 'community-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    };
  }
});

// ============================================
// COMMUNITY MANAGEMENT (Admin-created)
// ============================================

/**
 * 🔒 INDIVIDUAL PRIVACY MODE FOR LIBRARY GROUPS
 * 
 * Each student can choose to be anonymous or show their real name
 * - Students with privacy ON appear as "Student A", "Student B"
 * - Students with privacy OFF show real names
 * - Library owners always see full details (name, email, phone)
 * - Only applies to groups (type='group'), NOT communities
 */
function anonymizeMemberName(userId: string, userName: string, userPrivacyEnabled: boolean, viewerRole: string): string {
  // Owners/admins always see real names
  if (viewerRole === 'library_owner' || viewerRole === 'admin' || viewerRole === 'super_admin') {
    return userName;
  }

  // If this user has privacy enabled, anonymize their name
  if (userPrivacyEnabled) {
    const hash = userId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const letter = String.fromCharCode(65 + (hash % 26)); // A-Z
    return `Student ${letter}`;
  }

  // User chose to show real name
  return userName;
}

/**
 * Get privacy preference for a user in a specific community/group
 * Note: Currently unused but kept for potential future use
 */
// async function getUserPrivacyPreference(communityId: string, userId: string): Promise<boolean> {
//   try {
//     const { data } = await supabase
//       .from('community_members')
//       .select('privacy_enabled')
//       .eq('community_id', communityId)
//       .eq('user_id', userId)
//       .single();
//     
//     return data?.privacy_enabled || false;
//   } catch (error) {
//     return false; // Default to no privacy
//   }
// }

/**
 * Create a new community (Admin only)
 * POST /api/communities
 * 
 * Note: Communities do NOT support individual privacy (only groups do)
 */
fastify.post('/api/communities', {
  preHandler: [
    requireRole('admin', 'super_admin'),
    validateBody(createCommunitySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { name, description, category, examType, icon, createdBy } = request.body as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      `INSERT INTO communities (
        tenant_id, name, description, category, exam_type, icon,
        created_by, type, member_count, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *`,
      [
        tenantId,
        name,
        description || null,
        category,
        examType || null,
        icon || null,
        createdBy,
        'community',
        0,
        true,
      ]
    );

    const community = result.rows[0];

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.emit('community:created', community);
    }

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      message: 'Community created successfully',
      data: community,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error creating community:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create community',
      },
    });
  }
});

/**
 * Get all communities
 * GET /api/communities
 */
fastify.get('/api/communities', {
  preHandler: [validateQuery(communityQuerySchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { page = 1, limit = 20 } = request.query as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get total count
    const countResult = await tenantDb.query(
      'SELECT COUNT(*) FROM communities WHERE tenant_id = $1 AND type = $2 AND is_active = true',
      [tenantId, 'community']
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated communities
    const offset = (page - 1) * limit;
    const communitiesResult = await tenantDb.query(
      `SELECT * FROM communities 
       WHERE tenant_id = $1 AND type = $2 AND is_active = true
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [tenantId, 'community', limit, offset]
    );

    return reply.send({
      success: true,
      data: communitiesResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching communities:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch communities',
      },
    });
  }
});

// ============================================
// GROUP MANAGEMENT (Library Owner-created)
// ============================================

/**
 * Create a new group (Library Owner)
 * POST /api/groups
 */
fastify.post('/api/groups', {
  preHandler: [validateBody(createGroupSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { name, description, libraryId, createdBy, isPrivate } = request.body as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Create group
    const groupResult = await tenantDb.query(
      `INSERT INTO communities (
        tenant_id, name, description, library_id, created_by, type,
        is_private, member_count, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *`,
      [
        tenantId,
        name,
        description || null,
        libraryId,
        createdBy,
        'group',
        isPrivate || false,
        1, // Creator is automatically a member
        true,
      ]
    );

    const group = groupResult.rows[0];

    // Auto-add creator as admin member
    await tenantDb.query(
      `INSERT INTO community_members (
        tenant_id, community_id, user_id, role, joined_at
      ) VALUES ($1, $2, $3, $4, NOW())`,
      [tenantId, group.id, createdBy, 'admin']
    );

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.to(`library:${libraryId}`).emit('group:created', group);
    }

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      message: 'Group created successfully',
      data: group,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error creating group:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create group',
      },
    });
  }
});

/**
 * Get all groups for a library
 * GET /api/groups/library/:libraryId
 */
fastify.get('/api/groups/library/:libraryId', {
  preHandler: [
    validateParams(z.object({ libraryId: z.string().uuid() })),
    validateQuery(communityQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { libraryId } = request.params as any;
    const { page = 1, limit = 20 } = request.query as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get total count
    const countResult = await tenantDb.query(
      'SELECT COUNT(*) FROM communities WHERE tenant_id = $1 AND library_id = $2 AND type = $3 AND is_active = true',
      [tenantId, libraryId, 'group']
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated groups
    const offset = (page - 1) * limit;
    const groupsResult = await tenantDb.query(
      `SELECT * FROM communities 
       WHERE tenant_id = $1 AND library_id = $2 AND type = $3 AND is_active = true
       ORDER BY created_at DESC 
       LIMIT $4 OFFSET $5`,
      [tenantId, libraryId, 'group', limit, offset]
    );

    return reply.send({
      success: true,
      data: groupsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching groups:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch groups',
      },
    });
  }
});

/**
 * Get all communities and groups for a specific student
 * GET /api/communities/all?userId=xxx
 * 
 * Returns:
 * - All exam communities (no restriction)
 * - Only library groups from libraries the student has booked
 */
fastify.get('/api/communities/all', {
  preHandler: [validateQuery(communityQuerySchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { userId } = request.query as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get ALL exam communities (NO RESTRICTION - anyone can see and join)
    const communitiesResult = await tenantDb.query(
      `SELECT * FROM communities 
       WHERE tenant_id = $1 AND is_active = true AND type = $2
       ORDER BY member_count DESC`,
      [tenantId, 'community']
    );

    const communities = communitiesResult.rows;

    // If no userId provided, return all communities only (no groups)
    if (!userId) {
      return reply.send({
        success: true,
        data: communities,
        timestamp: new Date().toISOString(),
      });
    }

    // Get libraries the student has booked
    const bookingsResult = await tenantDb.query(
      'SELECT DISTINCT library_id FROM bookings WHERE user_id = $1 AND tenant_id = $2',
      [userId, tenantId]
    );

    const bookedLibraryIds = bookingsResult.rows.map((b: any) => b.library_id);
    let eligibleGroups: any[] = [];

    // Get library groups ONLY from libraries the student has booked
    if (bookedLibraryIds.length > 0) {
      const placeholders = bookedLibraryIds.map((_, i) => `$${i + 3}`).join(',');
      const groupsResult = await tenantDb.query(
        `SELECT * FROM communities 
         WHERE tenant_id = $1 AND is_active = true AND type = $2 AND library_id IN (${placeholders})
         ORDER BY member_count DESC`,
        [tenantId, 'group', ...bookedLibraryIds]
      );
      eligibleGroups = groupsResult.rows;
    } else {
      logger.info(`Student ${userId} has no bookings → 0 library groups visible`);
    }

    // Combine: ALL communities + FILTERED groups (only from booked libraries)
    const allData = [...communities, ...eligibleGroups];

    logger.info(`Student ${userId} can see: ${communities.length} communities + ${eligibleGroups.length} eligible groups`);

    return reply.send({
      success: true,
      data: allData,
      stats: {
        communities: communities.length,
        eligibleGroups: eligibleGroups.length,
        bookedLibraries: bookedLibraryIds.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching communities:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch communities',
      },
    });
  }
});

// ============================================
// MEMBER MANAGEMENT
// ============================================

/**
 * Join a community/group
 * POST /api/communities/:id/join
 * 
 * For groups: Only customers (students who have booked) can join
 * For communities: Anyone can join
 */
fastify.post('/api/communities/:id/join', {
  preHandler: [
    validateParams(communityParamsSchema),
    validateBody(joinCommunitySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const { userId } = request.body as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get community/group details
    const communityResult = await tenantDb.query(
      'SELECT type, library_id FROM communities WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (communityResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Community/Group not found',
        },
      });
    }

    const community = communityResult.rows[0];

    // Get user name if not provided
    let userName = (request.body as any).userName;
    if (!userName) {
      const userResult = await tenantDb.query(
        'SELECT first_name, last_name FROM students WHERE id = $1 AND tenant_id = $2',
        [userId, tenantId]
      );
      if (userResult.rows.length > 0) {
        userName = `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim();
      }
    }

    // ✅ VALIDATION: ONLY for library GROUPS (NOT communities)
    // Communities are open to everyone, groups require booking
    if (community.type === 'group' && community.library_id) {
      const bookingsResult = await tenantDb.query(
        'SELECT id FROM bookings WHERE library_id = $1 AND user_id = $2 AND tenant_id = $3 LIMIT 1',
        [community.library_id, userId, tenantId]
      );

      if (bookingsResult.rows.length === 0) {
        logger.warn(`Non-customer tried to join group: userId=${userId}, groupId=${id}`);
        return reply.status(HTTP_STATUS.FORBIDDEN).send({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: 'Not eligible to join',
          },
          data: {
            message: 'You must book this library at least once before joining the group',
          },
        });
      }

      logger.info(`✅ Customer verified for GROUP join: userId=${userId}`);
    } else if (community.type === 'community') {
      // Communities are open to everyone - no validation needed
      logger.info(`✅ Joining COMMUNITY (no booking required): userId=${userId}`);
    }

    // Check if already a member
    const existingResult = await tenantDb.query(
      'SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2 AND tenant_id = $3',
      [id, userId, tenantId]
    );

    if (existingResult.rows.length > 0) {
      return reply.status(HTTP_STATUS.CONFLICT).send({
        success: false,
        error: {
          code: ERROR_CODES.CONFLICT,
          message: 'Already a member',
        },
      });
    }

    // Add member
    await tenantDb.query(
      `INSERT INTO community_members (
        tenant_id, community_id, user_id, user_name, role, joined_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [tenantId, id, userId, userName || 'Unknown', 'member']
    );

    // Increment member count
    await tenantDb.query(
      'UPDATE communities SET member_count = member_count + 1 WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.to(`community:${id}`).emit('member:joined', { userId, userName, communityId: id });
    }

    const isGroup = community.type === 'group';
    logger.info(`✅ User joined ${isGroup ? 'group' : 'community'}: ${id}`);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      message: `Joined ${isGroup ? 'group' : 'community'} successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error joining:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to join community',
      },
    });
  }
});

/**
 * Leave a community/group
 * POST /api/communities/:id/leave
 */
fastify.post('/api/communities/:id/leave', {
  preHandler: [
    validateParams(communityParamsSchema),
    validateBody(joinCommunitySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const { userId } = request.body as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Remove member
    const deleteResult = await tenantDb.query(
      'DELETE FROM community_members WHERE community_id = $1 AND user_id = $2 AND tenant_id = $3 RETURNING *',
      [id, userId, tenantId]
    );

    if (deleteResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Member not found',
        },
      });
    }

    // Decrement member count
    await tenantDb.query(
      'UPDATE communities SET member_count = GREATEST(member_count - 1, 0) WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    // Emit real-time event
    const io = getSocketIO();
    if (io) {
      io.to(`community:${id}`).emit('member:left', { userId, communityId: id });
    }

    return reply.send({
      success: true,
      message: 'Left successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error leaving community:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to leave community',
      },
    });
  }
});

/**
 * Toggle privacy mode for a student in a group
 * PUT /api/communities/:id/privacy
 * 
 * Students can choose to be anonymous or show their real name
 */
fastify.put('/api/communities/:id/privacy', {
  preHandler: [
    validateParams(communityParamsSchema),
    validateBody(updatePrivacySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const { userId, privacyEnabled } = request.body as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId || !userId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID and User ID are required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Update member's privacy preference
    const result = await tenantDb.query(
      `UPDATE community_members 
       SET privacy_enabled = $1, updated_at = NOW()
       WHERE community_id = $2 AND user_id = $3 AND tenant_id = $4
       RETURNING *`,
      [privacyEnabled, id, userId, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Member not found',
        },
      });
    }

    logger.info(`Privacy ${privacyEnabled ? 'enabled' : 'disabled'} for user ${userId} in community ${id}`);

    return reply.send({
      success: true,
      message: `Privacy ${privacyEnabled ? 'enabled' : 'disabled'}`,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error toggling privacy:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update privacy',
      },
    });
  }
});

/**
 * Get member's privacy preference in a group
 * GET /api/communities/:id/privacy/:userId
 */
fastify.get('/api/communities/:id/privacy/:userId', {
  preHandler: [validateParams(communityUserParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id, userId } = request.params as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'SELECT privacy_enabled FROM community_members WHERE community_id = $1 AND user_id = $2 AND tenant_id = $3',
      [id, userId, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Member not found',
        },
      });
    }

    return reply.send({
      success: true,
      data: {
        privacyEnabled: result.rows[0].privacy_enabled || false,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching privacy:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch privacy',
      },
    });
  }
});

/**
 * Get members of a community/group
 * GET /api/communities/:id/members
 */
fastify.get('/api/communities/:id/members', {
  preHandler: [
    validateParams(communityParamsSchema),
    validateQuery(communityQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const { page = 1, limit = 50 } = request.query as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get total count
    const countResult = await tenantDb.query(
      'SELECT COUNT(*) FROM community_members WHERE community_id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated members
    const offset = (page - 1) * limit;
    const membersResult = await tenantDb.query(
      `SELECT * FROM community_members 
       WHERE community_id = $1 AND tenant_id = $2
       ORDER BY joined_at DESC 
       LIMIT $3 OFFSET $4`,
      [id, tenantId, limit, offset]
    );

    return reply.send({
      success: true,
      data: membersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching members:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch members',
      },
    });
  }
});

// ============================================
// MESSAGING (Telegram-like)
// ============================================

/**
 * Send message to community/group
 * POST /api/communities/:id/messages
 * 
 * For groups: Respects individual privacy preferences
 */
fastify.post('/api/communities/:id/messages', {
  preHandler: [
    validateParams(communityParamsSchema),
    validateBody(sendMessageSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const { userId, message, fileUrl, fileType } = request.body as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Verify user is a member
    const membershipResult = await tenantDb.query(
      'SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2 AND tenant_id = $3',
      [id, userId, tenantId]
    );

    if (membershipResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: 'Not a member of this community',
        },
      });
    }

    const membership = membershipResult.rows[0];

    // Get user name if not provided
    let userName = (request.body as any).userName;
    if (!userName) {
      const userResult = await tenantDb.query(
        'SELECT first_name, last_name FROM students WHERE id = $1 AND tenant_id = $2',
        [userId, tenantId]
      );
      if (userResult.rows.length > 0) {
        userName = `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim();
      }
    }

    // Get community type
    const communityResult = await tenantDb.query(
      'SELECT type FROM communities WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (communityResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Community not found',
        },
      });
    }

    const isGroup = communityResult.rows[0].type === 'group';

    // Get sender's privacy preference (only for groups)
    const senderPrivacyEnabled = isGroup ? (membership.privacy_enabled || false) : false;

    // Insert message with sender's current display name
    const displayName = (isGroup && senderPrivacyEnabled) 
      ? anonymizeMemberName(userId, userName || 'Unknown', true, 'student')
      : userName || 'Unknown';

    const messageResult = await tenantDb.query(
      `INSERT INTO community_messages (
        tenant_id, community_id, user_id, user_name, display_name, privacy_enabled,
        message, message_type, file_url, file_name, file_type, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *`,
      [
        tenantId,
        id,
        userId,
        userName || 'Unknown',
        displayName,
        senderPrivacyEnabled,
        message,
        (request.body as any).messageType || 'text',
        fileUrl || null,
        (request.body as any).fileName || null,
        fileType || null,
      ]
    );

    const newMessage = messageResult.rows[0];

    // Emit real-time message to all members
    const io = getSocketIO();
    if (io) {
      io.to(`community:${id}`).emit('message:new', {
        ...newMessage,
        communityId: id,
        isGroup,
      });
      logger.info(`Real-time message sent to ${isGroup ? 'group' : 'community'}: ${id}`);
    }

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error sending message:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to send message',
      },
    });
  }
});

const getMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).default(100).optional(),
  offset: z.coerce.number().int().nonnegative().default(0).optional(),
  userRole: z.enum(['student', 'library_owner', 'admin', 'super_admin']).default('student').optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
});

/**
 * Get messages for a community/group
 * GET /api/communities/:id/messages?userRole=student
 * 
 * For groups: Returns display names based on individual privacy preferences
 * For owners: Always returns real names
 */
fastify.get('/api/communities/:id/messages', {
  preHandler: [
    validateParams(communityParamsSchema),
    validateQuery(getMessagesQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const { limit = 100, offset = 0, userRole = 'student', page } = request.query as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get community type
    const communityResult = await tenantDb.query(
      'SELECT type FROM communities WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (communityResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Community not found',
        },
      });
    }

    const isGroup = communityResult.rows[0].type === 'group';

    // Calculate pagination
    const finalOffset = page ? (page - 1) * limit : offset;

    // Get total count
    const countResult = await tenantDb.query(
      'SELECT COUNT(*) FROM community_messages WHERE community_id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get messages
    const messagesResult = await tenantDb.query(
      `SELECT * FROM community_messages 
       WHERE community_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [id, tenantId, limit, finalOffset]
    );

    let processedMessages = messagesResult.rows.reverse(); // Chronological order

    // For owners, show real names; for students in groups, respect individual privacy
    if (isGroup) {
      processedMessages = processedMessages.map((msg: any) => {
        // Owners always see real names
        if (userRole === 'library_owner' || userRole === 'admin' || userRole === 'super_admin') {
          msg.display_name = msg.user_name;
        } else {
          // Students see display_name (anonymous if privacy ON, real if OFF)
          msg.display_name = msg.display_name || msg.user_name;
        }
        return msg;
      });
    }

    return reply.send({
      success: true,
      data: processedMessages,
      isGroup,
      pagination: page ? {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      } : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching messages:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch messages',
      },
    });
  }
});

/**
 * Upload file (Note: File storage migration needed - currently uses Supabase Storage)
 * POST /api/communities/upload
 * 
 * TODO: Migrate to S3/Cloudflare R2 or local storage
 */
fastify.post('/api/communities/upload', async (request: AuthenticatedRequest, reply) => {
  try {
    const data = await request.file();
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    
    if (!data) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'No file uploaded',
        },
      });
    }

    // TODO: Implement file storage (S3, Cloudflare R2, or local)
    // For now, return a placeholder URL
    const filename = `${Date.now()}_${data.filename}`;
    const filepath = `community-files/${tenantId}/${filename}`;

    // Placeholder: In production, upload to S3/Cloudflare R2
    const publicUrl = `${process.env.FILE_STORAGE_URL || 'https://storage.example.com'}/${filepath}`;

    logger.warn('File upload using placeholder storage - needs migration to S3/R2');

    return reply.send({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: publicUrl,
        filename: data.filename,
        fileType: data.mimetype,
        size: (await data.toBuffer()).length,
        filepath,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error uploading file:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to upload file',
      },
    });
  }
});

/**
 * Get user's joined communities/groups
 * GET /api/communities/user/:userId
 */
fastify.get('/api/communities/user/:userId', {
  preHandler: [validateParams(z.object({ userId: z.string().uuid() }))],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { userId } = request.params as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get user's memberships with community details
    const membershipsResult = await tenantDb.query(
      `SELECT c.*, cm.role, cm.joined_at, cm.privacy_enabled
       FROM community_members cm
       INNER JOIN communities c ON c.id = cm.community_id
       WHERE cm.user_id = $1 AND cm.tenant_id = $2 AND c.tenant_id = $2
       ORDER BY cm.joined_at DESC`,
      [userId, tenantId]
    );

    return reply.send({
      success: true,
      data: membershipsResult.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error fetching user communities:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch user communities',
      },
    });
  }
});

/**
 * Delete community/group (Admin/Owner only)
 * DELETE /api/communities/:id
 */
fastify.delete('/api/communities/:id', {
  preHandler: [
    requireRole('admin', 'super_admin', 'library_owner'),
    validateParams(communityParamsSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Soft delete - mark as inactive
    const result = await tenantDb.query(
      `UPDATE communities 
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING *`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Community not found',
        },
      });
    }

    return reply.send({
      success: true,
      message: 'Community deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error deleting community:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to delete community',
      },
    });
  }
});

// ============================================
// MEMBER MANAGEMENT (Owner Features)
// ============================================

/**
 * Add student to group (Owner action)
 * POST /api/communities/:id/add-member
 * 
 * RESTRICTION: Only students who have booked the library can be added
 */
fastify.post('/api/communities/:id/add-member', {
  preHandler: [
    validateParams(communityParamsSchema),
    validateBody(addMemberSchema.extend({ libraryId: z.string().uuid() })),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const { userId, libraryId } = request.body as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // ✅ VALIDATION: Check if student has booked this library at least once
    const bookingsResult = await tenantDb.query(
      'SELECT id FROM bookings WHERE library_id = $1 AND user_id = $2 AND tenant_id = $3 LIMIT 1',
      [libraryId, userId, tenantId]
    );

    if (bookingsResult.rows.length === 0) {
      logger.warn(`Attempt to add non-customer: userId=${userId}, libraryId=${libraryId}`);
      return reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: 'Student has not booked your library',
        },
        data: {
          message: 'You can only add students who have booked your library at least once',
        },
      });
    }

    // Get user name if not provided
    let userName = (request.body as any).userName;
    if (!userName) {
      const userResult = await tenantDb.query(
        'SELECT first_name, last_name FROM students WHERE id = $1 AND tenant_id = $2',
        [userId, tenantId]
      );
      if (userResult.rows.length > 0) {
        userName = `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim();
      }
    }

    // Check if already a member
    const existingResult = await tenantDb.query(
      'SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2 AND tenant_id = $3',
      [id, userId, tenantId]
    );

    if (existingResult.rows.length > 0) {
      return reply.status(HTTP_STATUS.CONFLICT).send({
        success: false,
        error: {
          code: ERROR_CODES.CONFLICT,
          message: 'User is already a member',
        },
      });
    }

    const addedBy = (request.user as any)?.userId || (request.user as any)?.id;

    // Add member
    const memberResult = await tenantDb.query(
      `INSERT INTO community_members (
        tenant_id, community_id, user_id, user_name, role, added_by, joined_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [tenantId, id, userId, userName || 'Unknown', 'member', addedBy]
    );

    const newMember = memberResult.rows[0];

    // Increment member count
    await tenantDb.query(
      'UPDATE communities SET member_count = member_count + 1 WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    // Emit real-time notification
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:added', { communityId: id, addedBy });
      io.to(`community:${id}`).emit('member:added', { userId, userName });
    }

    logger.info(`✅ Added customer ${userName} (${userId}) to group ${id}`);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      message: 'Customer added successfully',
      data: newMember,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error adding member:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to add member',
      },
    });
  }
});

/**
 * Remove member from group (Owner action)
 * DELETE /api/communities/:id/members/:userId
 */
fastify.delete('/api/communities/:id/members/:userId', {
  preHandler: [validateParams(communityUserParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id, userId } = request.params as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Remove member
    const deleteResult = await tenantDb.query(
      'DELETE FROM community_members WHERE community_id = $1 AND user_id = $2 AND tenant_id = $3 RETURNING *',
      [id, userId, tenantId]
    );

    if (deleteResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Member not found',
        },
      });
    }

    // Decrement member count
    await tenantDb.query(
      'UPDATE communities SET member_count = GREATEST(member_count - 1, 0) WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    // Notify user
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:removed', { communityId: id });
      io.to(`community:${id}`).emit('member:removed', { userId });
    }

    return reply.send({
      success: true,
      message: 'Member removed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error removing member:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to remove member',
      },
    });
  }
});

const blockUserSchema = z.object({
  reason: z.string().max(500).optional(),
});

/**
 * Block user from group
 * POST /api/communities/:id/block/:userId
 */
fastify.post('/api/communities/:id/block/:userId', {
  preHandler: [
    validateParams(communityUserParamsSchema),
    validateBody(blockUserSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id, userId } = request.params as any;
    const { reason } = request.body as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Update member status to blocked
    const result = await tenantDb.query(
      `UPDATE community_members 
       SET is_blocked = true, blocked_at = NOW(), block_reason = $1, updated_at = NOW()
       WHERE community_id = $2 AND user_id = $3 AND tenant_id = $4
       RETURNING *`,
      [reason || null, id, userId, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Member not found',
        },
      });
    }

    // Notify user
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:blocked', { communityId: id, reason });
    }

    return reply.send({
      success: true,
      message: 'User blocked successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error blocking user:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to block user',
      },
    });
  }
});

/**
 * Unblock user from group
 * POST /api/communities/:id/unblock/:userId
 */
fastify.post('/api/communities/:id/unblock/:userId', {
  preHandler: [validateParams(communityUserParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id, userId } = request.params as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Update member status to unblocked
    const result = await tenantDb.query(
      `UPDATE community_members 
       SET is_blocked = false, blocked_at = NULL, block_reason = NULL, updated_at = NOW()
       WHERE community_id = $1 AND user_id = $2 AND tenant_id = $3
       RETURNING *`,
      [id, userId, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Member not found',
        },
      });
    }

    // Notify user
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:unblocked', { communityId: id });
    }

    return reply.send({
      success: true,
      message: 'User unblocked successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error unblocking user:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to unblock user',
      },
    });
  }
});

const inviteLinkSchema = z.object({
  expiresIn: z.coerce.number().int().positive().optional(), // hours
});

/**
 * Generate invite link for group
 * POST /api/communities/:id/invite-link
 */
fastify.post('/api/communities/:id/invite-link', {
  preHandler: [
    validateParams(communityParamsSchema),
    validateBody(inviteLinkSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as any;
    const { expiresIn } = request.body as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Generate unique invite code
    const inviteCode = `${id.substring(0, 8)}-${Date.now().toString(36)}`;
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 60 * 60 * 1000)
      : null;

    // Store invite link
    const inviteResult = await tenantDb.query(
      `INSERT INTO community_invites (
        tenant_id, community_id, invite_code, expires_at, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [tenantId, id, inviteCode, expiresAt, true]
    );

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${inviteCode}`;

    return reply.send({
      success: true,
      message: 'Invite link created',
      data: {
        inviteCode,
        inviteLink,
        expiresAt: expiresAt?.toISOString() || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error creating invite link:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create invite link',
      },
    });
  }
});

const joinViaInviteSchema = z.object({
  userId: z.string().uuid(),
  userName: z.string().max(200).optional(),
});

/**
 * Join via invite link
 * POST /api/communities/join/:inviteCode
 */
fastify.post('/api/communities/join/:inviteCode', {
  preHandler: [
    validateParams(z.object({ inviteCode: z.string().min(1) })),
    validateBody(joinViaInviteSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { inviteCode } = request.params as any;
    const { userId, userName } = request.body as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Validate invite
    const inviteResult = await tenantDb.query(
      `SELECT ci.*, c.* 
       FROM community_invites ci
       INNER JOIN communities c ON c.id = ci.community_id
       WHERE ci.invite_code = $1 AND ci.is_active = true AND ci.tenant_id = $2`,
      [inviteCode, tenantId]
    );

    if (inviteResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Invalid or expired invite link',
        },
      });
    }

    const invite = inviteResult.rows[0];

    // Check expiration
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invite link has expired',
        },
      });
    }

    // Get user name if not provided
    let finalUserName = userName;
    if (!finalUserName) {
      const userResult = await tenantDb.query(
        'SELECT first_name, last_name FROM students WHERE id = $1 AND tenant_id = $2',
        [userId, tenantId]
      );
      if (userResult.rows.length > 0) {
        finalUserName = `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim();
      }
    }

    // Check if already a member
    const existingResult = await tenantDb.query(
      'SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2 AND tenant_id = $3',
      [invite.community_id, userId, tenantId]
    );

    if (existingResult.rows.length > 0) {
      return reply.status(HTTP_STATUS.CONFLICT).send({
        success: false,
        error: {
          code: ERROR_CODES.CONFLICT,
          message: 'Already a member',
        },
      });
    }

    // Add member
    await tenantDb.query(
      `INSERT INTO community_members (
        tenant_id, community_id, user_id, user_name, role, joined_via, joined_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [tenantId, invite.community_id, userId, finalUserName || 'Unknown', 'member', 'invite']
    );

    // Increment member count and usage count
    await tenantDb.query(
      'UPDATE communities SET member_count = member_count + 1 WHERE id = $1 AND tenant_id = $2',
      [invite.community_id, tenantId]
    );

    await tenantDb.query(
      'UPDATE community_invites SET usage_count = COALESCE(usage_count, 0) + 1 WHERE id = $1 AND tenant_id = $2',
      [invite.id, tenantId]
    );

    // Notify
    const io = getSocketIO();
    if (io) {
      io.to(`community:${invite.community_id}`).emit('member:joined', { 
        userId, 
        userName: finalUserName, 
        joinedVia: 'invite' 
      });
    }

    return reply.send({
      success: true,
      message: 'Joined successfully via invite',
      data: {
        id: invite.community_id,
        name: invite.name,
        type: invite.type,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error joining via invite:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to join via invite',
      },
    });
  }
});

/**
 * Get all students (for owner to add to group)
 * GET /api/students/search?libraryId=xxx&q=search
 * 
 * ONLY returns students who have booked the library at least once
 */
fastify.get('/api/students/search', {
  preHandler: [validateQuery(searchQuerySchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { q, libraryId } = request.query as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    // Library ID is REQUIRED - owners can only add their customers
    if (!libraryId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Library ID is required',
        },
        data: {
          message: 'You can only add students who have booked your library',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // First, get all students who have booked this library (at least once)
    const bookingsResult = await tenantDb.query(
      'SELECT DISTINCT user_id FROM bookings WHERE library_id = $1 AND tenant_id = $2 AND user_id IS NOT NULL',
      [libraryId, tenantId]
    );

    const customerIds = bookingsResult.rows.map((b: any) => b.user_id);

    if (customerIds.length === 0) {
      return reply.send({
        success: true,
        data: [],
        message: 'No students have booked your library yet',
        timestamp: new Date().toISOString(),
      });
    }

    // Build query for students who have booked
    let query = `
      SELECT id, first_name, last_name, email, phone
      FROM students
      WHERE tenant_id = $1 AND id = ANY($2::uuid[])
    `;
    const params: any[] = [tenantId, customerIds];

    // Apply search filter if provided
    if (q && q.trim()) {
      query += ` AND (
        first_name ILIKE $${params.length + 1} OR 
        last_name ILIKE $${params.length + 1} OR 
        email ILIKE $${params.length + 1}
      )`;
      params.push(`%${q}%`);
    }

    query += ' LIMIT 50';

    const studentsResult = await tenantDb.query(query, params);

    logger.info(`Found ${studentsResult.rows.length} customers for library ${libraryId}`);

    return reply.send({
      success: true,
      data: studentsResult.rows,
      message: studentsResult.rows.length === 0 ? 'No matching students found' : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error searching students:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to search students',
      },
    });
  }
});

/**
 * Make user admin of group
 * POST /api/communities/:id/make-admin/:userId
 */
fastify.post('/api/communities/:id/make-admin/:userId', {
  preHandler: [
    requireRole('admin', 'super_admin', 'library_owner'),
    validateParams(communityUserParamsSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id, userId } = request.params as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      `UPDATE community_members 
       SET role = 'admin', updated_at = NOW()
       WHERE community_id = $1 AND user_id = $2 AND tenant_id = $3
       RETURNING *`,
      [id, userId, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Member not found',
        },
      });
    }

    // Notify user
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:promoted', { communityId: id, role: 'admin' });
    }

    return reply.send({
      success: true,
      message: 'User promoted to admin',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error making admin:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to make admin',
      },
    });
  }
});

/**
 * Remove admin privileges
 * POST /api/communities/:id/remove-admin/:userId
 */
fastify.post('/api/communities/:id/remove-admin/:userId', {
  preHandler: [
    requireRole('admin', 'super_admin', 'library_owner'),
    validateParams(communityUserParamsSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id, userId } = request.params as any;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      `UPDATE community_members 
       SET role = 'member', updated_at = NOW()
       WHERE community_id = $1 AND user_id = $2 AND tenant_id = $3
       RETURNING *`,
      [id, userId, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Member not found',
        },
      });
    }

    // Notify user
    const io = getSocketIO();
    if (io) {
      io.to(`user:${userId}`).emit('group:demoted', { communityId: id, role: 'member' });
    }

    return reply.send({
      success: true,
      message: 'Admin privileges removed',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error removing admin:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to remove admin',
      },
    });
  }
});

// Start the server
// ============================================
// START SERVER
// ============================================

export async function startCommunityService() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`✅ Community Service started on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Community Service:', err);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startCommunityService();
}

export default fastify;

