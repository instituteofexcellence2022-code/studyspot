# 🏗️ StudySpot Web Admin Portal v2.0 - Master Architecture

## 📋 **Project Overview**

**Version**: 2.0.0 (Complete Rebuild)  
**Total Pages**: 180+  
**Total Modules**: 25+  
**Total Features**: 1,500+  
**Architecture**: Full-Stack SaaS Platform  
**Target**: Enterprise-Grade Multi-Tenant Admin Portal

---

## 🎯 **Core Objectives**

1. **Comprehensive Coverage**: 180+ pages across all modules
2. **Enterprise-Grade**: Production-ready, scalable, maintainable
3. **Indigenous Solution**: Maximum self-reliance, free-tier compatible
4. **High Performance**: Optimized, fast, responsive
5. **Complete Documentation**: Every feature documented
6. **Full-Stack**: Frontend + Backend + Infrastructure

---

## 🛠️ **Complete Tech Stack**

### **Frontend**

#### **Core Framework**
- **React**: 19.2.0 (SYNCED with web-admin-portal & web-owner)
- **TypeScript**: 4.9.5 (SYNCED - Strict mode)
- **Build Tool**: React Scripts 5.0.1 (CRA - SYNCED) OR Vite 5.4.8 (Optional upgrade)
- **React Router DOM**: 7.9.4 (SYNCED)

#### **UI Framework**
- **Material-UI (@mui/material)**: 7.3.4 (SYNCED)
- **MUI Icons (@mui/icons-material)**: 7.3.4 (SYNCED)
- **MUI Lab (@mui/lab)**: 7.0.1-beta.18 (SYNCED)
- **MUI X Data Grid (@mui/x-data-grid)**: 8.14.1 (SYNCED)
- **MUI X Date Pickers (@mui/x-date-pickers)**: 8.14.1 (SYNCED)
- **Emotion React**: 11.14.0 (SYNCED - CSS-in-JS)
- **Emotion Styled**: 11.14.1 (SYNCED)

#### **State Management**
- **Redux Toolkit (@reduxjs/toolkit)**: 2.9.1 (SYNCED - Global state)
- **React Redux**: 9.2.0 (SYNCED - React bindings)
- **Redux Persist**: 6.0.0 (SYNCED - State persistence)
- **React Query (TanStack Query)**: 5.56.2 (Optional - Server state caching)

#### **Data Visualization**
- **Recharts**: 3.3.0 (SYNCED - Charts & graphs)
- **MUI X Data Grid**: 8.14.1 (SYNCED - Advanced tables)
- **Chart.js** (Optional): 4.4.0 (Additional charts if needed)

#### **Forms & Validation**
- **React Hook Form**: 7.65.0 (SYNCED - Form management)
- **Yup**: 1.4.0 (Schema validation - Optional)
- **@hookform/resolvers**: 3.9.0 (Yup integration - Optional)
- **Joi**: 17.11.0 (SYNCED with backend - Alternative validator)

#### **HTTP & API**
- **Axios**: 1.12.2 (SYNCED - HTTP client)
- **React Query**: 5.56.2 (Optional - Data fetching, caching)

#### **Utilities**
- **date-fns**: 4.1.0 (SYNCED - Date manipulation)
- **lodash**: 4.17.21 (SYNCED - Utility functions)
- **react-toastify**: 11.0.5 (SYNCED - Notifications/Toasts)
- **web-vitals**: 2.1.4 (SYNCED - Performance metrics)
- **qrcode**: 1.5.4 (SYNCED with web-owner - QR code generation)

### **Backend**

#### **Runtime**
- **Node.js**: 18.0.0+ (SYNCED - LTS)
- **Express**: 4.18.2 (SYNCED - Web framework)
- **TypeScript**: 5.3.3 (SYNCED with API - Backend type safety)

#### **Database**
- **PostgreSQL**: 15+ (Primary database - Supabase)
- **Redis**: 7.0+ (Caching - Upstash)

#### **ORM**
- **Prisma**: 5.0.0 (Database ORM)
- **Prisma Client**: 5.0.0 (Type-safe queries)

#### **Authentication**
- **jsonwebtoken**: 9.0.2 (SYNCED - JWT token authentication)
- **bcryptjs**: 2.4.3 (SYNCED - Password hashing)
- **Passport**: 0.7.0 (SYNCED - Authentication middleware)
- **passport-jwt**: 4.0.1 (SYNCED - JWT strategy)
- **passport-google-oauth20**: 2.0.0 (SYNCED - Google OAuth)
- **passport-facebook**: 3.0.0 (SYNCED - Facebook OAuth)

