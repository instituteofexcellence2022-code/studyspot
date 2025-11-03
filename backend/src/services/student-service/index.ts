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
import type { Student } from '../../types';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = parseInt(process.env.STUDENT_SERVICE_PORT || '3004');

// ============================================
// MIDDLEWARE
// ============================================

fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3002'],
  credentials: true,
});

fastify.register(helmet);

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
fastify.get('/api/v1/students', async (request, reply) => {
  try {
    // In production, get tenantId from auth middleware
    const tenantId = request.headers['x-tenant-id'] as string;

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
fastify.get('/api/v1/students/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;

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
fastify.post('/api/v1/students', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
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
fastify.put('/api/v1/students/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;
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
fastify.delete('/api/v1/students/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;

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
fastify.get('/api/v1/students/analytics', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
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
fastify.post('/api/v1/students/:id/suspend', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;
    const { reason } = request.body as { reason: string };

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
fastify.post('/api/v1/students/:id/reactivate', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;

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
fastify.get('/api/v1/students/:id/attendance', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;
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
fastify.get('/api/v1/students/:id/payments', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const tenantId = request.headers['x-tenant-id'] as string;
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
fastify.post('/api/v1/students/bulk-import', async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
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

