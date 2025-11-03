const express = require('express');
const router = express.Router();
const {
  body,
  query,
  param,
  validationResult
} = require('express-validator');
const {
  verifyToken
} = require('../middleware/auth');
const {
  db
} = require('../config/database');
const {
  logger
} = require('../utils/logger');

// ========================================
// VALIDATION MIDDLEWARE
// ========================================

const validateStudent = [body('firstName').trim().isLength({
  min: 2
}).withMessage('First name must be at least 2 characters'), body('lastName').trim().isLength({
  min: 2
}).withMessage('Last name must be at least 2 characters'), body('email').isEmail().normalizeEmail().withMessage('Valid email is required'), body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid phone number required'), body('status').optional().isIn(['active', 'inactive', 'suspended', 'graduated', 'withdrawn']).withMessage('Invalid status'), body('feeStatus').optional().isIn(['paid', 'pending', 'overdue', 'exempt', 'partial']).withMessage('Invalid fee status')];

// ========================================
// GET /api/students - List all students
// ========================================
router.get('/', verifyToken, [query('page').optional().isInt({
  min: 1
}).toInt(), query('limit').optional().isInt({
  min: 1,
  max: 100
}).toInt(), query('search').optional().trim(), query('status').optional().trim(), query('feeStatus').optional().trim(), query('plan').optional().trim(), query('sortBy').optional().isIn(['firstName', 'lastName', 'email', 'enrollmentDate', 'feeStatus', 'studentId']), query('sortOrder').optional().isIn(['asc', 'desc'])], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      feeStatus = '',
      plan = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const offset = (page - 1) * limit;
    const tenantId = req.user.tenantId || '00000000-0000-0000-0000-000000000000';

    // Build WHERE clause
    let whereConditions = ['tenant_id = $1', 'deleted_at IS NULL'];
    let queryParams = [tenantId];
    let paramIndex = 2;

    // Search across multiple fields
    if (search) {
      whereConditions.push(`(
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex} OR 
        phone ILIKE $${paramIndex} OR
        student_id ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Filter by status
    if (status) {
      const statuses = status.split(',');
      whereConditions.push(`status = ANY($${paramIndex})`);
      queryParams.push(statuses);
      paramIndex++;
    }

    // Filter by fee status
    if (feeStatus) {
      const feeStatuses = feeStatus.split(',');
      whereConditions.push(`fee_status = ANY($${paramIndex})`);
      queryParams.push(feeStatuses);
      paramIndex++;
    }

    // Filter by plan
    if (plan) {
      const plans = plan.split(',');
      whereConditions.push(`current_plan = ANY($${paramIndex})`);
      queryParams.push(plans);
      paramIndex++;
    }
    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM students WHERE ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get students with pagination
    const studentsQuery = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        student_id,
        status,
        current_plan,
        fee_status,
        enrollment_date,
        last_payment_date,
        next_payment_date,
        created_at,
        updated_at
      FROM students
      WHERE ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);
    const studentsResult = await db.query(studentsQuery, queryParams);

    // Transform to camelCase
    const students = studentsResult.rows.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      studentId: row.student_id,
      status: row.status,
      currentPlan: row.current_plan,
      feeStatus: row.fee_status,
      enrollmentDate: row.enrollment_date,
      lastPaymentDate: row.last_payment_date,
      nextPaymentDate: row.next_payment_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    logger.info(`Listed ${students.length} students for tenant ${tenantId}`);
  } catch (error) {
    logger.error('Error listing students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students',
      message: error.message
    });
  }
});

// ========================================
// POST /api/students - Create new student
// ========================================
router.post('/', verifyToken, validateStudent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      currentPlan,
      feeStatus = 'pending',
      status = 'active'
    } = req.body;
    const tenantId = req.user.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user.id;

    // Generate student ID
    const studentIdQuery = 'SELECT COUNT(*) FROM students WHERE tenant_id = $1';
    const countResult = await db.query(studentIdQuery, [tenantId]);
    const count = parseInt(countResult.rows[0].count) + 1;
    const studentId = `STU${String(count).padStart(4, '0')}`;
    const insertQuery = `
      INSERT INTO students (
        tenant_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        gender,
        address_line1,
        city,
        state,
        postal_code,
        country,
        student_id,
        status,
        current_plan,
        fee_status,
        created_by,
        updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
    const values = [tenantId, firstName, lastName, email, phone || null, dateOfBirth || null, gender || null, address?.line1 || null, address?.city || null, address?.state || null, address?.postalCode || null, address?.country || 'India', studentId, status, currentPlan || null, feeStatus, userId, userId];
    const result = await db.query(insertQuery, values);
    const student = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        student: {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          email: student.email,
          phone: student.phone,
          studentId: student.student_id,
          status: student.status,
          currentPlan: student.current_plan,
          feeStatus: student.fee_status,
          enrollmentDate: student.enrollment_date,
          createdAt: student.created_at
        }
      }
    });
    logger.info(`Student created: ${studentId} by user ${userId}`);
  } catch (error) {
    if (error.code === '23505') {
      // Unique violation
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }
    logger.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create student',
      message: error.message
    });
  }
});

