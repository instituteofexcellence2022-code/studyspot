// ============================================
// DOCUMENT SERVICE
// File upload, download, storage management
// Port: 3018
// ============================================

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { coreDb, tenantDbManager } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import { authenticate, AuthenticatedRequest, requireRole } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { z } from 'zod';
import { config } from '../../config/env';
import { randomUUID } from 'crypto';

dotenv.config();

const PORT = config.ports.document;
const fastify: FastifyInstance = Fastify({
  logger: false,
  requestIdLogLabel: 'reqId',
  genReqId: () => randomUUID(),
});

// ============================================
// PLUGINS
// ============================================

fastify.register(cors, {
  origin: config.cors.origins.length > 0 ? config.cors.origins : '*',
  credentials: true,
});

fastify.register(helmet);

fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10,
  },
});

// ============================================
// MIDDLEWARE
// ============================================

fastify.addHook('onRequest', requestLogger);

// Authentication - skip health check
fastify.addHook('onRequest', async (request, reply) => {
  if (request.url === '/health') return;
  await authenticate(request as AuthenticatedRequest, reply);
});

// Rate limiting
(async () => {
  await registerRateLimit(fastify, SERVICE_RATE_LIMITS.default);
})();

// Error handling
fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const uploadDocumentSchema = z.object({
  category: z.enum(['profile', 'booking', 'payment', 'library', 'student', 'other']).default('other'),
  description: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const getDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  category: z.enum(['profile', 'booking', 'payment', 'library', 'student', 'other']).optional(),
  user_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

const documentParamsSchema = z.object({
  id: z.string().uuid(),
});

// ============================================
// HEALTH CHECK
// ============================================

fastify.get('/health', async (request, reply) => {
  try {
    await coreDb.query('SELECT 1');
    
    return reply.send({
      status: 'healthy',
      service: 'document-service',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error: unknown) {
    logger.error('Health check failed:', error);
    return reply.status(HTTP_STATUS.SERVICE_UNAVAILABLE).send({
      status: 'unhealthy',
      service: 'document-service',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// ============================================
// FILE UPLOAD
// ============================================

/**
 * Upload document
 * POST /api/v1/documents/upload
 */
fastify.post('/api/v1/documents/upload', {
  preHandler: [validateBody(uploadDocumentSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const data = await request.file();
    const { category = 'other', description, metadata } = request.body as z.infer<typeof uploadDocumentSchema>;
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
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

    // Read file buffer
    const buffer = await data.toBuffer();
    const fileSize = buffer.length;

    // Validate file size (50MB max)
    if (fileSize > 50 * 1024 * 1024) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'File size exceeds 50MB limit',
        },
      });
    }

    // Generate unique filename
    const fileId = randomUUID();
    const fileExtension = data.filename?.split('.').pop() || 'bin';
    const filename = `${fileId}.${fileExtension}`;
    const filepath = `${tenantId}/${category}/${filename}`;

    // TODO: Upload to S3/Cloudflare R2
    // For now, store metadata in database
    // In production, upload to S3/R2 and store URL
    const storageUrl = `${process.env.FILE_STORAGE_URL || 'https://storage.example.com'}/${filepath}`;

    // Store document metadata
    const result = await tenantDb.query(
      `INSERT INTO documents (
        tenant_id, user_id, filename, original_filename, file_path, file_url,
        file_size, mime_type, category, description, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *`,
      [
        tenantId,
        userId,
        filename,
        data.filename || 'unknown',
        filepath,
        storageUrl,
        fileSize,
        data.mimetype || 'application/octet-stream',
        category,
        description || null,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    logger.info('Document uploaded', {
      documentId: result.rows[0].id,
      filename: data.filename,
      size: fileSize,
      tenantId,
      userId,
    });

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        ...result.rows[0],
        metadata: result.rows[0].metadata ? JSON.parse(result.rows[0].metadata) : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error uploading document:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to upload document',
      },
    });
  }
});

/**
 * Get documents
 * GET /api/v1/documents
 */
fastify.get('/api/v1/documents', {
  preHandler: [validateQuery(getDocumentsQuerySchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { page = 1, limit = 20, category, user_id, start_date, end_date } = request.query as z.infer<typeof getDocumentsQuerySchema>;
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const currentUserId = (request.user as any)?.id || (request.user as any)?.userId;

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

    // Build query
    let query = 'SELECT * FROM documents WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    // Filter by user (non-admin users can only see their own)
    const userRole = (request.user as any)?.role;
    if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'library_owner')) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(currentUserId);
    } else if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (start_date) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = await tenantDb.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await tenantDb.query(query, params);

    // Parse metadata JSON
    const documents = result.rows.map((d: any) => ({
      ...d,
      metadata: d.metadata ? JSON.parse(d.metadata) : null,
    }));

    return reply.send({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page as any),
        limit: parseInt(limit as any),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error fetching documents:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch documents',
      },
    });
  }
});

/**
 * Get document by ID
 * GET /api/v1/documents/:id
 */
fastify.get('/api/v1/documents/:id', {
  preHandler: [validateParams(documentParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as z.infer<typeof documentParamsSchema>;
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
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
      'SELECT * FROM documents WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Document not found',
        },
      });
    }

    const document = result.rows[0];

    // Check access (non-admin users can only access their own)
    const userRole = (request.user as any)?.role;
    if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'library_owner')) {
      if (document.user_id !== userId) {
        return reply.status(HTTP_STATUS.FORBIDDEN).send({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: 'Access denied',
          },
        });
      }
    }

    if (document.metadata) {
      document.metadata = JSON.parse(document.metadata);
    }

    return reply.send({
      success: true,
      data: document,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error fetching document:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch document',
      },
    });
  }
});

