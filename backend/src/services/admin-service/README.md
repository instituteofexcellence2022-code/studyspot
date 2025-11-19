# Admin Service - Database Access Pattern

## How Web Admin Portal Accesses Data

### 1. Platform-Level Operations (Core Database)

All platform management operations use the **core database**:

```typescript
import { coreDb } from '../../config/database';

// Get all tenants
async function getAllTenants() {
  const result = await coreDb.query('SELECT * FROM tenants ORDER BY created_at DESC');
  return result.rows;
}

// Get platform analytics
async function getPlatformAnalytics() {
  const result = await coreDb.query('SELECT * FROM platform_analytics ORDER BY date DESC LIMIT 30');
  return result.rows;
}

// Get all subscriptions
async function getAllSubscriptions() {
  const result = await coreDb.query(`
    SELECT s.*, t.name as tenant_name, sp.name as plan_name
    FROM subscriptions s
    JOIN tenants t ON s.tenant_id = t.id
    JOIN subscription_plans sp ON s.plan_id = sp.id
    ORDER BY s.created_at DESC
  `);
  return result.rows;
}
```

### 2. Tenant-Specific Operations (Tenant Databases)

When web admin needs to view/manage a specific tenant's data:

```typescript
import { tenantDbManager } from '../../config/database';

// Get tenant's students (for support)
async function getTenantStudents(tenantId: string) {
  const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
  const result = await tenantDb.query(
    'SELECT * FROM students WHERE tenant_id = $1 ORDER BY created_at DESC',
    [tenantId]
  );
  return result.rows;
}

// Get tenant's bookings (for analytics)
async function getTenantBookings(tenantId: string, dateRange: { start: Date, end: Date }) {
  const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
  const result = await tenantDb.query(
    `SELECT * FROM bookings 
     WHERE tenant_id = $1 
     AND start_date >= $2 
     AND start_date <= $3
     ORDER BY start_date DESC`,
    [tenantId, dateRange.start, dateRange.end]
  );
  return result.rows;
}
```

### 3. Cross-Tenant Analytics (Aggregate from Multiple Tenant DBs)

For platform-wide analytics:

```typescript
async function getCrossTenantAnalytics() {
  // Get all active tenants
  const tenants = await coreDb.query(
    'SELECT id, name FROM tenants WHERE status = $1',
    ['active']
  );

  // Aggregate data from each tenant
  const analytics = await Promise.all(
    tenants.rows.map(async (tenant) => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
      
      const [students, bookings, revenue] = await Promise.all([
        tenantDb.query('SELECT COUNT(*) as count FROM students WHERE tenant_id = $1', [tenant.id]),
        tenantDb.query('SELECT COUNT(*) as count FROM bookings WHERE tenant_id = $1', [tenant.id]),
        tenantDb.query('SELECT SUM(amount) as total FROM payments WHERE tenant_id = $1 AND payment_status = $2', 
          [tenant.id, 'completed'])
      ]);

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        students: parseInt(students.rows[0].count),
        bookings: parseInt(bookings.rows[0].count),
        revenue: parseFloat(revenue.rows[0].total || 0),
      };
    })
  );

  return analytics;
}
```

### 4. Security Considerations

**Web Admin Access Control:**
- Platform admins can access core database (their data)
- Platform admins can access any tenant database (for support/management)
- Use middleware to verify admin role before allowing tenant DB access

```typescript
// Middleware to check admin access
fastify.addHook('preHandler', async (request, reply) => {
  const user = (request as any).user;
  const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.role];
  
  // Only platform admins can access tenant data
  if (!userRoles.includes('super_admin') && !userRoles.includes('admin')) {
    return reply.status(403).send({ error: 'Admin access required' });
  }
});
```

### 5. Performance Optimization

**Caching Strategy:**
- Cache tenant list (changes infrequently)
- Cache platform analytics (refresh every 5 minutes)
- Don't cache tenant-specific data (changes frequently)

```typescript
import { cache } from '../../utils/cache';

async function getCachedTenants() {
  const cached = cache.get('all_tenants');
  if (cached) return cached;

  const tenants = await coreDb.query('SELECT * FROM tenants');
  cache.set('all_tenants', tenants.rows, 300); // 5 minutes
  return tenants.rows;
}
```

## Summary

**Web Admin Portal Database Access:**
1. ✅ Uses **Core Database** for platform operations
2. ✅ Uses **Tenant Databases** for tenant-specific support/management
3. ✅ No separate admin database needed
4. ✅ Current architecture is correct and scalable

