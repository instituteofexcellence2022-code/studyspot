// ============================================
// STUDENT SERVICE  
// Student CRUD + Analytics + Bulk Operations
// Port: 3004
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { coreDb, tenantDbManager } from '../../config/database';
import { logger } from '../../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validator';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';
import { requestLogger } from '../../middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import {
  createStudentSchema,
  updateStudentSchema,
  getStudentsQuerySchema,
  getStudentParamsSchema,
  suspendStudentSchema,
  getStudentAttendanceQuerySchema,
  getStudentPaymentsQuerySchema,
  bulkImportStudentsSchema,
} from '../../validators/student.validator';
import { z } from 'zod';
import type { Student } from '../../types';
import { config } from '../../config/env';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = config.ports.student;

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: config.cors.origins.length > 0 ? config.cors.origins : ['http://localhost:3002'],
  credentials: true,
});

fastify.register(helmet);

// ============================================
// RATE LIMITING
// ============================================

// Register rate limiting in async function
(async () => {
  await registerRateLimit(fastify, SERVICE_RATE_LIMITS.student);
})();

// ============================================
// REQUEST LOGGING
// ============================================

fastify.addHook('onRequest', requestLogger);

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

fastify.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
  // Skip auth for health check
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
// HELPER FUNCTIONS
// ============================================

const generateStudentCode = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `STU${timestamp}${random}`;
};

// ============================================
// ROUTES
// ============================================

// Health check
fastify.get('/health', async () => {
  return {
    success: true,
    data: {
      status: 'healthy',
      service: 'student-service',
      timestamp: new Date().toISOString(),
    },
  };
});

// Get all students (tenant-specific)
fastify.get('/api/v1/students', {
  preHandler: [validateQuery(getStudentsQuerySchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    // Get tenantId from authenticated user
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

    const { status, library_id, search, page = 1, limit = 20 } = request.query as any;

    // Get tenant database connection
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    let query = 'SELECT * FROM students WHERE tenant_id = $1 AND deleted_at IS NULL';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    // Apply filters
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (library_id) {
      query += ` AND library_id = $${paramIndex++}`;
      params.push(library_id);
    }

    if (search) {
      query += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await tenantDb.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await tenantDb.query(query, params);

    return {
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get students error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch students',
      },
    });
  }
});

// Get student by ID
fastify.get('/api/v1/students/:id', {
  preHandler: [validateParams(getStudentParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query<Student>(
      'SELECT * FROM students WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL',
      [id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Student not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get student error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch student',
      },
    });
  }
});

// Create student
fastify.post('/api/v1/students', {
  preHandler: [validateBody(createStudentSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const studentData = request.body as any;

    // Validate required fields
    if (!studentData.first_name || !studentData.phone) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.REQUIRED_FIELD_MISSING,
          message: 'First name and phone are required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Generate student code
    const student_code = generateStudentCode();

    // Insert student
    const result = await tenantDb.query<Student>(
      `INSERT INTO students (
        tenant_id, student_code, first_name, last_name, email, phone, parent_phone,
        date_of_birth, gender, address, city, state, pincode, education_level,
        course, institution, status, library_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        tenantId,
        student_code,
        studentData.first_name,
        studentData.last_name,
        studentData.email,
        studentData.phone,
        studentData.parent_phone,
        studentData.date_of_birth,
        studentData.gender,
        studentData.address,
        studentData.city,
        studentData.state,
        studentData.pincode,
        studentData.education_level,
        studentData.course,
        studentData.institution,
        'active',
        studentData.library_id,
      ]
    );

    logger.info(`✅ Student created: ${student_code}`);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: result.rows[0],
      message: 'Student created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Create student error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create student',
      },
    });
  }
});

// Update student
fastify.put('/api/v1/students/:id', {
  preHandler: [
    validateParams(getStudentParamsSchema),
    validateBody(updateStudentSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const updates = request.body as any;

    delete updates.id;
    delete updates.tenant_id;
    delete updates.student_code;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const fields = Object.keys(updates);
    const setClause = fields.map((field, idx) => `${field} = $${idx + 3}`).join(', ');

    if (!setClause) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'No fields to update',
        },
      });
    }

    const values = [id, tenantId, ...fields.map(f => updates[f])];

    const result = await tenantDb.query<Student>(
      `UPDATE students SET ${setClause} WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Student not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      message: 'Student updated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Update student error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update student',
      },
    });
  }
});

