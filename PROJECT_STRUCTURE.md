# StudySpot SaaS Platform - Corporate Project Structure

## Project Overview

**StudySpot** is a multi-tenant Software as a Service (SaaS) platform for library management with three distinct portals:

1. **Student Portal** - Mobile-first PWA for students
2. **Web Owner Portal** - Web application for library owners and staff
3. **Web Admin Portal** - Internal platform management

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Port 3000)                  │
│              Routes requests to microservices               │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Auth Service │    │ Student      │    │ Library      │
│   (3001)     │    │ Service      │    │ Service      │
└──────────────┘    │   (3004)     │    │   (3005)     │
        │           └──────────────┘    └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE LAYER                                  │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ Core DB      │         │ Tenant DBs   │                 │
│  │ (Platform)   │         │ (Per Tenant) │                 │
│  └──────────────┘         └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
studyspot-platform/
├── backend/                          # Backend Services
│   ├── src/
│   │   ├── config/                   # Configuration
│   │   │   ├── database.ts          # DB connection pools
│   │   │   ├── constants.ts          # Constants & enums
│   │   │   └── env.ts                # Environment validation
│   │   ├── middleware/               # Shared middleware
│   │   │   ├── auth.ts               # Authentication
│   │   │   ├── tenantContext.ts      # Tenant isolation
│   │   │   ├── security.ts          # Security checks
│   │   │   ├── errorHandler.ts       # Error handling
│   │   │   ├── logger.ts             # Request logging
│   │   │   └── validator.ts          # Input validation
│   │   ├── services/                 # Microservices
│   │   │   ├── api-gateway/          # API Gateway
│   │   │   ├── auth-service/         # Authentication
│   │   │   ├── student-service/      # Student management
│   │   │   ├── library-service/      # Library management
│   │   │   ├── booking-service/      # Booking management
│   │   │   ├── payment-service/      # Payment processing
│   │   │   └── ...
│   │   ├── utils/                    # Utilities
│   │   │   ├── logger.ts             # Winston logger
│   │   │   ├── cache.ts              # Caching utilities
│   │   │   ├── validation.ts         # Validation helpers
│   │   │   └── errors.ts             # Error classes
│   │   └── types/                    # TypeScript types
│   ├── migrations/                   # Database migrations
│   ├── tests/                        # Test files
│   ├── scripts/                      # Utility scripts
│   └── package.json
│
├── web-owner/                        # Library Owner Portal
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API services
│   │   ├── store/                   # Redux store
│   │   ├── hooks/                   # Custom hooks
│   │   ├── utils/                   # Utilities
│   │   └── types/                   # TypeScript types
│   └── package.json
│
├── web-admin/                        # Platform Admin Portal
│   └── (similar structure)
│
├── studyspot-student-pwa/            # Student Portal (PWA)
│   └── (similar structure)
│
├── packages/                         # Shared packages
│   └── studyspot-tenant-sdk/        # Shared SDK
│
├── docs/                            # Documentation
│   ├── architecture/                # Architecture docs
│   ├── api/                         # API documentation
│   └── deployment/                  # Deployment guides
│
├── .github/                         # GitHub workflows
│   └── workflows/
│       ├── ci.yml                   # CI pipeline
│       └── deploy.yml               # Deployment
│
└── README.md
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest

### Frontend
- **Framework**: React 18+
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI (MUI)
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Notifications**: React Toastify

### Infrastructure
- **Hosting**: Render (Backend), Vercel/Netlify (Frontend)
- **Database**: Supabase (PostgreSQL)
- **CDN**: Cloudflare (if needed)
- **Monitoring**: (To be configured)

## User Types & Access

1. **Students** → Student Portal
2. **Library Owners** → Web Owner Portal
3. **Library Staff** → Web Owner Portal (limited access)
4. **Platform Super Admin** → Web Admin Portal
5. **Platform Staff** → Web Admin Portal (role-based)

## Database Structure

### Core Database (Platform Level)
- `tenants` - Library businesses
- `library_owners` - Library owners
- `platform_admins` - Super admins
- `platform_staff` - Platform employees
- `subscriptions` - Tenant subscriptions
- `platform_analytics` - Platform metrics

### Tenant Database (Per Tenant)
- `libraries` - Libraries owned by tenant
- `library_staff` - Staff members
- `students` - Students enrolled
- `bookings` - Seat bookings
- `attendance` - Attendance records
- `payments` - Payment transactions

## API Structure

```
/api/v1/student/*          - Student Portal APIs
/api/v1/owner/*            - Library Owner APIs
/api/v1/staff/*            - Library Staff APIs
/api/v1/platform/admin/*   - Platform Super Admin APIs
/api/v1/platform/staff/*   - Platform Staff APIs
```

## Security Features

- ✅ Multi-tenant isolation
- ✅ Role-based access control (RBAC)
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Audit logging
- ✅ Security headers (Helmet)

## Performance Features

- ✅ Connection pooling
- ✅ Query optimization
- ✅ Caching layer (Redis-ready)
- ✅ Response compression
- ✅ Database indexing
- ✅ Lazy loading

## Scalability Features

- ✅ Microservices architecture
- ✅ Stateless services
- ✅ Horizontal scaling ready
- ✅ Database sharding support
- ✅ Load balancer ready

