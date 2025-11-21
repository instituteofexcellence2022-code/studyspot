# Practical Solution: Consolidate Endpoints in Auth Service

## Current Situation
- ✅ **Auth service is deployed** and working
- ❌ **Other services are NOT deployed** (student, library, etc.)
- ❌ **Frontend calls endpoints that don't exist or aren't routed**

## Solution: Add Missing Endpoints to Auth Service

Since only auth service is deployed, we'll add all required endpoints there:

### 1. Fee Plans (`/api/fee-plans`)
- Add CRUD endpoints to auth service
- Store in tenant database `fee_plans` table
- Add route to API Gateway

### 2. Students (`/api/v1/students`)
- Add CRUD endpoints to auth service (or verify existing)
- Store in tenant database `students` table
- Route already exists in API Gateway

### 3. Profile Photos (`/api/users/profile/picture`)
- ✅ Already exists in auth service
- ⚠️ Just needs to use correct user table (library_owners)

## Benefits
- ✅ Works immediately (no need to deploy other services)
- ✅ Single service to maintain
- ✅ Faster development
- ✅ Can split into microservices later if needed

## Implementation Plan
1. Add fee plan endpoints to auth service
2. Add route `/api/fee-plans` to API Gateway
3. Verify student endpoints work
4. Fix profile endpoints to use correct tables
5. Test all endpoints


