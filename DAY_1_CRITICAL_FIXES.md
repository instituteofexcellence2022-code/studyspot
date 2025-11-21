# 📅 DAY 1: CRITICAL FIXES
## Complete First Plan - Day 1 Detailed Tasks

**Date**: Day 1 of 7  
**Focus**: Fix Critical Issues  
**Duration**: 8 hours  
**Goal**: Fix Booking Service + Add Authentication

---

## 🎯 DAY 1 OBJECTIVES

1. ✅ Fix Booking Service database connection
2. ✅ Add authentication middleware
3. ✅ Test all fixes
4. ✅ Update documentation

---

## ⏰ TIME BREAKDOWN

### **MORNING (4 hours) - Booking Service Fix**

#### Hour 1: Analysis & Planning (9:00 AM - 10:00 AM)
- [ ] Review current Booking Service code
- [ ] Identify all Supabase usage
- [ ] Plan migration to tenant DB manager
- [ ] Create migration checklist
- [ ] Set up test environment

**Deliverable**: Migration plan ready

---

#### Hour 2: Update Core Functions (10:00 AM - 11:00 AM)

**Task 1: Update Imports** (10 min)
```typescript
// File: backend/src/services/booking-service/index.ts

// REMOVE these lines (around line 13-29):
import { createClient, SupabaseClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
let supabase: SupabaseClient;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  logger.info('✅ Booking Service: Supabase connected');
} else {
  logger.warn('⚠️ Booking Service: Supabase credentials missing - using mock data');
}

// ADD these lines:
import { tenantDbManager } from '../../config/database';
import { HTTP_STATUS, ERROR_CODES } from '../../config/constants';
import type { Pool } from 'pg';
```

**Task 2: Update createBooking Function** (20 min)
```typescript
// BEFORE (lines 66-122)
async function createBooking(data: Booking) {
  try {
    if (supabase) {
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([...])
        .select()
        .single();
      // ...
    } else {
      // Mock mode
    }
  }
}

// AFTER
async function createBooking(data: Booking, tenantId: string) {
  try {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    // Validate required fields
    if (!data.user_id || !data.library_id || !data.start_time || !data.end_time) {
      throw new Error('Missing required fields');
    }

    // Insert booking
    const result = await tenantDb.query(
      `INSERT INTO bookings (
        tenant_id, user_id, library_id, seat_id, start_time, end_time,
        status, total_amount, payment_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        tenantId,
        data.user_id,
        data.library_id,
        data.seat_id || null,
        data.start_time,
        data.end_time,
        data.status || 'pending',
        data.total_amount,
        data.payment_status || 'pending',
      ]
    );

    const booking = result.rows[0];

    // Enrich with user and library data
    const [userResult, libraryResult] = await Promise.all([
      tenantDb.query('SELECT id, first_name, last_name, email FROM users WHERE id = $1', [data.user_id]),
      tenantDb.query('SELECT id, name, address FROM libraries WHERE id = $1', [data.library_id]),
    ]);

    const enrichedBooking = {
      ...booking,
      studentName: userResult.rows[0] 
        ? `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}` 
        : 'Unknown',
      libraryName: libraryResult.rows[0]?.name || 'Unknown',
    };

    // Emit real-time event
    emitBookingCreated(enrichedBooking);

    logger.info(`✅ Booking created: ${booking.id}`);
    return { success: true, data: enrichedBooking };
  } catch (error: any) {
    logger.error('Error creating booking:', error);
    throw error;
  }
}
```

**Task 3: Update getBookings Function** (30 min)
```typescript
// BEFORE (lines 127-207)
async function getBookings(filters: {...}) {
  if (supabase) {
    let query = supabase.from('bookings').select(...);
    // ...
  } else {
    // Mock mode
  }
}