#### **Validation**
- **Joi**: 17.11.0 (SYNCED - Schema validation)
- **express-validator**: 7.0.1 (SYNCED - Request validation)
- **Zod**: 3.22.4 (Optional - Modern alternative)

#### **File Storage**
- **Multer**: 1.4.5-lts.1 (File uploads)
- **AWS S3** (via Cloudflare R2): File storage
- **Sharp**: 0.32.6 (Image processing)

#### **Background Jobs**
- **Bull**: 4.11.5 (Queue management)
- **BullMQ**: 5.0.0 (Modern queue)

#### **API Documentation**
- **swagger-jsdoc**: 6.2.8 (SYNCED - OpenAPI/Swagger docs)
- **swagger-ui-express**: 5.0.0 (SYNCED - API explorer)

#### **Payment Gateways**
- **razorpay**: 2.9.2 (SYNCED - Razorpay integration)
- **stripe**: 14.7.0 (SYNCED - Stripe integration)

#### **Communication Services**
- **nodemailer**: 6.9.7 (SYNCED - Email sending)
- **twilio**: 4.19.0 (SYNCED - SMS/WhatsApp)

#### **Additional Backend Tools**
- **helmet**: 7.1.0 (SYNCED - Security headers)
- **cors**: 2.8.5 (SYNCED - CORS middleware)
- **compression**: 1.7.4 (SYNCED - Response compression)
- **morgan**: 1.10.0 (SYNCED - HTTP request logger)
- **winston**: 3.11.0 (SYNCED - Application logger)
- **multer**: 1.4.5-lts.1 (SYNCED - File upload handling)
- **uuid**: 9.0.1 (SYNCED - UUID generation)
- **moment**: 2.29.4 (SYNCED - Date manipulation)
- **node-cron**: 3.0.3 (SYNCED - Scheduled tasks)
- **express-rate-limit**: 7.1.5 (SYNCED - Rate limiting)

### **DevOps & Infrastructure**

#### **Hosting**
- **Frontend**: Vercel (Free tier, edge network)
- **Backend**: Render (Free tier, auto-scaling)
- **Database**: Supabase (Free tier, PostgreSQL)
- **Cache**: Upstash Redis (Free tier, serverless)
- **Storage**: Cloudflare R2 (Free tier, S3-compatible)
- **CDN**: Cloudflare (Free tier, global)

#### **Monitoring**
- **Better Stack** (formerly Logtail): Logging
- **Sentry**: Error tracking
- **Uptime Robot**: Uptime monitoring

#### **CI/CD**
- **GitHub Actions**: CI/CD pipeline
- **Vercel**: Frontend deployment
- **Render**: Backend deployment

#### **Email & Communication**
- **Resend**: Email service (free tier)
- **Twilio**: SMS/WhatsApp (pay-per-use)
- **MSG91**: SMS (Indian market)

### **Development Tools**

#### **Linting & Formatting**
- **ESLint**: 8.57.0 (SYNCED - Code linting)
- **Prettier**: 3.4.2 (SYNCED - Code formatting)
- **@typescript-eslint/eslint-plugin**: 6.13.1 (SYNCED - TS linting)
- **@typescript-eslint/parser**: 6.13.1 (SYNCED - TS parser)

#### **Testing**
- **Jest**: 29.7.0 (SYNCED - Unit testing)
- **@testing-library/react**: 16.3.0 (SYNCED - Component testing)
- **@testing-library/jest-dom**: 6.9.1 (SYNCED - Jest matchers)
- **@testing-library/user-event**: 13.5.0 (SYNCED - User interaction simulation)
- **@testing-library/dom**: 10.4.1 (SYNCED - DOM testing utilities)
- **supertest**: 6.3.3 (SYNCED - API testing)
- **Playwright**: 1.40.0 (Optional - E2E testing)

#### **Code Quality**
- **cross-env**: 10.1.0 (SYNCED - Cross-platform env variables)
- **nodemon**: 3.0.2 (SYNCED - Development auto-restart)
- **Husky**: 9.0.0 (Optional - Git hooks)
- **lint-staged**: 15.0.0 (Optional - Pre-commit checks)

---

## 📁 **Complete Project Structure**

