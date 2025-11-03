# 🔧 Backend Architecture - StudySpot Admin Portal v2.0

## 📋 **Overview**

**Backend Type**: RESTful API  
**Runtime**: Node.js 18+  
**Framework**: Express 4.18.2  
**Language**: TypeScript 5.9.3  
**Database**: PostgreSQL 15+ (Supabase)  
**Cache**: Redis 7.0+ (Upstash)  
**ORM**: Prisma 5.0.0  
**Authentication**: JWT + Passport.js  
**Validation**: Zod 3.22.4  
**File Storage**: Cloudflare R2 (S3-compatible)  
**Background Jobs**: BullMQ 5.0.0  
**Documentation**: Swagger/OpenAPI

---

## 🏗️ **Backend Structure**

```
backend/
├── src/
│   ├── index.ts                    # Entry point
│   ├── app.ts                      # Express app configuration
│   │
│   ├── config/                     # Configuration
│   │   ├── database.ts            # Prisma client
│   │   ├── redis.ts               # Redis client
│   │   ├── environment.ts         # Environment variables
│   │   ├── constants.ts           # App constants
│   │   └── logger.ts              # Winston logger
│   │
│   ├── routes/                     # API Routes
│   │   ├── index.ts               # Route aggregator
│   │   ├── auth.routes.ts         # Auth endpoints
│   │   ├── tenants.routes.ts      # Tenant endpoints
│   │   ├── platform-users.routes.ts # Platform user endpoints
│   │   ├── admin-users.routes.ts  # Admin user endpoints
│   │   ├── revenue.routes.ts      # Revenue endpoints
│   │   ├── credits.routes.ts       # Credit endpoints
│   │   ├── subscriptions.routes.ts # Subscription endpoints
│   │   ├── payments.routes.ts     # Payment endpoints
│   │   ├── crm.routes.ts          # CRM endpoints
│   │   ├── messaging.routes.ts    # Messaging endpoints
│   │   ├── notifications.routes.ts # Notification endpoints
│   │   ├── analytics.routes.ts    # Analytics endpoints
│   │   ├── reports.routes.ts      # Report endpoints
│   │   ├── audit.routes.ts        # Audit log endpoints
│   │   ├── settings.routes.ts      # Settings endpoints
│   │   ├── rbac.routes.ts         # RBAC endpoints
│   │   ├── security.routes.ts     # Security endpoints
│   │   ├── microservices.routes.ts # Microservice endpoints
│   │   ├── templates.routes.ts     # Template endpoints
│   │   ├── tickets.routes.ts      # Ticket endpoints
│   │   └── monitoring.routes.ts   # Monitoring endpoints
│   │
│   ├── controllers/                # Controllers (Request handlers)
│   │   ├── auth.controller.ts
│   │   ├── tenants.controller.ts
│   │   ├── platform-users.controller.ts
│   │   ├── admin-users.controller.ts
│   │   ├── revenue.controller.ts
│   │   ├── credits.controller.ts
│   │   ├── subscriptions.controller.ts
│   │   ├── payments.controller.ts
│   │   ├── crm.controller.ts
│   │   ├── messaging.controller.ts
│   │   ├── notifications.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── reports.controller.ts
│   │   ├── audit.controller.ts
│   │   ├── settings.controller.ts
│   │   ├── rbac.controller.ts
│   │   ├── security.controller.ts
│   │   ├── microservices.controller.ts
│   │   ├── templates.controller.ts
│   │   ├── tickets.controller.ts
│   │   └── monitoring.controller.ts
│   │
│   ├── services/                   # Business Logic
│   │   ├── auth.service.ts
│   │   ├── tenants.service.ts
│   │   ├── platform-users.service.ts
│   │   ├── admin-users.service.ts
│   │   ├── revenue.service.ts
│   │   ├── credits.service.ts
│   │   ├── subscriptions.service.ts
│   │   ├── payments.service.ts
│   │   ├── crm.service.ts
│   │   ├── messaging.service.ts
│   │   ├── notifications.service.ts
│   │   ├── analytics.service.ts
│   │   ├── reports.service.ts
│   │   ├── audit.service.ts
│   │   ├── settings.service.ts
│   │   ├── rbac.service.ts
│   │   ├── security.service.ts
│   │   ├── microservices.service.ts
│   │   ├── templates.service.ts
│   │   ├── tickets.service.ts
│   │   ├── email.service.ts       # Email service
│   │   ├── sms.service.ts         # SMS service
│   │   ├── whatsapp.service.ts    # WhatsApp service
│   │   ├── payment-gateway.service.ts # Payment gateway
│   │   └── file-storage.service.ts # File storage
│   │
│   ├── models/                     # Prisma Models (schema.prisma)
│   │   └── [Defined in prisma/schema.prisma]
│   │
│   ├── middleware/                 # Express Middleware
│   │   ├── auth.middleware.ts     # JWT authentication
│   │   ├── tenant.middleware.ts   # Tenant isolation
│   │   ├── role.middleware.ts     # RBAC authorization
│   │   ├── validation.middleware.ts # Request validation
│   │   ├── error.middleware.ts    # Error handling
│   │   ├── rate-limit.middleware.ts # Rate limiting
│   │   ├── logger.middleware.ts   # Request logging
│   │   └── cors.middleware.ts     # CORS configuration
│   │
│   ├── validators/                 # Zod Schemas
│   │   ├── auth.validator.ts
│   │   ├── tenant.validator.ts
│   │   ├── user.validator.ts
│   │   ├── revenue.validator.ts
│   │   ├── credit.validator.ts
│   │   └── [All validators...]
│   │
│   ├── utils/                      # Utilities
│   │   ├── logger.ts              # Winston logger
│   │   ├── errors.ts              # Custom error classes
│   │   ├── response.ts            # Response formatters
│   │   ├── encryption.ts          # Encryption utilities
│   │   ├── token.ts               # JWT token utilities
│   │   ├── password.ts            # Password hashing
│   │   ├── date.ts                # Date utilities
│   │   └── helpers.ts             # Helper functions
│   │
│   ├── types/                      # TypeScript Types
│   │   ├── index.ts               # Global types
│   │   ├── express.d.ts           # Express type extensions
│   │   ├── request.ts             # Request types
│   │   └── response.ts             # Response types
│   │
│   ├── jobs/                       # Background Jobs (BullMQ)
│   │   ├── email.job.ts           # Email sending
│   │   ├── sms.job.ts             # SMS sending
│   │   ├── whatsapp.job.ts       # WhatsApp sending
│   │   ├── settlement.job.ts     # Payment settlement
│   │   ├── invoice.job.ts        # Invoice generation
│   │   ├── dunning.job.ts        # Dunning campaigns
│   │   ├── report.job.ts         # Report generation
│   │   └── cleanup.job.ts        # Data cleanup
│   │
│   └── queues/                     # Queue Configuration
│       ├── email.queue.ts
│       ├── sms.queue.ts
│       ├── whatsapp.queue.ts
│       └── settlement.queue.ts
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/               # Migration files
│   │   ├── 20250101000000_init/
│   │   ├── 20250102000000_add_users/
│   │   └── [All migrations...]
│   └── seed.ts                   # Database seed
│
├── tests/                         # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env.development
├── .env.production
├── .gitignore
├── tsconfig.json
├── package.json
├── jest.config.js
├── swagger.yaml                   # OpenAPI spec
└── README.md
```

