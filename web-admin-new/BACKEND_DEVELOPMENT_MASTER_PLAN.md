# 🏗️ BACKEND DEVELOPMENT MASTER PLAN
## Comprehensive Architecture & Implementation Strategy

---

## ✅ **YOUR APPROVED SERVICES - READY TO USE!**

### **Payment Gateways:**
- ✅ **Cashfree** - Account approved and ready (1.5% + ₹3)
- ✅ **Razorpay** - Account approved and ready (2% + ₹0)
- 🎯 **Strategy:** Dual gateway with smart routing + automatic failover

### **SMS Communication:**
- ✅ **BSNL DLT** - Entity ID registered, templates approved
- 🎯 **Provider:** MSG91 (₹0.15/SMS) with BSNL DLT integration
- 🎯 **Compliance:** 100% TRAI compliant for commercial SMS

### **Benefits:**
- 💰 Cost optimization through dual gateway
- 🔄 99.99% uptime with automatic failover
- 📱 Commercial SMS ready with DLT compliance
- 🇮🇳 100% Indian indigenous solutions

---

## 📋 **TABLE OF CONTENTS**

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [Multi-Tenancy Strategy](#multi-tenancy-strategy)
5. [API Structure](#api-structure)
6. [Security & Authentication](#security--authentication)
7. [Microservices Architecture](#microservices-architecture)
8. [Implementation Phases](#implementation-phases)
9. [Error Handling Strategy](#error-handling-strategy)
10. [Scalability & Performance](#scalability--performance)
11. [Monitoring & Logging](#monitoring--logging)
12. [Testing Strategy](#testing-strategy)

---

## 🎯 **1. ARCHITECTURE OVERVIEW**

### **System Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Admin Portal │  │ Owner Portal │  │ Mobile Apps  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Port 3000)                      │
│  • Rate Limiting  • Authentication  • Request Routing            │
│  • Load Balancing • API Versioning  • Request Logging            │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES LAYER                            │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Service │  │ User Service │  │ Tenant Service│          │
│  │  Port 3001   │  │  Port 3002   │  │  Port 3003   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Student Service│ │Library Service│ │Payment Service│          │
│  │  Port 3004   │  │  Port 3005   │  │  Port 3006   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Revenue Service│ │Credit Service │ │Subscription  │          │
│  │  Port 3007   │  │  Port 3008   │  │   Service    │          │
│  └──────────────┘  └──────────────┘  │  Port 3009   │          │
│                                       └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ CRM Service  │  │Messaging Svc │  │ Ticket Service│          │
│  │  Port 3010   │  │  Port 3011   │  │  Port 3012   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Analytics Svc │  │Notification  │  │ System Health │          │
│  │  Port 3013   │  │   Service    │  │   Service     │          │
│  └──────────────┘  │  Port 3014   │  │  Port 3015   │          │
│                    └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                   │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │  MongoDB     │          │
│  │  (Main DB)   │  │   (Cache)    │  │   (Logs)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ S3/MinIO     │  │  Elasticsearch│ │   RabbitMQ   │          │
│  │ (Storage)    │  │   (Search)    │  │ (Message Q)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### **Key Principles:**

1. **Microservices Architecture** - Independent, scalable services
2. **Multi-Tenancy** - Tenant isolation at database level
3. **API Gateway Pattern** - Single entry point with routing
4. **Event-Driven** - Async communication via message queues
5. **CQRS** - Command Query Responsibility Segregation
6. **Horizontal Scaling** - Service replication support
7. **Containerization** - Docker + Kubernetes deployment

---

## 💻 **2. TECHNOLOGY STACK**

### **Backend Framework:**
```yaml
Core:
  - Node.js (v18+ LTS)
  - Express.js / NestJS
  - TypeScript (Strict mode)

API Gateway:
  - Express Gateway / Kong / AWS API Gateway
  - Rate limiting: express-rate-limit
  - Request validation: Joi / Zod
```

### **Databases:**
```yaml
Primary Database:
  - PostgreSQL 15+
  - Multi-tenant schema design
  - Connection pooling: pg-pool
  - ORM: Prisma / TypeORM

Cache Layer:
  - Redis 7+
  - Session management
  - API response caching
  - Rate limit tracking

Document Store:
  - MongoDB (Optional)
  - Logs & audit trails
  - Analytics data
  - Unstructured data

Search Engine:
  - Elasticsearch 8+
  - Full-text search
  - Aggregations
  - Tenant-specific indexes
```

### **Message Queue:**
```yaml
Queue System:
  - RabbitMQ / AWS SQS
  - Event-driven architecture
  - Async job processing
  - Service communication

Job Scheduler:
  - Bull / Agenda
  - Cron jobs
  - Recurring tasks
  - Background processing
```

### **Storage:**
```yaml
File Storage:
  - AWS S3 / MinIO
  - Tenant-specific buckets
  - CDN integration
  - Secure pre-signed URLs
```

### **Authentication & Security:**
```yaml
Auth:
  - JWT (Access + Refresh tokens)
  - bcrypt for password hashing
  - OAuth 2.0 / SAML (SSO)
  - Multi-factor authentication

Security:
  - Helmet.js (HTTP headers)
  - CORS configuration
  - SQL injection prevention
  - XSS protection
  - Rate limiting
  - DDoS protection
```

### **Monitoring & Logging:**
```yaml
Monitoring:
  - Prometheus + Grafana
  - Custom metrics
  - Service health checks
  - Performance monitoring

Logging:
  - Winston / Pino
  - ELK Stack (Elasticsearch, Logstash, Kibana)
  - Structured logging
  - Log aggregation

APM:
  - New Relic / DataDog
  - Request tracing
  - Error tracking
  - Performance profiling
```

### **DevOps:**
```yaml
Containerization:
  - Docker
  - Docker Compose (Development)
  - Multi-stage builds

Orchestration:
  - Kubernetes
  - Helm charts
  - Auto-scaling
  - Service mesh (Istio)

CI/CD:
  - GitHub Actions / Jenkins
  - Automated testing
  - Deployment pipelines
  - Blue-green deployment
```

---

## 🗄️ **3. DATABASE DESIGN**

### **Multi-Tenant Schema Strategy:**

We'll use **Schema-per-Tenant** approach for data isolation:

```sql
-- Tenant Management Database (Shared)
CREATE DATABASE studyspot_core;

-- Tenant-specific Databases
CREATE DATABASE studyspot_tenant_1;
CREATE DATABASE studyspot_tenant_2;
CREATE DATABASE studyspot_tenant_N;
```

### **Core Database Schema (studyspot_core):**

```sql
-- ============================================
-- TENANT MANAGEMENT
-- ============================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, trial, expired
    subscription_plan VARCHAR(50), -- free, starter, professional, enterprise
    subscription_status VARCHAR(50), -- active, trial, expired, cancelled
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    max_libraries INTEGER DEFAULT 1,
    max_students INTEGER DEFAULT 100,
    max_staff INTEGER DEFAULT 10,
    database_name VARCHAR(100) UNIQUE NOT NULL, -- studyspot_tenant_1
    database_host VARCHAR(255),
    features JSONB, -- feature flags
    settings JSONB, -- custom settings
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_subscription ON tenants(subscription_plan, subscription_status);

-- ============================================
-- ADMIN USERS (Platform Admins)
-- ============================================

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50), -- super_admin, admin, support, analyst
    department VARCHAR(50), -- management, sales, finance, operations
    permissions JSONB, -- granular permissions
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- ============================================
-- PLATFORM ANALYTICS (Aggregated)
-- ============================================

CREATE TABLE platform_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_tenants INTEGER DEFAULT 0,
    active_tenants INTEGER DEFAULT 0,
    total_libraries INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    metrics JSONB, -- detailed metrics
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_platform_analytics_date ON platform_analytics(date);

-- ============================================
-- CREDIT MASTER WALLET (Platform Level)
-- ============================================

CREATE TABLE credit_master_wallet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_sms_credits BIGINT DEFAULT 0,
    total_whatsapp_credits BIGINT DEFAULT 0,
    total_email_credits BIGINT DEFAULT 0,
    available_sms_credits BIGINT DEFAULT 0,
    available_whatsapp_credits BIGINT DEFAULT 0,
    available_email_credits BIGINT DEFAULT 0,
    allocated_sms_credits BIGINT DEFAULT 0,
    allocated_whatsapp_credits BIGINT DEFAULT 0,
    allocated_email_credits BIGINT DEFAULT 0,
    total_purchased DECIMAL(15,2) DEFAULT 0,
    total_sold DECIMAL(15,2) DEFAULT 0,
    profit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CREDIT VENDORS
-- ============================================

CREATE TABLE credit_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    sms_rate DECIMAL(10,4), -- cost per SMS
    whatsapp_rate DECIMAL(10,4),
    email_rate DECIMAL(10,4),
    minimum_order INTEGER,
    payment_terms VARCHAR(100),
    rating DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CREDIT PURCHASE HISTORY
-- ============================================

CREATE TABLE credit_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES credit_vendors(id),
    purchase_date TIMESTAMP DEFAULT NOW(),
    sms_credits BIGINT DEFAULT 0,
    whatsapp_credits BIGINT DEFAULT 0,
    email_credits BIGINT DEFAULT 0,
    total_cost DECIMAL(15,2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50), -- pending, completed, failed
    invoice_number VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TENANT CREDIT WALLETS
-- ============================================

CREATE TABLE tenant_credit_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    sms_credits BIGINT DEFAULT 0,
    whatsapp_credits BIGINT DEFAULT 0,
    email_credits BIGINT DEFAULT 0,
    sms_rate DECIMAL(10,4), -- retail price per SMS
    whatsapp_rate DECIMAL(10,4),
    email_rate DECIMAL(10,4),
    total_spent DECIMAL(15,2) DEFAULT 0,
    low_balance_threshold INTEGER DEFAULT 1000,
    auto_alert_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenant_credit_wallets_tenant ON tenant_credit_wallets(tenant_id);

-- ============================================
-- SUBSCRIPTION PLANS
-- ============================================

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(50), -- free, trial, starter, professional, enterprise, custom
    price_monthly DECIMAL(10,2),
    price_quarterly DECIMAL(10,2),
    price_half_yearly DECIMAL(10,2),
    price_annual DECIMAL(10,2),
    max_libraries INTEGER,
    max_students INTEGER,
    max_staff INTEGER,
    features JSONB, -- feature list
    permissions JSONB, -- granular permissions
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_subscription_plans_type ON subscription_plans(type);

-- ============================================
-- SUBSCRIPTION HISTORY
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    plan_id UUID REFERENCES subscription_plans(id),
    billing_cycle VARCHAR(20), -- monthly, quarterly, half_yearly, annual
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50), -- active, trial, expired, cancelled
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    auto_renew BOOLEAN DEFAULT true,
    cancellation_date TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- AUDIT LOGS (Platform Level)
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID, -- NULL for platform-level actions
    user_id UUID,
    user_type VARCHAR(50), -- admin, tenant_owner, staff
    action VARCHAR(100) NOT NULL, -- login, create_user, update_subscription, etc.
    entity_type VARCHAR(100), -- tenant, user, subscription, payment
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- SYSTEM NOTIFICATIONS (Platform Level)
-- ============================================

CREATE TABLE system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- success, info, warning, error
    category VARCHAR(50), -- payment, tenant, student, subscription, credit, system, security
    priority VARCHAR(20), -- low, medium, high, critical
    tenant_id UUID, -- NULL for platform-wide notifications
    action_required BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_notifications_tenant ON system_notifications(tenant_id);
CREATE INDEX idx_system_notifications_type ON system_notifications(type);
CREATE INDEX idx_system_notifications_is_read ON system_notifications(is_read);
```

### **Tenant-Specific Database Schema (studyspot_tenant_N):**

```sql
-- ============================================
-- LIBRARIES
-- ============================================

CREATE TABLE libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, -- Reference to core.tenants
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    phone VARCHAR(20),
    email VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,
    opening_time TIME,
    closing_time TIME,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, under_maintenance
    amenities JSONB,
    images JSONB,
    manager_name VARCHAR(255),
    manager_phone VARCHAR(20),
    manager_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_libraries_tenant ON libraries(tenant_id);
CREATE INDEX idx_libraries_status ON libraries(status);
CREATE INDEX idx_libraries_city ON libraries(city);

-- ============================================
-- USERS (Tenant-specific)
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50), -- owner, manager, staff
    library_id UUID REFERENCES libraries(id),
    permissions JSONB,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_library ON users(library_id);

-- ============================================
-- STUDENTS
-- ============================================

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_code VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    parent_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    education_level VARCHAR(50), -- school, college, competitive_exam
    course VARCHAR(100),
    institution VARCHAR(255),
    photo_url VARCHAR(500),
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    id_proof_url VARCHAR(500),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
    subscription_plan VARCHAR(50),
    subscription_start_date DATE,
    subscription_end_date DATE,
    seat_number VARCHAR(20),
    preferred_time_slot VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_students_library ON students(library_id);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_status ON students(status);

-- ============================================
-- BOOKINGS / SEAT ALLOCATION
-- ============================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_id UUID REFERENCES students(id),
    seat_number VARCHAR(20),
    booking_type VARCHAR(50), -- hourly, daily, monthly
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_library ON bookings(library_id);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- ============================================
-- ATTENDANCE
-- ============================================

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_id UUID REFERENCES students(id),
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    date DATE NOT NULL,
    duration_minutes INTEGER,
    status VARCHAR(50), -- present, absent, late
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_tenant ON attendance(tenant_id);
CREATE INDEX idx_attendance_library ON attendance(library_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_id UUID REFERENCES students(id),
    booking_id UUID REFERENCES bookings(id),
    invoice_number VARCHAR(100) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50), -- cash, upi, card, net_banking
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_date TIMESTAMP,
    payment_gateway VARCHAR(50),
    transaction_id VARCHAR(255),
    payment_details JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_library ON payments(library_id);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- ============================================
-- COMMUNICATIONS
-- ============================================

CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_id UUID REFERENCES students(id),
    channel VARCHAR(20), -- sms, whatsapp, email
    type VARCHAR(50), -- welcome, reminder, promotional, alert
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    template_id UUID,
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    credits_used INTEGER DEFAULT 1,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_communications_tenant ON communications(tenant_id);
CREATE INDEX idx_communications_student ON communications(student_id);
CREATE INDEX idx_communications_status ON communications(status);

-- ============================================
-- TICKETS / COMPLAINTS
-- ============================================

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    library_id UUID REFERENCES libraries(id),
    student_id UUID REFERENCES students(id),
    ticket_number VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50), -- facility, service, billing, technical
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
    assigned_to UUID REFERENCES users(id),
    resolution TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX idx_tickets_student ON tickets(student_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- ============================================
-- REFERRALS
-- ============================================

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    referrer_id UUID REFERENCES students(id),
    referred_id UUID REFERENCES students(id),
    referral_code VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, converted, rewarded
    reward_type VARCHAR(50), -- discount, credit, cash
    reward_amount DECIMAL(10,2),
    reward_status VARCHAR(50) DEFAULT 'pending', -- pending, processed
    converted_at TIMESTAMP,
    rewarded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_referrals_tenant ON referrals(tenant_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
```

---

## 🏢 **4. MULTI-TENANCY STRATEGY**

### **Tenant Isolation Approach:**

We'll implement **Database-per-Tenant** for maximum isolation:

```typescript
// Tenant Database Manager
class TenantDatabaseManager {
  private connections: Map<string, Pool> = new Map();

  async getTenantConnection(tenantId: string): Promise<Pool> {
    // Check if connection exists in cache
    if (this.connections.has(tenantId)) {
      return this.connections.get(tenantId)!;
    }

    // Fetch tenant database info from core database
    const tenant = await this.getTenantInfo(tenantId);
    
    // Create new connection pool
    const pool = new Pool({
      host: tenant.database_host,
      database: tenant.database_name,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20, // connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Cache connection
    this.connections.set(tenantId, pool);
    return pool;
  }

  async getTenantInfo(tenantId: string): Promise<Tenant> {
    // Query core database
    const result = await coreDb.query(
      'SELECT * FROM tenants WHERE id = $1 AND status = $2',
      [tenantId, 'active']
    );
    
    if (!result.rows.length) {
      throw new Error('Tenant not found or inactive');
    }
    
    return result.rows[0];
  }
}
```

### **Tenant Context Middleware:**

```typescript
// Express middleware to extract tenant context
export const tenantContextMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract tenant from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const tenantId = decoded.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID not found in token' });
    }

    // Attach tenant context to request
    req.tenantId = tenantId;
    req.tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Usage in routes
router.get('/students', tenantContextMiddleware, async (req, res) => {
  // req.tenantDb is now available with tenant-specific connection
  const students = await req.tenantDb.query(
    'SELECT * FROM students WHERE tenant_id = $1',
    [req.tenantId]
  );
  
  res.json(students.rows);
});
```

### **Tenant Provisioning Flow:**

```typescript
// Tenant Onboarding Service
class TenantProvisioningService {
  async createTenant(data: TenantRegistration): Promise<Tenant> {
    const transaction = await coreDb.transaction();
    
    try {
      // 1. Create tenant record
      const tenant = await this.createTenantRecord(data, transaction);
      
      // 2. Create tenant database
      await this.createTenantDatabase(tenant.database_name);
      
      // 3. Run migrations on tenant database
      await this.runTenantMigrations(tenant.database_name);
      
      // 4. Create initial admin user
      await this.createTenantAdmin(tenant.id, data.owner_email);
      
      // 5. Initialize credit wallet
      await this.initializeCreditWallet(tenant.id);
      
      // 6. Send welcome email
      await this.sendWelcomeEmail(tenant);
      
      await transaction.commit();
      return tenant;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private async createTenantDatabase(databaseName: string): Promise<void> {
    // Create database
    await coreDb.query(`CREATE DATABASE ${databaseName}`);
    
    // Grant permissions
    await coreDb.query(`GRANT ALL PRIVILEGES ON DATABASE ${databaseName} TO app_user`);
  }

  private async runTenantMigrations(databaseName: string): Promise<void> {
    // Connect to tenant database
    const tenantDb = new Pool({ database: databaseName });
    
    // Run schema migrations
    await tenantDb.query(fs.readFileSync('./migrations/tenant_schema.sql', 'utf8'));
    
    // Insert seed data
    await tenantDb.query(fs.readFileSync('./migrations/tenant_seed.sql', 'utf8'));
    
    await tenantDb.end();
  }
}
```

---

## 🔌 **5. API STRUCTURE**

### **RESTful API Design:**

```
Base URL: https://api.studyspot.com/v1

Authentication: Bearer Token (JWT)
Content-Type: application/json
```

### **API Endpoint Structure:**

```yaml
# ============================================
# AUTHENTICATION & AUTHORIZATION
# ============================================

POST   /auth/login                          # Admin/User login
POST   /auth/logout                         # Logout
POST   /auth/refresh                        # Refresh access token
POST   /auth/forgot-password                # Forgot password
POST   /auth/reset-password                 # Reset password
POST   /auth/verify-email                   # Verify email
GET    /auth/profile                        # Get current user profile
PUT    /auth/profile                        # Update profile
POST   /auth/change-password                # Change password
POST   /auth/enable-2fa                     # Enable 2FA
POST   /auth/verify-2fa                     # Verify 2FA code

# ============================================
# TENANT MANAGEMENT
# ============================================

GET    /tenants                             # List all tenants (admin)
POST   /tenants                             # Create tenant (admin)
GET    /tenants/:id                         # Get tenant details
PUT    /tenants/:id                         # Update tenant
DELETE /tenants/:id                         # Delete tenant
GET    /tenants/:id/stats                   # Tenant statistics
POST   /tenants/:id/suspend                 # Suspend tenant
POST   /tenants/:id/reactivate              # Reactivate tenant
GET    /tenants/:id/subscriptions           # Subscription history
POST   /tenants/:id/upgrade                 # Upgrade subscription
POST   /tenants/:id/downgrade               # Downgrade subscription

# Tenant Onboarding
POST   /tenants/onboarding                  # Start onboarding
PUT    /tenants/onboarding/:id              # Update onboarding
GET    /tenants/onboarding/:id              # Get onboarding status
POST   /tenants/onboarding/:id/submit      # Submit for approval

# ============================================
# USER MANAGEMENT
# ============================================

# Platform Users (Admin)
GET    /admin/users                         # List all admin users
POST   /admin/users                         # Create admin user
GET    /admin/users/:id                     # Get admin user
PUT    /admin/users/:id                     # Update admin user
DELETE /admin/users/:id                     # Delete admin user
GET    /admin/users/:id/activity            # User activity log

# Tenant Users
GET    /users                               # List users (tenant)
POST   /users                               # Create user
GET    /users/:id                           # Get user
PUT    /users/:id                           # Update user
DELETE /users/:id                           # Delete user
POST   /users/:id/reset-password            # Reset user password
PUT    /users/:id/permissions                # Update permissions

# ============================================
# LIBRARY MANAGEMENT
# ============================================

GET    /libraries                           # List all libraries
POST   /libraries                           # Create library
GET    /libraries/:id                       # Get library details
PUT    /libraries/:id                       # Update library
DELETE /libraries/:id                       # Delete library
GET    /libraries/:id/performance           # Library performance
GET    /libraries/:id/occupancy             # Real-time occupancy
GET    /libraries/:id/analytics             # Library analytics
POST   /libraries/:id/suspend               # Suspend library
POST   /libraries/:id/reactivate            # Reactivate library
GET    /libraries/realtime-occupancy        # All libraries occupancy

# Library Approval (Admin)
GET    /admin/libraries/pending             # Pending approvals
POST   /admin/libraries/:id/approve         # Approve library
POST   /admin/libraries/:id/reject          # Reject library
POST   /admin/libraries/:id/request-changes # Request changes

# ============================================
# STUDENT MANAGEMENT
# ============================================

GET    /students                            # List all students
POST   /students                            # Create student
GET    /students/:id                        # Get student details
PUT    /students/:id                        # Update student
DELETE /students/:id                        # Delete student
GET    /students/:id/bookings               # Student bookings
GET    /students/:id/payments               # Student payments
GET    /students/:id/attendance             # Student attendance
GET    /students/:id/communications         # Communication history
GET    /students/:id/complaints             # Student complaints
POST   /students/:id/suspend                # Suspend student
POST   /students/:id/reactivate             # Reactivate student
POST   /students/:id/send-reminder          # Send reminder

# Student Analytics
GET    /students/analytics                  # Student analytics
GET    /students/dashboard                  # Dashboard data
GET    /students/churn-risk                 # At-risk students
GET    /students/top-active                 # Top active students

# Bulk Operations
POST   /students/bulk-import                # Bulk import students
POST   /students/bulk-update                # Bulk update students
POST   /students/bulk-message               # Send bulk message
GET    /students/export                     # Export students (CSV/Excel)

# ============================================
# BOOKING / SEAT ALLOCATION
# ============================================

GET    /bookings                            # List all bookings
POST   /bookings                            # Create booking
GET    /bookings/:id                        # Get booking
PUT    /bookings/:id                        # Update booking
DELETE /bookings/:id                        # Cancel booking
GET    /bookings/available-seats            # Available seats
POST   /bookings/bulk-assign                # Bulk seat assignment

# ============================================
# ATTENDANCE
# ============================================

GET    /attendance                          # List attendance records
POST   /attendance/check-in                 # Check-in
POST   /attendance/check-out                # Check-out
GET    /attendance/:id                      # Get attendance record
GET    /attendance/student/:id              # Student attendance
GET    /attendance/analytics                # Attendance analytics
GET    /attendance/report                   # Generate report

# Staff Attendance
GET    /staff-attendance                    # Staff attendance records
POST   /staff-attendance/scan               # QR scan check-in/out
GET    /staff-attendance/analytics          # Staff analytics

# ============================================
# PAYMENT MANAGEMENT
# ============================================

GET    /payments                            # List all payments
POST   /payments                            # Create payment
GET    /payments/:id                        # Get payment details
PUT    /payments/:id                        # Update payment
POST   /payments/:id/refund                 # Process refund
GET    /payments/student/:id                # Student payments
GET    /payments/pending                    # Pending payments
POST   /payments/send-reminder              # Send payment reminder
GET    /payments/analytics                  # Payment analytics
GET    /payments/export                     # Export payments

# Payment Gateway (Cashfree + Razorpay - APPROVED)
POST   /payments/initiate                   # Initiate payment (auto-selects gateway)
POST   /payments/verify                     # Verify payment
POST   /payments/webhook/cashfree           # Cashfree webhook
POST   /payments/webhook/razorpay           # Razorpay webhook

# ============================================
# REVENUE & BILLING
# ============================================

GET    /revenue/dashboard                   # Revenue dashboard
GET    /revenue/analytics                   # Revenue analytics
GET    /revenue/transactions                # All transactions
GET    /revenue/trends                      # Revenue trends
GET    /revenue/by-library                  # Library-wise revenue
GET    /revenue/by-plan                     # Plan-wise revenue
GET    /revenue/export                      # Export revenue data

# Invoices
GET    /invoices                            # List invoices
POST   /invoices                            # Create invoice
GET    /invoices/:id                        # Get invoice
POST   /invoices/:id/send                   # Send invoice
GET    /invoices/:id/pdf                    # Download PDF

# ============================================
# CREDIT MANAGEMENT
# ============================================

# Master Wallet (Admin)
GET    /admin/credits/wallet                # Master wallet balance
GET    /admin/credits/vendors               # List vendors
POST   /admin/credits/vendors               # Add vendor
PUT    /admin/credits/vendors/:id           # Update vendor
POST   /admin/credits/purchase              # Purchase credits
GET    /admin/credits/purchase-history      # Purchase history
GET    /admin/credits/pricing-matrix        # Pricing matrix
PUT    /admin/credits/pricing-matrix        # Update pricing
GET    /admin/credits/profit-analytics      # Profit analytics

# Tenant Wallets
GET    /admin/credits/tenant-wallets        # All tenant wallets
GET    /credits/wallet                      # My wallet (tenant)
POST   /credits/allocate                    # Allocate to tenant (admin)
POST   /credits/purchase                    # Purchase credits (tenant)
GET    /credits/usage-report                # Usage report
GET    /credits/packages                    # Available packages
POST   /credits/packages                    # Create custom package

# ============================================
# SUBSCRIPTION MANAGEMENT
# ============================================

# Subscription Plans (Admin)
GET    /admin/subscriptions/plans           # List all plans
POST   /admin/subscriptions/plans           # Create plan
GET    /admin/subscriptions/plans/:id       # Get plan
PUT    /admin/subscriptions/plans/:id       # Update plan
DELETE /admin/subscriptions/plans/:id       # Delete plan
GET    /admin/subscriptions/analytics       # Subscription analytics

# Tenant Subscriptions
GET    /subscriptions                       # List subscriptions (tenant)
POST   /subscriptions/subscribe             # Subscribe to plan
POST   /subscriptions/upgrade               # Upgrade plan
POST   /subscriptions/downgrade             # Downgrade plan
POST   /subscriptions/:id/cancel            # Cancel subscription
POST   /subscriptions/:id/renew             # Renew subscription
GET    /subscriptions/current               # Current subscription

# ============================================
# CRM & LEADS
# ============================================

GET    /crm/leads                           # List all leads
POST   /crm/leads                           # Create lead
GET    /crm/leads/:id                       # Get lead
PUT    /crm/leads/:id                       # Update lead
DELETE /crm/leads/:id                       # Delete lead
POST   /crm/leads/:id/convert               # Convert to customer
POST   /crm/leads/:id/assign                # Assign to user
GET    /crm/leads/kanban                    # Kanban board data
GET    /crm/analytics                       # CRM analytics

# ============================================
# SALES & TEAMS
# ============================================

GET    /sales/teams                         # List teams
GET    /sales/members                       # Team members
GET    /sales/performance                   # Performance metrics
GET    /sales/pipeline                      # Sales pipeline
GET    /sales/referrals                     # Referral program
GET    /sales/referrals/:id                 # Referral details
GET    /sales/analytics                     # Sales analytics
GET    /sales/leaderboard                   # Sales leaderboard

# ============================================
# MESSAGING & COMMUNICATION (BSNL DLT APPROVED)
# ============================================

# Bulk Messaging
POST   /messaging/send                      # Send bulk message
POST   /messaging/sms                       # Send SMS (BSNL DLT compliant)
POST   /messaging/whatsapp                  # Send WhatsApp
POST   /messaging/email                     # Send Email
GET    /messaging/history                   # Message history
GET    /messaging/analytics                 # Messaging analytics
GET    /messaging/dlt-templates             # Get approved DLT templates

# Message Templates (BSNL DLT Registered)
GET    /messaging/templates                 # List templates
POST   /messaging/templates                 # Create template
GET    /messaging/templates/:id             # Get template
PUT    /messaging/templates/:id             # Update template
DELETE /messaging/templates/:id             # Delete template
POST   /messaging/templates/:id/duplicate   # Duplicate template
GET    /messaging/templates/dlt-status      # Check DLT approval status

# ============================================
# TICKET MANAGEMENT
# ============================================

GET    /tickets                             # List all tickets
POST   /tickets                             # Create ticket
GET    /tickets/:id                         # Get ticket
PUT    /tickets/:id                         # Update ticket
DELETE /tickets/:id                         # Delete ticket
POST   /tickets/:id/assign                  # Assign ticket
POST   /tickets/:id/close                   # Close ticket
POST   /tickets/:id/reopen                  # Reopen ticket
POST   /tickets/:id/comment                 # Add comment
GET    /tickets/analytics                   # Ticket analytics
GET    /tickets/ai-automation               # AI automation rules

# ============================================
# REFERRALS & LOYALTY
# ============================================

GET    /referrals                           # List referrals
POST   /referrals                           # Create referral
GET    /referrals/:id                       # Get referral
GET    /referrals/code/:code                # Get by code
POST   /referrals/:id/convert               # Mark as converted
POST   /referrals/:id/reward                # Process reward
GET    /referrals/analytics                 # Referral analytics

# Loyalty Program
GET    /loyalty/points/:studentId           # Get points
POST   /loyalty/points/earn                 # Earn points
POST   /loyalty/points/redeem               # Redeem points
GET    /loyalty/rewards                     # Available rewards
GET    /loyalty/history/:studentId          # Points history

# ============================================
# ANALYTICS & REPORTS
# ============================================

# Platform Analytics (Admin)
GET    /analytics/executive                 # Executive dashboard
GET    /analytics/revenue                   # Revenue analytics
GET    /analytics/users                     # User analytics
GET    /analytics/operational               # Operational metrics
GET    /analytics/regional                  # Regional insights
GET    /analytics/trends                    # Trend analysis

# Tenant Analytics
GET    /analytics/dashboard                 # Dashboard data
GET    /analytics/students                  # Student analytics
GET    /analytics/libraries                 # Library analytics
GET    /analytics/financial                 # Financial analytics
GET    /analytics/attendance                # Attendance analytics

# Reports
GET    /reports                             # List reports
POST   /reports/generate                    # Generate report
GET    /reports/:id                         # Get report
GET    /reports/:id/download                # Download report
GET    /reports/scheduled                   # Scheduled reports
POST   /reports/schedule                    # Schedule report

# ============================================
# SYSTEM & ADMIN
# ============================================

# System Health
GET    /system/health                       # Health check
GET    /system/metrics                      # System metrics
GET    /system/services                     # Service status
GET    /system/version                      # Version info

# Audit Logs
GET    /audit/logs                          # Get audit logs
GET    /audit/logs/search                   # Search logs
GET    /audit/logs/export                   # Export logs

# Notifications
GET    /notifications                       # Get notifications
POST   /notifications/mark-read/:id         # Mark as read
POST   /notifications/mark-all-read         # Mark all as read
DELETE /notifications/clear                 # Clear all
GET    /notifications/preferences           # Get preferences
PUT    /notifications/preferences           # Update preferences

# Developer / API Management
GET    /developer/api-keys                  # List API keys
POST   /developer/api-keys                  # Create API key
DELETE /developer/api-keys/:id              # Delete API key
POST   /developer/api-keys/:id/regenerate   # Regenerate key
GET    /developer/webhooks                  # List webhooks
POST   /developer/webhooks                  # Create webhook
PUT    /developer/webhooks/:id              # Update webhook
DELETE /developer/webhooks/:id              # Delete webhook
POST   /developer/webhooks/:id/test         # Test webhook
GET    /developer/api-logs                  # API logs
GET    /developer/analytics                 # API analytics

# Settings
GET    /settings                            # Get settings
PUT    /settings                            # Update settings
GET    /settings/:key                       # Get specific setting
PUT    /settings/:key                       # Update specific setting
```

### **Standard Response Format:**

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-11-02T14:30:00Z"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2025-11-02T14:30:00Z"
}

// Paginated Response
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2025-11-02T14:30:00Z"
}
```

---

## 🔒 **6. SECURITY & AUTHENTICATION**

### **JWT Token Structure:**

```typescript
// Access Token (15 minutes)
{
  "userId": "uuid",
  "tenantId": "uuid",
  "role": "admin",
  "permissions": ["read:users", "write:users"],
  "type": "access",
  "exp": 1699000000,
  "iat": 1699000000
}

// Refresh Token (7 days)
{
  "userId": "uuid",
  "type": "refresh",
  "exp": 1699000000,
  "iat": 1699000000
}
```

### **Authentication Flow:**

```typescript
// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password, type } = req.body; // type: 'admin' | 'tenant'
  
  try {
    // 1. Find user
    const user = type === 'admin' 
      ? await findAdminUser(email)
      : await findTenantUser(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 2. Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 3. Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive' });
    }
    
    // 4. Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      permissions: user.permissions,
    });
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
    });
    
    // 5. Store refresh token
    await storeRefreshToken(user.id, refreshToken);
    
    // 6. Update last login
    await updateLastLogin(user.id, req.ip);
    
    // 7. Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'login',
      ipAddress: req.ip,
    });
    
    return res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

### **Role-Based Access Control (RBAC):**

```typescript
// Permission structure
const PERMISSIONS = {
  // User management
  'users:read': 'View users',
  'users:create': 'Create users',
  'users:update': 'Update users',
  'users:delete': 'Delete users',
  
  // Tenant management
  'tenants:read': 'View tenants',
  'tenants:create': 'Create tenants',
  'tenants:update': 'Update tenants',
  'tenants:delete': 'Delete tenants',
  'tenants:suspend': 'Suspend tenants',
  
  // Student management
  'students:read': 'View students',
  'students:create': 'Create students',
  'students:update': 'Update students',
  'students:delete': 'Delete students',
  
  // Financial
  'payments:read': 'View payments',
  'payments:create': 'Create payments',
  'payments:refund': 'Process refunds',
  'revenue:read': 'View revenue',
  
  // System
  'system:settings': 'Manage system settings',
  'system:logs': 'View system logs',
  'system:health': 'View system health',
};

// Role definitions
const ROLES = {
  super_admin: {
    name: 'Super Admin',
    permissions: Object.keys(PERMISSIONS), // All permissions
  },
  admin: {
    name: 'Admin',
    permissions: [
      'users:read', 'users:create', 'users:update',
      'tenants:read', 'tenants:update',
      'students:read', 'students:create', 'students:update',
      'payments:read', 'revenue:read',
    ],
  },
  support: {
    name: 'Support',
    permissions: [
      'users:read',
      'tenants:read',
      'students:read',
      'payments:read',
    ],
  },
  // ... more roles
};

// Permission middleware
const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage
router.delete('/users/:id', 
  authenticate,
  requirePermission('users:delete'),
  async (req, res) => {
    // Delete user
  }
);
```

---

## 🔌 **7. MICROSERVICES ARCHITECTURE**

### **Service Structure:**

```
services/
├── api-gateway/               # Port 3000
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── logging.ts
│   │   ├── routes/
│   │   │   └── index.ts
│   │   └── app.ts
│   ├── package.json
│   └── Dockerfile
│
├── auth-service/              # Port 3001
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── utils/
│   │   └── app.ts
│   ├── package.json
│   └── Dockerfile
│
├── user-service/              # Port 3002
├── tenant-service/            # Port 3003
├── student-service/           # Port 3004
├── library-service/           # Port 3005
├── payment-service/           # Port 3006
├── revenue-service/           # Port 3007
├── credit-service/            # Port 3008
├── subscription-service/      # Port 3009
├── crm-service/               # Port 3010
├── messaging-service/         # Port 3011
├── ticket-service/            # Port 3012
├── analytics-service/         # Port 3013
├── notification-service/      # Port 3014
└── system-health-service/     # Port 3015
```

### **Service Communication:**

```typescript
// Event-driven communication via RabbitMQ
class EventBus {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async publish(event: string, data: any): Promise<void> {
    await this.channel.publish(
      'studyspot.events',
      event,
      Buffer.from(JSON.stringify(data))
    );
  }

  async subscribe(event: string, handler: Function): Promise<void> {
    await this.channel.consume(
      event,
      async (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          await handler(data);
          this.channel.ack(msg);
        }
      }
    );
  }
}

// Example: Student created event
// In Student Service
await eventBus.publish('student.created', {
  studentId: student.id,
  tenantId: student.tenant_id,
  email: student.email,
  phone: student.phone,
});

// In Messaging Service (listener)
eventBus.subscribe('student.created', async (data) => {
  // Send welcome email
  await sendWelcomeEmail(data.email);
  
  // Send welcome SMS
  await sendWelcomeSMS(data.phone);
});
```

---

## 📈 **8. IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Weeks 1-4)**

**Week 1-2: Infrastructure Setup**
- [ ] Set up PostgreSQL database cluster
- [ ] Set up Redis cache
- [ ] Set up RabbitMQ message queue
- [ ] Set up S3/MinIO object storage
- [ ] Create database schemas (core + tenant template)
- [ ] Set up development environment

**Week 3-4: Core Services**
- [ ] Implement API Gateway
- [ ] Implement Auth Service
  - [ ] Login/Logout
  - [ ] JWT token generation
  - [ ] Password reset
  - [ ] 2FA support
- [ ] Implement Tenant Service
  - [ ] CRUD operations
  - [ ] Database provisioning
  - [ ] Tenant context middleware
- [ ] Implement User Service
  - [ ] Admin users
  - [ ] Tenant users
  - [ ] Role management

**Deliverables:**
- ✅ Working authentication
- ✅ Tenant isolation
- ✅ Basic API gateway

---

### **Phase 2: Core Business Logic (Weeks 5-8)**

**Week 5-6: Student & Library Management**
- [ ] Implement Student Service
  - [ ] CRUD operations
  - [ ] Bulk import/export
  - [ ] Search & filters
- [ ] Implement Library Service
  - [ ] CRUD operations
  - [ ] Occupancy tracking
  - [ ] Performance metrics

**Week 7-8: Financial Services**
- [ ] Implement Payment Service
  - [ ] Payment processing
  - [ ] Gateway integration
  - [ ] Refund handling
- [ ] Implement Revenue Service
  - [ ] Revenue tracking
  - [ ] Analytics
  - [ ] Reporting

**Deliverables:**
- ✅ Student management complete
- ✅ Library management complete
- ✅ Payment processing working

---

### **Phase 3: Credits & Subscriptions (Weeks 9-12)**

**Week 9-10: Credit Management**
- [ ] Implement Credit Service
  - [ ] Master wallet management
  - [ ] Tenant wallet management
  - [ ] Credit allocation
  - [ ] Purchase system
  - [ ] Pricing matrix

**Week 11-12: Subscription Management**
- [ ] Implement Subscription Service
  - [ ] Plan management
  - [ ] Subscription lifecycle
  - [ ] Billing cycles
  - [ ] Auto-renewal

**Deliverables:**
- ✅ Credit system operational
- ✅ Subscription management complete

---

### **Phase 4: Operations (Weeks 13-16)**

**Week 13-14: CRM & Messaging**
- [ ] Implement CRM Service
  - [ ] Lead management
  - [ ] Kanban board
  - [ ] Conversion tracking
- [ ] Implement Messaging Service
  - [ ] SMS integration
  - [ ] WhatsApp integration
  - [ ] Email integration
  - [ ] Template management
  - [ ] Bulk messaging

**Week 15-16: Tickets & Referrals**
- [ ] Implement Ticket Service
  - [ ] Ticket management
  - [ ] Assignment system
  - [ ] AI automation
- [ ] Implement Referral Service
  - [ ] Referral tracking
  - [ ] Reward system

**Deliverables:**
- ✅ CRM operational
- ✅ Communication system working
- ✅ Ticket system complete

---

### **Phase 5: Analytics & System (Weeks 17-20)**

**Week 17-18: Analytics**
- [ ] Implement Analytics Service
  - [ ] Data aggregation
  - [ ] Dashboard APIs
  - [ ] Report generation
  - [ ] Export functionality

**Week 19-20: System Services**
- [ ] Implement Notification Service
  - [ ] Real-time notifications
  - [ ] Notification preferences
- [ ] Implement System Health Service
  - [ ] Health checks
  - [ ] Metrics collection
  - [ ] Service monitoring
- [ ] Implement Audit Service
  - [ ] Audit logging
  - [ ] Log search
  - [ ] Compliance reports

**Deliverables:**
- ✅ Analytics complete
- ✅ Notifications working
- ✅ Monitoring in place

---

### **Phase 6: Testing & Optimization (Weeks 21-24)**

**Week 21-22: Testing**
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] Load testing
- [ ] Security testing
- [ ] Penetration testing

**Week 23-24: Optimization**
- [ ] Performance optimization
- [ ] Query optimization
- [ ] Caching strategy
- [ ] Load balancing
- [ ] CDN setup

**Deliverables:**
- ✅ All tests passing
- ✅ Performance optimized
- ✅ Security hardened

---

### **Phase 7: Deployment & Documentation (Weeks 25-26)**

**Week 25: Deployment**
- [ ] Kubernetes setup
- [ ] CI/CD pipelines
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] Disaster recovery