// Delete student (soft delete)
fastify.delete('/api/v1/students/:id', async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'UPDATE students SET deleted_at = NOW() WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL RETURNING id',
      [id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Student not found',
        },
      });
    }

    return {
      success: true,
      message: 'Student deleted successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Delete student error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to delete student',
      },
    });
  }
});

// Get student analytics
fastify.get('/api/v1/students/analytics', async (request: AuthenticatedRequest, reply) => {
  try {
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get statistics
    const statsResult = await tenantDb.query(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(*) FILTER (WHERE status = 'active') as active_students,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended_students,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month
      FROM students 
      WHERE tenant_id = $1 AND deleted_at IS NULL
    `, [tenantId]);

    return {
      success: true,
      data: statsResult.rows[0],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get student analytics error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch analytics',
      },
    });
  }
});

// Suspend student
fastify.post('/api/v1/students/:id/suspend', {
  preHandler: [
    validateParams(getStudentParamsSchema),
    validateBody(suspendStudentSchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const { reason } = request.body as { reason?: string };

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query<Student>(
      `UPDATE students SET status = 'suspended', notes = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *`,
      [reason, id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Student not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      message: 'Student suspended successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Suspend student error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to suspend student',
      },
    });
  }
});

// Reactivate student
fastify.post('/api/v1/students/:id/reactivate', async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query<Student>(
      `UPDATE students SET status = 'active' WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      [id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Student not found',
        },
      });
    }

    return {
      success: true,
      data: result.rows[0],
      message: 'Student reactivated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Reactivate student error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to reactivate student',
      },
    });
  }
});

// Get student attendance
fastify.get('/api/v1/students/:id/attendance', {
  preHandler: [
    validateParams(getStudentParamsSchema),
    validateQuery(getStudentAttendanceQuerySchema),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const { startDate, endDate, limit = 30 } = request.query as any;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    let query = 'SELECT * FROM attendance WHERE student_id = $1 AND tenant_id = $2';
    const params: any[] = [id, tenantId];
    let paramIndex = 3;

    if (startDate) {
      query += ` AND date >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND date <= $${paramIndex++}`;
      params.push(endDate);
    }

    query += ` ORDER BY date DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await tenantDb.query(query, params);

    return {
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get student attendance error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch attendance',
      },
    });
  }
});

// Get student payments
fastify.get('/api/v1/students/:id/payments', async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const { limit = 20 } = request.query as any;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      `SELECT * FROM payments 
       WHERE student_id = $1 AND tenant_id = $2 
       ORDER BY created_at DESC 
       LIMIT $3`,
      [id, tenantId, limit]
    );

    return {
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get student payments error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch payments',
      },
    });
  }
});

// Bulk import students
fastify.post('/api/v1/students/bulk-import', {
  preHandler: [validateBody(bulkImportStudentsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const { students } = request.body as { students: any[] };

    if (!students || !Array.isArray(students) || students.length === 0) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Students array is required',
        },
      });
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const imported: any[] = [];
    const failed: any[] = [];

    for (const student of students) {
      try {
        const student_code = generateStudentCode();
        
        const result = await tenantDb.query(
          `INSERT INTO students (tenant_id, student_code, first_name, last_name, email, phone, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [tenantId, student_code, student.first_name, student.last_name, student.email, student.phone, 'active']
        );

        imported.push(result.rows[0]);
      } catch (error: any) {
        failed.push({ student, error: error.message });
      }
    }

    logger.info(`Bulk import: ${imported.length} success, ${failed.length} failed`);

    return {
      success: true,
      data: {
        imported: imported.length,
        failed: failed.length,
        students: imported,
        failures: failed,
      },
      message: `Imported ${imported.length} students`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Bulk import error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to import students',
      },
    });
  }
});

// ============================================
// STUDENT PROFILE ENHANCEMENTS
// ============================================

