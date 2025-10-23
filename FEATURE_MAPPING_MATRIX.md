# 🗺️ STUDYSPOT - COMPLETE FEATURE MAPPING MATRIX

**Purpose**: Map all features to correct portals  
**Date**: October 22, 2025  
**Status**: Comprehensive Analysis Complete

---

## 📊 **3-PORTAL ARCHITECTURE SUMMARY**

| Portal | Users | Purpose | Revenue Model |
|--------|-------|---------|---------------|
| **📱 Mobile App** | Students (End Users) | Book seats, study | Pay libraries for seats |
| **🏢 Owner Portal** | Library Owners/Staff (B2B Customers) | Manage library business | Subscribe to platform + buy credits |
| **⚙️ Admin Portal** | SaaS Company (Internal) | Manage platform | Collect subscriptions from libraries |

---

## 🎯 **COMPLETE FEATURE DISTRIBUTION**

### **MOBILE APP (Student-Facing)**

#### ✅ Features to Include:
1. **Authentication & Profile**
   - Social login (Google/Facebook/LinkedIn)
   - Profile management
   - Digital ID card with QR code
   - Document upload
   - KYC verification

2. **Library Discovery**
   - Location-based search
   - Advanced filters
   - Map view
   - Reviews & ratings
   - Favorites

3. **Booking Management**
   - Real-time seat availability
   - Shift-based booking
   - Seat selection
   - Booking history
   - Auto-extension
   - Waitlist

4. **Attendance & Access**
   - QR code scanner
   - Check-in/check-out
   - Session tracking
   - Attendance history

5. **Payment Management**
   - Multiple payment methods
   - Payment history
   - Auto-payment
   - Coupons & referrals

6. **Digital Resources**
   - E-books access
   - Study materials
   - Offline access

7. **Issue Reporting**
   - Category-based reporting
   - Photo attachment
   - Status tracking

8. **Study Tools**
   - Pomodoro timer
   - Task management
   - Goal tracking
   - Progress analytics

9. **Study Groups**
   - Join communities
   - Notes sharing
   - Discussion forums

10. **Gamification**
    - Achievements
    - Rewards
    - Leaderboards
    - Badges

11. **Analytics**
    - Study time tracking
    - Performance insights
    - Productivity metrics

12. **AI Features**
    - Study recommendations
    - Resource suggestions
    - Schedule optimization

#### ❌ Features to Exclude:
- ❌ Library management
- ❌ Student management (bulk operations)
- ❌ Staff management
- ❌ Fee plan management
- ❌ Subscription management
- ❌ Credit purchasing
- ❌ Multi-tenant features
- ❌ Platform administration

---

### **LIBRARY OWNER/STAFF PORTAL**

#### ✅ Features to Include:

**1. Multi-Tenant Architecture**
- Custom subdomain
- White-label branding
- Feature enable/disable
- Branch management

**2. Student Management**
- Manual profile creation
- Bulk import (CSV/Excel)
- Advanced search & filters
- KYC verification
- ID card generation
- Segmentation

**3. Staff Management**
- Staff ID creation
- Role assignment
- Task management
- Performance monitoring
- Shift scheduling
- Leave management

**4. Fee Plan Management**
- Custom fee plans
- Shift/zone/duration pricing
- Discount configuration
- Pro-rata calculations
- Scholarship management

**5. Payment Collection (from Students)**
- Online payments (Razorpay/Stripe)
- QR code payments
- Cash/cheque/bank transfer
- Receipt generation
- Payment analytics

**6. Subscription Management (to Platform)**
- View current plan
- Upgrade/downgrade
- Billing history
- Invoice downloads
- Payment methods

**7. Credit Management (Purchase from Platform)**
- SMS credit purchase
- WhatsApp credit purchase
- Usage tracking
- Auto-topup
- Balance alerts

**8. Communication Dashboard**
- Automated messaging
- Fee reminders
- Attendance alerts
- Manual message controls
- AI personalization

**9. Attendance Management**
- Dashboard overview
- Check-in/check-out logs
- Overstay alerts
- Export functionality

**10. Seat & Space Management**
- Drag-drop seat designer
- Zone management
- Capacity planning
- Shift configuration
- Booking rules

**11. Issue Management**
- Real-time issue feed
- Priority queue
- Staff assignment
- Resolution tracking
- Analytics

**12. Resources Management**
- Digital resource upload
- Categorization
- Access control
- Usage analytics

**13. Referral & Discount System**
- Referral program config
- Coupon management
- Campaign tracking

**14. Analytics & Reporting**
- Operational analytics
- Financial analytics
- Student analytics
- Custom reports
- Export functionality

**15. AI-Powered Features**
- Attendance prediction
- Revenue forecasting
- Capacity optimization
- Churn prediction
- Smart recommendations

**16. Feature Control Panel**
- Payment features control
- Communication control
- Dashboard control
- AI features control
- Student features control

**17. Security & Compliance**
- MFA
- Role-based access
- Audit logs
- Data encryption
- Privacy compliance

**18. Integration & API**
- Payment gateways
- Messaging services
- Hardware integration
- Custom API access