```
web-admin-new/
├── frontend/                    # Frontend Application
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   ├── robots.txt
│   │   └── assets/
│   │       ├── images/
│   │       └── fonts/
│   │
│   ├── src/
│   │   ├── main.tsx            # Entry point
│   │   ├── App.tsx             # Root component
│   │   ├── vite-env.d.ts      # Vite types
│   │   │
│   │   ├── config/             # Configuration
│   │   │   ├── constants.ts
│   │   │   ├── environment.ts
│   │   │   └── theme.ts
│   │   │
│   │   ├── types/              # Global TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── common.ts
│   │   │   └── response.ts
│   │   │
│   │   ├── api/                # API Layer
│   │   │   ├── client.ts      # Axios instance
│   │   │   ├── endpoints.ts   # API endpoints
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── tenant.service.ts
│   │   │       ├── user.service.ts
│   │   │       ├── revenue.service.ts
│   │   │       ├── credit.service.ts
│   │   │       ├── subscription.service.ts
│   │   │       ├── payment.service.ts
│   │   │       ├── crm.service.ts
│   │   │       ├── messaging.service.ts
│   │   │       ├── notification.service.ts
│   │   │       ├── analytics.service.ts
│   │   │       ├── report.service.ts
│   │   │       ├── audit.service.ts
│   │   │       ├── settings.service.ts
│   │   │       ├── rbac.service.ts
│   │   │       ├── security.service.ts
│   │   │       ├── microservices.service.ts
│   │   │       ├── template.service.ts
│   │   │       ├── ticket.service.ts
│   │   │       ├── monitoring.service.ts
│   │   │       └── developer.service.ts
│   │   │
│   │   ├── store/              # Redux Store
│   │   │   ├── index.ts
│   │   │   ├── hooks.ts
│   │   │   └── slices/
│   │   │       ├── authSlice.ts
│   │   │       ├── uiSlice.ts
│   │   │       ├── tenantSlice.ts
│   │   │       ├── userSlice.ts
│   │   │       ├── notificationSlice.ts
│   │   │       └── settingsSlice.ts
│   │   │
│   │   ├── hooks/              # Custom React Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermissions.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   └── useToast.ts
│   │   │
│   │   ├── utils/              # Utility Functions
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── storage.ts
│   │   │   ├── helpers.ts
│   │   │   ├── constants.ts
│   │   │   └── errorHandlers.ts
│   │   │
│   │   ├── components/         # Shared Components
│   │   │   ├── common/
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Table/
│   │   │   │   ├── Loading/
│   │   │   │   ├── ErrorBoundary/
│   │   │   │   ├── EmptyState/
│   │   │   │   ├── SearchBar/
│   │   │   │   ├── FilterPanel/
│   │   │   │   └── Pagination/
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Header/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── UserMenu.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Sidebar/
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── NavItem.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Footer/
│   │   │   │   ├── Breadcrumbs/
│   │   │   │   └── MainLayout/
│   │   │   │
│   │   │   └── charts/
│   │   │       ├── LineChart/
│   │   │       ├── BarChart/
│   │   │       ├── PieChart/
│   │   │       └── AreaChart/
│   │   │
│   │   ├── modules/            # Feature Modules (25+ modules)
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   │   └── ResetPasswordPage.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   └── PasswordField.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAuth.ts
│   │   │   │   └── types/
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── pages/
│   │   │   │   │   └── DashboardPage.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── KPICard.tsx
│   │   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   │   └── QuickActions.tsx
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── tenants/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── TenantListPage.tsx
│   │   │   │   │   ├── TenantDetailsPage.tsx
│   │   │   │   │   ├── CreateTenantPage.tsx
│   │   │   │   │   ├── EditTenantPage.tsx
│   │   │   │   │   ├── TenantOnboardingPage.tsx
│   │   │   │   │   ├── TenantSettingsPage.tsx
│   │   │   │   │   └── TenantBrandingPage.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── TenantCard.tsx
│   │   │   │   │   ├── OnboardingWizard.tsx
│   │   │   │   │   └── TenantStats.tsx
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── platform-users/
│   │   │   │   ├── pages/
│   │   │   │   │   └── PlatformUsersPage.tsx (6 tabs)
│   │   │   │   ├── components/
│   │   │   │   │   ├── UserCard.tsx
│   │   │   │   │   ├── UserDetailsModal.tsx
│   │   │   │   │   └── UserAnalytics.tsx
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── admin-users/
│   │   │   │   ├── pages/
│   │   │   │   │   └── AdminUsersPage.tsx (4 tabs)
│   │   │   │   ├── components/
│   │   │   │   │   ├── AdminCard.tsx
│   │   │   │   │   └── PermissionMatrix.tsx
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── revenue/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── RevenueDashboard.tsx
│   │   │   │   │   ├── SubscriptionPlansPage.tsx
│   │   │   │   │   ├── InvoicesPage.tsx
│   │   │   │   │   ├── PaymentMethodsPage.tsx
│   │   │   │   │   ├── DunningManagementPage.tsx
│   │   │   │   │   └── RevenueAnalyticsPage.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── credits/
│   │   │   │   ├── pages/
│   │   │   │   │   └── CreditManagementPage.tsx (4 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── subscriptions/
│   │   │   │   ├── pages/
│   │   │   │   │   └── SubscriptionManagementPage.tsx (5 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   ├── pages/
│   │   │   │   │   └── PaymentManagementPage.tsx (6 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── crm/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── CRMDashboardPage.tsx
│   │   │   │   │   ├── LeadsPage.tsx
│   │   │   │   │   ├── ContactsPage.tsx
│   │   │   │   │   ├── DealsPage.tsx
│   │   │   │   │   └── ActivitiesPage.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── messaging/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── MessagingPage.tsx (4 tabs)
│   │   │   │   │   ├── CampaignsPage.tsx
│   │   │   │   │   └── TemplatesPage.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── pages/
│   │   │   │   │   └── NotificationsPage.tsx (4 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── AnalyticsDashboardPage.tsx
│   │   │   │   │   ├── UserAnalyticsPage.tsx
│   │   │   │   │   ├── RevenueAnalyticsPage.tsx
│   │   │   │   │   └── CustomAnalyticsPage.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── ReportsPage.tsx
│   │   │   │   │   ├── ReportBuilderPage.tsx
│   │   │   │   │   └── ScheduledReportsPage.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── audit/
│   │   │   │   ├── pages/
│   │   │   │   │   └── AuditLogsPage.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── monitoring/
│   │   │   │   ├── pages/
│   │   │   │   │   └── SystemHealthPage.tsx (3 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── developer/
│   │   │   │   ├── pages/
│   │   │   │   │   └── APIDocumentationPage.tsx (4 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── SettingsPage.tsx (5 tabs)
│   │   │   │   │   ├── SecuritySettingsPage.tsx
│   │   │   │   │   └── IntegrationsPage.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── pages/
│   │   │   │   │   └── ProfilePage.tsx (4 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── rbac/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── RolesPage.tsx
│   │   │   │   │   └── PermissionsPage.tsx
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── security/
│   │   │   │   ├── pages/
│   │   │   │   │   └── SecurityManagementPage.tsx (4 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── microservices/
│   │   │   │   ├── pages/
│   │   │   │   │   └── MicroservicesManagementPage.tsx (5 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   ├── pages/
│   │   │   │   │   └── TemplateManagementPage.tsx (5 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── tickets/
│   │   │   │   ├── pages/
│   │   │   │   │   └── TicketManagementPage.tsx (6 tabs)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   └── [Additional modules...]
│   │   │
│   │   ├── routes/             # Routing Configuration
│   │   │   ├── index.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── routeConfig.ts
│   │   │
│   │   ├── styles/             # Global Styles
│   │   │   ├── global.css
│   │   │   ├── variables.css
│   │   │   └── mixins.ts
│   │   │
│   │   └── __tests__/         # Tests
│   │       ├── unit/
│   │       ├── integration/
│   │       └── e2e/
│   │
│   ├── .env.example
│   ├── .env.development
│   ├── .env.production
│   ├── .gitignore
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── package.json
│   └── README.md
│
├── backend/                     # Backend API
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── app.ts             # Express app
│   │   │
│   │   ├── config/            # Configuration
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   ├── environment.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── routes/            # API Routes
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── tenants.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── revenue.routes.ts
│   │   │   ├── credits.routes.ts
│   │   │   ├── subscriptions.routes.ts
│   │   │   ├── payments.routes.ts
│   │   │   ├── crm.routes.ts
│   │   │   ├── messaging.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   ├── reports.routes.ts
│   │   │   ├── audit.routes.ts
│   │   │   ├── settings.routes.ts
│   │   │   ├── rbac.routes.ts
│   │   │   ├── security.routes.ts
│   │   │   ├── microservices.routes.ts
│   │   │   ├── templates.routes.ts
│   │   │   └── tickets.routes.ts
│   │   │
│   │   ├── controllers/       # Controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── tenants.controller.ts
│   │   │   ├── users.controller.ts
│   │   │   └── [All controllers...]
│   │   │
│   │   ├── services/          # Business Logic
│   │   │   ├── auth.service.ts
│   │   │   ├── tenants.service.ts
│   │   │   ├── users.service.ts
│   │   │   └── [All services...]
│   │   │
│   │   ├── models/            # Database Models (Prisma)
│   │   │   ├── index.ts
│   │   │   ├── User.ts
│   │   │   ├── Tenant.ts
│   │   │   └── [All models...]
│   │   │
│   │   ├── middleware/        # Middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── tenant.middleware.ts
│   │   │
│   │   ├── utils/             # Utilities
│   │   │   ├── logger.ts
│   │   │   ├── validator.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── types/             # TypeScript Types
│   │   │   └── index.ts
│   │   │
│   │   └── jobs/              # Background Jobs
│   │       ├── email.job.ts
│   │       ├── sms.job.ts
│   │       └── settlement.job.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Migration files
│   │
│   ├── .env.example
│   ├── .env.development
│   ├── .env.production
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── infrastructure/             # Infrastructure as Code
│   ├── docker/
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.backend
│   │   └── docker-compose.yml
│   │
│   ├── kubernetes/            # K8s manifests (optional)
│   │   ├── frontend/
│   │   ├── backend/
│   │   └── database/
│   │
│   ├── terraform/              # Infrastructure (optional)
│   │   └── [Terraform files]
│   │
│   └── scripts/               # Deployment scripts
│       ├── deploy.sh
│       └── migrate.sh
│
├── docs/                       # Documentation
│   ├── architecture/
│   │   ├── SYSTEM_ARCHITECTURE.md
│   │   ├── DATABASE_SCHEMA.md
│   │   └── API_DOCUMENTATION.md
│   │
│   ├── guides/
│   │   ├── SETUP_GUIDE.md
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   └── CONTRIBUTING.md
│   │
│   └── api/
│       └── openapi.yaml       # OpenAPI spec
│
├── .github/                    # GitHub Actions
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-frontend.yml
│   │   └── deploy-backend.yml
│   │
│   └── ISSUE_TEMPLATE/
│
├── .gitignore
├── README.md                   # Main README
├── CHANGELOG.md
├── LICENSE
└── package.json                # Root package.json (monorepo)
```

