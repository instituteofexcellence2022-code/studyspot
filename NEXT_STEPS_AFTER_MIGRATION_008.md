# Next Steps After Migration 008

## ✅ Migration 008 Completed Successfully

The clear user structure has been implemented. Now we need to update the backend services to use the new tables.

## Immediate Actions Required

### 1. Update Authentication Service ⚠️ CRITICAL

**File**: `backend/src/services/auth-service/index.ts`

**Changes Needed**:

#### Registration (Library Owner)
```typescript
// OLD: Insert into admin_users
// NEW: Insert into library_owners AND create tenant

async register(data: RegisterRequest) {
  // 1. Create tenant first
  const tenant = await createTenant({ name: data.businessName });
  
  // 2. Create library owner linked to tenant
  const owner = await db.query(`
    INSERT INTO library_owners (tenant_id, email, password_hash, first_name, last_name, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [tenant.id, data.email, hashedPassword, data.firstName, data.lastName, data.phone]);
  
  // 3. Link tenant to owner
  await db.query(`
    UPDATE tenants SET owner_id = $1 WHERE id = $2
  `, [owner.id, tenant.id]);
  
  // 4. Generate token with user_table
  const token = generateAccessToken({
    userId: owner.id,
    userType: 'library_owner',
    userTable: 'library_owners',
    tenantId: tenant.id
  });
}
```

#### Login (All User Types)
```typescript
async login(email: string, password: string) {
  // Try library_owners first
  let user = await db.query(`
    SELECT * FROM library_owners WHERE email = $1
  `, [email]);
  
  if (user.rows.length > 0) {
    // Verify password and return
    return {
      user: formatUserResponse(user.rows[0], 'library_owner'),
      tokens: generateTokens(user.rows[0], 'library_owners', user.rows[0].tenant_id)
    };
  }
  
  // Try platform_admins
  user = await db.query(`
    SELECT * FROM platform_admins WHERE email = $1
  `, [email]);
  
  if (user.rows.length > 0) {
    return {
      user: formatUserResponse(user.rows[0], 'platform_admin'),
      tokens: generateTokens(user.rows[0], 'platform_admins', null)
    };
  }
  
  // Try platform_staff
  user = await db.query(`
    SELECT * FROM platform_staff WHERE email = $1
  `, [email]);
  
  if (user.rows.length > 0) {
    return {
      user: formatUserResponse(user.rows[0], 'platform_staff'),
      tokens: generateTokens(user.rows[0], 'platform_staff', null)
    };
  }
  
  throw new AuthenticationError('Invalid credentials');
}
```

### 2. Update Token Generation

**File**: `backend/src/services/auth-service/index.ts`

```typescript
function generateAccessToken(user: any, userTable: string, tenantId: string | null) {
  return jwt.sign({
    userId: user.id,
    email: user.email,
    userType: getUserTypeFromTable(userTable),
    userTable: userTable, // NEW: Include which table
    tenantId: tenantId,
    role: user.role || 'library_owner',
  }, JWT_SECRET, { expiresIn: JWT_ACCESS_TOKEN_EXPIRY });
}

