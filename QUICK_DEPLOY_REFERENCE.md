# 🚀 Quick Deploy Reference Card

## ⚡ TL;DR - Deploy in 15 Minutes

### Step 1: Deploy API to Render (5 min)
1. Go to: https://dashboard.render.com
2. New → Web Service → Select `studyspot` repo
3. Configure:
   - Root Directory: `api`
   - Build: `npm install`
   - Start: `node src/index-unified.js`
4. Add environment variables (copy from `api/.env`)
5. Deploy!

### Step 2: Deploy Frontend to Vercel (3 min)
1. Go to: https://vercel.com/dashboard
2. New Project → Import `studyspot` repo
3. Configure:
   - Root Directory: `web`
   - Framework: Create React App
4. Add env var: `REACT_APP_API_URL=<your-render-url>`
5. Deploy!

### Step 3: Test (2 min)
- Visit your Vercel URL
- Register + Login
- ✅ Done!

---

## 🔑 Your Environment Variables

### For Render (API)

**⚠️ IMPORTANT:** Copy ALL values from your local `api/.env` file!

The format is:

```env
NODE_ENV=production
PORT=10000

DATABASE_URL=<your-supabase-connection-string>

UPSTASH_REDIS_REST_URL=<your-upstash-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>

JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
ENCRYPTION_KEY=<your-encryption-key>
SESSION_SECRET=<your-session-secret>

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

BREVO_API_KEY=<your-brevo-api-key>
BREVO_SENDER_EMAIL=<your-brevo-sender-email>
```

**💡 TIP:** Open `api/.env` in your editor and copy/paste each value into Render!

### For Vercel (Frontend)
```env
REACT_APP_API_URL=https://studyspot-api.onrender.com
```
*(Replace with your actual Render URL)*

---

## 🔗 Important Links

| Service | Dashboard | Docs |
|---------|-----------|------|
| **Render** | [dashboard.render.com](https://dashboard.render.com) | [docs.render.com](https://docs.render.com) |
| **Vercel** | [vercel.com/dashboard](https://vercel.com/dashboard) | [vercel.com/docs](https://vercel.com/docs) |
| **Supabase** | [supabase.com/dashboard](https://supabase.com/dashboard) | [supabase.com/docs](https://supabase.com/docs) |
| **GitHub** | [github.com](https://github.com/instituteofexcellence2022-code/studyspot) | - |

---

## ✅ Deployment Checklist

**Render (API):**
- [ ] Service created
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables added (12 total)
- [ ] Deployment successful
- [ ] Health check: `https://your-api.onrender.com/health`

**Vercel (Frontend):**
- [ ] Project imported
- [ ] Build settings configured
- [ ] API URL environment variable set
- [ ] Deployment successful
- [ ] Site accessible
- [ ] Login/Register works

---

## 🧪 Quick Tests

### Test API
```bash
# Health check
curl https://your-api.onrender.com/health

# Should return:
{"status":"healthy","timestamp":"..."}
```

### Test Frontend
1. Visit your Vercel URL
2. Click "Register"
3. Fill in details
4. Submit
5. Login with credentials
6. ✅ Success!

---

## 🆘 Troubleshooting

**API won't start?**
→ Check Render logs for errors
→ Verify all env vars are set
→ Test database connection string

**Frontend can't connect?**
→ Check REACT_APP_API_URL is correct
→ Verify API health endpoint works
→ Check browser console

**Database errors?**
→ Verify Supabase password
→ Check connection string format
→ Run migrations: `node api/run-migrations.js`

---

## 📞 Support

**Full guide:** Read `DEPLOY_NOW.md`
**Security details:** Read `GIT_HISTORY_CLEANED.md`
**Complete summary:** Read `GIT_CLEANUP_COMPLETE.md`

---

## 🎯 Expected Timeline

| Task | Time |
|------|------|
| Render API Setup | 5 min |
| Vercel Frontend Setup | 3 min |
| Testing | 2 min |
| **Total** | **~10-15 min** |

---

**🎉 Ready? Start with Render!**

Go to: https://dashboard.render.com

Good luck! 🚀