---

## 📦 **Complete Module Breakdown (25+ Modules, 180+ Pages)**

### **MODULE 1: Authentication & Authorization** (3 pages)
1. Login Page
2. Forgot Password Page
3. Reset Password Page

### **MODULE 2: Dashboard** (1 page)
1. Main Dashboard Page

### **MODULE 3: Tenant Management** (7 pages)
1. Tenant List Page
2. Create Tenant Page
3. Tenant Details Page
4. Edit Tenant Page
5. Tenant Onboarding Page
6. Tenant Settings Page
7. Tenant Branding Page

### **MODULE 4: Platform Users** (7 pages - 6 tabs + details)
1. Platform Users Page (6 tabs: All Users, Owners, Students, Parents, Staff, Analytics)
2. Library Owner Details Page
3. Student Details Page
4. Parent Details Page
5. Staff Details Page
6. User Analytics Page
7. Bulk User Operations Page

### **MODULE 5: Admin Users** (5 pages - 4 tabs + details)
1. Admin Users Page (4 tabs: All Admins, Team Management, Analytics, Role Permissions)
2. Admin Details Page
3. Admin Activity Page
4. Permission Management Page
5. Team Management Page

### **MODULE 6: Revenue & Billing** (10 pages)
1. Revenue Dashboard
2. Subscription Plans Page
3. Invoice Management Page
4. Invoice Details Page
5. Create Invoice Page
6. Payment Methods Page
7. Payment Gateway Configuration Page
8. Dunning Management Page
9. Revenue Analytics Page
10. Revenue Reports Page