---

## 🗄️ **Database Schema (Prisma)**

### **Core Tables:**

```prisma
// User Management
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String
  phone             String?
  type              UserType // PLATFORM | ADMIN
  role              String?
  tenantId          String?
  status            UserStatus @default(ACTIVE)
  passwordHash      String
  emailVerified     Boolean  @default(false)
  twoFactorEnabled  Boolean  @default(false)
  lastLoginAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  tenant            Tenant?  @relation(fields: [tenantId], references: [id])
  auditLogs         AuditLog[]
  sessions          Session[]
  
  @@index([email])
  @@index([tenantId])
  @@index([type])
}

enum UserType {
  PLATFORM_USER  // Library owners, students, parents, staff
  ADMIN_USER     // Portal admins
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING
}

// Tenant Management
model Tenant {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  email             String
  phone             String?
  address           String?
  status            TenantStatus @default(ACTIVE)
  subscriptionPlan  String?
  subscriptionStatus SubscriptionStatus?
  logo              String?
  
  // Metadata
  metadata          Json?
  
  // Relations
  users             User[]
  subscriptions     Subscription[]
  invoices          Invoice[]
  payments          Payment[]
  credits           CreditWallet[]
  libraries         Library[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([slug])
  @@index([status])
}

enum TenantStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  TRIAL
}

enum SubscriptionStatus {
  ACTIVE
  TRIAL
  CANCELLED
  EXPIRED
}

// Revenue & Billing
model Subscription {
  id                String   @id @default(cuid())
  tenantId          String
  planId            String
  status            SubscriptionStatus
  billingCycle      BillingCycle
  startDate         DateTime
  endDate           DateTime?
  cancelDate        DateTime?
  
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  plan              SubscriptionPlan @relation(fields: [planId], references: [id])
  invoices          Invoice[]
  changes           SubscriptionChange[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([tenantId])
  @@index([planId])
  @@index([status])
}

model SubscriptionPlan {
  id                String   @id @default(cuid())
  name              String   @unique
  description       String?
  monthlyPrice      Decimal
  annualPrice       Decimal
  features          Json?    // Array of features
  limits            Json?    // User limits, storage, etc.
  trialDays         Int      @default(0)
  status            PlanStatus @default(ACTIVE)
  
  subscriptions     Subscription[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Invoice {
  id                String   @id @default(cuid())
  tenantId          String
  subscriptionId    String?
  invoiceNumber     String   @unique
  amount            Decimal
  tax               Decimal  @default(0)
  total             Decimal
  status            InvoiceStatus
  dueDate           DateTime
  paidDate          DateTime?
  
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  subscription      Subscription? @relation(fields: [subscriptionId], references: [id])
  items             InvoiceItem[]
  payments          Payment[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([tenantId])
  @@index([invoiceNumber])
  @@index([status])
}

// Credit Management
model CreditWallet {
  id                String   @id @default(cuid())
  tenantId          String
  smsCredits        Int      @default(0)
  whatsappCredits   Int      @default(0)
  emailCredits      Int      @default(0)
  
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  transactions      CreditTransaction[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([tenantId])
  @@index([tenantId])
}

model CreditTransaction {
  id                String   @id @default(cuid())
  walletId          String
  type              CreditType
  amount            Int
  balance           Int
  description       String?
  
  wallet            CreditWallet @relation(fields: [walletId], references: [id])
  
  createdAt         DateTime @default(now())
  
  @@index([walletId])
  @@index([type])
}

enum CreditType {
  SMS
  WHATSAPP
  EMAIL
}

// Payment Management
model Payment {
  id                String   @id @default(cuid())
  tenantId          String?
  invoiceId         String?
  transactionId     String   @unique
  amount            Decimal
  gatewayFee        Decimal
  platformFee       Decimal
  netAmount         Decimal
  method            PaymentMethod
  status            PaymentStatus
  gatewayResponse   Json?
  
  tenant            Tenant?  @relation(fields: [tenantId], references: [id])
  invoice           Invoice? @relation(fields: [invoiceId], references: [id])
  settlement        Settlement?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([tenantId])
  @@index([transactionId])
  @@index([status])
}

model Settlement {
  id                String   @id @default(cuid())
  tenantId          String
  amount            Decimal
  gatewayCharges    Decimal
  platformFee       Decimal
  netAmount         Decimal
  status            SettlementStatus
  utr               String?  @unique
  settledAt         DateTime?
  
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  payments          Payment[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([tenantId])
  @@index([status])
  @@index([utr])
}

// CRM
model Lead {
  id                String   @id @default(cuid())
  name              String
  email             String
  phone             String?
  company           String?
  source            LeadSource
  status            LeadStatus
  value             Decimal  @default(0)
  
  activities        Activity[]
  contacts          Contact[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([status])
  @@index([source])
}

model Contact {
  id                String   @id @default(cuid())
  name              String
  email             String
  phone             String?
  company           String?
  type              ContactType
  status            ContactStatus
  
  leadId            String?
  lead              Lead?    @relation(fields: [leadId], references: [id])
  deals             Deal[]
  activities        Activity[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([type])
  @@index([status])
}

model Deal {
  id                String   @id @default(cuid())
  name              String
  value             Decimal
  probability       Int      @default(0) // 0-100
  stage             DealStage
  contactId         String?
  expectedCloseDate DateTime?
  
  contact           Contact? @relation(fields: [contactId], references: [id])
  activities        Activity[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([stage])
  @@index([contactId])
}

// Messaging
model Message {
  id                String   @id @default(cuid())
  tenantId          String?
  channel           MessageChannel
  recipient         String
  subject           String?
  content           String
  status            MessageStatus
  sentAt            DateTime?
  
  tenant            Tenant?  @relation(fields: [tenantId], references: [id])
  campaign          Campaign? @relation(fields: [campaignId], references: [id])
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([tenantId])
  @@index([status])
  @@index([channel])
}

// Audit Logs
model AuditLog {
  id                String   @id @default(cuid())
  userId            String
  action            String
  resource          String
  resourceId        String?
  changes           Json?
  ipAddress         String?
  
  user              User     @relation(fields: [userId], references: [id])
  
  createdAt         DateTime @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([resource])
  @@index([createdAt])
}

// Sessions
model Session {
  id                String   @id @default(cuid())
  userId            String
  token             String   @unique
  ipAddress         String?
  userAgent         String?
  expiresAt         DateTime
  
  user              User     @relation(fields: [userId], references: [id])
  
  createdAt         DateTime @default(now())
  
  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}

// ... (50+ more tables)
```

