# ✅ CORRECT Tenant Onboarding Structure - 10 STEPS

## 🎯 Based on: `web-admin-portal/src/modules/tenants/types/onboarding.ts`

---

## 📋 Complete 10-Step Structure

### Step 1: Business Info 🏢
**Type**: `business_info`

**Fields** (from BusinessInfo interface):
- Library Name
- Owner Name
- Contact Number
- Alternate Number
- Business Email
- Alternate Email
- GST Number
- PAN Number
- Business Type (Proprietorship/Partnership/Pvt Ltd/Public Ltd/LLP/Trust/Other)
- Established Year
- Website
- Description
- License Number
- Registration Number
- Tax Registered (boolean)
- Industry Category (Education/Library/Coaching/Study Center/Co-working/Other)

**Total**: 16 fields

---

### Step 2: Address Info 📍
**Type**: `address_info`

**Fields** (from AddressInfo interface):
- Address (street)
- Landmark
- City
- State
- Zip Code
- Country
- Latitude (optional)
- Longitude (optional)
- Is Service Address Same (boolean)
- Service Address (conditional):
  - Address
  - Landmark
  - City
  - State
  - Zip Code
  - Country

**Total**: 9 main fields + 6 conditional = 15 fields

---

### Step 3: Plan Selection ⭐
**Type**: `plan_selection`

**Fields** (from PlanSelection interface):
- Selected Plan (Starter/Professional/Enterprise/Custom)
- Plan Name
- Billing Cycle (Monthly/Quarterly/Semi-Annual/Annual)
- Payment Frequency (Monthly/Quarterly/Annually)
- Start Date
- Contract Duration (months)
- Auto Renewal (boolean)
- Plan Features (PlanFeatures interface):
  - Max Students
  - Max Seats
  - Max Staff
  - Storage GB
  - API Access
  - White Label
  - Custom Domain
  - Priority Support
  - Dedicated Manager
  - SMS Credits
  - WhatsApp Credits
  - Email Credits
  - Advanced Analytics
  - Custom Reports
  - Mobile App
  - Parent App
  - Face Recognition
  - QR Code Entry
  - Biometric Attendance
  - Online Payments
  - Multi Location
  - Max Locations
- Pricing (PlanPricing):
  - Base Price
  - Setup Fee
  - Discount Percentage
  - Discounted Price
  - GST Amount
  - Total Amount
  - Per Student Charge
  - Additional Seat Charge
  - Currency
- Trial Period:
  - Enabled
  - Duration Days
  - Requires Card
- Add-ons (array)

**Total**: 40+ fields

---

### Step 4: Billing Info 💳
**Type**: `billing_info`

**Fields** (from BillingInfo interface):
- Billing Name
- Billing Email
- Billing Phone
- Billing Address
- Billing City
- Billing State
- Billing Zip Code
- Billing Country
- GST Number
- PAN Number
- Payment Method (Card/UPI/NetBanking/Bank Transfer/Cheque/Wallet)
- Is Same As Business Address (boolean)
- Invoice Preference (Email/Postal/Both)
- Invoice Frequency (Monthly/Quarterly/Annually)
- Auto Pay Enabled (boolean)
- Primary Payment Method
- Backup Payment Method

**Total**: 17 fields

---

### Step 5: Bank Details 🏦
**Type**: `bank_details`

**Fields** (from BankDetails interface):
- Account Holder Name
- Account Number
- Confirm Account Number
- Account Type (Savings/Current/Overdraft)
- Bank Name
- Branch Name
- IFSC Code
- SWIFT Code
- UPI ID
- Verification Status (Pending/Verified/Failed)
- Verification Method (Penny Drop/Manual/Document)
- Cancelled Cheque Upload:
  - URL
  - Uploaded At
- Bank Statement Upload:
  - URL
  - Uploaded At

**Total**: 14 fields

---

### Step 6: Customization 🎨
**Type**: `customization`

**Fields** (from CustomizationPreferences interface):
- Primary Color (color picker)
- Secondary Color
- Accent Color
- Logo Upload:
  - URL
  - File Name
  - File Size
  - Uploaded At
- Favicon Upload:
  - URL
  - File Name
  - Uploaded At
- Cover Image Upload:
  - URL
  - File Name
  - Uploaded At
- Theme (Light/Dark/Auto)
- Font Family
- Custom CSS (textarea)
- Custom Domain
- Domain Verification Status
- White Label (boolean)
- Hide Powered By (boolean)
- Custom Email Domain

**Total**: 17 fields

---

### Step 7: Features Config ⚙️
**Type**: `features_config`

**Fields** (from FeaturesConfig interface):

