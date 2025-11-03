# 🎨 CUSTOM CREDIT PLANS FEATURE

**Added:** October 30, 2025  
**Status:** ✅ Implemented (Types, Mock Data, API)  
**Purpose:** Create personalized credit plans for any credit type combination

---

## 🎯 **WHY CUSTOM PLANS?**

### **Problem:**
- Pre-defined packages don't fit all tenant needs
- Library A needs only SMS (for bookings)
- Library B needs only Email (for newsletters)
- Library C needs custom SMS:WhatsApp ratio (3:1)
- Enterprise tenants need tailored plans

### **Solution:**
✅ **Single-Type Plans:** SMS-only, WhatsApp-only, Email-only  
✅ **Mixed Plans:** Any combination of SMS/WhatsApp/Email  
✅ **Tenant-Specific:** Create plans for individual tenants  
✅ **Template Plans:** Reusable templates for common patterns  
✅ **Price Calculator:** Auto-calculate wholesale/retail/profit  

---

## 💳 **CUSTOM PLAN TYPES**

### **1. SMS-Only Plans** 📱
Perfect for libraries focused on booking confirmations

**Examples:**
- **SMS Only - 500:** ₹125 (40% margin)
- **SMS Only - 1,000:** ₹240 (37.5% margin, 4% discount)

**Use Cases:**
- Seat booking confirmations
- Payment reminders
- OTP/2FA authentication
- Urgent notifications

---

### **2. WhatsApp-Only Plans** 💬
For libraries using WhatsApp for engagement

**Examples:**
- **WhatsApp Only - 500:** ₹75 (33.3% margin)

**Use Cases:**
- Student engagement
- Library announcements
- Event reminders
- Two-way customer support

---

### **3. Email-Only Plans** 📧
For newsletter and marketing-heavy users

**Examples:**
- **Email Only - 2,000:** ₹100 (60% margin)
- **Email Only - 5,000:** ₹225 (55.6% margin, 10% discount)

**Use Cases:**
- Monthly newsletters
- Marketing campaigns
- Invoice/receipt delivery
- Bulk announcements

---

### **4. Mixed/Custom Plans** 🎨
Any combination for specific needs

**Examples:**
- **Mumbai Library Mix:** 800 SMS + 400 WhatsApp + 1,600 Email = ₹375
- **Bangalore SMS Focus:** 1,500 SMS + 200 WhatsApp + 500 Email = ₹450

**Use Cases:**
- Tenant-specific requirements
- Usage pattern optimization
- Cost optimization
- Enterprise custom deals

---

## 📊 **MOCK DATA - 7 CUSTOM PLANS**

### **Single-Type Templates (5):**
1. SMS-500: ₹125
2. SMS-1000: ₹240
3. WhatsApp-500: ₹75
4. Email-2000: ₹100
5. Email-5000: ₹225

### **Tenant-Specific (2):**
6. Mumbai Library: 800+400+1600 = ₹375
7. Bangalore Study: 1500+200+500 = ₹450

---

## 🔧 **API METHODS ADDED**

### **1. Get All Custom Plans**
```typescript
creditsService.getCustomPlans()
// Returns all 7 custom plans
```

### **2. Get Plans by Type**
```typescript
creditsService.getCustomPlansByType('sms')
// Returns only SMS-only plans

creditsService.getCustomPlansByType('mixed')
// Returns only mixed plans
```

### **3. Get Tenant-Specific Plans**
```typescript
creditsService.getCustomPlansForTenant('1')
// Returns plans created for tenant ID 1 (Mumbai Library)
```

### **4. Price Calculator** 🧮
```typescript
creditsService.calculateCustomPlanPrice(
  1000, // SMS
  500,  // WhatsApp
  2000  // Email
  // Optional: discount %
)

// Returns:
{
  wholesaleCost: ₹240,
  retailValue: ₹400,
  suggestedPrice: ₹400,
  profitMargin: 40%
}
```

---

## 💰 **PRICING EXAMPLES**

### **SMS-Only Comparison:**
| Quantity | Wholesale | Retail | Price | Discount | Margin |
|----------|-----------|--------|-------|----------|--------|
| 500 | ₹75 | ₹125 | ₹125 | 0% | 40% |
| 1,000 | ₹150 | ₹250 | ₹240 | 4% | 37.5% |
| 2,000 | ₹300 | ₹500 | ₹450 | 10% | 33.3% |

### **Email-Only Comparison:**
| Quantity | Wholesale | Retail | Price | Discount | Margin |
|----------|-----------|--------|-------|----------|--------|
| 2,000 | ₹40 | ₹100 | ₹100 | 0% | 60% |
| 5,000 | ₹100 | ₹250 | ₹225 | 10% | 55.6% |
| 10,000 | ₹200 | ₹500 | ₹400 | 20% | 50% |

---

## 🎨 **CUSTOM PLAN BUILDER UI** (To Be Built)

### **Step 1: Select Credit Type**
```
┌─────────────────────────────────────────┐
│ Choose Credit Type:                     │
│ ○ SMS Only                              │
│ ○ WhatsApp Only                         │
│ ○ Email Only                            │
│ ● Custom Mix (Multiple types)           │
└─────────────────────────────────────────┘
```

