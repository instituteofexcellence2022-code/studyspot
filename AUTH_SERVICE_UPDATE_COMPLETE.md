# Authentication Service Update - Complete ✅

## Status: UPDATED TO USE NEW TABLES

The authentication service has been updated to use the new user table structure (`library_owners`, `platform_admins`, `platform_staff`) instead of the old `admin_users` table.

## Changes Made

### 1. Helper Functions Updated ✅

**`getUserTypeFromTable(userTable: string)`** - NEW
- Maps table names to user types
- Returns: 'library_owner', 'platform_admin', 'platform_staff', etc.

**`generateAccessToken(user, userTable)`** - UPDATED
- Now requires `userTable` parameter
- Includes `userTable` in JWT payload
- Determines `userType` from table name

**`generateRefreshToken(user, userTable)`** - UPDATED
- Now requires `userTable` parameter
- Includes `userTable` in refresh token payload

**`formatUserResponse(user, userTable?)`** - UPDATED
- Accepts optional `userTable` parameter
- Includes `userTable` in response
- Determines `userType` from table name

**`buildAuthPayload(user, tokens, userTable?)`** - UPDATED
- Accepts optional `userTable` parameter
- Passes `userTable` to `formatUserResponse`

### 2. Login Endpoint Updated ✅

**`POST /api/auth/login`**

**Changes:**
- Checks `library_owners` table first
- Then checks `platform_admins` table
- Then checks `platform_staff` table
- Falls back to `admin_users` for backward compatibility
- Determines `userTable` based on which table user is found in
- Generates tokens with `userTable` included
- Stores refresh token with `user_table` column
- Updates last login in correct table
- Creates audit log with `user_table` column

**Flow:**
```
1. Try library_owners WHERE email = ?
2. Try platform_admins WHERE email = ?
3. Try platform_staff WHERE email = ?
4. Fallback to admin_users WHERE email = ?
5. Verify password
6. Generate tokens with userTable
7. Store refresh token with user_table
8. Update last_login in correct table
9. Create audit log with user_table
```

### 3. Register Endpoint Updated ✅

**`POST /api/auth/register`**

**Changes:**
- Creates tenant first (if doesn't exist)
- Creates user in `library_owners` table (not `admin_users`)
- Links tenant to library owner via `owner_id`
- Generates tokens with `userTable = 'library_owners'`
- Stores refresh token with `user_table = 'library_owners'`

**Flow:**
```
1. Validate input
2. Check if tenant exists for email
3. Create tenant if doesn't exist
4. Create library_owner in library_owners table
5. Link tenant.owner_id to library_owner.id
6. Generate tokens with userTable = 'library_owners'
7. Store refresh token with user_table
8. Return auth payload
```

### 4. Get Current User Endpoint Updated ✅

**`GET /api/auth/me`**

**Changes:**
- Extracts `userTable` from JWT token
- Queries correct table based on `userTable`:
  - `library_owners` if `userTable = 'library_owners'`
  - `platform_admins` if `userTable = 'platform_admins'`
  - `platform_staff` if `userTable = 'platform_staff'`
  - Falls back to `admin_users` for backward compatibility
- Returns user with `userTable` included

### 5. Profile Endpoint Updated ✅

**`GET /api/auth/profile`**

**Changes:**
- Same as `/api/auth/me` endpoint
- Queries correct table based on `userTable` from token

### 6. Refresh Token Handler Updated ✅

**`POST /api/auth/refresh`**

**Changes:**
- Extracts `userTable` from refresh token
- Validates refresh token with `user_table` column
- Queries user from correct table based on `userTable`
- Generates new access token with `userTable`
- Returns auth payload with `userTable`

## Backward Compatibility

The service maintains backward compatibility:
- Falls back to `admin_users` table if user not found in new tables
- Handles tokens without `userTable` (defaults to `library_owners`)
- Gracefully handles missing `user_table` column in refresh_tokens

## Testing Checklist

### Library Owner Flow
- [ ] Register new library owner → Creates in `library_owners` table
- [ ] Login as library owner → Finds in `library_owners` table
- [ ] Get profile → Queries `library_owners` table
- [ ] Refresh token → Uses `userTable = 'library_owners'`

### Platform Admin Flow
- [ ] Login as platform admin → Finds in `platform_admins` table
- [ ] Get profile → Queries `platform_admins` table
- [ ] Refresh token → Uses `userTable = 'platform_admins'`

### Platform Staff Flow
- [ ] Login as platform staff → Finds in `platform_staff` table
- [ ] Get profile → Queries `platform_staff` table
- [ ] Refresh token → Uses `userTable = 'platform_staff'`

## Next Steps

1. **Update Profile Update Endpoint** - Update `/api/users/profile` PUT endpoint to use correct table
2. **Update Profile Picture Upload** - Update to use correct table
3. **Update KYC Endpoints** - Update to use correct table
4. **Update Admin Login Endpoint** - Update `/api/v1/auth/admin/login` to use new tables
5. **Test All Endpoints** - Verify all authentication flows work correctly

## Files Modified

- ✅ `backend/src/services/auth-service/index.ts` - Complete update

## Migration Status

- ✅ Database migration 008 completed
- ✅ Authentication service updated
- ⏳ Profile update endpoints (next)
- ⏳ Testing (next)

---

**Status**: ✅ **AUTHENTICATION SERVICE UPDATED**
**Next Action**: Update profile update endpoints and test

