const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { query: dbQuery } = require('../config/database');
const { logger } = require('../utils/logger');

// =====================================================
// FEE PLANS MANAGEMENT ROUTES
// =====================================================

/**
 * @route   GET /api/fee-plans
 * @desc    Get all fee plans for tenant
 * @access  Private
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { status, type, search } = req.query;

    let whereClause = 'WHERE tenant_id = $1';
    let params = [tenantId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      whereClause += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    const result = await dbQuery(`
      SELECT 
        id,
        name,
        description,
        type,
        base_price,
        selected_shift,
        selected_zone,
        custom_shift,
        custom_zone,
        features,
        enable_discount,
        discount,
        is_popular,
        scholarship_eligible,
        waiver_allowed,
        status,
        max_seats,
        max_hours,
        created_at,
        updated_at
      FROM fee_plans 
      ${whereClause}
      ORDER BY is_popular DESC, created_at DESC
    `, params);

    res.json({
      success: true,
      data: { feePlans: result.rows }
    });

  } catch (error) {
    logger.error('Error fetching fee plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee plans',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/fee-plans/:id
 * @desc    Get specific fee plan
 * @access  Private
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const result = await dbQuery(`
      SELECT 
        id,
        name,
        description,
        type,
        base_price,
        selected_shift,
        selected_zone,
        custom_shift,
        custom_zone,
        features,
        enable_discount,
        discount,
        is_popular,
        scholarship_eligible,
        waiver_allowed,
        status,
        max_seats,
        max_hours,
        created_at,
        updated_at
      FROM fee_plans 
      WHERE id = $1 AND tenant_id = $2
    `, [id, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fee plan not found'
      });
    }

    res.json({
      success: true,
      data: { feePlan: result.rows[0] }
    });

  } catch (error) {
    logger.error('Error fetching fee plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee plan',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/fee-plans
 * @desc    Create new fee plan
 * @access  Private
 */