### **MODULE 7: Credit Management** (8 pages - 4 tabs + details)
1. Credit Management Page (4 tabs: Overview, Wallets, Packages, Custom Plans)
2. Master Wallet Page
3. Tenant Wallet Details Page
4. Credit Package Details Page
5. Custom Plan Builder Page
6. Credit Analytics Page
7. Credit Transactions Page
8. Credit Pricing Page

### **MODULE 8: Subscription Management** (7 pages - 5 tabs + details)
1. Subscription Management Page (5 tabs: Active, Changes, Analytics, Comparison, Configuration)
2. Subscription Details Page
3. Plan Configuration Page
4. Subscription Changes Page
5. Subscription Analytics Page
6. Plan Comparison Page
7. Subscription Reports Page

### **MODULE 9: Payment Management** (10 pages - 6 tabs + details)
1. Payment Management Page (6 tabs: Transactions, Pending Settlements, Completed, Failed, Analytics, Settings)
2. Transaction Details Page
3. Settlement Details Page
4. Failed Payment Details Page
5. Payment Analytics Page
6. Fee Configuration Page
7. Settlement Configuration Page
8. Payment Reports Page
9. Refund Management Page
10. Payment Reconciliation Page

### **MODULE 10: CRM** (12 pages)
1. CRM Dashboard Page
2. Leads List Page
3. Lead Details Page
4. Create Lead Page
5. Contacts List Page
6. Contact Details Page
7. Create Contact Page
8. Deals Pipeline Page
9. Deal Details Page
10. Create Deal Page
11. Activities Page
12. CRM Analytics Page