**A) Attendance**:
- Enabled
- Methods (Manual/QR/Biometric/Face Recognition)
- Auto Mark Absent
- Grace Time Minutes
- Allow Self Check-in

**B) Fee Management**:
- Enabled
- Online Payments
- Installment Support
- Late Fee Enabled
- Late Fee Percentage
- Due Date Reminders
- Payment Gateways (Razorpay/Stripe/Paytm/PhonePe)

**C) Messaging**:
- Enabled
- Channels (SMS/WhatsApp/Email/Push/In-App)
- Bulk Messaging
- Template Management
- Scheduled Messaging
- Auto Reminders

**D) Analytics**:
- Enabled
- Realtime Dashboard
- Custom Reports
- Export Enabled
- Data Retention Days
- Predictive Analytics

**E) Mobile App**:
- Enabled
- Student App
- Parent App
- Staff App
- Custom Branding
- Push Notifications

**F) Library** (if applicable):
- Book Management
- Issue/Return
- Reservations
- Fine Management
- Catalog Management

**G) CRM**:
- Enabled
- Lead Management
- Follow-up Reminders
- Conversion Tracking
- Campaign Management

**H) Reports**:
- Enabled
- Standard Reports (array)
- Custom Reports
- Scheduled Reports
- Report Sharing

**I) Integrations**:
- Enabled
- API Access
- Webhooks
- Third Party Apps
- SSO Enabled

**Total**: 50+ fields across 9 feature categories

---

### Step 8: Admin Setup 👤
**Type**: `admin_setup`

**Fields** (from AdminSetup interface):

**A) Primary Admin**:
- First Name
- Last Name
- Email
- Phone
- Password
- Confirm Password
- Role (Super Admin/Admin/Manager)
- Department
- Designation

**B) Additional Admins** (array):
- First Name
- Last Name
- Email
- Phone
- Role
- Permissions (array)

**C) Security Settings**:
- Two Factor Auth
- Password Policy (Standard/Strict/Custom)
- Session Timeout (minutes)
- IP Whitelist (array)
- Allow Remote Access

**Total**: 20+ fields

---

### Step 9: Verification 📄
**Type**: `verification`

**Fields** (from VerificationInfo interface):
- KYC Status
- KYC Verified At
- Business Verification Status
- Business Verified At
- Bank Verification Status
- Bank Verified At
- Document Uploads (array):
  - PAN Card
  - GST Certificate
  - Business License
  - Registration Certificate
  - Address Proof
  - Cancelled Cheque
  - Owner ID Proof
  - Incorporation Certificate
  - Tax Certificate
- Remarks
- Verified By (user info)

**Total**: 15+ fields

---

### Step 10: Review 📋
**Type**: `review`

**Fields**:
- Complete summary of ALL previous steps
- Agreements & Consents:
  - Terms Accepted
  - Terms Accepted At
  - Privacy Policy Accepted
  - Privacy Policy Accepted At
  - Data Processing Consent
  - Marketing Consent
  - SLA Accepted
  - SLA Accepted At
  - IP Address (captured)
  - User Agent (captured)
- Metadata:
  - Source (Website/Referral/Sales Team/Partner/Other)
  - Referral Code
  - Sales Rep ID
  - Partner Code
  - UTM Parameters
  - Notes
- Final Actions:
  - Create Tenant
  - Send Welcome Email
  - Grant Portal Access

**Total**: 20+ fields

---

## 📊 Summary

**Total Steps**: 10
**Total Fields**: 200+ fields
**Total Complexity**: VERY COMPREHENSIVE!

### Step Breakdown:
1. Business Info (16 fields)
2. Address Info (15 fields)
3. Plan Selection (40+ fields)
4. Billing Info (17 fields)
5. Bank Details (14 fields)
6. Customization (17 fields)
7. Features Config (50+ fields)
8. Admin Setup (20+ fields)
9. Verification (15+ fields)
10. Review (20+ fields)

---

## 🎯 Recommendation for Implementation

Given the massive scope (200+ fields), I recommend organizing as:

### **2-STEP WIZARD with 10 TABS**:

**STEP 1: Essential Setup** (5 tabs)
1. Business Info
2. Address Info
3. Plan Selection
4. Billing Info
5. Bank Details

**STEP 2: Advanced Configuration** (5 tabs)
6. Customization & Branding
7. Features Configuration
8. Admin & Team Setup
9. Verification & Documents
10. Review & Launch

---

## ✅ Corrected Understanding

You were right - the web-admin-portal has **10 STEPS**, not 9!

**Shall I build the complete 10-step onboarding now?**

