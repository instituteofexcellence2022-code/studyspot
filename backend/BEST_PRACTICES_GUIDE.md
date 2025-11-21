# 📚 Best Practices Guide

## 🎯 **Code Quality Standards**

### **1. Type Safety** ✅

#### **✅ DO:**
```typescript
// Use typed interfaces
import { getParams, getQuery, getBody } from '../../utils/typeHelpers';
import { StudentParams, StudentQuery, CreateStudentBody } from '../../types/requests';

const { id } = getParams<StudentParams>(request);
const { page, limit } = getQuery<StudentQuery>(request);
const { name, email } = getBody<CreateStudentBody>(request);
```

#### **❌ DON'T:**
```typescript
// Avoid 'any' types
const { id } = request.params as any;
const { page } = request.query as any;
const { name } = request.body as any;
```

---

### **2. Environment Variables** ✅

#### **✅ DO:**
```typescript
// Use centralized config
import { config } from '../../config/env';

const PORT = config.ports.student;
const JWT_SECRET = config.jwt.secret;
```

#### **❌ DON'T:**
```typescript
// Avoid direct process.env
const PORT = parseInt(process.env.STUDENT_SERVICE_PORT || '3004');
const JWT_SECRET = process.env.JWT_SECRET;
```

---

### **3. Error Handling** ✅

#### **✅ DO:**
```typescript
import { handleError } from '../../utils/typeHelpers';

try {
  // operation
} catch (error: unknown) {
  const errorInfo = handleError(error, {
    requestId: request.id,
    userId: getUser(request)?.id,
    tenantId: getTenantId(request),
    operation: 'createStudent',
  });
  
  logger.error('Error creating student:', errorInfo);
  
  return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
    success: false,
    error: {
      code: ERROR_CODES.SERVER_ERROR,
      message: 'Failed to create student',
    },
  });
}
```

#### **❌ DON'T:**
```typescript
// Avoid generic error handling
catch (error: any) {
  logger.error('Error:', error);
  return reply.code(500).send({ error: 'Internal error' });
}
```

---

### **4. Database Queries** ✅

#### **✅ DO:**
```typescript
// Use parameterized queries
const result = await tenantDb.query(
  'SELECT * FROM students WHERE id = $1 AND tenant_id = $2',
  [id, tenantId]
);

// Use proper types
const result = await tenantDb.query<Student>(
  'SELECT * FROM students WHERE id = $1',
  [id]
);
```

#### **❌ DON'T:**
```typescript
// Avoid string concatenation
const query = `SELECT * FROM students WHERE id = '${id}'`;
// SQL injection risk!
```

---

### **5. Validation** ✅

#### **✅ DO:**
```typescript
// Use Zod schemas
import { createStudentSchema } from '../../validators/student.validator';

fastify.post('/api/v1/students', {
  preHandler: [validateBody(createStudentSchema)],
}, async (request, reply) => {
  // Body is already validated
});
```

#### **❌ DON'T:**
```typescript
// Avoid manual validation
if (!request.body.name) {
  return reply.code(400).send({ error: 'Name required' });
}
```

---

### **6. Logging** ✅

#### **✅ DO:**
```typescript
// Use structured logging
logger.info('Student created', {
  studentId: result.rows[0].id,
  tenantId,
  userId: getUser(request)?.id,
  requestId: request.id,
});
```

#### **❌ DON'T:**
```typescript
// Avoid console.log
console.log('Student created:', studentId);
```

---

### **7. Response Format** ✅

#### **✅ DO:**
```typescript
// Consistent response format
return reply.send({
  success: true,
  data: result.rows[0],
  timestamp: new Date().toISOString(),
});
```

#### **❌ DON'T:**
```typescript
// Avoid inconsistent formats
return reply.send(result.rows[0]);
return { data: result.rows[0] };
return reply.code(200).send({ student: result.rows[0] });
```

---

### **8. Authentication** ✅

#### **✅ DO:**
```typescript
// Use authenticated request
import { AuthenticatedRequest, getUser } from '../../middleware/auth';

fastify.get('/api/v1/students', async (request: AuthenticatedRequest, reply) => {
  const user = getUser(request);
  const tenantId = getTenantId(request);
  // ...
});
```

#### **❌ DON'T:**
```typescript
// Avoid manual auth checks
if (!request.headers.authorization) {
  return reply.code(401).send({ error: 'Unauthorized' });
}
```

---

### **9. Rate Limiting** ✅

#### **✅ DO:**
```typescript
// Use service-specific rate limits
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../middleware/rateLimiter';

(async () => {
  await registerRateLimit(fastify, SERVICE_RATE_LIMITS.student);
})();
```

---

### **10. Code Organization** ✅

#### **✅ DO:**
```typescript
// Follow service template structure
// 1. Imports
// 2. Configuration
// 3. Middleware
// 4. Validation Schemas
// 5. Routes
// 6. Export function
```

---

## 📊 **Quality Checklist**

### **For Each Service:**
- [ ] No `any` types
- [ ] Uses `config` for env vars
- [ ] Proper error handling
- [ ] Input validation (Zod)
- [ ] Authentication middleware
- [ ] Rate limiting
- [ ] Request logging
- [ ] Consistent response format
- [ ] Type-safe database queries
- [ ] Structured logging
- [ ] Health check endpoint
- [ ] Export function for testing

---

## 🎯 **Code Review Checklist**

### **Before Committing:**
- [ ] All TypeScript errors fixed
- [ ] No `any` types
- [ ] All env vars use config
- [ ] Error handling consistent
- [ ] Validation in place
- [ ] Logging structured
- [ ] Tests pass
- [ ] Build succeeds
- [ ] No console.log
- [ ] No TODO comments

---

**Status**: ✅ **Best Practices Documented**

**Next**: Apply to all services systematically