// Get student profile with analytics
fastify.get('/api/v1/students/:id/profile', {
  preHandler: [validateParams(getStudentParamsSchema)],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Get student
    const studentResult = await tenantDb.query(
      'SELECT * FROM students WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL',
      [id, tenantId]
    );

    if (!studentResult.rows.length) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Student not found',
        },
      });
    }

    const student = studentResult.rows[0];

    // Get academic goals
    const goalsResult = await tenantDb.query(
      'SELECT * FROM student_academic_goals WHERE student_id = $1 ORDER BY created_at DESC',
      [id]
    ).catch(() => ({ rows: [] }));

    // Get privacy settings
    const privacyResult = await tenantDb.query(
      'SELECT * FROM student_privacy_settings WHERE student_id = $1',
      [id]
    ).catch(() => ({ rows: [] }));

    // Get profile analytics
    const analyticsResult = await tenantDb.query(`
      SELECT 
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(b.total_amount) as total_spent,
        AVG(EXTRACT(EPOCH FROM (b.end_time::timestamp - b.start_time::timestamp))/3600) as avg_hours_per_booking,
        COUNT(DISTINCT DATE(a.date)) as days_attended,
        MAX(a.date) as last_attendance_date
      FROM students s
      LEFT JOIN bookings b ON s.id = b.user_id AND b.tenant_id = $2
      LEFT JOIN attendance a ON s.id = a.student_id AND a.tenant_id = $2
      WHERE s.id = $1
      GROUP BY s.id
    `, [id, tenantId]).catch(() => ({ rows: [{}] }));

    return {
      success: true,
      data: {
        student,
        academicGoals: goalsResult.rows,
        privacySettings: privacyResult.rows[0] || {
          profileVisibility: 'public',
          showEmail: true,
          showPhone: true,
          showLocation: true,
          allowDataSharing: false,
        },
        analytics: analyticsResult.rows[0] || {},
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Get student profile error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to fetch profile',
      },
    });
  }
});

// Update academic goals
fastify.post('/api/v1/students/:id/academic-goals', {
  preHandler: [
    validateParams(getStudentParamsSchema),
    validateBody(z.object({
      goal: z.string().min(1).max(500),
      targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
      status: z.enum(['active', 'completed', 'cancelled']).optional().default('active'),
    })),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const { goal, targetDate, priority, status } = request.body as any;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Create academic_goals table if it doesn't exist
    await tenantDb.query(`
      CREATE TABLE IF NOT EXISTS student_academic_goals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id UUID NOT NULL,
        tenant_id UUID NOT NULL,
        goal TEXT NOT NULL,
        target_date DATE,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      )
    `).catch(() => {});

    const result = await tenantDb.query(
      `INSERT INTO student_academic_goals (student_id, tenant_id, goal, target_date, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, tenantId, goal, targetDate || null, priority, status]
    );

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: result.rows[0],
      message: 'Academic goal created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Create academic goal error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to create academic goal',
      },
    });
  }
});

// Update privacy settings
fastify.put('/api/v1/students/:id/privacy-settings', {
  preHandler: [
    validateParams(getStudentParamsSchema),
    validateBody(z.object({
      profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
      showEmail: z.boolean().optional(),
      showPhone: z.boolean().optional(),
      showLocation: z.boolean().optional(),
      allowDataSharing: z.boolean().optional(),
    })),
  ],
}, async (request: AuthenticatedRequest, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId || request.headers['x-tenant-id'] as string;
    const settings = request.body as any;

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Create privacy_settings table if it doesn't exist
    await tenantDb.query(`
      CREATE TABLE IF NOT EXISTS student_privacy_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id UUID NOT NULL UNIQUE,
        tenant_id UUID NOT NULL,
        profile_visibility VARCHAR(20) DEFAULT 'public',
        show_email BOOLEAN DEFAULT true,
        show_phone BOOLEAN DEFAULT true,
        show_location BOOLEAN DEFAULT true,
        allow_data_sharing BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      )
    `).catch(() => {});

    const fields = Object.keys(settings);
    const setClause = fields.map((field, idx) => `${field} = $${idx + 3}`).join(', ');
    const values = [id, tenantId, ...fields.map(f => settings[f])];

    const result = await tenantDb.query(
      `INSERT INTO student_privacy_settings (student_id, tenant_id, ${fields.join(', ')})
       VALUES ($1, $2, ${fields.map((_, idx) => `$${idx + 3}`).join(', ')})
       ON CONFLICT (student_id) 
       DO UPDATE SET ${setClause}, updated_at = NOW()
       RETURNING *`,
      values
    );

    return {
      success: true,
      data: result.rows[0],
      message: 'Privacy settings updated successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error('Update privacy settings error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to update privacy settings',
      },
    });
  }
});

// ============================================
// START SERVER
// ============================================

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`🎓 Student Service running on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start Student Service', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down Student Service...');
  await fastify.close();
  process.exit(0);
});

