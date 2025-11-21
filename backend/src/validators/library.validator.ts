// ============================================
// LIBRARY SERVICE VALIDATION SCHEMAS
// ============================================

import { z } from 'zod';

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Common schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

// Create Library Schema
export const createLibrarySchema = z.object({
  name: z.string().min(1, 'Library name is required').max(200, 'Name too long'),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits').optional().nullable(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  opening_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format').optional().nullable(),
  closing_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format').optional().nullable(),
});

// Update Library Schema
export const updateLibrarySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().regex(/^[0-9]{6}$/).optional().nullable(),
  phone: z.string().regex(/^[0-9]{10}$/).optional().nullable(),
  email: z.string().email().optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  opening_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  closing_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

// Get Libraries Query Schema
export const getLibrariesQuerySchema = paginationSchema.extend({
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  city: z.string().max(100).optional(),
});

// Get Library Params Schema
export const getLibraryParamsSchema = z.object({
  id: uuidSchema,
});

// Fee Plan Schemas
export const createFeePlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'combo']),
  basePrice: z.coerce.number().nonnegative('Base price must be non-negative'),
  shiftPricing: z.record(z.any()).optional().default({}),
  zonePricing: z.record(z.any()).optional().default({}),
  discount: z.record(z.any()).optional().default({}),
  maxSeats: z.coerce.number().int().positive().optional().nullable(),
  maxHours: z.coerce.number().int().positive().optional().nullable(),
  scholarshipEligible: z.boolean().optional().default(false),
  waiverAllowed: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  isPopular: z.boolean().optional().default(false),
  features: z.array(z.string()).optional().default([]),
});

export const updateFeePlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'combo']).optional(),
  basePrice: z.coerce.number().nonnegative().optional(),
  shiftPricing: z.record(z.any()).optional(),
  zonePricing: z.record(z.any()).optional(),
  discount: z.record(z.any()).optional(),
  maxSeats: z.coerce.number().int().positive().optional().nullable(),
  maxHours: z.coerce.number().int().positive().optional().nullable(),
  scholarshipEligible: z.boolean().optional(),
  waiverAllowed: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  isPopular: z.boolean().optional(),
  features: z.array(z.string()).optional(),
});

export const feePlanParamsSchema = z.object({
  id: uuidSchema,
});

