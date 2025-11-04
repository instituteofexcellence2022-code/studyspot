# 📧 SETUP RESEND EMAIL SERVICE

## 🎯 **WHAT YOU'LL GET**

- ✅ **3,000 free emails per month**
- ✅ Professional email notifications
- ✅ Password reset emails
- ✅ Booking confirmations
- ✅ User registration emails
- ✅ 99.9% delivery rate
- ✅ Simple API, no SMTP hassle

---

## ⚡ **STEP 1: CREATE RESEND ACCOUNT (2 minutes)**

### **A. Sign Up**
1. Go to: https://resend.com
2. Click **"Start Building"** or **"Sign Up"**
3. Sign up with:
   - **GitHub** (fastest - 1 click) ← Recommended
   - **Google**
   - **Email**

### **B. Verify Email**
- Check your email for verification link
- Click to verify
- You'll be redirected to Resend dashboard

---

## 🔑 **STEP 2: GET API KEY (1 minute)**

### **A. Create API Key**
1. You should see the Resend dashboard
2. Click **"API Keys"** (left sidebar)
3. Click **"Create API Key"** button

### **B. Configure API Key**
Fill in:
```
Name: StudySpot Production
Permission: Full Access (Sending access)
Domain: (leave default for now)
```

### **C. Copy API Key**
1. Click **"Create"**
2. You'll see your API key: `re_xxxxxxxxxx`
3. **IMPORTANT:** Copy it immediately (you won't see it again!)
4. It looks like: `re_AbCdEfGh123456789`

---

## ⚙️ **STEP 3: ADD TO RENDER (1 minute)**

### **A. Go to Render Environment**
1. Render Dashboard: https://dashboard.render.com
2. Click on **`studyspot-api`**
3. Click **"Environment"** tab

### **B. Add Email Environment Variables**

Click **"Add Environment Variable"** for each:

#### **Variable 1: Email Provider**
```
Key:   EMAIL_PROVIDER
Value: resend
```

#### **Variable 2: Resend API Key**
```
Key:   RESEND_API_KEY
Value: re_xxxxxxxxxx
```
(Paste the API key you copied)

#### **Variable 3: From Email**
```
Key:   FROM_EMAIL
Value: noreply@studyspot.com
```
(Or use: onboarding@resend.dev for testing)

#### **Variable 4: From Name**
```
Key:   FROM_NAME
Value: StudySpot
```

### **C. Save Changes**
1. Click **"Save Changes"**
2. Backend will auto-redeploy (2-3 minutes)
3. Wait for "Live" status

---

## ✅ **STEP 4: VERIFY IT WORKS (2 minutes)**

### **A. Wait for Deployment**
- Render Dashboard → Events tab
- Wait for: "Deploy live"

### **B. Check Logs**
- Click **"Logs"** tab
- Look for:
  ```
  ✅ Email service configured: resend
  ✅ Available email providers: resend
  ```

### **C. Test Email Sending (Optional)**

**Method 1: Via API (if you have test endpoint)**
```bash
curl -X POST https://studyspot-api.onrender.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com","subject":"Test","text":"Hello from StudySpot!"}'
```

**Method 2: Via Resend Dashboard**
1. Resend Dashboard → **Emails**
2. Click **"Send Test Email"**
3. Enter your email
4. Click **"Send"**
5. Check your inbox (check spam too!)

---

## 📧 **WHAT EMAILS WILL BE SENT**

Once configured, your backend can send:

### **User Emails:**
- ✅ Welcome email (on registration)
- ✅ Email verification
- ✅ Password reset
- ✅ Profile update confirmation

### **Booking Emails:**
- ✅ Booking confirmation
- ✅ Booking reminder (1 day before)
- ✅ Booking cancellation
- ✅ Booking modification

### **Payment Emails:**
- ✅ Payment receipt
- ✅ Payment failed
- ✅ Refund confirmation

### **Admin Emails:**
- ✅ New user registration alert
- ✅ New booking notification
- ✅ System alerts

---

## 🎨 **BONUS: CUSTOM DOMAIN (Optional)**

Want to send from **your own domain** instead of `onboarding@resend.dev`?

### **If You Have a Domain:**

1. **Resend Dashboard** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `studyspot.com`
4. Add DNS records (Resend will show you what to add)
5. Verify domain
6. Update `FROM_EMAIL` to: `noreply@yourdomain.com`

**Benefits:**
- Professional sender address
- Better email deliverability
- No "via resend.dev" in email headers

---

## 📊 **RESEND FREE TIER LIMITS**

```
Emails per month: 3,000
Emails per day:   100
Recipients:       Unlimited
API requests:     Unlimited
Domains:          1 custom domain
Support:          Community
```

**Perfect for your needs!** ✅

---

## 🔍 **TROUBLESHOOTING**

### **Problem 1: API key not working**
**Solution:**
- Make sure you copied the full key (starts with `re_`)
- Check no extra spaces
- Create a new API key if needed

### **Problem 2: Emails going to spam**
**Solution:**
- Use `onboarding@resend.dev` for testing (whitelisted)
- Or set up custom domain with proper DNS records
- Add SPF, DKIM, DMARC records (Resend provides these)

### **Problem 3: Emails not sending**
**Solution:**
- Check Render logs for errors
- Verify `EMAIL_PROVIDER=resend` is set
- Check `RESEND_API_KEY` is correct
- Test in Resend dashboard first

---

## 📋 **QUICK CHECKLIST**

- [ ] Created Resend account
- [ ] Generated API key (re_xxx)
- [ ] Added EMAIL_PROVIDER=resend to Render
- [ ] Added RESEND_API_KEY to Render
- [ ] Added FROM_EMAIL to Render
- [ ] Added FROM_NAME to Render
- [ ] Saved changes in Render
- [ ] Waited for redeploy (2-3 min)
- [ ] (Optional) Tested email sending

---

## 🎯 **NEXT STEPS AFTER EMAIL**

Once emails are working:
1. **Sentry** - Error tracking (10 min)
2. **UptimeRobot** - Uptime monitoring (5 min)
3. **Cloudinary** - Image storage (15 min)
4. **Razorpay** - Payment gateway (15 min)

---

## 💬 **TELL ME YOUR STATUS**

Let me know where you are:

**A.** "Created account, got API key: re_xxx"  
→ Great! Now add to Render

**B.** "Added to Render, waiting for redeploy..."  
→ Perfect! Should be ready in 2-3 min

**C.** "Deployed! How do I test it?"  
→ I'll show you how

**D.** "Need help with: [issue]"  
→ I'll help troubleshoot

Let me know! 📧🚀

