# 🔴 PHASE 14: CREDIT SYSTEM MANAGEMENT

**Priority:** CRITICAL  
**Status:** 🚧 IN PROGRESS  
**Started:** October 30, 2025  
**Target:** 5 pages for Credit System Management

---

## 📋 **OVERVIEW**

The Credit System is crucial for StudySpot's business model. Libraries purchase credits to send:
- **SMS Messages** (for seat bookings, reminders)
- **WhatsApp Messages** (for engagement)
- **Email Campaigns** (for marketing)

This module manages credit wallets, pricing, usage tracking, and credit packages.

---

## 💰 **STUDYSPOT CREDIT SYSTEM**

### **Credit Types:**
1. **SMS Credits** - ₹0.25 per SMS
2. **WhatsApp Credits** - ₹0.15 per message
3. **Email Credits** - ₹0.05 per email

### **Credit Packages:**
| Package | SMS | WhatsApp | Email | Price | Savings |
|---------|-----|----------|-------|-------|---------|
| Starter | 1,000 | 500 | 2,000 | ₹499 | 10% |
| Growth | 5,000 | 2,500 | 10,000 | ₹1,999 | 20% |
| Business | 15,000 | 7,500 | 30,000 | ₹4,999 | 30% |
| Enterprise | 50,000 | 25,000 | 100,000 | ₹14,999 | 40% |

### **Usage Scenarios:**
- **Seat Booking Confirmation** → 1 SMS + 1 WhatsApp
- **Payment Reminder** → 1 SMS + 1 Email
- **Monthly Newsletter** → 500 Emails
- **Promotional Campaign** → 1,000 WhatsApp messages

---

## 🎯 **PAGES TO BUILD**

### **1. Credit Dashboard** (Page 1 of 5)
**File:** `src/modules/credits/pages/CreditDashboard.tsx`

**Features:**
- Total Credits Balance (SMS, WhatsApp, Email)
- Usage Overview (Today, This Week, This Month)
- Top Consumers (Libraries using most credits)
- Credit Alerts (Low balance warnings)
- Recent Transactions (Last 10 credit purchases/usage)
- Usage Trend Chart (Last 30 days)
- Quick Actions (Buy Credits, View Pricing)

**KPIs:**
- Total Credits Available
- Credits Used (Last 30 days)
- Average Daily Burn Rate
- Days Until Depletion

**Mock Data:**
- 25,000 SMS credits
- 12,500 WhatsApp credits
- 50,000 Email credits
- 15 libraries consuming credits

---

### **2. Credit Wallets** (Page 2 of 5)
**File:** `src/modules/credits/pages/CreditWalletsPage.tsx`

**Features:**
- List of All Library Wallets
- Balance per Credit Type
- Last Purchase Date
- Usage Statistics
- Low Balance Indicators
- Add Credits to Wallet
- View Transaction History
- Search & Filter by Library

**Table Columns:**
- Library Name
- SMS Credits
- WhatsApp Credits
- Email Credits
- Total Value (₹)
- Last Purchase
- Status (Active, Low, Depleted)
- Actions

**Mock Data:**
- 15 library wallets
- Various balance levels
- Last 30 days of purchases

---

### **3. Credit Pricing** (Page 3 of 5)
**File:** `src/modules/credits/pages/CreditPricingPage.tsx`

**Features:**
- 4 Credit Package Cards (Starter, Growth, Business, Enterprise)
- Price Comparison Table
- Savings Calculator
- Custom Package Builder
- Volume Discounts Display
- Popular Badge (Growth package)
- Buy Now Actions
- Package Features List

**Package Details:**
- Package Name
- SMS Credits
- WhatsApp Credits
- Email Credits
- Price (₹)
- Savings %
- Features/Benefits
- Buy Button

**Mock Data:**
- 4 pre-defined packages
- Discount tiers (10%, 20%, 30%, 40%)

---

### **4. Usage Analytics** (Page 4 of 5)
**File:** `src/modules/credits/pages/UsageAnalyticsPage.tsx`

**Features:**
- Usage Breakdown by Type (SMS, WhatsApp, Email)
- Usage Trend Charts (Line charts for each type)
- Top Campaigns (Highest credit consumers)
- Library Usage Comparison
- Peak Usage Times (Hourly heatmap)
- Usage Forecasting
- Export Reports (CSV, PDF)

**Analytics:**
- Daily/Weekly/Monthly Usage
- Usage by Campaign Type
- Cost Analysis
- ROI Tracking
- Efficiency Metrics

**Mock Data:**
- 30 days of usage data
- 10 campaigns
- Hourly usage patterns

---

### **5. Credit Packages Management** (Page 5 of 5)
**File:** `src/modules/credits/pages/CreditPackagesPage.tsx`

