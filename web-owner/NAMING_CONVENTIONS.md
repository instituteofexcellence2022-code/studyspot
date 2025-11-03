# 🏷️ StudySpot Library Owner Portal - Naming Conventions

## 📋 **Standardized Naming Rules**

### **1. Page Components**
- **Format**: `[Feature][Purpose]Page.tsx`
- **Examples**: 
  - `RevenueAnalyticsPage.tsx` (not PaymentAnalyticsPage)
  - `RevenueManagementPage.tsx` (not PaymentsPageComprehensive)
  - `InvoiceManagementPage.tsx` ✅
  - `BillingTemplatesPage.tsx` ✅

### **2. Folder Structure**
- **Format**: `[feature]/` (singular, lowercase)
- **Examples**:
  - `revenue/` (not `payment/` or `payments/`)
  - `invoice/` ✅
  - `billing/` ✅
  - `subscription/` ✅

### **3. Component Naming**
- **Format**: `[Feature][Purpose]Component.tsx`
- **Examples**:
  - `RevenueAnalyticsDashboard.tsx`
  - `InvoiceManagementDialog.tsx`
  - `BillingTemplateCard.tsx`

### **4. Service Naming**
- **Format**: `[feature]Service.ts`
- **Examples**:
  - `revenueService.ts` (not paymentService)
  - `invoiceService.ts`
  - `billingService.ts`

### **5. Route Constants**
- **Format**: `[FEATURE]_[PURPOSE]`
- **Examples**:
  - `REVENUE_ANALYTICS: '/revenue-analytics'`
  - `REVENUE_MANAGEMENT: '/revenue-management'`
  - `INVOICE_MANAGEMENT: '/invoice-management'`

## 🎯 **Purpose-Based Naming**

### **Revenue Management** (Library Business Revenue)
- **Purpose**: Track library revenue, payments, collections
- **Naming**: `Revenue*`
- **Examples**: `RevenueAnalyticsPage`, `RevenueManagementPage`

### **Invoice Management** (Invoice Creation & Tracking)
- **Purpose**: Create, manage, track invoices
- **Naming**: `Invoice*`
- **Examples**: `InvoiceManagementPage`, `InvoiceDialog`

### **Billing Management** (Billing Templates & Configuration)
- **Purpose**: Manage billing templates, configurations
- **Naming**: `Billing*`
- **Examples**: `BillingTemplatesPage`, `BillingConfigurationPage`

### **Subscription Management** (Software Subscriptions)
- **Purpose**: Manage software subscription plans
- **Naming**: `Subscription*`
- **Examples**: `SubscriptionPlansPage`, `SubscriptionManagePage`

## 📁 **Standardized Folder Structure**

```
src/
├── pages/
│   ├── revenue/           # Library revenue management
│   │   ├── RevenueAnalyticsPage.tsx
│   │   ├── RevenueManagementPage.tsx
│   │   └── RevenueCollectionPage.tsx
│   ├── invoice/           # Invoice management
│   │   ├── InvoiceManagementPage.tsx
│   │   ├── InvoiceCreatePage.tsx
│   │   └── InvoiceHistoryPage.tsx
│   ├── billing/           # Billing templates & config
│   │   ├── BillingTemplatesPage.tsx
│   │   └── BillingConfigurationPage.tsx
│   └── subscription/      # Software subscriptions
│       ├── SubscriptionPlansPage.tsx
│       ├── SubscriptionManagePage.tsx
│       └── SubscriptionBillingPage.tsx
├── components/
│   ├── revenue/           # Revenue components
│   ├── invoice/           # Invoice components
│   ├── billing/           # Billing components
│   └── subscription/      # Subscription components
└── services/
    ├── revenueService.ts
    ├── invoiceService.ts
    ├── billingService.ts
    └── subscriptionService.ts
```

## 🔄 **Migration Plan**

### **Phase 1: Rename Pages**
1. `PaymentAnalyticsPage.tsx` → `RevenueAnalyticsPage.tsx`
2. `PaymentsPageComprehensive.tsx` → `RevenueManagementPage.tsx`
3. `PaymentsPage.tsx` → `SubscriptionPaymentsPage.tsx`

### **Phase 2: Reorganize Folders**
1. Move `payment/` → `revenue/`
2. Move `payments/` → `subscription/payments/`
3. Keep `invoice/` and `billing/` as is

### **Phase 3: Update Routes & Imports**
1. Update `ROUTES` constants
2. Update all import statements
3. Update `App.tsx` routing

### **Phase 4: Update Components**
1. Rename component files
2. Update component exports
3. Update component imports

## ✅ **Benefits of Standardized Naming**

1. **Clarity**: Purpose is immediately clear from the name
2. **Consistency**: Same naming pattern across all features
3. **Maintainability**: Easy to find and modify related files
4. **Scalability**: New features follow established patterns
5. **Team Collaboration**: Everyone understands the naming logic

## 🚫 **Avoid These Patterns**

- ❌ `Payment*` (ambiguous - could be revenue or subscription)
- ❌ `Enhanced*` or `Advanced*` suffixes (use descriptive names instead)
- ❌ `Clean*` or `Simple*` prefixes (use standard names)
- ❌ Mixed singular/plural folder names
- ❌ Inconsistent page suffixes (`Page` vs `Dashboard` vs `Management`)