### **MODULE 11: Messaging** (10 pages)
1. Messaging Inbox Page
2. Messaging Sent Page
3. Messaging Drafts Page
4. Message Details Page
5. Compose Message Page
6. Campaigns Page
7. Campaign Details Page
8. Create Campaign Page
9. Message Templates Page
10. Messaging Analytics Page

### **MODULE 12: Notifications** (6 pages - 4 tabs + details)
1. Notifications Page (4 tabs: All, Unread, Important, Settings)
2. Notification Details Page
3. Notification Settings Page
4. Notification Templates Page
5. Notification Analytics Page
6. Bulk Notification Page

### **MODULE 13: System Health & Monitoring** (8 pages - 3 tabs + details)
1. System Health Page (3 tabs: Services, Metrics, Charts)
2. Service Details Page
3. Metrics Details Page
4. Performance Analysis Page
5. Logs Viewer Page
6. Alert Configuration Page
7. Health Reports Page
8. Incident Management Page

### **MODULE 14: API Documentation** (6 pages - 4 tabs + details)
1. API Documentation Page (4 tabs: Reference, Authentication, Examples, Webhooks)
2. API Endpoint Details Page
3. API Testing Page
4. Webhook Management Page
5. API Analytics Page
6. API Keys Management Page

### **MODULE 15: Analytics & BI** (12 pages)
1. Analytics Dashboard Page
2. User Analytics Page
3. Revenue Analytics Page
4. Subscription Analytics Page
5. Payment Analytics Page
6. Tenant Analytics Page
7. Credit Analytics Page
8. Custom Analytics Page
9. Analytics Builder Page
10. Analytics Reports Page
11. Data Export Page
12. Analytics Settings Page

### **MODULE 16: Reports** (15 pages)
1. Reports Dashboard Page
2. Tenant Report Page
3. User Report Page
4. Revenue Report Page
5. Subscription Report Page
6. Payment Report Page
7. Credit Report Page
8. CRM Report Page
9. Messaging Report Page
10. Custom Report Builder Page
11. Scheduled Reports Page
12. Report Templates Page
13. Report History Page
14. Report Export Page
15. Report Configuration Page

### **MODULE 17: Audit Logs** (5 pages)
1. Audit Logs List Page
2. Audit Log Details Page
3. Audit Log Analytics Page
4. Audit Log Reports Page
5. Audit Log Configuration Page

### **MODULE 18: Settings** (10 pages - 5 tabs + details)
1. Settings Page (5 tabs: General, Security, Integrations, Email Templates, Advanced)
2. General Settings Page
3. Security Settings Page
4. Integration Settings Page
5. Email Template Editor Page
6. Advanced Settings Page
7. System Configuration Page
8. Feature Flags Page
9. Maintenance Mode Page
10. Backup & Restore Page

### **MODULE 19: Profile** (6 pages - 4 tabs + details)
1. Profile Page (4 tabs: Profile, Security, Preferences, Activity)
2. Edit Profile Page
3. Change Password Page
4. MFA Setup Page
5. Activity History Page
6. API Keys Page

### **MODULE 20: RBAC (Roles & Permissions)** (8 pages)
1. Roles List Page
2. Role Details Page
3. Create Role Page
4. Edit Role Page
5. Permissions Catalog Page
6. Permission Details Page
7. Role Assignment Page
8. RBAC Analytics Page

### **MODULE 21: Security Management** (10 pages - 4 tabs + details)
1. Security Management Page (4 tabs: MFA, SSO, Security Events, Threat Detection)
2. MFA Configuration Page
3. SSO Configuration Page
4. Security Event Details Page
5. Threat Details Page
6. Security Policies Page
7. IP Whitelist Page
8. Security Reports Page
9. Security Analytics Page
10. Incident Response Page