function getUserTypeFromTable(userTable: string): string {
  const mapping = {
    'library_owners': 'library_owner',
    'platform_admins': 'platform_admin',
    'platform_staff': 'platform_staff',
    'library_staff': 'library_staff',
    'students': 'student'
  };
  return mapping[userTable] || 'unknown';
}
```

### 3. Update Tenant Context Middleware

**File**: `backend/src/middleware/tenantContext.ts`

```typescript
export async function extractTenantContext(request: FastifyRequest) {
  const user = (request as any).user; // From auth middleware
  const userTable = user.userTable; // From JWT token
  
  // Platform admins can access any tenant
  if (userTable === 'platform_admins') {
    // Allow access to any tenant via query param
    const tenantId = request.query?.tenantId;
    if (tenantId) {
      return { tenantId, userTable: 'platform_admins' };
    }
    return { tenantId: null, userTable: 'platform_admins' };
  }
  
  // Platform staff can access any tenant for support
  if (userTable === 'platform_staff' && user.role === 'support') {
    const tenantId = request.query?.tenantId;
    if (tenantId) {
      return { tenantId, userTable: 'platform_staff' };
    }
    return { tenantId: null, userTable: 'platform_staff' };
  }
  
  // Library owners are restricted to their own tenant
  if (userTable === 'library_owners') {
    return { tenantId: user.tenantId, userTable: 'library_owners' };
  }
  
  // Library staff are restricted to their tenant
  if (userTable === 'library_staff') {
    return { tenantId: user.tenantId, userTable: 'library_staff' };
  }
  
  // Students are restricted to their tenant
  if (userTable === 'students') {
    return { tenantId: user.tenantId, userTable: 'students' };
  }
  
  throw new AuthorizationError('Invalid user type');
}
```

### 4. Update User Profile Endpoint

**File**: `backend/src/services/auth-service/index.ts`

```typescript
async getProfile(userId: string, userTable: string) {
  let user;
  
  switch (userTable) {
    case 'library_owners':
      user = await db.query('SELECT * FROM library_owners WHERE id = $1', [userId]);
      break;
    case 'platform_admins':
      user = await db.query('SELECT * FROM platform_admins WHERE id = $1', [userId]);
      break;
    case 'platform_staff':
      user = await db.query('SELECT * FROM platform_staff WHERE id = $1', [userId]);
      break;
    default:
      throw new NotFoundError('User');
  }
  
  if (user.rows.length === 0) {
    throw new NotFoundError('User');
  }
  
  return formatUserResponse(user.rows[0], getUserTypeFromTable(userTable));
}
```

### 5. Update Refresh Token Logic

**File**: `backend/src/services/auth-service/index.ts`

```typescript
async refreshToken(refreshToken: string) {
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, JWT_SECRET);
  const { userId, userTable } = decoded;
  
  // Get user from appropriate table
  let user;
  switch (userTable) {
    case 'library_owners':
      user = await db.query('SELECT * FROM library_owners WHERE id = $1', [userId]);
      break;
    case 'platform_admins':
      user = await db.query('SELECT * FROM platform_admins WHERE id = $1', [userId]);
      break;
    case 'platform_staff':
      user = await db.query('SELECT * FROM platform_staff WHERE id = $1', [userId]);
      break;
    default:
      throw new AuthenticationError('Invalid user type');
  }
  
  if (user.rows.length === 0) {
    throw new AuthenticationError('User not found');
  }
  
  // Generate new tokens
  return generateTokens(user.rows[0], userTable, user.rows[0].tenant_id || null);
}
```

## Testing Checklist

### Library Owner Flow
- [ ] Register new library owner → Creates tenant + owner
- [ ] Login as library owner → Returns correct user type
- [ ] Get profile → Returns owner data
- [ ] Refresh token → Works correctly
- [ ] Access tenant-scoped data → Works correctly

### Platform Admin Flow
- [ ] Login as platform admin → Returns correct user type
- [ ] Get profile → Returns admin data
- [ ] Access any tenant data → Works with tenantId param
- [ ] Refresh token → Works correctly

### Platform Staff Flow
- [ ] Login as platform staff → Returns correct user type
- [ ] Get profile → Returns staff data
- [ ] Access tenant data (if support role) → Works with tenantId param
- [ ] Refresh token → Works correctly

## Migration 009 - Library Staff Table

After updating authentication, run migration 009 to create the `library_staff` table in tenant databases.

## Rollback Plan (If Needed)

If issues occur:
1. Keep `admin_users` table (don't drop yet)
2. Add fallback logic to check both old and new tables
3. Gradually migrate users to new tables
4. Once stable, drop `admin_users`

## Files to Update

1. ✅ `backend/src/services/auth-service/index.ts` - Authentication logic
2. ✅ `backend/src/middleware/tenantContext.ts` - Tenant context extraction
3. ✅ `backend/src/middleware/auth.ts` - JWT verification (if needed)
4. ✅ `backend/src/utils/jwt.ts` - Token generation helpers (if exists)

## Priority Order

1. **HIGH**: Update authentication service (login, register, refresh)
2. **HIGH**: Update tenant context middleware
3. **MEDIUM**: Update profile endpoint
4. **MEDIUM**: Test all authentication flows
5. **LOW**: Clean up old `admin_users` references (after verification)

---

**Status**: Ready to implement
**Next**: Update authentication service to use new tables