**Week 26: Documentation**
- [ ] API documentation (Swagger)
- [ ] Architecture documentation
- [ ] Deployment guide
- [ ] Developer guide
- [ ] User guide

**Deliverables:**
- ✅ Production deployment
- ✅ Complete documentation

---

## ⚠️ **9. ERROR HANDLING STRATEGY**

### **Standardized Error Codes:**

```typescript
export enum ErrorCode {
  // Authentication & Authorization (1xxx)
  UNAUTHORIZED = 1001,
  INVALID_TOKEN = 1002,
  TOKEN_EXPIRED = 1003,
  INSUFFICIENT_PERMISSIONS = 1004,
  INVALID_CREDENTIALS = 1005,
  ACCOUNT_INACTIVE = 1006,
  
  // Validation (2xxx)
  VALIDATION_ERROR = 2001,
  REQUIRED_FIELD_MISSING = 2002,
  INVALID_FORMAT = 2003,
  DUPLICATE_ENTRY = 2004,
  
  // Resource (3xxx)
  RESOURCE_NOT_FOUND = 3001,
  RESOURCE_ALREADY_EXISTS = 3002,
  RESOURCE_DELETED = 3003,
  
  // Business Logic (4xxx)
  INSUFFICIENT_BALANCE = 4001,
  SUBSCRIPTION_EXPIRED = 4002,
  LIMIT_EXCEEDED = 4003,
  TENANT_SUSPENDED = 4004,
  
  // External Services (5xxx)
  PAYMENT_GATEWAY_ERROR = 5001,
  SMS_SERVICE_ERROR = 5002,
  EMAIL_SERVICE_ERROR = 5003,
  
  // System (6xxx)
  DATABASE_ERROR = 6001,
  SERVER_ERROR = 6002,
  SERVICE_UNAVAILABLE = 6003,
}

// Error response class
class ApiError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: any;

  constructor(code: ErrorCode, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error:', err);

  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.SERVER_ERROR,
      message: 'Internal server error',
    },
    timestamp: new Date().toISOString(),
  });
});
```

