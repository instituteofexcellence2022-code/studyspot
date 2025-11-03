/**
 * Student Service
 * Enhanced student management with advanced features
 */

const { pool } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Get students with advanced filtering and search
 */
async function getStudents(filters = {}, pagination = {}) {
  try {
    const {
      search,
      status,
      kyc_verified,
      group_id,
      library_id,
      tenant_id,
      created_after,
      created_before,
    } = filters;

    const {
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = pagination;

    const offset = (page - 1) * limit;

    // Build WHERE clauses
    const conditions = ["u.role = 'student'"];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(
        u.name ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex} OR 
        u.phone ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`u.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (kyc_verified !== undefined) {
      conditions.push(`u.kyc_verified = $${paramIndex}`);
      params.push(kyc_verified);
      paramIndex++;
    }

    if (group_id) {
      conditions.push(`sg.id = $${paramIndex}`);
      params.push(group_id);
      paramIndex++;
    }

    if (library_id) {
      conditions.push(`u.library_id = $${paramIndex}`);
      params.push(library_id);
      paramIndex++;
    }

    if (tenant_id) {
      conditions.push(`l.tenant_id = $${paramIndex}`);
      params.push(tenant_id);
      paramIndex++;
    }

    if (created_after) {
      conditions.push(`u.created_at >= $${paramIndex}`);
      params.push(created_after);
      paramIndex++;
    }

    if (created_before) {
      conditions.push(`u.created_at <= $${paramIndex}`);
      params.push(created_before);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN libraries l ON u.library_id = l.id
      LEFT JOIN student_group_members sgm ON u.id = sgm.user_id
      LEFT JOIN student_groups sg ON sgm.group_id = sg.id
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const dataQuery = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.status,
        u.kyc_verified,
        u.kyc_documents,
        u.student_id,
        u.created_at,
        u.last_login,
        l.name as library_name,
        l.id as library_id,
        (
          SELECT json_agg(json_build_object('id', sg.id, 'name', sg.name))
          FROM student_group_members sgm2
          INNER JOIN student_groups sg ON sgm2.group_id = sg.id
          WHERE sgm2.user_id = u.id
        ) as groups
      FROM users u
      LEFT JOIN libraries l ON u.library_id = l.id
      LEFT JOIN student_group_members sgm ON u.id = sgm.user_id
      LEFT JOIN student_groups sg ON sgm.group_id = sg.id
      WHERE ${whereClause}
      ORDER BY u.${sort_by} ${sort_order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const dataResult = await pool.query(dataQuery, params);

    return {
      success: true,
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error fetching students:', error);
    throw error;
  }
}

/**
 * Get student by ID with full details
 */
async function getStudentById(studentId) {
  try {
    const query = `
      SELECT 
        u.*,
        l.name as library_name,
        l.id as library_id,
        (
          SELECT json_agg(json_build_object('id', sg.id, 'name', sg.name, 'description', sg.description))
          FROM student_group_members sgm
          INNER JOIN student_groups sg ON sgm.group_id = sg.id
          WHERE sgm.user_id = u.id
        ) as groups,
        (
          SELECT COUNT(*) 
          FROM bookings b 
          WHERE b.user_id = u.id
        ) as total_bookings,
        (
          SELECT COUNT(*) 
          FROM attendance a 
          WHERE a.user_id = u.id
        ) as total_attendance,
        (
          SELECT COALESCE(SUM(amount), 0) 
          FROM payments p 
          WHERE p.user_id = u.id AND p.status = 'completed'
        ) as total_paid
      FROM users u
      LEFT JOIN libraries l ON u.library_id = l.id
      WHERE u.id = $1 AND u.role = 'student'
    `;

    const result = await pool.query(query, [studentId]);

    if (result.rows.length === 0) {
      return {
        success: false,
        errors: [{ code: 'STUDENT_NOT_FOUND', message: 'Student not found' }],
      };
    }

    return {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    logger.error('Error fetching student:', error);
    throw error;
  }
}

/**
 * Create new student
 */
async function createStudent(studentData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      name,
      email,
      phone,
      password,
      library_id,
      kyc_documents,
      group_ids = [],
    } = studentData;

    // Generate student ID
    const studentIdQuery = `
      SELECT COALESCE(MAX(CAST(SUBSTRING(student_id FROM 5) AS INTEGER)), 0) + 1 as next_id
      FROM users
      WHERE student_id LIKE 'STU-%'
    `;
    const idResult = await client.query(studentIdQuery);
    const student_id = `STU-${String(idResult.rows[0].next_id).padStart(6, '0')}`;

    // Create user
    const insertQuery = `
      INSERT INTO users (
        name, email, phone, password, role, library_id, 
        student_id, kyc_documents, status
      )
      VALUES ($1, $2, $3, $4, 'student', $5, $6, $7, 'active')
      RETURNING *
    `;
    
    const result = await client.query(insertQuery, [
      name,
      email,
      phone,
      password, // Should be hashed in the route handler
      library_id,
      student_id,
      kyc_documents ? JSON.stringify(kyc_documents) : null,
    ]);

    const user = result.rows[0];

    // Add to groups if specified
    if (group_ids.length > 0) {
      for (const group_id of group_ids) {
        await client.query(
          'INSERT INTO student_group_members (group_id, user_id) VALUES ($1, $2)',
          [group_id, user.id]
        );
      }
    }

    await client.query('COMMIT');

    return {
      success: true,
      data: user,
      message: 'Student created successfully',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error creating student:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Bulk import students from CSV data
 */
async function bulkImportStudents(studentsData, libraryId) {
  const client = await pool.connect();
  const results = {
    success: [],
    failed: [],
  };

  try {
    await client.query('BEGIN');

    for (const studentData of studentsData) {
      try {
        const { name, email, phone, password } = studentData;

        // Generate student ID
        const studentIdQuery = `
          SELECT COALESCE(MAX(CAST(SUBSTRING(student_id FROM 5) AS INTEGER)), 0) + 1 as next_id
          FROM users
          WHERE student_id LIKE 'STU-%'
        `;
        const idResult = await client.query(studentIdQuery);
        const student_id = `STU-${String(idResult.rows[0].next_id).padStart(6, '0')}`;

        // Insert student
        const insertQuery = `
          INSERT INTO users (
            name, email, phone, password, role, library_id, student_id, status
          )
          VALUES ($1, $2, $3, $4, 'student', $5, $6, 'active')
          RETURNING id, name, email, student_id
        `;

        const result = await client.query(insertQuery, [
          name,
          email,
          phone,
          password,
          libraryId,
          student_id,
        ]);

        results.success.push(result.rows[0]);
      } catch (error) {
        results.failed.push({
          data: studentData,
          error: error.message,
        });
      }
    }

    await client.query('COMMIT');

    return {
      success: true,
      data: results,
      message: `Imported ${results.success.length} students successfully, ${results.failed.length} failed`,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error bulk importing students:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Export students to CSV format
 */
async function exportStudents(filters = {}) {
  try {
    const { data } = await getStudents(filters, { limit: 10000, page: 1 });

    // Format data for CSV
    const csvData = data.map(student => ({
      'Student ID': student.student_id,
      'Name': student.name,
      'Email': student.email,
      'Phone': student.phone,
      'Library': student.library_name,
      'Status': student.status,
      'KYC Verified': student.kyc_verified ? 'Yes' : 'No',
      'Created At': student.created_at,
    }));

    return {
      success: true,
      data: csvData,
    };
  } catch (error) {
    logger.error('Error exporting students:', error);
    throw error;
  }
}

/**
 * Verify student KYC
 */
async function verifyKYC(studentId, kycData) {
  try {
    const { verified, documents, verified_by, notes } = kycData;

    const query = `
      UPDATE users
      SET 
        kyc_verified = $1,
        kyc_documents = $2,
        kyc_verified_by = $3,
        kyc_verified_at = $4,
        kyc_notes = $5,
        updated_at = NOW()
      WHERE id = $6 AND role = 'student'
      RETURNING *
    `;

    const result = await pool.query(query, [
      verified,
      documents ? JSON.stringify(documents) : null,
      verified_by,
      verified ? new Date() : null,
      notes,
      studentId,
    ]);

    if (result.rows.length === 0) {
      return {
        success: false,
        errors: [{ code: 'STUDENT_NOT_FOUND', message: 'Student not found' }],
      };
    }

    return {
      success: true,
      data: result.rows[0],
      message: verified ? 'KYC verified successfully' : 'KYC verification removed',
    };
  } catch (error) {
    logger.error('Error verifying KYC:', error);
    throw error;
  }
}

/**
 * Get or create student groups
 */
async function getStudentGroups(libraryId) {
  try {
    const query = `
      SELECT 
        sg.*,
        COUNT(sgm.user_id) as member_count
      FROM student_groups sg
      LEFT JOIN student_group_members sgm ON sg.id = sgm.group_id
      WHERE sg.library_id = $1
      GROUP BY sg.id
      ORDER BY sg.name
    `;

    const result = await pool.query(query, [libraryId]);

    return {
      success: true,
      data: result.rows,
    };
  } catch (error) {
    logger.error('Error fetching student groups:', error);
    throw error;
  }
}

/**
 * Create student group
 */
async function createStudentGroup(groupData) {
  try {
    const { name, description, library_id } = groupData;

    const query = `
      INSERT INTO student_groups (name, description, library_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await pool.query(query, [name, description, library_id]);

    return {
      success: true,
      data: result.rows[0],
      message: 'Group created successfully',
    };
  } catch (error) {
    logger.error('Error creating student group:', error);
    throw error;
  }
}

/**
 * Add students to group
 */
async function addStudentsToGroup(groupId, studentIds) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const studentId of studentIds) {
      await client.query(
        `INSERT INTO student_group_members (group_id, user_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [groupId, studentId]
      );
    }

    await client.query('COMMIT');

    return {
      success: true,
      message: `Added ${studentIds.length} students to group`,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error adding students to group:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  bulkImportStudents,
  exportStudents,
  verifyKYC,
  getStudentGroups,
  createStudentGroup,
  addStudentsToGroup,
};








