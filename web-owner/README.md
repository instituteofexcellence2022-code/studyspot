# 🏢 STUDYSPOT - Library Owner & Staff Portal

**Target Users**: Library Owners, Branch Managers, Library Staff  
**Purpose**: Manage libraries, bookings, users, subscriptions, and business operations  
**Port**: 3000  
**URL**: https://owner.studyspot.com (production)

---

## 📋 **PORTAL SCOPE**

This is the **Library Owner/Staff Portal** - one of three separate portals in the StudySpot platform:

1. **📱 Mobile App** (`/mobile`) - For Students
2. **🏢 Library Owner Portal** (`/web-owner`) - THIS PORTAL
3. **⚙️ Platform Admin Portal** (`/web-admin`) - For Super Admins

---

## ✨ **Features Included in This Portal**

### ✅ Dashboard & Analytics
- Real-time library metrics
- Booking analytics
- Revenue analytics
- User statistics
- Performance insights

### ✅ Library Management
- Create/Edit/Delete libraries
- Multi-branch management
- Seat management
- Library settings
- Operating hours configuration

### ✅ Booking Management
- View all bookings
- Manage check-ins/check-outs
- Handle cancellations
- Booking history
- Calendar view

### ✅ User Management
- View customers (students)
- Staff management
- User profiles
- KYC verification
- Activity logs

### ✅ Subscription Management
- View current plan
- Upgrade/downgrade plans
- Billing history
- Invoice downloads
- Payment methods

### ✅ Credit Management
- SMS/WhatsApp/Email credits
- Purchase credit packages
- Auto-topup settings
- Usage analytics
- Transaction history

### ✅ Financial Management
- GST-compliant invoicing
- Expense tracking
- Revenue reports
- Payment reconciliation

---

## ❌ **Features NOT in This Portal**

These are in the Platform Admin Portal (`/web-admin`):

- ❌ Tenant management (creating new libraries)
- ❌ Platform-wide analytics
- ❌ RBAC role management
- ❌ System security settings
- ❌ Platform audit logs
- ❌ Super admin tools

---

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd web-owner
npm install
```

### Development
```bash
npm start
# Runs on http://localhost:3000
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
REACT_APP_PORTAL_NAME=Library Owner Portal
```

---

## 📁 **Project Structure**

```
web-owner/
├── public/                # Static files
├── src/
│   ├── components/        # Reusable components
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── library/       # Library components
│   │   ├── booking/       # Booking components
│   │   ├── credits/       # Credit components
│   │   └── common/        # Shared components
│   ├── pages/             # Page components
│   │   ├── auth/          # Login, Register
│   │   ├── dashboard/     # Dashboard
│   │   ├── library/       # Library pages
│   │   ├── booking/       # Booking pages
│   │   ├── user/          # User pages
│   │   ├── subscription/  # Subscription pages
│   │   ├── credits/       # Credit pages
│   │   └── invoices/      # Invoice pages
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

This portal supports these user roles:

- **Library Owner** - Full access to their library
- **Branch Manager** - Manage specific branch
- **Front Desk Staff** - Handle daily operations
- **Facility Manager** - Maintenance & facilities
- **Finance Manager** - Financial operations
- **Analytics Manager** - Reports & analytics

---

## 🎨 **Theme**

- **Primary Color**: #1976d2 (Blue)
- **Accent Color**: #dc004e (Pink)
- **Purpose**: Professional, business-focused design

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
REACT_APP_PORTAL_NAME=Library Owner Portal
```

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

**Built with ❤️ for Library Owners & Staff**