/**
 * Download document
 * GET /api/v1/documents/:id/download
 */
fastify.get('/api/v1/documents/:id/download', {
  preHandler: [validateParams(documentParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as z.infer<typeof documentParamsSchema>;
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
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
      'SELECT * FROM documents WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Document not found',
        },
      });
    }

    const document = result.rows[0];

    // Check access
    const userRole = (request.user as any)?.role;
    if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'library_owner')) {
      if (document.user_id !== userId) {
        return reply.status(HTTP_STATUS.FORBIDDEN).send({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: 'Access denied',
          },
        });
      }
    }

    // TODO: Download from S3/R2
    // For now, return URL
    // In production, stream file from S3/R2
    return reply.redirect(document.file_url);
  } catch (error: unknown) {
    logger.error('Error downloading document:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to download document',
      },
    });
  }
});

/**
 * Delete document
 * DELETE /api/v1/documents/:id
 */
fastify.delete('/api/v1/documents/:id', {
  preHandler: [validateParams(documentParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as z.infer<typeof documentParamsSchema>;
    const userId = (request.user as any)?.id || (request.user as any)?.userId;
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

    // Check access before deleting
    const docResult = await tenantDb.query(
      'SELECT * FROM documents WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (docResult.rows.length === 0) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Document not found',
        },
      });
    }

    const document = docResult.rows[0];
    const userRole = (request.user as any)?.role;
    if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'library_owner')) {
      if (document.user_id !== userId) {
        return reply.status(HTTP_STATUS.FORBIDDEN).send({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: 'Access denied',
          },
        });
      }
    }

    // Delete document
    const deleteResult = await tenantDb.query(
      'DELETE FROM documents WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId]
    );

    // TODO: Delete from S3/R2
    // In production, delete file from storage

    logger.info('Document deleted', {
      documentId: id,
      tenantId,
      userId,
    });

    return reply.send({
      success: true,
      message: 'Document deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Error deleting document:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to delete document',
      },
    });
  }
});

// ============================================
// START SERVER
// ============================================

export async function startDocumentService() {
  try {
    await fastify.listen({ port: PORT as number, host: '0.0.0.0' });
    logger.info(`✅ Document Service started on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Document Service:', err);
    process.exit(1);
  }
}

// Start if run directly
if (require.main === module) {
  startDocumentService();
}