---

## 🚀 **10. SCALABILITY & PERFORMANCE**

### **Caching Strategy:**

```typescript
// Redis caching wrapper
class CacheService {
  private redis: Redis;
  
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}

// Usage in service
async getStudentById(id: string): Promise<Student> {
  // Try cache first
  const cached = await cache.get<Student>(`student:${id}`);
  if (cached) {
    return cached;
  }
  
  // Fetch from database
  const student = await db.query('SELECT * FROM students WHERE id = $1', [id]);
  
  // Cache for 1 hour
  await cache.set(`student:${id}`, student, 3600);
  
  return student;
}
```

### **Database Optimization:**

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_students_tenant_status 
  ON students(tenant_id, status) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_payments_tenant_date 
  ON payments(tenant_id, payment_date DESC);

CREATE INDEX CONCURRENTLY idx_attendance_library_date 
  ON attendance(library_id, date DESC);

-- Partitioning for large tables
CREATE TABLE audit_logs_2025 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### **Load Balancing:**

```yaml
# Kubernetes Service
apiVersion: v1
kind: Service
metadata:
  name: student-service
spec:
  type: LoadBalancer
  selector:
    app: student-service
  ports:
  - port: 3004
    targetPort: 3004

---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: student-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: student-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 📊 **11. MONITORING & LOGGING**

### **Structured Logging:**

```typescript
// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'student-service',
    environment: process.env.NODE_ENV 
  },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      tenantId: req.tenantId,
      userId: req.user?.id,
      ip: req.ip,
    });
  });
  
  next();
});
```

### **Metrics Collection:**

```typescript
// Prometheus metrics
const promClient = require('prom-client');