### **Step 2: Set Quantities**
```
┌─────────────────────────────────────────┐
│ SMS Credits:         [1000] credits     │
│ WhatsApp Credits:    [500 ] credits     │
│ Email Credits:       [2000] credits     │
│                                          │
│ 💰 Live Calculator:                     │
│ ├─ Wholesale Cost:   ₹240               │
│ ├─ Retail Value:     ₹400               │
│ ├─ Discount:         [5]%               │
│ ├─ Final Price:      ₹380               │
│ └─ Profit Margin:    36.8% ✅           │
└─────────────────────────────────────────┘
```

### **Step 3: Configure Details**
```
┌─────────────────────────────────────────┐
│ Plan Name:     [SMS Heavy Package]      │
│ Description:   [For booking confirmations] │
│ Validity:      [90] days                │
│ Tenant:        [Select Tenant ▼]        │
│ Is Template:   ☑ Can be reused         │
│                                          │
│ [Cancel]          [Create Plan →]       │
└─────────────────────────────────────────┘
```

---

## 📋 **ADMIN USE CASES**

### **Use Case 1: Create SMS-Only Plan**
**Scenario:** Library needs only SMS for seat bookings

**Steps:**
1. Select "SMS Only"
2. Set quantity: 1,000 SMS
3. System calculates: ₹250 retail, ₹150 wholesale
4. Apply 4% discount → ₹240 final
5. Save as template

**Result:** 37.5% profit margin

---

### **Use Case 2: Tenant-Specific Plan**
**Scenario:** Mumbai Library has unique usage pattern

**Steps:**
1. Select tenant: "Central Library Mumbai"
2. Analyze usage history
3. Create custom mix: 800+400+1600
4. Apply 5% loyalty discount
5. Set 120-day validity
6. Save (not as template)

**Result:** Custom plan for specific tenant

---

### **Use Case 3: Promotional Plan**
**Scenario:** Holiday special offer

**Steps:**
1. Clone "Mini Top-Up"
2. Add 20% extra credits
3. Keep same price (₹99)
4. Set 30-day validity
5. Mark as promotional

**Result:** Time-limited offer

---

## 🎯 **BUSINESS BENEFITS**

### **For StudySpot:**
✅ **Flexibility:** Serve any tenant need  
✅ **Higher Margins:** Single-type plans = better margins  
✅ **Competitive Edge:** No competitor offers this  
✅ **Enterprise Deals:** Close big contracts with custom plans  
✅ **Upsell Opportunities:** Start simple, add complexity  

### **For Tenants:**
✅ **Pay for What You Need:** No wasted credits  
✅ **Cost Optimization:** Buy only required types  
✅ **Perfect Fit:** Plans match usage patterns  
✅ **Scalability:** Start small, grow custom  
✅ **Budget Control:** Precise spending  

---

## 📈 **PROFIT MARGIN ANALYSIS**

### **Single-Type Plans (Best Margins!):**
- **SMS-Only:** 37.5-40% margin
- **WhatsApp-Only:** 33.3% margin  
- **Email-Only:** 55.6-60% margin ⭐ BEST!

### **Mixed Plans:**
- Depends on ratio
- Typically 35-45% margin
- Better than bulk packages (0.38%)

### **Why Email-Only Has Highest Margin:**
```
Wholesale: ₹0.02 per email
Retail: ₹0.05 per email
Markup: ₹0.03 (150% profit!)
```

---

## 🔮 **FUTURE ENHANCEMENTS**

1. **AI-Powered Recommendations**
   - Analyze tenant usage
   - Suggest optimal custom plan
   - "You use 70% SMS, consider SMS-Only plan"

2. **Usage-Based Auto-Plans**
   - Monitor consumption for 30 days
   - Auto-generate perfect custom plan
   - One-click purchase

3. **Bulk Custom Plans**
   - Create multiple custom plans at once
   - Upload CSV with tenant-specific plans
   - Batch apply

4. **Dynamic Pricing**
   - Adjust margins based on quantity
   - Seasonal pricing
   - Loyalty-based discounts

5. **Plan Comparison Tool**
   - Compare custom vs pre-defined
   - Show savings calculator
   - Recommend best option

---

## ✅ **IMPLEMENTATION STATUS**

### **Completed:**
- [x] TypeScript types (`CustomCreditPlan`, `CreditPlanBuilder`)
- [x] Mock data (7 custom plans)
- [x] API methods (get, filter, calculate)
- [x] Price calculator function
- [x] Documentation

### **To Be Built (Phase 14 Pages):**
- [ ] Custom Plan Builder UI (Page 5)
- [ ] Plan list with filters
- [ ] Price calculator widget
- [ ] Tenant-specific view
- [ ] Template management

---

## 💡 **KEY INSIGHTS**

### **1. Email-Only Plans = Highest Profit**
With 60% margin, email-only plans are the most profitable!

### **2. Single-Type > Mixed**
Single-type plans typically have better margins than mixed plans.

### **3. Custom > Bulk Packages**
Custom plans (35-60% margin) >>> Bulk packages (0.38%)

### **4. Flexibility = Competitive Advantage**
No other platform offers this level of customization!

---

## 🚀 **READY TO BUILD UI!**

All backend logic, types, and mock data are ready.  
Next: Build the Custom Plan Builder in Page 5 of Phase 14!

**Just say "continue" to build the UI!** 🎨