**Features:**
- List of All Packages
- Create Custom Package
- Edit Existing Package
- Package Status (Active/Inactive)
- Purchase History per Package
- Revenue per Package
- Package Performance Metrics

**Admin Features:**
- Create Package
- Set Pricing
- Define Credit Amounts
- Set Discount %
- Enable/Disable Package
- View Analytics

**Mock Data:**
- 4 standard packages
- Purchase history (50 transactions)
- Revenue metrics

---

## 🗂️ **FILE STRUCTURE**

```
src/
├── modules/
│   └── credits/
│       ├── pages/
│       │   ├── CreditDashboard.tsx          (Page 1)
│       │   ├── CreditWalletsPage.tsx        (Page 2)
│       │   ├── CreditPricingPage.tsx        (Page 3)
│       │   ├── UsageAnalyticsPage.tsx       (Page 4)
│       │   └── CreditPackagesPage.tsx       (Page 5)
│       └── types/
│           └── index.ts                     (TypeScript types)
└── services/
    └── api/
        └── credits.ts                       (API service with mock data)
```

---

## 📊 **TYPES TO DEFINE**

```typescript
// Credit Wallet
interface CreditWallet {
  id: string;
  tenantId: string;
  tenantName: string;
  smsCredits: number;
  whatsappCredits: number;
  emailCredits: number;
  totalValue: number; // in INR
  lastPurchase: string;
  status: 'active' | 'low' | 'depleted';
  createdAt: string;
  updatedAt: string;
}

// Credit Package
interface CreditPackage {
  id: string;
  name: string;
  description: string;
  smsCredits: number;
  whatsappCredits: number;
  emailCredits: number;
  price: number; // in INR
  originalPrice: number;
  savings: number; // percentage
  popular: boolean;
  features: string[];
  status: 'active' | 'inactive';
  purchaseCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

// Credit Transaction
interface CreditTransaction {
  id: string;
  tenantId: string;
  tenantName: string;
  type: 'purchase' | 'usage';
  creditType: 'sms' | 'whatsapp' | 'email';
  amount: number;
  balance: number;
  cost?: number; // for purchases
  campaignName?: string; // for usage
  timestamp: string;
}

// Usage Statistics
interface UsageStats {
  type: 'sms' | 'whatsapp' | 'email';
  used: number;
  cost: number;
  campaignCount: number;
  avgPerCampaign: number;
}
```

---

## 🎨 **UI COMPONENTS**

### **Reusable Components:**
- Credit Balance Card (shows credits by type)
- Usage Chart (line/bar chart for trends)
- Package Card (displays package details)
- Wallet Table (list of all wallets)
- Transaction List (recent credit activity)
- Alert Badge (low balance warning)

### **Charts:**
- Line Chart (usage trends)
- Bar Chart (usage by type)
- Pie Chart (credit distribution)
- Heatmap (peak usage times)

---

## 🔗 **ROUTING**

```typescript
// New routes to add to App.tsx
<Route path="/credits/dashboard" element={<CreditDashboard />} />
<Route path="/credits/wallets" element={<CreditWalletsPage />} />
<Route path="/credits/pricing" element={<CreditPricingPage />} />
<Route path="/credits/usage" element={<UsageAnalyticsPage />} />
<Route path="/credits/packages" element={<CreditPackagesPage />} />
```

---

## 🧭 **SIDEBAR NAVIGATION**

Add new expandable menu item:

```
💳 Credits & Messaging
  ├─ Dashboard        /credits/dashboard
  ├─ Wallets          /credits/wallets
  ├─ Pricing          /credits/pricing
  ├─ Usage Analytics  /credits/usage
  └─ Packages         /credits/packages
```

---

## 📈 **SUCCESS METRICS**

- [ ] 5 Pages Built
- [ ] 40+ Features Implemented
- [ ] Type-Safe TypeScript
- [ ] INR Currency Throughout
- [ ] Mock Data for 15 Libraries
- [ ] Responsive Design
- [ ] 0 Compilation Errors
- [ ] Expandable Sidebar Menu
- [ ] Full Documentation

---

## ⏱️ **ESTIMATED TIME**

- **Page 1 (Dashboard):** 2-3 hours
- **Page 2 (Wallets):** 2-3 hours
- **Page 3 (Pricing):** 1-2 hours
- **Page 4 (Usage Analytics):** 3-4 hours
- **Page 5 (Packages):** 2-3 hours

**Total:** 10-15 hours

---

## 🚀 **READY TO START!**

Phase 14 is the next critical module for StudySpot's business model. Let's build a complete credit management system that tracks, manages, and analyzes credit usage across all libraries!

**Starting with Page 1: Credit Dashboard** 🎯

