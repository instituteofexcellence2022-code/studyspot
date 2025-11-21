# 📋 Service Separation Guidelines

## 🎯 **Core Principles**

### **1. Service Independence**
Each service MUST be:
- ✅ Independently deployable
- ✅ Independently scalable
- ✅ Independently testable
- ✅ Has its own database schema
- ✅ No runtime dependencies on other services

### **2. Communication Rules**

#### ✅ **ALLOWED:**
- Services communicate through **API Gateway only**
- Services use shared utilities (`../../utils/`)
- Services use shared middleware (`../../middleware/`)
- Services use shared config (`../../config/`)

#### ❌ **FORBIDDEN:**
- Direct service-to-service HTTP calls
- Importing from other services
- Accessing other services' database tables
- Sharing business logic between services
- Synchronous dependencies on other services

### **3. Database Access Rules**

#### **Core Database (coreDb):**
- ✅ Platform-level data (tenants, subscriptions, admin_users)
- ✅ Cross-tenant analytics
- ✅ System configuration

#### **Tenant Databases (tenantDbManager):**
- ✅ Tenant-specific data (students, libraries, bookings, payments)
- ✅ Each tenant has isolated database
- ✅ Services access via `tenantDbManager.getTenantConnection(tenantId)`

#### **Service-Specific Tables:**
- ✅ Each service owns its tables
- ✅ No service accesses another service's tables
- ✅ Use API Gateway for cross-service data needs

## 📁 **Shared Code Organization**

### **What Goes in Shared Folders:**

#### `src/config/` - Configuration
- Database connections
- Payment gateway configs
- SMS configs
- Environment variables
- Constants

#### `src/middleware/` - Request Middleware
- Authentication
- Validation
- Rate limiting
- Error handling
- Request logging

#### `src/utils/` - Utilities
- Logger
- Error classes
- Cache helpers
- Monitoring
- Socket helpers

#### `src/validators/` - Validation Schemas
- Zod schemas
- Reusable validation logic

### **What Stays in Services:**

- ✅ Service-specific business logic
- ✅ Service-specific routes
- ✅ Service-specific database queries
- ✅ Service-specific error handling
- ✅ Service-specific types

## 🔄 **Inter-Service Communication**

### **Pattern: API Gateway Only**

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │ ← Single Entry Point
└──────┬──────┘
       │
       ├──► Auth Service
       ├──► Student Service
       ├──► Library Service
       ├──► Booking Service
       └──► ... (all services)
```

### **Example: Booking Service needs Student data**

❌ **WRONG:**
```typescript
// In booking-service
import { getStudent } from '../student-service';
const student = await getStudent(studentId);
```

✅ **CORRECT:**
```typescript
// In booking-service
// Option 1: Store student_id, fetch via API Gateway if needed
// Option 2: Use event-driven pattern (async)
// Option 3: Accept student data in request
```

## 📊 **Service Responsibilities**

### **Each Service Owns:**

1. **Data Layer**
   - Own database tables
   - Own data access logic
   - Own data validation

2. **Business Logic**
   - Own business rules
   - Own domain logic
   - Own calculations

3. **API Layer**
   - Own routes
   - Own request/response handling
   - Own error responses

4. **Configuration**
   - Own service port
   - Own service-specific config
   - Own environment variables

## ✅ **Separation Checklist**

For each service, verify:

- [ ] No imports from other services
- [ ] No HTTP calls to other services
- [ ] No direct database access to other services' tables
- [ ] Uses shared utilities for common functionality
- [ ] Has clear service boundaries
- [ ] Can be deployed independently
- [ ] Has its own health check
- [ ] Has its own error handling
- [ ] Has its own logging

## 🚨 **Common Anti-Patterns to Avoid**

### ❌ **1. Service-to-Service Direct Calls**
```typescript
// DON'T DO THIS
import axios from 'axios';
const student = await axios.get('http://student-service:3002/api/students/123');
```

### ❌ **2. Shared Business Logic**
```typescript
// DON'T DO THIS
// In booking-service
import { calculatePrice } from '../library-service/utils';
```

### ❌ **3. Cross-Service Database Access**
```typescript
// DON'T DO THIS
// In booking-service
const student = await studentDb.query('SELECT * FROM students WHERE id = $1', [id]);
```

### ❌ **4. Service Dependencies**
```typescript
// DON'T DO THIS
// In booking-service
import { StudentService } from '../student-service';
```

## ✅ **Correct Patterns**

### ✅ **1. Use API Gateway**
```typescript
// Client calls API Gateway
// API Gateway routes to appropriate service
// Services are unaware of each other
```

### ✅ **2. Extract Shared Code**
```typescript
// Shared utility
// src/utils/priceCalculator.ts
export function calculatePrice(base: number, discount: number) {
  return base - discount;
}

// Both services can use it
import { calculatePrice } from '../../utils/priceCalculator';
```

### ✅ **3. Event-Driven (Future)**
```typescript
// Services emit events
// Other services subscribe to events
// Async, decoupled communication
```

## 📝 **Service Template**

Each service should follow this structure:

```typescript
// Service-specific imports
import Fastify from 'fastify';
import { coreDb, tenantDbManager } from '../../config/database';
import { logger } from '../../utils/logger';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validator';

// Service-specific routes
fastify.get('/api/v1/service-specific', async (request, reply) => {
  // Service-specific logic
  // Access own database only
  // Use shared utilities
});
```

---

**Status**: ✅ **All Services Follow Separation Guidelines!**

