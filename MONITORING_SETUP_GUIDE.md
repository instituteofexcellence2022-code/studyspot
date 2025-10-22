# 🔍 MONITORING SETUP GUIDE

**Service**: Better Stack (FREE)  
**Time**: 10 minutes  
**Cost**: $0/month  

---

## 🎯 **WHY MONITORING?**

Monitor your deployed application to:
- ✅ Get alerts if API goes down
- ✅ Track uptime percentage
- ✅ Keep Render API awake (free tier sleeps after 15 min)
- ✅ Monitor response times
- ✅ Get notified of issues before users complain

---

## 📋 **SETUP STEPS**

### **Step 1: Create Better Stack Account** (2 minutes)

1. Go to: https://betterstack.com/uptime
2. Click "Start Free Trial"
3. Sign up with email or GitHub
4. Verify email
5. ✅ Account created!

---

### **Step 2: Create Uptime Monitor for API** (3 minutes)

1. **In Better Stack Dashboard**:
   - Click "Create Monitor"
   - Or go to: https://uptime.betterstack.com/team/{your-team}/monitors/new

2. **Configure Monitor**:
   ```
   Monitor Type: HTTP(s)
   Name: StudySpot API Health
   URL: https://studyspot-api.onrender.com/health
   Check Interval: Every 3 minutes
   Request Method: GET
   Expected Status Code: 200
   Request Timeout: 30 seconds
   ```

3. **Add Keyword Check** (optional):
   ```
   Expected Keyword in Response: "status"
   ```

4. **Configure Alerts**:
   ```
   Email Notifications: ON
   Your Email: [your email]
   Alert When: Down for 1 minute
   ```

5. Click **"Create Monitor"**

✅ **API monitoring active!**

---

### **Step 3: Create Uptime Monitor for Web** (2 minutes)

1. **Create Second Monitor**:
   ```
   Monitor Type: HTTP(s)
   Name: StudySpot Web App
   URL: https://studyspot.vercel.app
   Check Interval: Every 5 minutes
   Request Method: GET
   Expected Status Code: 200
   ```

2. **Configure Alerts**:
   ```
   Email Notifications: ON
   Alert When: Down for 2 minutes
   ```

3. Click **"Create Monitor"**

✅ **Web monitoring active!**

---

### **Step 4: Optional - Status Page** (3 minutes)

Create a public status page for users:

1. Go to Status Pages section
2. Click "Create Status Page"
3. Configure:
   ```
   Name: StudySpot Status
   Subdomain: studyspot (gets studyspot.betteruptime.com)
   Add Monitors: 
   - StudySpot API Health
   - StudySpot Web App
   ```

4. Customize colors and logo (optional)

5. Click "Create"

6. **Share URL**: `https://studyspot.betteruptime.com`

✅ **Public status page live!**

---

## 📊 **WHAT YOU GET (FREE TIER)**

### **Included**:
- ✅ 10 monitors
- ✅ 3-minute check intervals
- ✅ Email alerts
- ✅ SMS alerts (limited)
- ✅ Incident management
- ✅ Public status page
- ✅ 30-day data retention
- ✅ Uptime reports

### **Benefits**:
- Know immediately if app goes down
- Automatic recovery detection
- Performance tracking
- Keep API awake 24/7 (pings every 3 min)

---

## 🚨 **ALERT SETUP**

When you get an alert email:

1. **Check the error**:
   - Open Better Stack dashboard
   - View incident details
   - Check response time/status code

2. **Quick fixes**:
   - If Render API sleeping: Wait 30 seconds, it'll wake up
   - If actually down: Check Render logs
   - If web down: Check Vercel deployment

3. **Mark as resolved**:
   - Better Stack auto-resolves when service is back
   - Add incident notes if needed

---

## 📈 **VIEWING REPORTS**

### **Uptime Reports**:
1. Go to Monitors
2. Click on a monitor
3. View:
   - Uptime percentage (target: >99%)
   - Response times (target: <500ms)
   - Incident history
   - Downtime duration

### **Weekly Email Reports**:
- Automatically sent every Monday
- Shows uptime %, incidents, avg response time
- No configuration needed

---

## ⚙️ **ADVANCED (OPTIONAL)**

### **Webhook Alerts** (for Slack/Discord):
```
1. Go to Monitor settings
2. Add Webhook Integration
3. Enter webhook URL
4. Get notifications in Slack/Discord
```

### **Custom Headers**:
```
If API requires authentication:
1. Edit monitor
2. Add Custom Headers
3. Example: Authorization: Bearer YOUR_TOKEN
```

### **Maintenance Windows**:
```
Schedule maintenance to pause alerts:
1. Go to Maintenance Windows
2. Create window
3. Select monitors to pause
4. Set duration
```

---

## ✅ **MONITORING CHECKLIST**

After setup, verify:

- [ ] API monitor active and green
- [ ] Web monitor active and green
- [ ] Email alerts configured
- [ ] Test alert (click "Test" on monitor)
- [ ] Received test email
- [ ] Status page accessible (if created)
- [ ] Check interval is 3-5 minutes

---

## 🎯 **EXPECTED RESULTS**

### **Normal State**:
```
✅ Both monitors GREEN (up)
✅ Response times: API <500ms, Web <200ms
✅ Uptime: >99%
✅ No alerts
```

### **If API Sleeps (Render Free Tier)**:
```
⚠️ First ping after sleep: ~30 seconds (yellow/timeout)
✅ Next ping: <200ms (green)
✅ This is NORMAL for free tier
✅ Monitoring keeps it awake!
```

### **If Actually Down**:
```
🔴 Monitor shows RED
📧 Email alert received
🔧 Check Render/Vercel logs
🔧 Check deployment status
📝 Document incident
```

---

## 🆘 **TROUBLESHOOTING**

### **False Positives**:
- Increase timeout to 60 seconds
- Increase check interval to 5 minutes
- Verify URL is correct

### **Too Many Alerts**:
- Adjust "Alert after" to 2-3 consecutive failures
- Use alert grouping
- Set quiet hours if needed

### **Monitor Not Updating**:
- Check internet connection
- Verify monitor is active
- Check rate limits (shouldn't hit on free tier)

---

## 💰 **COST**

**Free Tier**: 
- 10 monitors
- Unlimited team members
- Email + limited SMS alerts
- Perfect for StudySpot!

**Paid Plans** (if you need more):
- Pro: $18/month (30 monitors, more features)
- Team: $49/month (unlimited monitors)

---

## ✅ **SUCCESS!**

After setup, you have:
- ✅ 24/7 monitoring
- ✅ Instant alerts if down
- ✅ API stays awake (no 15-min sleep)
- ✅ Performance tracking
- ✅ Public status page
- ✅ All FREE!

---

## 📊 **ALTERNATIVE SERVICES**

If you prefer different tools:

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **Better Stack** | 10 monitors | Recommended ✅ |
| UptimeRobot | 50 monitors | More monitors |
| Pingdom | 1 monitor | Enterprise features |
| StatusCake | 10 monitors | Simple setup |
| Freshping | 50 monitors | Team collaboration |

All are good, Better Stack has best UX!

---

## 🚀 **NEXT STEPS**

1. ✅ Set up monitoring (10 min)
2. ✅ Wait 24 hours
3. ✅ Check uptime report
4. ✅ Adjust if needed

**You now have enterprise-grade monitoring for FREE!** 🎉

---

**Setup Time**: 10 minutes  
**Cost**: $0/month  
**Value**: Priceless for peace of mind! ✨