---

## 🔌 **API Endpoints Structure**

### **Authentication Endpoints** (5)
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### **Tenant Endpoints** (15)
```
GET    /api/tenants
GET    /api/tenants/:id
POST   /api/tenants
PUT    /api/tenants/:id
DELETE /api/tenants/:id
POST   /api/tenants/:id/onboarding
GET    /api/tenants/:id/settings
PUT    /api/tenants/:id/settings
GET    /api/tenants/:id/branding
PUT    /api/tenants/:id/branding
GET    /api/tenants/:id/analytics
GET    /api/tenants/:id/users
GET    /api/tenants/:id/invoices
GET    /api/tenants/:id/payments
POST   /api/tenants/:id/suspend
POST   /api/tenants/:id/activate
```

### **Platform User Endpoints** (20)
```
GET    /api/platform-users
GET    /api/platform-users/:id
POST   /api/platform-users
PUT    /api/platform-users/:id
DELETE /api/platform-users/:id
GET    /api/platform-users/owners
GET    /api/platform-users/students
GET    /api/platform-users/parents
GET    /api/platform-users/staff
GET    /api/platform-users/analytics
GET    /api/platform-users/owners/:id
GET    /api/platform-users/students/:id
GET    /api/platform-users/parents/:id
GET    /api/platform-users/staff/:id
POST   /api/platform-users/bulk-import
POST   /api/platform-users/bulk-export
POST   /api/platform-users/:id/activate
POST   /api/platform-users/:id/deactivate
GET    /api/platform-users/:id/activity
```

