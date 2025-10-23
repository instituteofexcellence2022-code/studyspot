/**
 * Enhanced Student Routes
 * Advanced student management with search, import/export, KYC, and groups
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { verifyToken: authenticate } = require('../middleware/auth');
const { requirePermission, restrictToOwnLibrary } = require('../middleware/rbac');
const studentService = require('../services/studentService');
const { logger } = require('../utils/logger');

// Multer configuration for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/students
 * Get students with advanced filtering and search
 */
router.get('/',
  authenticate,
  requirePermission('students:view'),
  restrictToOwnLibrary,
  async (req, res) => {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status,
        kyc_verified: req.query.kyc_verified === 'true' ? true : req.query.kyc_verified === 'false' ? false : undefined,
        group_id: req.query.group_id,
        created_after: req.query.created_after,
        created_before: req.query.created_before,
        ...req.libraryFilter, // From restrictToOwnLibrary middleware
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sort_by: req.query.sort_by || 'created_at',
        sort_order: req.query.sort_order || 'DESC',
      };

      const result = await studentService.getStudents(filters, pagination);
      res.json(result);
    } catch (error) {
      logger.error('Error fetching students:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'STUDENTS_FETCH_ERROR',
          message: 'Failed to fetch students'
        }]
      });
    }
  }
);

/**
 * GET /api/students/:id
 * Get student by ID with full details
 */
router.get('/:id',
  authenticate,
  requirePermission('students:view'),
  async (req, res) => {
    try {
      const result = await studentService.getStudentById(req.params.id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error fetching student:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'STUDENT_FETCH_ERROR',
          message: 'Failed to fetch student details'
        }]
      });
    }
  }
);

/**
 * POST /api/students
 * Create new student
 */
router.post('/',
  authenticate,
  requirePermission('students:create'),
  async (req, res) => {
    try {
      const { name, email, phone, password, library_id, kyc_documents, group_ids } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: 'Name, email, and password are required'
          }]
        });
      }

      // Use user's library if not super admin
      const finalLibraryId = req.user.role === 'super_admin' ? library_id : req.user.library_id;

      const result = await studentService.createStudent({
        name,
        email,
        phone,
        password, // Should be hashed here
        library_id: finalLibraryId,
        kyc_documents,
        group_ids,
      });

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating student:', error);
      
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({
          success: false,
          errors: [{
            code: 'DUPLICATE_STUDENT',
            message: 'Student with this email already exists'
          }]
        });
      }

      res.status(500).json({
        success: false,
        errors: [{
          code: 'STUDENT_CREATE_ERROR',
          message: 'Failed to create student'
        }]
      });
    }
  }
);

/**
 * POST /api/students/bulk-import
 * Bulk import students from CSV file
 */
router.post('/bulk-import',
  authenticate,
  requirePermission('students:import'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          errors: [{
            code: 'NO_FILE',
            message: 'Please upload a CSV file'
          }]
        });
      }

      const studentsData = [];
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csv())
        .on('data', (row) => {
          studentsData.push({
            name: row.name || row.Name,
            email: row.email || row.Email,
            phone: row.phone || row.Phone,
            password: row.password || 'Student@123', // Default password
          });
        })
        .on('end', async () => {
          try {
            const library_id = req.user.library_id;
            const result = await studentService.bulkImportStudents(studentsData, library_id);
            res.json(result);
          } catch (error) {
            logger.error('Error bulk importing students:', error);
            res.status(500).json({
              success: false,
              errors: [{
                code: 'BULK_IMPORT_ERROR',
                message: 'Failed to import students'
              }]
            });
          }
        })
        .on('error', (error) => {
          logger.error('Error parsing CSV:', error);
          res.status(400).json({
            success: false,
            errors: [{
              code: 'CSV_PARSE_ERROR',
              message: 'Failed to parse CSV file'
            }]
          });
        });
    } catch (error) {
      logger.error('Error in bulk import:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'BULK_IMPORT_ERROR',
          message: 'Failed to process import'
        }]
      });
    }
  }
);

/**
 * GET /api/students/export
 * Export students to CSV
 */
router.get('/export',
  authenticate,
  requirePermission('students:export'),
  restrictToOwnLibrary,
  async (req, res) => {
    try {
      const filters = {
        status: req.query.status,
        kyc_verified: req.query.kyc_verified === 'true' ? true : req.query.kyc_verified === 'false' ? false : undefined,
        ...req.libraryFilter,
      };

      const result = await studentService.exportStudents(filters);

      if (!result.success) {
        return res.status(500).json(result);
      }

      // Convert to CSV format
      const csvHeaders = Object.keys(result.data[0] || {}).join(',');
      const csvRows = result.data.map(row => 
        Object.values(row).map(val => `"${val}"`).join(',')
      );
      const csvContent = [csvHeaders, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=students_${Date.now()}.csv`);
      res.send(csvContent);
    } catch (error) {
      logger.error('Error exporting students:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'EXPORT_ERROR',
          message: 'Failed to export students'
        }]
      });
    }
  }
);

/**
 * PUT /api/students/:id/verify-kyc
 * Verify student KYC
 */
router.put('/:id/verify-kyc',
  authenticate,
  requirePermission('students:verify_kyc'),
  async (req, res) => {
    try {
      const { verified, documents, notes } = req.body;

      const result = await studentService.verifyKYC(req.params.id, {
        verified,
        documents,
        verified_by: req.user.id,
        notes,
      });

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error verifying KYC:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'KYC_VERIFY_ERROR',
          message: 'Failed to verify KYC'
        }]
      });
    }
  }
);

/**
 * GET /api/students/groups
 * Get student groups
 */
router.get('/groups',
  authenticate,
  requirePermission('students:manage_groups'),
  async (req, res) => {
    try {
      const library_id = req.user.library_id;
      const result = await studentService.getStudentGroups(library_id);
      res.json(result);
    } catch (error) {
      logger.error('Error fetching student groups:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'GROUPS_FETCH_ERROR',
          message: 'Failed to fetch student groups'
        }]
      });
    }
  }
);

/**
 * POST /api/students/groups
 * Create student group
 */
router.post('/groups',
  authenticate,
  requirePermission('students:manage_groups'),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: 'Group name is required'
          }]
        });
      }

      const result = await studentService.createStudentGroup({
        name,
        description,
        library_id: req.user.library_id,
      });

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating student group:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'GROUP_CREATE_ERROR',
          message: 'Failed to create student group'
        }]
      });
    }
  }
);

/**
 * POST /api/students/groups/:id/members
 * Add students to group
 */
router.post('/groups/:id/members',
  authenticate,
  requirePermission('students:manage_groups'),
  async (req, res) => {
    try {
      const { student_ids } = req.body;

      if (!Array.isArray(student_ids) || student_ids.length === 0) {
        return res.status(400).json({
          success: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: 'Student IDs array is required'
          }]
        });
      }

      const result = await studentService.addStudentsToGroup(req.params.id, student_ids);
      res.json(result);
    } catch (error) {
      logger.error('Error adding students to group:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'GROUP_ADD_ERROR',
          message: 'Failed to add students to group'
        }]
      });
    }
  }
);

module.exports = router;

