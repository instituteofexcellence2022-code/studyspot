# 📁 StudySpot Project Structure

**Version**: 1.0  
**Last Updated**: October 23, 2025  
**Architecture**: Monorepo with 3 main applications

---

## 🏗️ High-Level Overview

```
studyspot/
├── api/                    # Backend API (Node.js + Express)
├── web-owner/             # Owner Portal (React + TypeScript)
├── web-admin/             # Admin Portal (React + TypeScript)
├── mobile/                # Mobile App (Future - React Native)
├── web/                   # Student Portal (Future - React)
├── docs/                  # Documentation
└── [config files]         # Root configuration
```

---

## 📊 Project Statistics

| Component | Files | Lines of Code | Tech Stack |
|-----------|-------|--------------|------------|
| **Backend API** | ~100 | ~15,000+ | Node.js, Express, PostgreSQL |
| **Owner Portal** | ~80 | ~12,000+ | React, TypeScript, Material-UI |
| **Admin Portal** | ~70 | ~10,000+ | React, TypeScript, Material-UI |
| **Total** | ~250 | ~37,000+ | Full Stack TypeScript |

---

## 🎯 Application Structure

### 1. Backend API (`/api`)

**Purpose**: Unified API server for all portals  
**Port**: 3001  
**Database**: PostgreSQL (Supabase)  
**Cache**: Redis

```
api/
├── src/
│   ├── config/              # Configuration
│   │   ├── database.js      # PostgreSQL connection
│   │   ├── redis.js         # Redis caching
│   │   └── swagger.js       # API documentation
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── rateLimiter.js   # Rate limiting
│   │   ├── cache.js         # Response caching
│   │   ├── securityHeaders.js # Security headers
│   │   ├── httpsRedirect.js # HTTPS enforcement
│   │   ├── requestId.js     # Request tracking
│   │   ├── errorHandler.js  # Error handling
│   │   ├── rbac.js          # Role-based access
│   │   └── pagination.js    # Pagination helper
│   │
│   ├── routes/              # API endpoints (13 route groups)
│   │   ├── auth.js          # Authentication
│   │   ├── users.js         # User management
│   │   ├── libraries.js     # Library CRUD
│   │   ├── bookings.js      # Booking system
│   │   ├── payments.js      # Payment processing
│   │   ├── subscriptions.js # Subscription management
│   │   ├── credits.js       # Credit system
│   │   ├── notifications.js # Notifications
│   │   ├── analytics.js     # Analytics & reports
│   │   ├── ai.js            # AI features
│   │   ├── iot.js           # IoT devices
│   │   ├── studyTools.js    # Study tools
│   │   ├── maps.js          # Google Maps
│   │   ├── health.js        # Health checks
│   │   ├── metrics.js       # Prometheus metrics
│   │   └── webhooks.js      # Payment webhooks
│   │
│   ├── services/            # Business logic
│   │   ├── aiService.js     # AI/ML features
│   │   ├── analyticsService.js
│   │   ├── bookingService.js
│   │   ├── notificationService.js
│   │   ├── paymentService.js
│   │   ├── stripeService.js
│   │   └── [12 more services]
│   │
│   ├── repositories/        # Data access layer
│   │   ├── bookingRepository.js
│   │   └── reviewRepository.js
│   │
│   ├── database/            # Database setup
│   │   ├── schema.sql       # Database schema
│   │   ├── migrate.js       # Migration runner
│   │   └── seed.js          # Seed data
│   │
│   ├── utils/               # Utilities
│   │   ├── logger.js        # Winston logger
│   │   ├── apiResponse.js   # Standardized responses
│   │   └── passwordValidator.js
│   │
│   └── index-unified.js     # Main server entry
│
├── .env                     # Environment variables
└── package.json             # Dependencies
```

**API Features**: 100+ endpoints across 13 route groups

---

### 2. Owner Portal (`/web-owner`)