### **Admin User Endpoints** (15)
```
GET    /api/admin-users
GET    /api/admin-users/:id
POST   /api/admin-users
PUT    /api/admin-users/:id
DELETE /api/admin-users/:id
GET    /api/admin-users/analytics
GET    /api/admin-users/permissions
PUT    /api/admin-users/:id/permissions
GET    /api/admin-users/:id/activity
POST   /api/admin-users/:id/invite
POST   /api/admin-users/:id/reset-password
POST   /api/admin-users/:id/toggle-mfa
GET    /api/admin-users/:id/sessions
DELETE /api/admin-users/:id/sessions/:sessionId
```

### **Revenue Endpoints** (25)
```
GET    /api/revenue/dashboard
GET    /api/revenue/metrics
GET    /api/revenue/invoices
GET    /api/revenue/invoices/:id
POST   /api/revenue/invoices
PUT    /api/revenue/invoices/:id
DELETE /api/revenue/invoices/:id
POST   /api/revenue/invoices/:id/send
GET    /api/revenue/plans
POST   /api/revenue/plans
PUT    /api/revenue/plans/:id
DELETE /api/revenue/plans/:id
GET    /api/revenue/payment-methods
POST   /api/revenue/payment-methods
PUT    /api/revenue/payment-methods/:id
GET    /api/revenue/dunning
POST   /api/revenue/dunning/campaigns
GET    /api/revenue/analytics
GET    /api/revenue/reports
... (more endpoints)
```