router.post('/',
  verifyToken,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').isIn(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'combo']).withMessage('Invalid type'),
    body('basePrice').isNumeric().withMessage('Base price must be a number'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be positive'),
    body('features').optional().isArray().withMessage('Features must be an array'),
    body('enableDiscount').optional().isBoolean().withMessage('Enable discount must be boolean'),
    body('discount').optional().isObject().withMessage('Discount must be an object'),
    body('isPopular').optional().isBoolean().withMessage('Is popular must be boolean'),
    body('scholarshipEligible').optional().isBoolean().withMessage('Scholarship eligible must be boolean'),
    body('waiverAllowed').optional().isBoolean().withMessage('Waiver allowed must be boolean'),
    body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Invalid status'),
    body('maxSeats').optional().isInt({ min: 0 }).withMessage('Max seats must be positive integer'),
    body('maxHours').optional().isInt({ min: 0 }).withMessage('Max hours must be positive integer'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        name,
        description,
        type,
        basePrice,
        selectedShift,
        selectedZone,
        customShift,
        customZone,
        features = [],
        enableDiscount = false,
        discount,
        isPopular = false,
        scholarshipEligible = false,
        waiverAllowed = false,
        status = 'active',
        maxSeats,
        maxHours
      } = req.body;

      const tenantId = req.user.tenantId;

      const result = await dbQuery(`
        INSERT INTO fee_plans (
          tenant_id,
          name,
          description,
          type,
          base_price,
          selected_shift,
          selected_zone,
          custom_shift,
          custom_zone,
          features,
          enable_discount,
          discount,
          is_popular,
          scholarship_eligible,
          waiver_allowed,
          status,
          max_seats,
          max_hours
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *
      `, [
        tenantId,
        name,
        description,
        type,
        basePrice,
        selectedShift,
        selectedZone,
        customShift ? JSON.stringify(customShift) : null,
        customZone ? JSON.stringify(customZone) : null,
        JSON.stringify(features),
        enableDiscount,
        discount ? JSON.stringify(discount) : null,
        isPopular,
        scholarshipEligible,
        waiverAllowed,
        status,
        maxSeats,
        maxHours
      ]);

      logger.info('Fee plan created', { 
        feePlanId: result.rows[0].id, 
        tenantId, 
        userId: req.user.id,
        name 
      });

      res.status(201).json({
        success: true,
        message: 'Fee plan created successfully',
        data: { feePlan: result.rows[0] }
      });

    } catch (error) {
      logger.error('Error creating fee plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create fee plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/fee-plans/:id
 * @desc    Update fee plan
 * @access  Private
 */
router.put('/:id',
  verifyToken,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('type').optional().isIn(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'combo']).withMessage('Invalid type'),
    body('basePrice').optional().isNumeric().withMessage('Base price must be a number'),
    body('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be positive'),
    body('features').optional().isArray().withMessage('Features must be an array'),
    body('enableDiscount').optional().isBoolean().withMessage('Enable discount must be boolean'),
    body('discount').optional().isObject().withMessage('Discount must be an object'),
    body('isPopular').optional().isBoolean().withMessage('Is popular must be boolean'),
    body('scholarshipEligible').optional().isBoolean().withMessage('Scholarship eligible must be boolean'),
    body('waiverAllowed').optional().isBoolean().withMessage('Waiver allowed must be boolean'),
    body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Invalid status'),
    body('maxSeats').optional().isInt({ min: 0 }).withMessage('Max seats must be positive integer'),
    body('maxHours').optional().isInt({ min: 0 }).withMessage('Max hours must be positive integer'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const tenantId = req.user.tenantId;

      // Check if fee plan exists
      const existingResult = await dbQuery(`
        SELECT id FROM fee_plans WHERE id = $1 AND tenant_id = $2
      `, [id, tenantId]);

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Fee plan not found'
        });
      }

      const updateFields = [];
      const values = [];
      let paramCount = 0;

      // Build dynamic update query
      const fields = [
        'name', 'description', 'type', 'base_price', 'selected_shift', 'selected_zone',
        'custom_shift', 'custom_zone', 'features', 'enable_discount', 'discount',
        'is_popular', 'scholarship_eligible', 'waiver_allowed', 'status', 'max_seats', 'max_hours'
      ];

      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          paramCount++;
          updateFields.push(`${field} = $${paramCount}`);
          
          if (field === 'custom_shift' || field === 'custom_zone' || field === 'features' || field === 'discount') {
            values.push(req.body[field] ? JSON.stringify(req.body[field]) : null);
          } else {
            values.push(req.body[field]);
          }
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      paramCount++;
      updateFields.push(`updated_at = NOW()`);
      values.push(id);
      paramCount++;
      values.push(tenantId);

      const result = await dbQuery(`
        UPDATE fee_plans 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount - 1} AND tenant_id = $${paramCount}
        RETURNING *
      `, values);

      logger.info('Fee plan updated', { 
        feePlanId: id, 
        tenantId, 
        userId: req.user.id 
      });

      res.json({
        success: true,
        message: 'Fee plan updated successfully',
        data: { feePlan: result.rows[0] }
      });

    } catch (error) {
      logger.error('Error updating fee plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update fee plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/fee-plans/:id
 * @desc    Delete fee plan
 * @access  Private
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    // Check if fee plan exists
    const existingResult = await dbQuery(`
      SELECT id, name FROM fee_plans WHERE id = $1 AND tenant_id = $2
    `, [id, tenantId]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fee plan not found'
      });
    }

    // Check if fee plan is assigned to any students
    const assignmentResult = await dbQuery(`
      SELECT COUNT(*) as count FROM student_fee_plans WHERE fee_plan_id = $1 AND status = 'active'
    `, [id]);

    if (parseInt(assignmentResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete fee plan that is assigned to students. Please deactivate it instead.'
      });
    }

    await dbQuery(`
      DELETE FROM fee_plans WHERE id = $1 AND tenant_id = $2
    `, [id, tenantId]);

    logger.info('Fee plan deleted', { 
      feePlanId: id, 
      tenantId, 
      userId: req.user.id,
      name: existingResult.rows[0].name
    });

    res.json({
      success: true,
      message: 'Fee plan deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting fee plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete fee plan',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/fee-plans/:id/students
 * @desc    Get students assigned to a fee plan
 * @access  Private
 */
router.get('/:id/students', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const result = await dbQuery(`
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.student_id,
        sfp.assigned_at,
        sfp.status,
        sfp.notes
      FROM student_fee_plans sfp
      JOIN students s ON sfp.student_id = s.id
      JOIN fee_plans fp ON sfp.fee_plan_id = fp.id
      WHERE fp.id = $1 AND fp.tenant_id = $2
      ORDER BY sfp.assigned_at DESC
    `, [id, tenantId]);

    res.json({
      success: true,
      data: { students: result.rows }
    });

  } catch (error) {
    logger.error('Error fetching fee plan students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/fee-plans/:id/assign-student
 * @desc    Assign student to fee plan
 * @access  Private
 */
router.post('/:id/assign-student',
  verifyToken,
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('notes').optional().isString().withMessage('Notes must be string'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { studentId, notes } = req.body;
      const tenantId = req.user.tenantId;

      // Check if fee plan exists
      const feePlanResult = await dbQuery(`
        SELECT id FROM fee_plans WHERE id = $1 AND tenant_id = $2
      `, [id, tenantId]);

      if (feePlanResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Fee plan not found'
        });
      }

      // Check if student exists
      const studentResult = await dbQuery(`
        SELECT id FROM students WHERE id = $1 AND tenant_id = $2
      `, [studentId, tenantId]);

      if (studentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if already assigned
      const existingResult = await dbQuery(`
        SELECT id FROM student_fee_plans 
        WHERE student_id = $1 AND fee_plan_id = $2 AND status = 'active'
      `, [studentId, id]);

      if (existingResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Student is already assigned to this fee plan'
        });
      }

      const result = await dbQuery(`
        INSERT INTO student_fee_plans (
          student_id,
          fee_plan_id,
          assigned_by,
          notes
        ) VALUES ($1, $2, $3, $4) RETURNING *
      `, [studentId, id, req.user.id, notes]);

      logger.info('Student assigned to fee plan', { 
        studentId, 
        feePlanId: id, 
        tenantId, 
        userId: req.user.id 
      });

      res.status(201).json({
        success: true,
        message: 'Student assigned to fee plan successfully',
        data: { assignment: result.rows[0] }
      });

    } catch (error) {
      logger.error('Error assigning student to fee plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign student',
        error: error.message
      });
    }
  }
);

module.exports = router;