**19. White-label & Branding**
- Custom branding
- Color schemes
- Custom domain
- Branded communications

**20. Automation Rules**
- Auto seat release
- Fee reminder schedules
- Issue escalation
- Staff assignment

**21. IoT Integration**
- WiFi appliance control
- Lighting/AC/power management
- Automation rules
- Energy monitoring

**22. Face Recognition**
- Enrollment
- Attendance marking
- Hardware support
- Security features

#### ❌ Features to Exclude:
- ❌ Platform-wide analytics (only their library)
- ❌ Tenant management (can't manage other libraries)
- ❌ Subscription plan creation (they choose, not create)
- ❌ Platform administration
- ❌ Super admin features
- ❌ Credit pricing management (they buy, not price)
- ❌ Revenue collection from libraries

---

### **PLATFORM ADMIN PORTAL**

#### ✅ Features to Include:

**1. Platform Overview**
- Business metrics dashboard
- System health monitoring
- Customer health scoring
- Performance benchmarks
- Real-time analytics
- Security compliance status

**2. Subscription Plan Management**
- Create/edit plans (Free/Starter/Pro/Enterprise)
- Feature allocation per plan
- Pricing configuration
- Trial period settings
- Plan comparison

**3. Billing & Revenue Management**
- Automated billing cycles
- Invoice generation
- Payment gateway integration
- Failed payment handling
- Refund processing
- Tax calculation (GST/International)
- Payment reconciliation

**4. Revenue Analytics**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Revenue by plan type
- Churn rate & retention
- Customer Lifetime Value (LTV)
- Revenue forecasting
- Geographic distribution
- Growth rate analysis

**5. Payout Management**
- Library commission calculation (if applicable)
- Payout schedule config
- Automated processing
- Payout history
- Dispute resolution

**6. Credit System Management**
- SMS credit package configuration
- WhatsApp credit packages
- Pricing tiers
- Usage tracking (platform-wide)
- Cost optimization
- Provider integration management
- Bulk purchase discounts

**7. Library/Tenant Management**
- Multi-tenant architecture
- Library onboarding workflow
- Business verification
- Tenant health monitoring
- Performance analytics
- Bulk operations
- Search & filtering
- Suspension/reactivation

**8. Platform User Management**
- Super admin users
- Role-based access control
- Permission templates
- Activity audit logs
- Security controls
- IP whitelisting
- Session management

**9. System Administration**
- Server infrastructure
- Database management
- Performance monitoring
- Backup & recovery
- Security management
- SSL certificates
- System health dashboard
- Auto-scaling
- Disaster recovery

**10. Feature Management**
- Global feature flags
- Gradual rollout
- A/B testing framework
- Feature usage analytics
- Dependency management
- Rollback mechanisms

**11. Analytics & Business Intelligence**
- Platform-wide analytics
- Customer acquisition analytics
- User behavior analysis
- Financial performance metrics
- Operational efficiency
- Custom report builder
- Predictive analytics
- Churn prediction
- Growth trends
- Market intelligence

**12. Customer Success**
- Customer health scoring
- Support ticket management
- Knowledge base management
- Customer feedback analysis
- Success plan generation
- Proactive intervention
- SLA monitoring
- Training programs
- Onboarding optimization
- Retention strategies

**13. Marketing & Growth**
- Marketing automation
- Lead management
- Email campaigns
- Partnership program
- Referral program admin
- Competitive analysis
- Market expansion
- SEO/ASO management
- Campaign analytics

**14. Integration & API Management**
- Developer portal
- API documentation
- Rate limiting config
- Webhook management
- Integration marketplace
- Third-party integrations

**15. Security & Compliance**
- Security monitoring
- Compliance management (GDPR/DPDP)
- Comprehensive audit logging
- Data protection
- Vulnerability assessment
- Security incident response
- Risk management
- Regulatory compliance

#### ❌ Features to Exclude:
- ❌ Individual library operations
- ❌ Student management (library owner's responsibility)
- ❌ Seat management for specific libraries
- ❌ Library-specific bookings
- ❌ Student-facing features
- ❌ Library staff management
- ❌ Individual library IoT/Face Recognition (owner manages)

---

## 📁 **CURRENT WEB APP PAGE MAPPING**

### **Pages in `/web/src/pages/`** → **Portal Assignment**

| Current Page | Owner Portal | Admin Portal | Notes |
|--------------|--------------|--------------|-------|
| **auth/** | ✅ | ✅ | Both need login |
| LoginPage | ✅ | ✅ | Different auth flows |
| RegisterPage | ✅ | ❌ | Only owners register |
| ForgotPasswordPage | ✅ | ✅ | Both portals |
| EmailVerificationPage | ✅ | ✅ | Both portals |
| **dashboard/** | | | |
| DashboardPage | ✅ | ✅ | Different dashboards |
| EnhancedDashboardPage | ✅ | ❌ | Library dashboard only |
| **library/** | | | |
| LibrariesPage | ✅ | ❌ | Owner manages libraries |
| LibraryDetailsPage | ✅ | ❌ | Owner views details |
| LibraryCreatePage | ✅ | ❌ | Owner creates libraries |
| LibraryEditPage | ✅ | ❌ | Owner edits libraries |
| **booking/** | | | |
| BookingsPage | ✅ | ❌ | Owner views bookings |
| BookingDetailsPage | ✅ | ❌ | Owner manages bookings |
| **user/** | | | |
| UsersPage | ✅ | ❌ | Owner manages students |
| UserDetailsPage | ✅ | ❌ | Student details |
| UserCreatePage | ✅ | ❌ | Create students |
| UserEditPage | ✅ | ❌ | Edit students |
| **admin/** | | | |
| AdminPage | ❌ | ✅ | Platform admin only |
| AdminTenantsPage | ❌ | ✅ | Manage library tenants |
| AdminTenantDetailsPage | ❌ | ✅ | Tenant details |
| AdminAnalyticsPage | ❌ | ✅ | Platform analytics |
| RoleManagementPage | ❌ | ✅ | Platform roles |
| AuditLogPage | ❌ | ✅ | Platform audit |
| SecuritySettingsPage | ❌ | ✅ | Platform security |
| TenantManagementPage | ❌ | ✅ | Tenant management |
| **subscription/** | | | |
| SubscriptionPlansPage | ✅ | ✅ | Owner views, Admin creates |
| SubscriptionManagePage | ✅ | ❌ | Owner manages theirs |
| SubscriptionCheckoutPage | ✅ | ❌ | Owner subscribes |
| SubscriptionSuccessPage | ✅ | ❌ | Owner confirmation |
| InvoicesPage | ✅ | ❌ | Owner invoices |
| BillingPage | ✅ | ❌ | Owner billing |
| PlansPage | ✅ | ✅ | Different views |
| SubscriptionPage | ✅ | ❌ | Owner subscription |
| **credits/** | | | |
| CreditDashboardPage | ✅ | ✅ | Owner uses, Admin manages |
| CreditPurchasePage | ✅ | ❌ | Owner purchases |
| TransactionHistoryPage | ✅ | ❌ | Owner history |
| UsageAnalyticsPage | ✅ | ✅ | Owner uses, Admin sees all |
| AutoTopupPage | ✅ | ❌ | Owner auto-topup |
| **tenant/** | | | |
| OnboardingWizard | ❌ | ✅ | Admin onboards tenants |
| SettingsDashboard | ✅ | ✅ | Both need settings |
| AnalyticsDashboard | ✅ | ✅ | Different analytics |
| **ai/** | | | |
| AIAssistantPage | ✅ | ❌ | Library operations AI |
| RecommendationsPage | ✅ | ❌ | Library recommendations |
| PredictiveAnalyticsPage | ✅ | ✅ | Library & Platform |
| SmartSchedulerPage | ✅ | ❌ | Library scheduling |
| **profile/** | | | |
| ProfilePage | ✅ | ✅ | Both portals |
| **common/** | | | |
| HelpPage | ✅ | ✅ | Both portals |
| NotFoundPage | ✅ | ✅ | Both portals |

---

## 🎯 **MISSING PAGES TO CREATE**

### **For Admin Portal:**
1. **Credit Management Pages**
   - CreditSystemManagementPage (pricing, packages)
   - SMSCreditConfigPage
   - WhatsAppCreditConfigPage
   - CreditProviderManagementPage

2. **Revenue Pages**
   - RevenueDashboardPage (MRR/ARR)
   - PayoutManagementPage
   - BillingManagementPage

3. **Customer Success Pages**
   - CustomerHealthPage
   - SupportTicketManagementPage
   - KnowledgeBaseManagementPage

4. **Marketing Pages**
   - LeadManagementPage
   - CampaignManagementPage
   - PartnerManagementPage

### **For Owner Portal:**
1. **Student Management Pages** (if not existing)
   - BulkStudentImportPage
   - StudentSegmentationPage
   - KYCVerificationPage

2. **Staff Management Pages**
   - StaffManagementPage
   - RoleAssignmentPage
   - ShiftManagementPage

3. **IoT Pages**
   - IoTDashboardPage
   - ApplianceControlPage
   - EnergyMonitoringPage

4. **Face Recognition Pages**
   - FaceEnrollmentPage
   - AttendanceSystemPage
   - BiometricSettingsPage

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Phase 1: Copy Existing Pages**
- [ ] Copy auth pages to both portals
- [ ] Copy owner-specific pages to web-owner
- [ ] Copy admin-specific pages to web-admin
- [ ] Copy shared components to both

### **Phase 2: Create Missing Pages**
- [ ] Create admin credit management pages
- [ ] Create admin revenue pages
- [ ] Create owner IoT pages
- [ ] Create owner face recognition pages

### **Phase 3: Update Routes**
- [ ] Create web-owner App.tsx with correct routes
- [ ] Create web-admin App.tsx with correct routes
- [ ] Update navigation menus

### **Phase 4: Clean Up**
- [ ] Remove admin pages from web-owner
- [ ] Remove owner pages from web-admin
- [ ] Update Redux slices for each portal

---

**This matrix serves as the definitive guide for feature separation across all 3 portals.**








