# Quick Deployment Reference - Copy & Paste

## 🚀 Service 1: Student Service

### Render Configuration
```
Name: studyspot-students
Environment: Node
Region: Oregon
Branch: main
Root Directory: (empty)

Build Command: cd backend && npm install && npm run build
Start Command: cd backend && npm run start:student
```

### Environment Variables (Copy All)
```
NODE_ENV=production
STUDENT_SERVICE_PORT=10001
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
DATABASE_URL=your-database-connection-string-here
```

**Service URL after deployment**: `https://studyspot-students.onrender.com`

---

## 🚀 Service 2: Library Service

### Render Configuration
```
Name: studyspot-libraries
Environment: Node
Region: Oregon
Branch: main
Root Directory: (empty)

Build Command: cd backend && npm install && npm run build
Start Command: cd backend && npm run start:library
```

### Environment Variables (Copy All)
```
NODE_ENV=production
LIBRARY_SERVICE_PORT=10002
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
DATABASE_URL=your-database-connection-string-here
```

**Service URL after deployment**: `https://studyspot-libraries.onrender.com`

---

## 🚀 Service 3: Booking Service

### Render Configuration
```
Name: studyspot-bookings
Environment: Node
Region: Oregon
Branch: main
Root Directory: (empty)

Build Command: cd backend && npm install && npm run build
Start Command: cd backend && npm run start:booking
```

### Environment Variables (Copy All)
```
NODE_ENV=production
BOOKING_SERVICE_PORT=10003
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
DATABASE_URL=your-database-connection-string-here
SUPABASE_URL=your-supabase-url-if-using
SUPABASE_SERVICE_ROLE_KEY=your-supabase-key-if-using
```

**Service URL after deployment**: `https://studyspot-bookings.onrender.com`

---

## 🚀 Service 4: Payment Service

### Render Configuration
```
Name: studyspot-payments
Environment: Node
Region: Oregon
Branch: main
Root Directory: (empty)

Build Command: cd backend && npm install && npm run build
Start Command: cd backend && npm run start:payment
```

### Environment Variables (Copy All)
```
NODE_ENV=production
PAYMENT_SERVICE_PORT=10004
CORS_ORIGIN=https://studyspot-rose.vercel.app,https://studyspot-librarys.vercel.app,https://studyspot-admin-2.vercel.app,https://studyspot-student.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:3002,https://main.studyspot-student.pages.dev,https://studyspot-student.netlify.app
DATABASE_URL=your-database-connection-string-here
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret
```

**Service URL after deployment**: `https://studyspot-payments.onrender.com`

---

## 🔧 After All Services Deployed

### Update API Gateway Environment Variables

Go to: Render Dashboard → `studyspot-api` → Environment → Add these:

```
STUDENT_SERVICE_URL=https://studyspot-students.onrender.com
LIBRARY_SERVICE_URL=https://studyspot-libraries.onrender.com
BOOKING_SERVICE_URL=https://studyspot-bookings.onrender.com
PAYMENT_SERVICE_URL=https://studyspot-payments.onrender.com
```

### Restart API Gateway
After adding variables, restart: `studyspot-api` → Manual Deploy → Deploy latest commit

---

## ✅ Quick Health Check Commands

```bash
# Test each service
curl https://studyspot-students.onrender.com/health
curl https://studyspot-libraries.onrender.com/health
curl https://studyspot-bookings.onrender.com/health
curl https://studyspot-payments.onrender.com/health

# Test through API Gateway
curl https://studyspot-api.onrender.com/api/v1/students
curl https://studyspot-api.onrender.com/api/fee-plans
```

---

**Start with Student Service!** 🎯