### **MODULE 22: Microservices Management** (12 pages - 5 tabs + details)
1. Microservices Management Page (5 tabs: Overview, Health, Gateway, Config, Logs)
2. Service Details Page
3. Service Health Page
4. API Gateway Page
5. Service Configuration Page
6. Service Logs Page
7. Service Analytics Page
8. Deployment Management Page
9. Service Monitoring Page
10. Alert Configuration Page
11. Service Reports Page
12. Infrastructure Page

### **MODULE 23: Template Management** (15 pages - 5 tabs + details)
1. Template Management Page (5 tabs: All, SMS, WhatsApp, Email, Custom)
2. Template Details Page
3. Create Template Page
4. Edit Template Page
5. SMS Templates Page
6. WhatsApp Templates Page
7. Email Templates Page
8. Custom Template Builder Page
9. Template Categories Page
10. Template Variables Page
11. Template Preview Page
12. Template Analytics Page
13. Template Approval Page
14. Template Reports Page
15. Template Settings Page

### **MODULE 24: Ticket Management** (15 pages - 6 tabs + details)
1. Ticket Management Page (6 tabs: All, My Tickets, Open, Resolved, Statistics, Settings)
2. Ticket Details Page
3. Create Ticket Page
4. Edit Ticket Page
5. Ticket Comments Page
6. Ticket Attachments Page
7. Ticket Assignment Page
8. Ticket Escalation Page
9. Ticket SLA Page
10. Ticket Satisfaction Page
11. Ticket Analytics Page
12. Ticket Reports Page
13. Ticket Categories Page
14. Ticket Templates Page
15. Ticket Automation Page

### **MODULE 25: Additional Modules** (20+ pages)
1. Workflows Page
2. Automation Page
3. Integrations Page
4. Webhooks Page
5. Compliance Page
6. Legal Page
7. Documentation Page
8. Help Center Page
9. Changelog Page
10. Roadmap Page
11. Feature Requests Page
12. Feedback Page
13. Support Center Page
14. Knowledge Base Page
15. Training Page
16. Onboarding Page
17. Migration Page
18. Import/Export Page
19. Data Management Page
20. System Maintenance Page

---

## 📊 **Page Count Summary**

### **By Module:**
1. Authentication: 3 pages
2. Dashboard: 1 page
3. Tenants: 7 pages
4. Platform Users: 7 pages
5. Admin Users: 5 pages
6. Revenue: 10 pages
7. Credits: 8 pages
8. Subscriptions: 7 pages
9. Payments: 10 pages
10. CRM: 12 pages
11. Messaging: 10 pages
12. Notifications: 6 pages
13. System Health: 8 pages
14. API Docs: 6 pages
15. Analytics: 12 pages
16. Reports: 15 pages
17. Audit Logs: 5 pages
18. Settings: 10 pages
19. Profile: 6 pages
20. RBAC: 8 pages
21. Security: 10 pages
22. Microservices: 12 pages
23. Templates: 15 pages
24. Tickets: 15 pages
25. Additional: 20 pages

**Total: 180+ pages** ✅

---

## 🗄️ **Database Schema (Prisma)**

### **Core Tables:**
- Users (Platform Users + Admin Users)
- Tenants
- Subscriptions
- Invoices
- Payments
- Credits
- Transactions
- Settlements
- Leads
- Contacts
- Deals
- Messages
- Notifications
- Tickets
- Templates
- Audit Logs
- Roles
- Permissions
- Settings
- And 50+ more tables...

---

## 🌐 **API Endpoints (200+ Endpoints)**

### **Authentication** (5 endpoints)
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### **Tenants** (15 endpoints)
- GET /api/tenants
- GET /api/tenants/:id
- POST /api/tenants
- PUT /api/tenants/:id
- DELETE /api/tenants/:id
- POST /api/tenants/:id/onboarding
- GET /api/tenants/:id/settings
- PUT /api/tenants/:id/settings
- GET /api/tenants/:id/branding
- PUT /api/tenants/:id/branding
- ... (more endpoints)

### **Platform Users** (20 endpoints)
- GET /api/platform-users
- GET /api/platform-users/:id
- POST /api/platform-users
- PUT /api/platform-users/:id
- DELETE /api/platform-users/:id
- GET /api/platform-users/owners
- GET /api/platform-users/students
- GET /api/platform-users/parents
- GET /api/platform-users/staff
- GET /api/platform-users/analytics
- ... (more endpoints)

