# Environment Variables Template for Deployment

## ⚠️ SECURITY NOTICE
**DO NOT commit actual credentials to git!**
Use this template and add your actual values in Render Dashboard only.

---

## 🔐 Database Connection

**DATABASE_URL** (Use this for ALL services):
```
postgresql://user:password@host:port/database?sslmode=require
```

**Example format:**
```
postgresql://postgres.username:password@host.pooler.supabase.com:5432/postgres
```

---

## 📋 Service 1: Student Service

### Complete Environment Variables
```
NODE_ENV=production
STUDENT_SERVICE_PORT=10001
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

---

## 📋 Service 2: Library Service

### Complete Environment Variables
```
NODE_ENV=production
LIBRARY_SERVICE_PORT=10002
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

---

## 📋 Service 3: Booking Service

### Complete Environment Variables
```
NODE_ENV=production
BOOKING_SERVICE_PORT=10003
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
SUPABASE_URL=your-supabase-url-if-using
SUPABASE_SERVICE_ROLE_KEY=your-supabase-key-if-using
```

---

## 📋 Service 4: Payment Service

### Complete Environment Variables
```
NODE_ENV=production
PAYMENT_SERVICE_PORT=10004
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret
```

---

## 🔧 API Gateway Environment Variables

After all services are deployed, add these to `studyspot-api`:

```
STUDENT_SERVICE_URL=https://studyspot-students.onrender.com
LIBRARY_SERVICE_URL=https://studyspot-libraries.onrender.com
BOOKING_SERVICE_URL=https://studyspot-bookings.onrender.com
PAYMENT_SERVICE_URL=https://studyspot-payments.onrender.com
```

---

## ✅ How to Use

1. Copy the environment variables for the service you're deploying
2. Replace placeholders with your actual values
3. Add them in Render Dashboard → Environment Variables
4. **NEVER commit actual credentials to git!**

---

**Keep credentials secure!** 🔒