// AFTER
async function getBookings(
  filters: {
    userId?: string;
    libraryId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  tenantId: string
) {
  try {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const { userId, libraryId, status, startDate, endDate, page = 1, limit = 50 } = filters;

    // Build query
    let query = 'SELECT * FROM bookings WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (userId) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(userId);
    }

    if (libraryId) {
      query += ` AND library_id = $${paramIndex++}`;
      params.push(libraryId);
    }

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (startDate) {
      query += ` AND start_time >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND end_time <= $${paramIndex++}`;
      params.push(endDate);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await tenantDb.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await tenantDb.query(query, params);

    // Enrich bookings with user and library data
    const enrichedBookings = await Promise.all(
      result.rows.map(async (booking) => {
        const [userResult, libraryResult] = await Promise.all([
          tenantDb.query('SELECT id, first_name, last_name, email, phone FROM users WHERE id = $1', [booking.user_id]),
          tenantDb.query('SELECT id, name, address, city FROM libraries WHERE id = $1', [booking.library_id]),
        ]);

        return {
          ...booking,
          studentName: userResult.rows[0]
            ? `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`
            : 'Unknown',
          libraryName: libraryResult.rows[0]?.name || 'Unknown',
          date: booking.start_time?.split('T')[0],
          time: new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );

    return {
      success: true,
      data: enrichedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  } catch (error: any) {
    logger.error('Error fetching bookings:', error);
    throw error;
  }
}
```

---

#### Hour 3: Update Remaining Functions (11:00 AM - 12:00 PM)

**Task 4: Update getBookingById** (15 min)
```typescript
async function getBookingById(id: string, tenantId: string) {
  try {
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      `SELECT * FROM bookings WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    if (!result.rows.length) {
      throw new Error('Booking not found');
    }

    const booking = result.rows[0];

    // Enrich with user and library data
    const [userResult, libraryResult] = await Promise.all([
      tenantDb.query('SELECT id, first_name, last_name, email, phone FROM users WHERE id = $1', [booking.user_id]),
      tenantDb.query('SELECT id, name, address, city FROM libraries WHERE id = $1', [booking.library_id]),
    ]);

    return {
      success: true,
      data: {
        ...booking,
        studentName: userResult.rows[0]
          ? `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`
          : 'Unknown',
        libraryName: libraryResult.rows[0]?.name || 'Unknown',
      },
    };
  } catch (error: any) {
    logger.error('Error fetching booking:', error);
    throw error;
  }
}
```

**Task 5: Update updateBooking** (15 min)
```typescript
async function updateBooking(id: string, updates: Partial<Booking>, tenantId: string) {
  try {
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const setClause = fields.map((field, idx) => `${field} = $${idx + 3}`).join(', ');
    const values = [id, tenantId, ...fields.map(f => updates[f])];

    const result = await tenantDb.query(
      `UPDATE bookings SET ${setClause}, updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING *`,
      values
    );

    if (!result.rows.length) {
      throw new Error('Booking not found');
    }

    const booking = result.rows[0];
    
    // Enrich and emit
    const [userResult, libraryResult] = await Promise.all([
      tenantDb.query('SELECT id, first_name, last_name FROM users WHERE id = $1', [booking.user_id]),
      tenantDb.query('SELECT id, name FROM libraries WHERE id = $1', [booking.library_id]),
    ]);

    const enrichedBooking = {
      ...booking,
      studentName: userResult.rows[0]
        ? `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`
        : 'Unknown',
      libraryName: libraryResult.rows[0]?.name || 'Unknown',
    };

    emitBookingUpdated(enrichedBooking);
    return { success: true, data: enrichedBooking };
  } catch (error: any) {
    logger.error('Error updating booking:', error);
    throw error;
  }
}
```

**Task 6: Update cancelBooking** (10 min)
```typescript
async function cancelBooking(id: string, tenantId: string) {
  try {
    const result = await updateBooking(id, { status: 'cancelled' }, tenantId);
    
    if (result.data) {
      emitBookingCancelled(result.data);
    }
    
    return result;
  } catch (error: any) {
    logger.error('Error cancelling booking:', error);
    throw error;
  }
}
```

**Task 7: Remove Mock Code** (5 min)
- [ ] Remove `mockBookings` array
- [ ] Remove all `if (supabase) { ... } else { mock }` blocks
- [ ] Remove mock mode warnings

---

#### Hour 4: Update Routes & Test (12:00 PM - 1:00 PM)

**Task 8: Update All Route Handlers** (30 min)
```typescript
// Update all routes to:
// 1. Extract tenantId from headers
// 2. Validate tenantId
// 3. Pass tenantId to functions
// 4. Handle errors properly

// Example: Create booking route
fastify.post('/api/v1/bookings', async (request, reply) => {
  try {
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

    const bookingData = request.body as Booking;
    const result = await createBooking(bookingData, tenantId);
    return reply.code(201).send(result);
  } catch (error: any) {
    logger.error('POST /api/v1/bookings error:', error);
    return reply.code(500).send({
      success: false,
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: error.message || 'Failed to create booking',
      },
    });
  }
});

// Update all other routes similarly
```

**Task 9: Testing** (30 min)
- [ ] Test booking creation
- [ ] Test booking retrieval
- [ ] Test booking update
- [ ] Test booking cancellation
- [ ] Test multi-tenant isolation
- [ ] Test error scenarios
- [ ] Fix any issues

**Deliverable**: Booking Service fully migrated and tested

---

### **AFTERNOON (4 hours) - Authentication Middleware**

#### Hour 5: Create Authentication Middleware (1:00 PM - 2:00 PM)

**Task 10: Create Auth Middleware** (1 hour)
```typescript
// File: backend/src/middleware/auth.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
  };
  tenantId?: string;
}

export async function authenticate(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    // Extract token from header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
          message: 'Authentication required. Please provide a valid token.',
        },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Attach user and tenant to request
    request.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };
    request.tenantId = decoded.tenantId;

    return;
  } catch (error: any) {
    logger.error('Authentication error:', error);

    if (error.name === 'TokenExpiredError') {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.TOKEN_EXPIRED,
          message: 'Token has expired. Please login again.',
        },
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Invalid token. Please login again.',
        },
      });
    }

    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: {
        code: ERROR_CODES.AUTHENTICATION_ERROR,
        message: 'Authentication failed',
      },
    });
  }
}

// Optional: Role-based authorization
export function authorize(...allowedRoles: string[]) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        error: {
          code: ERROR_CODES.AUTHORIZATION_ERROR,
          message: 'Insufficient permissions',
        },
      });
    }

    return;
  };
}
```

---

#### Hour 6: Add to Student Service (2:00 PM - 3:00 PM)

**Task 11: Update Student Service** (1 hour)
```typescript
// File: backend/src/services/student-service/index.ts

// Add import
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';

// Add middleware to routes
fastify.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
  // Skip auth for health check
  if (request.url === '/health') {
    return;
  }
  return authenticate(request, reply);
});

// Update routes to use request.user and request.tenantId
fastify.get('/api/v1/students', async (request: AuthenticatedRequest, reply) => {
  try {
    const tenantId = request.tenantId || request.user?.tenantId;
    
    if (!tenantId) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tenant ID is required',
        },
      });
    }

    // Rest of the code...
  }
});

// Update all other routes similarly
```

---

#### Hour 7: Add to Library & Booking Services (3:00 PM - 4:00 PM)

**Task 12: Update Library Service** (30 min)
- [ ] Add auth middleware
- [ ] Update all routes
- [ ] Test authentication

**Task 13: Update Booking Service** (30 min)
- [ ] Add auth middleware
- [ ] Update all routes
- [ ] Test authentication

---

#### Hour 8: Add to Payment Service & Test (4:00 PM - 5:00 PM)

**Task 14: Update Payment Service** (30 min)
- [ ] Add auth middleware
- [ ] Update all routes
- [ ] Test authentication

**Task 15: Integration Testing** (30 min)
- [ ] Test authenticated requests
- [ ] Test unauthenticated requests
- [ ] Test invalid tokens
- [ ] Test expired tokens
- [ ] Test role-based access
- [ ] Fix any issues

**Deliverable**: Authentication middleware implemented and tested

---

## ✅ DAY 1 COMPLETION CHECKLIST

### Booking Service
- [ ] Supabase client removed
- [ ] Tenant DB manager integrated
- [ ] All functions updated
- [ ] All routes updated
- [ ] Mock code removed
- [ ] Multi-tenant isolation tested
- [ ] All CRUD operations tested
- [ ] Error handling tested

### Authentication
- [ ] Middleware created
- [ ] Added to Student Service
- [ ] Added to Library Service
- [ ] Added to Booking Service
- [ ] Added to Payment Service
- [ ] Token verification working
- [ ] Tenant extraction working
- [ ] Error handling tested
- [ ] Role-based access tested

### Testing
- [ ] All services tested
- [ ] Authentication tested
- [ ] Multi-tenant tested
- [ ] Error scenarios tested
- [ ] All tests passing

### Documentation
- [ ] Code updated
- [ ] Comments added
- [ ] Changes documented

---

## 🐛 TROUBLESHOOTING

### Issue: Tenant DB Connection Fails
**Solution**: Check database URL, verify tenant exists, check connection pooling

### Issue: Authentication Fails
**Solution**: Check JWT_SECRET, verify token format, check token expiration

### Issue: Multi-tenant Isolation Broken
**Solution**: Verify all queries include tenant_id, test with multiple tenants

---

## 📊 DAY 1 METRICS

### Code Changes
- Files Modified: 5
- Lines Changed: ~500
- Functions Updated: 10+
- Routes Updated: 20+

### Testing
- Unit Tests: 0 → 10
- Integration Tests: 0 → 5
- Test Coverage: 0% → 30%

### Quality
- Critical Issues: 1 → 0
- Security Issues: 2 → 0
- Code Quality: 75% → 85%

---

## 🎯 END OF DAY 1

### Deliverables
- ✅ Booking Service fixed
- ✅ Authentication middleware implemented
- ✅ All services updated
- ✅ All tests passing

### Status
- **Critical Issues**: 0 (was 1)
- **Security**: Enhanced
- **Code Quality**: Improved

### Next Day Preview
- Day 2: Security enhancements (validation, rate limiting)

---

**Day 1 Complete! Ready for Day 2! 🚀**