### **Admin Users** (15 endpoints)
- GET /api/admin-users
- GET /api/admin-users/:id
- POST /api/admin-users
- PUT /api/admin-users/:id
- DELETE /api/admin-users/:id
- GET /api/admin-users/analytics
- GET /api/admin-users/permissions
- ... (more endpoints)

### **Revenue** (25 endpoints)
- GET /api/revenue/dashboard
- GET /api/revenue/invoices
- GET /api/revenue/invoices/:id
- POST /api/revenue/invoices
- GET /api/revenue/plans
- POST /api/revenue/plans
- ... (more endpoints)

### **Credits** (20 endpoints)
- GET /api/credits/dashboard
- GET /api/credits/wallets
- GET /api/credits/packages
- POST /api/credits/packages
- GET /api/credits/custom-plans
- POST /api/credits/custom-plans
- ... (more endpoints)

### **Subscriptions** (20 endpoints)
- GET /api/subscriptions
- GET /api/subscriptions/:id
- POST /api/subscriptions
- PUT /api/subscriptions/:id
- GET /api/subscriptions/analytics
- ... (more endpoints)

### **Payments** (25 endpoints)
- GET /api/payments/transactions
- GET /api/payments/settlements
- POST /api/payments/settlements
- GET /api/payments/analytics
- GET /api/payments/settings
- PUT /api/payments/settings
- ... (more endpoints)

### **CRM** (30 endpoints)
- GET /api/crm/leads
- POST /api/crm/leads
- GET /api/crm/contacts
- GET /api/crm/deals
- GET /api/crm/activities
- ... (more endpoints)

### **Messaging** (20 endpoints)
- GET /api/messaging/inbox
- POST /api/messaging/send
- GET /api/messaging/campaigns
- POST /api/messaging/campaigns
- ... (more endpoints)

### **Other Modules** (100+ endpoints)
- Notifications (15)
- Analytics (20)
- Reports (25)
- Audit Logs (10)
- Settings (15)
- RBAC (20)
- Security (15)
- Microservices (25)
- Templates (20)
- Tickets (25)
- ... (more endpoints)

**Total: 200+ API Endpoints** ✅

---

## 🚀 **Deployment Architecture**

### **Frontend Deployment (Vercel)**
- **Platform**: Vercel
- **Build**: Vite production build
- **CDN**: Cloudflare Edge Network
- **SSL**: Automatic HTTPS
- **Custom Domain**: Support
- **Environment Variables**: Secure storage
- **Preview Deployments**: Per PR
- **Analytics**: Vercel Analytics (free tier)

### **Backend Deployment (Render)**
- **Platform**: Render
- **Runtime**: Node.js 18+
- **Database**: Supabase PostgreSQL
- **Cache**: Upstash Redis
- **Queue**: BullMQ on Render
- **Environment Variables**: Secure storage
- **Health Checks**: Automatic
- **Auto-scaling**: Enabled
- **Logs**: Render logs + Better Stack

### **Database (Supabase)**
- **Platform**: Supabase
- **Type**: PostgreSQL 15+
- **Backup**: Daily automatic backups
- **Connection Pooling**: Built-in
- **Real-time**: Supabase Realtime
- **Row Level Security**: Enabled
- **API**: Auto-generated REST API

### **Cache (Upstash Redis)**
- **Platform**: Upstash
- **Type**: Serverless Redis
- **Free Tier**: 10K commands/day
- **Global**: Multi-region support
- **TTL**: Configurable
- **Monitoring**: Built-in

### **File Storage (Cloudflare R2)**
- **Platform**: Cloudflare R2
- **Type**: S3-compatible storage
- **Free Tier**: 10GB storage, 1M operations/month
- **CDN**: Cloudflare CDN integration
- **Images**: Automatic optimization
- **Access**: Signed URLs

---

## 📝 **Next Steps**

This is the **master architecture document**. Next I'll create:

1. **Complete Implementation Plan** (180+ pages breakdown)
2. **Backend Architecture** (API structure, database schema)
3. **Frontend Architecture** (Component structure, routing)
4. **Deployment Guide** (Step-by-step deployment)
5. **Development Roadmap** (Phase-by-phase implementation)

**Ready to proceed with detailed implementation plans?** 🚀

---

**Last Updated**: October 31, 2025  
**Status**: Master Architecture Complete  
**Next**: Detailed Implementation Plans

