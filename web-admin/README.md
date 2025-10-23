# ⚙️ STUDYSPOT - Platform Administrator Portal

**Target Users**: Super Administrators, Platform Managers  
**Purpose**: Manage tenants, platform configuration, system security, and platform-wide analytics  
**Port**: 3002  
**URL**: https://admin.studyspot.com (production)

---

## 📋 **PORTAL SCOPE**

This is the **Platform Administrator Portal** - one of three separate portals in the StudySpot platform:

1. **📱 Mobile App** (`/mobile`) - For Students
2. **🏢 Library Owner Portal** (`/web-owner`) - For Library Owners/Staff
3. **⚙️ Platform Admin Portal** (`/web-admin`) - THIS PORTAL

---

## ✨ **Features Included in This Portal**

### ✅ Tenant Management
- Onboard new tenants (libraries)
- View all tenants
- Tenant details & settings
- Suspend/activate tenants
- Tenant analytics
- Billing management

### ✅ Platform Analytics
- Platform-wide metrics
- Revenue analytics across all tenants
- User growth statistics
- System performance metrics
- Business intelligence dashboards

### ✅ RBAC Management
- Create/Edit/Delete roles
- Manage permissions
- Assign roles to users
- Permission groups
- Role hierarchy
- Audit logs

### ✅ Security Management
- Security settings
- Authentication configuration
- API key management
- IP whitelisting
- Security audit logs
- Compliance monitoring

### ✅ System Configuration
- Platform settings
- Feature flags
- System limits
- Email templates
- Notification settings
- Integration configuration

### ✅ Subscription Management (Platform-wide)
- Manage subscription plans
- Pricing configuration
- Plan features
- Billing cycles
- Stripe configuration

### ✅ Audit & Compliance
- Complete audit trail
- User activity logs
- System changes log
- Security events
- Compliance reports
- Data export

---

## ❌ **Features NOT in This Portal**

These are in the Library Owner Portal (`/web-owner`):

- ❌ Library management (individual libraries)
- ❌ Booking management
- ❌ Library user management
- ❌ Library-specific analytics
- ❌ Library credit management

---

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd web-admin
npm install
```

### Development
```bash
npm start
# Runs on http://localhost:3002
```

### Build
```bash
npm run build
# Creates production build in /build
```

### Environment Variables

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_PORTAL_NAME=Platform Administrator
```

---

## 📁 **Project Structure**

```
web-admin/
├── public/                # Static files
├── src/
│   ├── components/        # Reusable components
│   │   ├── admin/         # Admin components
│   │   ├── tenants/       # Tenant components
│   │   ├── roles/         # RBAC components
│   │   ├── audit/         # Audit components
│   │   └── common/        # Shared components
│   ├── pages/             # Page components
│   │   ├── auth/          # Login
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── tenants/       # Tenant pages
│   │   ├── roles/         # RBAC pages
│   │   ├── security/      # Security pages
│   │   ├── audit/         # Audit pages
│   │   └── settings/      # System settings
│   ├── services/          # API services
│   ├── store/             # Redux store
│   ├── hooks/             # Custom hooks
│   ├── layouts/           # Layout components
│   ├── constants/         # Constants & config
│   └── App.tsx            # Main app component
├── package.json
└── README.md
```

---

## 🔐 **Supported Roles**

This portal supports:

- **Super Admin** - Full platform access
- **Platform Manager** - Platform operations
- **Support Staff** - Customer support access

---

## 🎨 **Theme**

- **Primary Color**: #d32f2f (Red)
- **Accent Color**: #f57c00 (Orange)
- **Purpose**: Administrative, high-security design

---

## 📦 **Deployment**

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Environment Variables (Production)
```env
REACT_APP_API_URL=https://api.studyspot.com
REACT_APP_PORTAL_NAME=Platform Administrator
```

---

## 🔒 **Security**

This portal has **HIGHEST security requirements**:

- MFA required for all users
- IP whitelisting enabled
- Enhanced audit logging
- Session timeout: 15 minutes
- Additional security headers
- Rate limiting: 50 req/min

---

## 🧪 **Testing**

```bash
npm test              # Run tests
npm run test:coverage # Coverage report
```

---

## 📝 **License**

Proprietary - StudySpot Platform

---

**Built with ❤️ for Platform Administrators**







