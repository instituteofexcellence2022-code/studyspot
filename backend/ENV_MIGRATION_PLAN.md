# Environment Variable Migration Plan

## 📋 **Goal**
Migrate all services from direct `process.env` access to centralized `config` from `@config/env`.

## 📊 **Current Status**
- **Services using direct process.env**: 19/19
- **Services migrated**: 0/19
- **Priority**: Medium (code quality improvement)

---

## 🔍 **Common Patterns Found:**

### **1. Port Configuration**
```typescript
// ❌ Before
const PORT = process.env.STUDENT_SERVICE_PORT || 3004;

// ✅ After
import { config } from '../../config/env';
const PORT = parseInt(config.ports.student || '3004');
```

### **2. CORS Origin**
```typescript
// ❌ Before
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
});

// ✅ After
fastify.register(cors, {
  origin: config.cors?.origin?.split(',') || '*',
});
```

### **3. Database URLs**
```typescript
// ❌ Before
const dbUrl = process.env.DATABASE_URL;

// ✅ After
const dbUrl = config.database.url;
```

---

## 📝 **Migration Checklist:**

### **Phase 1: High Priority Services** (Core Business)
- [ ] student-service
- [ ] library-service
- [ ] booking-service
- [ ] payment-service
- [ ] auth-service

### **Phase 2: Platform Services**
- [ ] tenant-service
- [ ] user-service
- [ ] admin-service
- [ ] subscription-service
- [ ] credit-service

### **Phase 3: Communication Services**
- [ ] message-service
- [ ] messaging-service
- [ ] community-service
- [ ] notification-service

### **Phase 4: Supporting Services**
- [ ] attendance-service
- [ ] analytics-service
- [ ] document-service
- [ ] api-gateway

---

## 🎯 **Benefits:**
1. ✅ Type safety (validated env vars)
2. ✅ Centralized configuration
3. ✅ Better error messages
4. ✅ Easier testing
5. ✅ Consistent defaults

---

## ⚠️ **Notes:**
- Some services may need additional env vars added to `config/env.ts`
- Test each service after migration
- Keep backward compatibility during transition

