# 🔄 Community Service Migration Plan

## Overview
Community Service is the final service to standardize. It has 25+ routes and uses Supabase extensively.

## Migration Strategy

### Phase 1: Core Infrastructure ✅ (DONE)
- ✅ Added authentication middleware
- ✅ Added input validation (Zod schemas)
- ✅ Added rate limiting
- ✅ Added request logging
- ✅ Added error handling
- ✅ Enhanced health check
- ✅ Migrated create community route
- ✅ Migrated get communities route

### Phase 2: Core Routes (In Progress)
- [ ] Create group route
- [ ] Get groups route
- [ ] Join/leave community routes
- [ ] Send/get messages routes
- [ ] Member management routes

### Phase 3: Advanced Features
- [ ] File upload handling
- [ ] Privacy settings
- [ ] Admin management
- [ ] Invite links
- [ ] Search functionality

## Key Changes Needed

### Database Migration Pattern:
```typescript
// OLD (Supabase):
const { data, error } = await supabase
  .from('communities')
  .select('*')
  .eq('id', id);

// NEW (PostgreSQL):
const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
const result = await tenantDb.query(
  'SELECT * FROM communities WHERE id = $1 AND tenant_id = $2',
  [id, tenantId]
);
```

### Response Format Standardization:
```typescript
// OLD:
return reply.code(201).send({ success: true, data });

// NEW:
return reply.status(HTTP_STATUS.CREATED).send({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});
```

## Remaining Routes to Migrate

1. POST /api/groups - Create group
2. GET /api/groups/library/:libraryId - Get groups by library
3. GET /api/communities/all - Get all communities/groups
4. POST /api/communities/:id/join - Join community
5. POST /api/communities/:id/leave - Leave community
6. PUT /api/communities/:id/privacy - Update privacy
7. GET /api/communities/:id/privacy/:userId - Get privacy
8. GET /api/communities/:id/members - Get members
9. POST /api/communities/:id/messages - Send message
10. GET /api/communities/:id/messages - Get messages
11. POST /api/communities/upload - Upload file
12. GET /api/communities/user/:userId - Get user communities
13. DELETE /api/communities/:id - Delete community
14. POST /api/communities/:id/add-member - Add member
15. DELETE /api/communities/:id/members/:userId - Remove member
16. POST /api/communities/:id/block/:userId - Block member
17. POST /api/communities/:id/unblock/:userId - Unblock member
18. POST /api/communities/:id/invite-link - Generate invite
19. POST /api/communities/join/:inviteCode - Join via invite
20. GET /api/students/search - Search students
21. POST /api/communities/:id/make-admin/:userId - Make admin
22. POST /api/communities/:id/remove-admin/:userId - Remove admin

## Estimated Time: 1-2 hours

## Status: Infrastructure Complete, Routes Migration In Progress