**Purpose**: Library owners and staff management  
**Port**: 3000  
**Theme**: Blue (#1976d2)  
**Target Users**: Library Owners, Branch Managers, Staff

```
web-owner/
├── public/                  # Static files
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # Entry point
│   │
│   ├── components/          # Reusable components
│   │   ├── common/          # Shared components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── GlobalSnackbar.tsx
│   │   │
│   │   ├── library/         # Library components
│   │   │   ├── LibraryList.tsx
│   │   │   ├── LibraryDetails.tsx
│   │   │   ├── LibraryForm.tsx
│   │   │   └── LibraryFilters.tsx
│   │   │
│   │   ├── dashboard/       # Dashboard widgets
│   │   │   ├── QuickActions.tsx
│   │   │   └── RecentActivity.tsx
│   │   │
│   │   ├── ai/              # AI components
│   │   │   ├── AIStudyAssistant.tsx
│   │   │   ├── PredictiveAnalytics.tsx
│   │   │   ├── RecommendationEngine.tsx
│   │   │   └── SmartScheduler.tsx
│   │   │
│   │   ├── analytics/       # Analytics components
│   │   │   ├── GoalTracker.tsx
│   │   │   ├── PerformanceInsights.tsx
│   │   │   └── StudyPatternAnalysis.tsx
│   │   │
│   │   ├── credits/         # Credit components
│   │   │   ├── CreditBalanceCard.tsx
│   │   │   └── CreditPackageCard.tsx
│   │   │
│   │   └── subscription/    # Subscription components
│   │       ├── PricingCard.tsx
│   │       └── UsageProgressBar.tsx
│   │
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   │   ├── CleanLoginPage.tsx    # ✨ With Skip Login
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── EmailVerificationPage.tsx
│   │   │
│   │   ├── dashboard/       # Dashboard pages
│   │   │   ├── DashboardPage.tsx
│   │   │   └── EnhancedDashboardPage.tsx
│   │   │
│   │   ├── library/         # Library management
│   │   │   ├── LibrariesPage.tsx
│   │   │   ├── LibraryDetailsPage.tsx
│   │   │   ├── LibraryCreatePage.tsx
│   │   │   └── LibraryEditPage.tsx
│   │   │
│   │   ├── booking/         # Booking management
│   │   │   ├── BookingsPage.tsx
│   │   │   └── BookingDetailsPage.tsx
│   │   │
│   │   ├── user/            # User management
│   │   │   ├── UsersPage.tsx
│   │   │   ├── UserDetailsPage.tsx
│   │   │   ├── UserCreatePage.tsx
│   │   │   └── UserEditPage.tsx
│   │   │
│   │   ├── subscription/    # Subscription pages
│   │   │   ├── SubscriptionPlansPage.tsx
│   │   │   ├── SubscriptionCheckoutPage.tsx
│   │   │   ├── SubscriptionSuccessPage.tsx
│   │   │   ├── SubscriptionManagePage.tsx
│   │   │   ├── InvoicesPage.tsx
│   │   │   └── BillingPage.tsx
│   │   │
│   │   ├── credits/         # Credit management
│   │   │   ├── CreditDashboardPage.tsx
│   │   │   ├── CreditPurchasePage.tsx
│   │   │   ├── AutoTopupPage.tsx
│   │   │   ├── UsageAnalyticsPage.tsx
│   │   │   └── TransactionHistoryPage.tsx
│   │   │
│   │   ├── ai/              # AI features
│   │   │   ├── AIAssistantPage.tsx
│   │   │   ├── RecommendationsPage.tsx
│   │   │   ├── PredictiveAnalyticsPage.tsx
│   │   │   └── SmartSchedulerPage.tsx
│   │   │
│   │   ├── profile/         # Profile management
│   │   │   └── ProfilePage.tsx
│   │   │
│   │   └── common/          # Common pages
│   │       ├── HelpPage.tsx
│   │       └── NotFoundPage.tsx
│   │
│   ├── layouts/             # Page layouts
│   │   ├── MainLayout.tsx   # Authenticated layout
│   │   └── AuthLayout.tsx   # Login/register layout
│   │
│   ├── store/               # Redux state
│   │   ├── index.ts         # Store config
│   │   └── slices/          # State slices
│   │       ├── authSlice.ts
│   │       ├── librarySlice.ts
│   │       ├── bookingSlice.ts
│   │       ├── userSlice.ts
│   │       ├── subscriptionSlice.ts
│   │       ├── creditSlice.ts
│   │       ├── tenantSlice.ts
│   │       ├── rbacSlice.ts
│   │       └── uiSlice.ts
│   │
│   ├── services/            # API services
│   │   ├── api.ts           # Main API client
│   │   ├── authService.ts
│   │   ├── libraryService.ts
│   │   ├── bookingService.ts
│   │   ├── userService.ts
│   │   ├── creditService.ts
│   │   ├── errorService.ts  # Error handling
│   │   ├── rbacService.ts   # RBAC
│   │   └── tenantService.ts
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── redux.ts         # Redux hooks
│   │   ├── usePermissions.ts
│   │   └── useRole.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── index.ts         # Main types
│   │   └── subscription.ts
│   │
│   ├── constants/           # Constants
│   │   └── index.ts         # Routes, API config, roles
│   │
│   ├── config/              # Configuration
│   │   └── environment.ts   # Environment config
│   │
│   └── utils/               # Utilities
│       ├── logger.ts        # Frontend logging
│       ├── toast.ts         # Toast notifications
│       ├── accessibility.ts # A11y helpers
│       ├── performanceMonitor.ts
│       └── lazyLoader.ts    # Code splitting
│
├── .env                     # Environment variables
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

**Pages**: 40+ pages covering all library management features

---

### 3. Admin Portal (`/web-admin`)

**Purpose**: Platform administration and tenant management  
**Port**: 3002  
**Theme**: Purple (#9c27b0)  
**Target Users**: Super Admins, Platform Support

```
web-admin/
├── src/
│   ├── components/
│   │   ├── admin/           # Admin-specific components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── TenantDetails.tsx
│   │   │   └── TenantManagement.tsx
│   │   │
│   │   ├── tenant/          # Tenant onboarding
│   │   │   ├── BusinessInfoStep.tsx
│   │   │   ├── ContactInfoStep.tsx
│   │   │   ├── PlanSelectionStep.tsx
│   │   │   ├── PaymentSetupStep.tsx
│   │   │   ├── BrandingStep.tsx
│   │   │   ├── ConfirmationStep.tsx
│   │   │   ├── ReviewSubmitStep.tsx
│   │   │   ├── GeneralSettingsTab.tsx
│   │   │   ├── BrandingTab.tsx
│   │   │   ├── NotificationsTab.tsx
│   │   │   └── SecurityTab.tsx
│   │   │
│   │   └── [common components] # Same as owner portal
│   │
│   ├── pages/
│   │   ├── admin/           # Admin pages
│   │   │   ├── AdminPage.tsx
│   │   │   ├── AdminTenantsPage.tsx
│   │   │   ├── AdminTenantDetailsPage.tsx
│   │   │   ├── AdminAnalyticsPage.tsx
│   │   │   ├── TenantManagementPage.tsx
│   │   │   ├── AuditLogPage.tsx
│   │   │   ├── RoleManagementPage.tsx
│   │   │   └── SecuritySettingsPage.tsx
│   │   │
│   │   ├── tenant/          # Tenant pages
│   │   │   ├── OnboardingWizard.tsx
│   │   │   ├── SettingsDashboard.tsx
│   │   │   └── AnalyticsDashboard.tsx
│   │   │
│   │   └── [other pages]    # Similar to owner portal
│   │
│   └── [same structure as web-owner]
│
└── [config files]
```

**Focus**: Platform management, tenant onboarding, system analytics

---

## 🔧 Configuration Files (Root Level)

### Environment & Setup
```
.env                        # Environment variables (gitignored)
.gitignore                  # Git ignore rules
package.json                # Root dependencies
docker-compose.yml          # Docker configuration
vercel.json                 # Vercel deployment config
```

### Scripts & Utilities
```
START_EVERYTHING.bat        # Start all servers
START_OWNER_PORTAL.bat      # Start owner portal
START_ADMIN_PORTAL.bat      # Start admin portal
CREATE_ENV_FILES_NOW.bat    # Create .env files
TEST_AUTHENTICATION.bat     # Test auth system
RUN_BACKUP.bat              # Backup project
```

### Documentation (100+ files)
```
README.md                   # Main project README
ARCHITECTURE.md             # System architecture
DEVELOPMENT_ROADMAP.md      # Development plan
PROJECT_STRUCTURE.md        # This file!
DEPLOYMENT_GUIDE_PORTALS.md # Deployment guide
API_DOCUMENTATION.md        # API reference
[90+ more documentation files]
```

---

## 📦 Dependencies

### Backend (api/package.json)
```json
{
  "express": "^4.18.2",
  "pg": "^8.11.0",           // PostgreSQL client
  "redis": "^4.6.0",          // Redis cache
  "jsonwebtoken": "^9.0.0",   // JWT auth
  "bcrypt": "^5.1.0",         // Password hashing
  "helmet": "^7.0.0",         // Security
  "cors": "^2.8.5",           // CORS
  "dotenv": "^16.0.3",        // Environment
  "winston": "^3.8.0",        // Logging
  "swagger-ui-express": "^4.6.0", // API docs
  "razorpay": "^2.8.0",       // Payments (India)
  "stripe": "^12.0.0",        // Payments (Global)
  "axios": "^1.4.0",          // HTTP client
  "prom-client": "^14.2.0"    // Prometheus metrics
}
```

### Frontend (web-owner & web-admin)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.11.0",
  "typescript": "^5.0.0",
  "@mui/material": "^5.13.0",  // Material-UI
  "@mui/icons-material": "^5.11.0",
  "@reduxjs/toolkit": "^1.9.5", // Redux
  "react-redux": "^8.1.0",
  "redux-persist": "^6.0.0",
  "axios": "^1.4.0",
  "react-hook-form": "^7.43.0", // Forms
  "react-toastify": "^9.1.0",   // Notifications
  "recharts": "^2.5.0",         // Charts
  "date-fns": "^2.29.0",        // Date utils
  "react-query": "^3.39.0"      // Data fetching
}
```

---

## 🗄️ Database Schema

**Database**: PostgreSQL (Supabase)  
**Location**: `api/src/database/schema.sql`

### Main Tables (30+ tables)
```
users                       # All users (students, owners, staff, admins)
tenants                     # Multi-tenant support
libraries                   # Library/branches
seats                       # Seats/desks
rooms                       # Private rooms
bookings                    # Seat bookings
subscriptions               # Student subscriptions
plans                       # Subscription plans
payments                    # Payment records
invoices                    # Invoice records
credits                     # SMS/WhatsApp credits
notifications               # Push notifications
reviews                     # Student reviews
analytics                   # Analytics data
audit_logs                  # System audit trail
iot_devices                 # IoT device registry
study_sessions              # Study tracking
goals                       # Student goals
rewards                     # Gamification
messages                    # In-app messaging
webhooks                    # Webhook logs
[10+ more tables]
```

---

## 🌐 API Routes (13 Route Groups)

### Authentication & Users
- **POST** `/api/auth/register` - Register user
- **POST** `/api/auth/login` - Login
- **POST** `/api/auth/refresh` - Refresh token
- **GET** `/api/auth/profile` - Get profile
- **GET** `/api/users` - List users
- **GET** `/api/users/:id` - Get user
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

### Libraries & Bookings
- **GET** `/api/libraries` - List libraries
- **GET** `/api/libraries/:id` - Get library
- **POST** `/api/libraries` - Create library
- **PUT** `/api/libraries/:id` - Update library
- **DELETE** `/api/libraries/:id` - Delete library
- **GET** `/api/bookings` - List bookings
- **POST** `/api/bookings` - Create booking
- **POST** `/api/bookings/:id/checkin` - Check-in
- **POST** `/api/bookings/:id/checkout` - Check-out

### Payments & Subscriptions
- **POST** `/api/payments/create` - Create payment
- **POST** `/api/payments/verify` - Verify payment
- **GET** `/api/subscriptions` - List subscriptions
- **POST** `/api/subscriptions` - Create subscription
- **GET** `/api/invoices` - List invoices

### Analytics & AI
- **GET** `/api/analytics/dashboard` - Dashboard stats
- **GET** `/api/analytics/revenue` - Revenue analytics
- **POST** `/api/ai/chat` - AI chatbot
- **GET** `/api/ai/recommendations` - Get recommendations
- **GET** `/api/ai/predictions` - Predictive analytics

### System & Monitoring
- **GET** `/health` - Health check
- **GET** `/api/metrics` - Prometheus metrics
- **GET** `/api-docs` - Swagger documentation

**Total**: 100+ endpoints

---

## 🚀 Development Workflow

### 1. Start Development Servers

**Option A: Start Everything**
```bash
# Double-click this file
START_EVERYTHING.bat

# Or manually:
cd api && npm start                    # Port 3001
cd web-owner && npm start              # Port 3000
cd web-admin && npm start              # Port 3002
```

**Option B: Start Individual Services**
```bash
START_OWNER_PORTAL.bat                 # Just owner portal
START_ADMIN_PORTAL.bat                 # Just admin portal
```

### 2. Access Applications

| Application | URL | Credentials |
|-------------|-----|-------------|
| **Owner Portal** | http://localhost:3000 | Click "Skip Login" |
| **Admin Portal** | http://localhost:3002 | admin@demo.com / Admin123456 |
| **API Server** | http://localhost:3001 | - |
| **API Docs** | http://localhost:3001/api-docs | - |

### 3. Development Tools

**VS Code Extensions** (Recommended):
- ESLint
- Prettier
- TypeScript
- REST Client
- GitLens
- Material-UI Snippets

**Browser Extensions**:
- React Developer Tools
- Redux DevTools
- Lighthouse (performance)

---

## 📊 Code Organization Patterns

### Frontend Architecture
```
Feature-Based Organization
├── Page Component (container)
│   ├── UI Components (presentation)
│   ├── Redux Slice (state)
│   ├── Service (API calls)
│   ├── Types (TypeScript)
│   └── Tests (__tests__)
```

### Backend Architecture
```
Layered Architecture
Route → Middleware → Service → Repository → Database
  ↓         ↓           ↓          ↓
Request   Auth/      Business   Data
Handler  Validation   Logic    Access
```

### State Management
```
Redux Toolkit Pattern
├── Slice (createSlice)
│   ├── initialState
│   ├── reducers (sync actions)
│   └── extraReducers (async thunks)
├── Selectors (useAppSelector)
└── Thunks (createAsyncThunk)
```

---

## 🔐 Security Features

### Backend Security
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ HTTPS redirect (production)
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection

### Frontend Security
- ✅ Protected routes
- ✅ Role-based access control
- ✅ Token refresh mechanism
- ✅ XSS sanitization
- ✅ Secure localStorage usage

---

## 📈 Performance Optimizations

### Frontend
- ✅ Code splitting (lazy loading)
- ✅ Route-based chunking
- ✅ Tree shaking
- ✅ Image optimization
- ✅ Bundle size optimization
- ✅ Memoization (React.memo, useMemo)
- ✅ Virtual scrolling (future)

### Backend
- ✅ Redis caching
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Response compression
- ✅ Query optimization
- ✅ API response caching

---

## 🧪 Testing Structure

```
[component-name]/
├── ComponentName.tsx          # Component
└── __tests__/
    ├── ComponentName.test.tsx # Unit tests
    └── [more tests]
```

**Test Files Found**:
- `web-owner/src/components/common/__tests__/ErrorBoundary.test.tsx`
- `web-owner/src/pages/auth/__tests__/LoginPage.test.tsx`
- `web-owner/src/services/__tests__/subscriptionService.test.ts`
- `web-owner/src/utils/__tests__/accessibility.test.ts`
- `web-owner/src/utils/__tests__/toast.test.ts`

---

## 📝 Key Files to Know

### Most Important Files

**Backend**:
1. `api/src/index-unified.js` - Main server
2. `api/src/config/database.js` - DB connection
3. `api/src/routes/auth.js` - Authentication
4. `api/src/middleware/auth.js` - JWT verification

**Frontend (Owner)**:
5. `web-owner/src/App.tsx` - App entry
6. `web-owner/src/pages/auth/CleanLoginPage.tsx` - Login (with Skip!)
7. `web-owner/src/pages/dashboard/DashboardPage.tsx` - Dashboard
8. `web-owner/src/store/slices/authSlice.ts` - Auth state
9. `web-owner/src/services/api.ts` - API client

**Configuration**:
10. `api/.env` - API environment variables
11. `web-owner/.env` - Frontend environment
12. `vercel.json` - Vercel deployment

---

## 🎯 Current Development Focus

### Active Features
- ✅ Authentication system
- ✅ Basic dashboard
- 🔄 Library management (IN PROGRESS)
- ⏳ Booking system (NEXT)
- ⏳ User management (PLANNED)

### Next Steps
1. Build Libraries List Page
2. Create Library Form
3. Library Details View
4. Search & Filters
5. API Integration

---

## 📚 Documentation Files

**Setup & Getting Started**:
- `README.md` - Main README
- `DEVELOPMENT_ROADMAP.md` - Development plan
- `ARCHITECTURE.md` - System architecture

**Deployment**:
- `DEPLOYMENT_GUIDE_PORTALS.md` - Full deployment guide
- `FREE_DEPLOYMENT_PLAN.md` - Free tier deployment
- `VERCEL_REDEPLOY.md` - Vercel instructions

**Authentication**:
- `AUTHENTICATION_FIX_SUMMARY.md` - Auth fixes
- `DEMO_ACCOUNT_CREDENTIALS.md` - Demo accounts
- `LOGIN_ISSUE_DIAGNOSIS.md` - Troubleshooting

**Development**:
- `CODE_REVIEW_RESULTS.md` - Code quality
- `TESTING_GUIDE.md` - Testing guide
- `MONITORING_SETUP_GUIDE.md` - Monitoring

---

## 💡 Quick Reference

### Environment Variables

**API (.env)**:
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
PORT=3001
NODE_ENV=development
```

**Frontend (.env)**:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

### Common Commands

```bash
# Install dependencies
npm install                    # Root
cd api && npm install          # Backend
cd web-owner && npm install    # Owner portal
cd web-admin && npm install    # Admin portal

# Start development
npm start                      # Each folder

# Build for production
npm run build                  # Frontend

# Run tests
npm test                       # Run tests

# Database
cd api && npm run migrate      # Run migrations
cd api && npm run seed         # Seed data
```

---

## 🎉 Summary

**Total Project Size**:
- **~250 files** across 3 main applications
- **~37,000 lines of code**
- **100+ API endpoints**
- **40+ frontend pages**
- **30+ database tables**
- **13 route groups**
- **3 applications** (API, Owner Portal, Admin Portal)

**Tech Stack**:
- Backend: Node.js + Express + PostgreSQL + Redis
- Frontend: React + TypeScript + Material-UI + Redux
- Deployment: Vercel (frontend) + Render (backend)
- Database: Supabase (PostgreSQL)

**Current Status**:
- ✅ Foundation complete
- ✅ Authentication working
- ✅ Basic dashboard live
- 🔄 Building core features
- 🚀 Ready for development!

---

**Questions? Check the documentation files or ask me!** 😊