// ========================================
// GET /api/students/:id - Get single student
// ========================================
router.get('/:id', verifyToken, param('id').isUUID(), async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const tenantId = req.user.tenantId || '00000000-0000-0000-0000-000000000000';
    const query = 'SELECT * FROM students WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL';
    const result = await db.query(query, [id, tenantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    const student = result.rows[0];
    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          email: student.email,
          phone: student.phone,
          studentId: student.student_id,
          status: student.status,
          currentPlan: student.current_plan,
          feeStatus: student.fee_status,
          enrollmentDate: student.enrollment_date,
          dateOfBirth: student.date_of_birth,
          gender: student.gender,
          address: {
            line1: student.address_line1,
            line2: student.address_line2,
            city: student.city,
            state: student.state,
            postalCode: student.postal_code,
            country: student.country
          },
          createdAt: student.created_at,
          updatedAt: student.updated_at
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student',
      message: error.message
    });
  }
});

// ========================================
// PUT /api/students/:id - Update student
// ========================================
router.put('/:id', verifyToken, [param('id').isUUID(), ...validateStudent], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    const {
      id
    } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      status,
      currentPlan,
      feeStatus
    } = req.body;
    const tenantId = req.user.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user.id;
    const updateQuery = `
      UPDATE students SET
        first_name = $1,
        last_name = $2,
        email = $3,
        phone = $4,
        status = $5,
        current_plan = $6,
        fee_status = $7,
        updated_by = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND tenant_id = $10 AND deleted_at IS NULL
      RETURNING *
    `;
    const values = [firstName, lastName, email, phone, status, currentPlan, feeStatus, userId, id, tenantId];
    const result = await db.query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    const student = result.rows[0];
    res.json({
      success: true,
      message: 'Student updated successfully',
      data: {
        student: {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          email: student.email,
          phone: student.phone,
          studentId: student.student_id,
          status: student.status,
          currentPlan: student.current_plan,
          feeStatus: student.fee_status,
          updatedAt: student.updated_at
        }
      }
    });
    logger.info(`Student updated: ${id} by user ${userId}`);
  } catch (error) {
    logger.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update student',
      message: error.message
    });
  }
});

// ========================================
// DELETE /api/students/:id - Delete student (soft delete)
// ========================================
router.delete('/:id', verifyToken, param('id').isUUID(), async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const tenantId = req.user.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user.id;
    const deleteQuery = `
      UPDATE students SET
        deleted_at = CURRENT_TIMESTAMP,
        updated_by = $1
      WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL
      RETURNING id
    `;
    const result = await db.query(deleteQuery, [userId, id, tenantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
    logger.info(`Student deleted: ${id} by user ${userId}`);
  } catch (error) {
    logger.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete student',
      message: error.message
    });
  }
});

// ========================================
// GET /api/students/export/csv - Export to CSV
// ========================================
router.get('/export/csv', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || '00000000-0000-0000-0000-000000000000';
    const query = `
      SELECT 
        student_id, first_name, last_name, email, phone, 
        status, current_plan, fee_status, enrollment_date
      FROM students
      WHERE tenant_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [tenantId]);

    // Generate CSV
    const headers = ['Student ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Plan', 'Fee Status', 'Enrollment Date'];
    const rows = result.rows.map(row => [row.student_id, row.first_name, row.last_name, row.email, row.phone || '', row.status, row.current_plan || '', row.fee_status, row.enrollment_date]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=students_${Date.now()}.csv`);
    res.send(csv);
    logger.info(`Students exported to CSV for tenant ${tenantId}`);
  } catch (error) {
    logger.error('Error exporting students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export students',
      message: error.message
    });
  }
});
module.exports = router;