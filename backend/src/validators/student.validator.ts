// ============================================
// STUDENT SERVICE VALIDATION SCHEMAS
// ============================================

import { z } from 'zod';

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Common schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

// Create Student Schema
export const createStudentSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  last_name: z.string().max(100, 'Last name too long').optional(),
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').min(10).max(10),
  parent_phone: z.string().regex(/^[0-9]{10}$/, 'Parent phone must be 10 digits').optional().nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits').optional().nullable(),
  education_level: z.string().max(50).optional().nullable(),
  course: z.string().max(100).optional().nullable(),
  institution: z.string().max(200).optional().nullable(),
  library_id: uuidSchema.optional().nullable(),
});

// Update Student Schema
export const updateStudentSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  parent_phone: z.string().regex(/^[0-9]{10}$/).optional().nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().regex(/^[0-9]{6}$/).optional().nullable(),
  education_level: z.string().max(50).optional().nullable(),
  course: z.string().max(100).optional().nullable(),
  institution: z.string().max(200).optional().nullable(),
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
  library_id: uuidSchema.optional().nullable(),
});

// Get Students Query Schema
export const getStudentsQuerySchema = paginationSchema.extend({
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
  library_id: uuidSchema.optional(),
  search: z.string().max(100).optional(),
});

// Get Student Params Schema
export const getStudentParamsSchema = z.object({
  id: uuidSchema,
});

// Suspend Student Schema
export const suspendStudentSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500).optional(),
});

// Get Student Attendance Query Schema
export const getStudentAttendanceQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().positive().max(100).default(30).optional(),
});

// Get Student Payments Query Schema
export const getStudentPaymentsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

// Bulk Import Students Schema
export const bulkImportStudentsSchema = z.object({
  students: z.array(createStudentSchema).min(1, 'At least one student is required').max(1000, 'Maximum 1000 students per import'),
});