### **Credit Endpoints** (20)
```
GET    /api/credits/dashboard
GET    /api/credits/master-wallet
GET    /api/credits/wallets
GET    /api/credits/wallets/:id
POST   /api/credits/wallets/:id/add
GET    /api/credits/packages
POST   /api/credits/packages
PUT    /api/credits/packages/:id
GET    /api/credits/custom-plans
POST   /api/credits/custom-plans
PUT    /api/credits/custom-plans/:id
GET    /api/credits/transactions
GET    /api/credits/analytics
GET    /api/credits/pricing
PUT    /api/credits/pricing
... (more endpoints)
```

### **Payment Endpoints** (25)
```
GET    /api/payments/transactions
GET    /api/payments/transactions/:id
POST   /api/payments/refund
GET    /api/payments/settlements
GET    /api/payments/settlements/:id
POST   /api/payments/settlements
PUT    /api/payments/settlements/:id/approve
GET    /api/payments/failed
POST   /api/payments/failed/:id/retry
GET    /api/payments/analytics
GET    /api/payments/settings
PUT    /api/payments/settings/fees
PUT    /api/payments/settings/settlements
GET    /api/payments/reports
... (more endpoints)
```

**Total: 200+ API Endpoints** ✅

---

## 🔐 **Authentication & Authorization**

### **JWT Token Structure:**
```typescript
{
  userId: string;
  email: string;
  role: string;
  tenantId?: string; // For multi-tenancy
  type: 'ADMIN_USER' | 'PLATFORM_USER';
  permissions: string[];
  iat: number;
  exp: number;
}
```

### **Authorization Levels:**
1. **Public**: No authentication required
2. **Authenticated**: Valid JWT token required
3. **Role-Based**: Specific role required
4. **Permission-Based**: Specific permission required
5. **Tenant-Isolated**: Tenant context required

---

## 🗄️ **Multi-Tenant Architecture**

### **6-Layer Isolation:**

1. **Database Layer**: Row-Level Security (RLS) in PostgreSQL
2. **API Layer**: Tenant middleware validates tenant context
3. **Cache Layer**: Tenant-scoped cache keys
4. **Storage Layer**: Tenant-namespaced file storage
5. **JWT Layer**: Tenant ID in token
6. **React Context**: Tenant context in frontend

### **Tenant Middleware:**
```typescript
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
  
  if (!tenantId) {
    return res.status(403).json({
      success: false,
      error: { message: 'Tenant context required' }
    });
  }
  
  req.tenantId = tenantId;
  next();
};
```

---

## 📊 **Caching Strategy**

### **Redis Cache Keys:**
```
users:{userId}                    # User data
tenant:{tenantId}                 # Tenant data
subscriptions:{tenantId}          # Tenant subscriptions
credits:{tenantId}                # Tenant credits
analytics:{tenantId}:{date}       # Analytics cache
```

### **Cache TTL:**
- User data: 5 minutes
- Tenant data: 10 minutes
- Analytics: 1 hour
- Reports: 6 hours

---

## 🚀 **Background Jobs**

### **Job Queues:**
1. **Email Queue**: Send emails (Welcome, Invoice, Notification)
2. **SMS Queue**: Send SMS messages
3. **WhatsApp Queue**: Send WhatsApp messages
4. **Settlement Queue**: Process payment settlements
5. **Invoice Queue**: Generate invoices
6. **Dunning Queue**: Run dunning campaigns
7. **Report Queue**: Generate reports
8. **Cleanup Queue**: Data cleanup tasks

---

## 📝 **API Response Format**

### **Success Response:**
```typescript
{
  success: true,
  data: T,
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  }
}
```

### **Error Response:**
```typescript
{
  success: false,
  error: {
    message: string;
    code?: string;
    details?: any;
    statusCode: number;
  }
}
```

---

## 🧪 **Testing Strategy**

### **Unit Tests:**
- Service layer tests
- Utility function tests
- Validator tests

### **Integration Tests:**
- API endpoint tests
- Database integration tests
- External service tests

### **E2E Tests:**
- Critical user flows
- Authentication flows
- CRUD operations

---

## 📊 **Performance Optimization**

1. **Database Indexing**: All foreign keys, search fields
2. **Query Optimization**: Eager loading, pagination
3. **Caching**: Redis for frequent queries
4. **Connection Pooling**: Prisma connection pool
5. **Rate Limiting**: Per-user, per-endpoint limits
6. **Response Compression**: Gzip/Brotli compression

---

**Last Updated**: October 31, 2025  
**Status**: Backend Architecture Complete  
**Next**: Frontend Architecture Document


