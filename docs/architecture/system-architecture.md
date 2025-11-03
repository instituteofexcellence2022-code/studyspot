# 🏗️ STUDYSPOT Platform - System Architecture Documentation

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Database Design](#database-design)
5. [Security Architecture](#security-architecture)
6. [Scalability Design](#scalability-design)
7. [Integration Architecture](#integration-architecture)
8. [Deployment Architecture](#deployment-architecture)

## 🎯 Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Mobile App    │  Library Web    │  Platform Admin Web         │
│   (React Native)│  (React.js)     │  (React.js)                 │
│   Students      │  Library Staff  │  Super Admins               │
└─────────────────┴─────────────────┴─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  • Authentication & Authorization                              │
│  • Rate Limiting & Throttling                                  │
│  • Request Routing & Load Balancing                            │
│  • API Versioning                                              │
│  • Request/Response Transformation                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MICROSERVICES LAYER                           │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│ User        │ Booking     │ Payment     │ Notification        │
│ Management  │ Service     │ Service     │ Service             │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│ Library     │ Analytics   │ File        │ IoT                 │
│ Management  │ Service     │ Service     │ Service             │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│ Communication│ AI/ML      │ Audit       │ Integration         │
│ Service     │ Service     │ Service     │ Service             │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│ PostgreSQL  │ Redis       │ Elasticsearch│ AWS S3             │
│ (Primary DB)│ (Cache)     │ (Search)    │ (File Storage)      │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│ MongoDB     │ InfluxDB    │ RabbitMQ    │ External APIs       │
│ (Logs)      │ (Metrics)   │ (Messages)  │ (Third-party)       │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
```

## 🔧 System Components

### 1. Client Applications

#### Mobile Application (Student App)
- **Technology**: React Native / Flutter
- **Architecture**: Component-based with Redux/Provider state management
- **Key Features**:
  - Offline-first design
  - Real-time updates via WebSocket
  - Push notifications
  - Camera integration for QR scanning
  - Biometric authentication

#### Library Management Web Application
- **Technology**: React.js with TypeScript
- **Architecture**: Single Page Application (SPA)
- **Key Features**:
  - Role-based access control
  - Real-time dashboard
  - Responsive design
  - Progressive Web App (PWA) capabilities

#### Platform Management Web Application
- **Technology**: React.js with TypeScript
- **Architecture**: Multi-tenant admin dashboard
- **Key Features**:
  - Super admin controls
  - System monitoring
  - Business intelligence
  - Customer success tools

### 2. API Gateway

#### Kong API Gateway
- **Authentication**: JWT token validation
- **Rate Limiting**: Per-user and per-IP limits
- **Load Balancing**: Round-robin with health checks
- **Monitoring**: Request/response logging
- **Security**: CORS, HTTPS enforcement

### 3. Microservices Architecture

#### User Management Service
```yaml
Responsibilities:
  - User registration and authentication
  - Profile management
  - Role-based access control
  - KYC verification
  - Digital ID generation

Technology Stack:
  - Node.js with Express.js
  - PostgreSQL for user data
  - Redis for session management
  - JWT for authentication
```

#### Booking Service
```yaml
Responsibilities:
  - Seat availability management
  - Booking creation and modification
  - Real-time seat updates
  - Booking history and analytics
  - Waitlist management

Technology Stack:
  - Node.js with Express.js
  - PostgreSQL for booking data
  - Redis for real-time updates
  - WebSocket for live updates
```

#### Payment Service
```yaml
Responsibilities:
  - Payment processing
  - Subscription management
  - Invoice generation
  - Refund processing
  - Financial reporting

Technology Stack:
  - Node.js with Express.js
  - PostgreSQL for transaction data
  - Integration with Razorpay/Stripe
  - Redis for payment session management
```

#### Notification Service
```yaml
Responsibilities:
  - Push notifications
  - Email notifications
  - SMS notifications
  - WhatsApp integration
  - Notification preferences

Technology Stack:
  - Node.js with Express.js
  - Firebase Cloud Messaging
  - SendGrid for emails
  - Twilio for SMS
  - WhatsApp Business API
```

#### Analytics Service
```yaml
Responsibilities:
  - Data collection and processing
  - Business intelligence
  - Custom reporting
  - Performance metrics
  - Predictive analytics

Technology Stack:
  - Python with FastAPI
  - PostgreSQL for structured data
  - InfluxDB for time-series data
  - Apache Kafka for data streaming
```

## 📊 Data Flow Architecture

### 1. User Registration Flow
```
Mobile App → API Gateway → User Service → Database
                ↓
         Notification Service → Email/SMS
```

### 2. Booking Flow
```
Mobile App → API Gateway → Booking Service → Database
                ↓              ↓
         Payment Service ← Notification Service
                ↓
         Real-time Updates → WebSocket → Mobile App
```

### 3. Payment Flow
```
Mobile App → API Gateway → Payment Service → External Gateway
                ↓              ↓
         Database ← Notification Service
                ↓
         Analytics Service → Reporting
```

### 4. Real-time Updates Flow
```
Library Web → API Gateway → Booking Service → WebSocket
                ↓              ↓
         Mobile App ← Real-time Updates ← Redis Pub/Sub
```

## 🗄️ Database Design

### 1. Multi-Tenant Architecture

#### Tenant Isolation Strategy
```sql
-- Tenant-based row-level security
CREATE POLICY tenant_isolation ON users
    FOR ALL TO application_role
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Enable RLS on all tenant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

#### Core Database Schema
```sql
-- Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    subscription_plan VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Libraries table
CREATE TABLE libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    amenities JSONB,
    pricing JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seats table
CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID REFERENCES libraries(id),
    seat_number VARCHAR(50),
    zone VARCHAR(50),
    seat_type VARCHAR(50),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    seat_id UUID REFERENCES seats(id),
    library_id UUID REFERENCES libraries(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Caching Strategy

#### Redis Cache Structure
```redis
# User sessions
user:session:{user_id} -> {session_data}
TTL: 24 hours

# Seat availability
seat:availability:{library_id}:{date} -> {availability_data}
TTL: 1 hour

# Library data
library:data:{library_id} -> {library_info}
TTL: 6 hours

# Booking data
booking:active:{user_id} -> {booking_list}
TTL: 2 hours
```

### 3. Search Architecture

#### Elasticsearch Indexes
```json
{
  "libraries": {
    "mappings": {
      "properties": {
        "name": {"type": "text", "analyzer": "standard"},
        "address": {"type": "text", "analyzer": "standard"},
        "amenities": {"type": "keyword"},
        "location": {"type": "geo_point"},
        "rating": {"type": "float"},
        "price_range": {"type": "integer"}
      }
    }
  },
  "users": {
    "mappings": {
      "properties": {
        "email": {"type": "keyword"},
        "name": {"type": "text", "analyzer": "standard"},
        "phone": {"type": "keyword"},
        "role": {"type": "keyword"}
      }
    }
  }
}
```

## 🔒 Security Architecture

### 1. Authentication & Authorization

#### JWT Token Structure
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",
    "tenant_id": "tenant_uuid",
    "role": "student|library_staff|super_admin",
    "permissions": ["read:bookings", "write:bookings"],
    "iat": 1640995200,
    "exp": 1641081600
  }
}
```

#### Role-Based Access Control (RBAC)
```yaml
Roles:
  student:
    permissions:
      - read:own_profile
      - write:own_profile
      - read:libraries
      - write:bookings
      - read:own_bookings
  
  library_staff:
    permissions:
      - read:library_data
      - write:library_data
      - read:bookings
      - write:bookings
      - read:users
  
  super_admin:
    permissions:
      - read:all
      - write:all
      - admin:system
```

### 2. Data Security

#### Encryption Strategy
- **At Rest**: AES-256 encryption for sensitive data
- **In Transit**: TLS 1.3 for all communications
- **Database**: Transparent Data Encryption (TDE)
- **Files**: Server-side encryption for S3 storage

#### Data Privacy
- **PII Protection**: Data masking and anonymization
- **GDPR Compliance**: Right to be forgotten implementation
- **Data Retention**: Automated data purging policies
- **Audit Logging**: Comprehensive activity tracking

### 3. API Security

#### Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

#### Rate Limiting
```yaml
Rate Limits:
  authentication: 5 requests/minute
  booking: 10 requests/minute
  general_api: 100 requests/minute
  file_upload: 5 requests/minute
```

## 📈 Scalability Design

### 1. Horizontal Scaling

#### Load Balancing Strategy
```yaml
Load Balancer Configuration:
  type: Application Load Balancer (ALB)
  algorithm: Round Robin with health checks
  health_check:
    path: /health
    interval: 30s
    timeout: 5s
    healthy_threshold: 2
    unhealthy_threshold: 3
```

#### Auto-Scaling Configuration
```yaml
Auto Scaling Groups:
  min_size: 2
  max_size: 10
  desired_capacity: 3
  scaling_policies:
    scale_up:
      metric: CPU > 70%
      cooldown: 300s
    scale_down:
      metric: CPU < 30%
      cooldown: 300s
```

### 2. Database Scaling

#### Read Replicas
```yaml
Database Configuration:
  primary: 1 master instance
  replicas: 3 read replicas
  connection_pooling: PgBouncer
  failover: Automatic with RDS Multi-AZ
```

#### Sharding Strategy
```yaml
Sharding Plan:
  strategy: Tenant-based sharding
  shard_key: tenant_id
  shard_count: 10
  rebalancing: Automatic based on load
```

### 3. Caching Strategy

#### Multi-Level Caching
```yaml
Cache Levels:
  L1: Application memory cache (Redis)
  L2: CDN cache (CloudFront)
  L3: Database query cache
  TTL: 
    static_data: 24 hours
    dynamic_data: 1 hour
    real_time_data: 5 minutes
```

## 🔗 Integration Architecture

### 1. Third-Party Integrations

#### Payment Gateways
```yaml
Razorpay Integration:
  endpoints:
    - /api/payments/create-order
    - /api/payments/verify
    - /api/payments/refund
  webhooks:
    - payment.captured
    - payment.failed
    - refund.processed

Stripe Integration:
  endpoints:
    - /api/stripe/create-payment-intent
    - /api/stripe/confirm-payment
    - /api/stripe/create-refund
  webhooks:
    - payment_intent.succeeded
    - payment_intent.payment_failed
```

#### Communication Services
```yaml
SMS Integration (Twilio):
  endpoints:
    - /api/sms/send
    - /api/sms/status
  features:
    - OTP delivery
    - Booking confirmations
    - Reminder notifications

Email Integration (SendGrid):
  endpoints:
    - /api/email/send
    - /api/email/templates
  features:
    - Transactional emails
    - Marketing campaigns
    - Email analytics

WhatsApp Integration:
  endpoints:
    - /api/whatsapp/send-message
    - /api/whatsapp/templates
  features:
    - Template messages
    - Interactive messages
    - Media sharing
```

### 2. IoT Integration

#### Smart Device Management
```yaml
IoT Architecture:
  protocol: MQTT over TLS
  broker: AWS IoT Core
  devices:
    - Smart locks
    - Environmental sensors
    - Energy meters
    - Security cameras
  data_flow:
    device -> IoT Core -> Lambda -> Database
```

#### Device Communication
```json
{
  "device_id": "lock_001",
  "library_id": "lib_123",
  "command": "unlock",
  "timestamp": "2024-01-15T10:30:00Z",
  "payload": {
    "seat_id": "seat_456",
    "user_id": "user_789"
  }
}
```

## 🚀 Deployment Architecture

### 1. Container Architecture

#### Docker Configuration
```dockerfile
# API Service Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: studyspot-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: studyspot-api
  template:
    metadata:
      labels:
        app: studyspot-api
    spec:
      containers:
      - name: api
        image: studyspot/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 2. CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Run security scan
        run: npm audit
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t studyspot/api:${{ github.sha }} .
      - name: Push to registry
        run: docker push studyspot/api:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: kubectl set image deployment/studyspot-api api=studyspot/api:${{ github.sha }}
```

### 3. Monitoring & Observability

#### Application Monitoring
```yaml
Monitoring Stack:
  metrics: Prometheus + Grafana
  logging: ELK Stack (Elasticsearch, Logstash, Kibana)
  tracing: Jaeger
  alerting: AlertManager + PagerDuty
  uptime: Pingdom
```

#### Health Checks
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      external_apis: await checkExternalAPIs()
    }
  };
  
  const isHealthy = Object.values(health.services).every(s => s.status === 'healthy');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

## 📊 Performance Considerations

### 1. Database Optimization

#### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_library_id ON bookings(library_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_seats_library_id ON seats(library_id);

-- Composite indexes
CREATE INDEX idx_bookings_user_date ON bookings(user_id, booking_date);
CREATE INDEX idx_seats_library_available ON seats(library_id, is_available);
```

#### Query Optimization
```sql
-- Optimized booking query
EXPLAIN ANALYZE
SELECT b.*, s.seat_number, l.name as library_name
FROM bookings b
JOIN seats s ON b.seat_id = s.id
JOIN libraries l ON b.library_id = l.id
WHERE b.user_id = $1
  AND b.booking_date >= CURRENT_DATE
ORDER BY b.booking_date, b.start_time;
```

### 2. Caching Strategy

#### Cache Invalidation
```javascript
// Cache invalidation on booking update
async function updateBooking(bookingId, updates) {
  const booking = await Booking.findByIdAndUpdate(bookingId, updates);
  
  // Invalidate related caches
  await redis.del(`booking:active:${booking.user_id}`);
  await redis.del(`seat:availability:${booking.library_id}:${booking.booking_date}`);
  
  return booking;
}
```

### 3. API Performance

#### Response Time Targets
```yaml
Performance SLAs:
  authentication: < 200ms
  booking_creation: < 500ms
  library_search: < 300ms
  payment_processing: < 1000ms
  file_upload: < 2000ms
  real_time_updates: < 100ms
```

#### Optimization Techniques
- Database connection pooling
- Query result caching
- API response compression
- CDN for static assets
- Lazy loading for large datasets
- Pagination for list endpoints

---

**Document Version**: 1.0.0  
**Last Updated**: [Current Date]  
**Next Review**: [Next Review Date]

