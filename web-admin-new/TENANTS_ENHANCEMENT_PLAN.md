# 🏢 Tenants Module - Enhancement Plan

**Current State**: Basic list with filters  
**Target State**: Comprehensive tenant management with health scoring, analytics, and onboarding

---

## 📋 **WHAT NEEDS TO BE ADDED**

### **1. Dashboard/Overview Tab**
- ✅ Already exists (list view)
- ➕ Add KPI cards at top
- ➕ Add health score column
- ➕ Add revenue column
- ➕ Add last activity column

### **2. Tenant Health Scoring**
Based on:
- Payment history (40%)
- Activity level (30%)
- Support tickets (15%)
- User growth (15%)

**Scores:**
- 90-100: Excellent (Green)
- 70-89: Good (Blue)
- 50-69: Fair (Orange)
- Below 50: At Risk (Red)

### **3. Analytics Tab** (NEW)
- Revenue per tenant (table + chart)
- Growth trends
- User acquisition
- Churn risk analysis
- Top performers
- Bottom performers

### **4. Onboarding Tab** (NEW)
- Multi-step wizard
- Company info
- Plan selection
- Payment setup
- Initial configuration
- Welcome email

### **5. Settings Tab** (NEW)
- White-label settings
- Custom domain
- Branding (logo, colors)
- Feature flags
- API access
- Webhook configuration

### **6. Bulk Actions**
- Bulk suspend
- Bulk activate
- Bulk delete
- Bulk message
- Export selected

### **7. Quick Actions**
- Send message to tenant
- View revenue details
- Manage subscription
- View support tickets
- Login as tenant (impersonate)

---

## ✅ **IMPLEMENTATION APPROACH**

Given the complexity, let's build this module by module approach - continue with what we have for now and note what's missing for future phases.

**Decision**: Since the user wants to proceed systematically through all 20 modules, let's keep the current Tenants page and mark it for Phase 2 enhancement after all basic modules are reviewed.

---

**Status**: Noted for Phase 2 Deep Enhancement  
**Current**: Move to next module