// HTTP request duration
const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
});

// Database query duration
const dbDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

// Active tenants gauge
const activeTenants = new promClient.Gauge({
  name: 'active_tenants_total',
  help: 'Total number of active tenants',
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

---

## 🧪 **12. TESTING STRATEGY**

### **Test Pyramid:**

```
                    E2E Tests (10%)
                  /                \
            Integration Tests (30%)
          /                          \
      Unit Tests (60%)
```

### **Unit Test Example:**

```typescript
// student.service.test.ts
describe('StudentService', () => {
  let service: StudentService;
  let db: MockDatabase;
  
  beforeEach(() => {
    db = new MockDatabase();
    service = new StudentService(db);
  });
  
  describe('createStudent', () => {
    it('should create a student successfully', async () => {
      const studentData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+919876543210',
      };
      
      const result = await service.createStudent(studentData);
      
      expect(result).toHaveProperty('id');
      expect(result.first_name).toBe('John');
      expect(db.insert).toHaveBeenCalledTimes(1);
    });
    
    it('should throw error for duplicate email', async () => {
      db.findOne.mockResolvedValue({ id: 'existing' });
      
      await expect(
        service.createStudent({ email: 'existing@example.com' })
      ).rejects.toThrow('Email already exists');
    });
  });
});
```

### **Integration Test Example:**

```typescript
// student.integration.test.ts
describe('Student API Integration', () => {
  let app: Express;
  let authToken: string;
  
  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getTestAuthToken();
  });
  
  it('should create and retrieve student', async () => {
    // Create student
    const createResponse = await request(app)
      .post('/students')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@test.com',
        phone: '+919876543211',
      })
      .expect(201);
    
    const studentId = createResponse.body.data.id;
    
    // Retrieve student
    const getResponse = await request(app)
      .get(`/students/${studentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(getResponse.body.data.first_name).toBe('Jane');
  });
});
```

---

## 📝 **IMPLEMENTATION CHECKLIST**

### **Infrastructure**
- [ ] PostgreSQL setup
- [ ] Redis setup
- [ ] RabbitMQ setup
- [ ] S3/MinIO setup
- [ ] Elasticsearch setup
- [ ] Monitoring setup (Prometheus/Grafana)

### **Core Services**
- [ ] API Gateway
- [ ] Auth Service
- [ ] Tenant Service
- [ ] User Service

### **Business Services**
- [ ] Student Service
- [ ] Library Service
- [ ] Payment Service
- [ ] Revenue Service
- [ ] Credit Service
- [ ] Subscription Service
- [ ] CRM Service
- [ ] Messaging Service
- [ ] Ticket Service
- [ ] Analytics Service

### **System Services**
- [ ] Notification Service
- [ ] System Health Service
- [ ] Audit Service

### **Security**
- [ ] JWT implementation
- [ ] RBAC implementation
- [ ] Rate limiting
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CORS configuration

### **Testing**
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] Load tests
- [ ] Security tests

### **Documentation**
- [ ] API documentation (Swagger)
- [ ] Architecture documentation
- [ ] Deployment guide
- [ ] Developer guide

### **Deployment**
- [ ] Docker images
- [ ] Kubernetes manifests
- [ ] CI/CD pipelines
- [ ] Monitoring dashboards

---

## 🎯 **SUCCESS CRITERIA**

### **Performance**
- API response time < 200ms (95th percentile)
- Database query time < 50ms (95th percentile)
- System uptime > 99.9%

### **Scalability**
- Support 1000+ concurrent users
- Support 100+ tenants
- Handle 10,000 requests/second

### **Security**
- Zero critical vulnerabilities
- All data encrypted (at rest & in transit)
- Regular security audits

### **Quality**
- 80%+ code coverage
- Zero high-priority bugs in production
- All critical paths tested

---

## 📞 **SUPPORT & MAINTENANCE**

### **Ongoing Tasks**
- Daily: Monitor system health
- Weekly: Review error logs
- Monthly: Performance optimization
- Quarterly: Security audit
- Yearly: Disaster recovery drill

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-02  
**Status:** Ready for Implementation  
**Estimated Timeline:** 26 weeks (6 months)  
**Team Size:** 5-8 developers

---

**🚀 LET'S BUILD SOMETHING AMAZING! 🚀**

