# 🚀 Booking Service - Setup & Testing Guide

## ✅ What's Been Implemented

### 1. **Complete Booking Microservice**
   - ✅ Full CRUD operations (Create, Read, Update, Delete)
   - ✅ Real-time WebSocket notifications
   - ✅ Supabase/PostgreSQL integration
   - ✅ Mock data mode for development
   - ✅ Pagination and filtering
   - ✅ API Gateway routing

### 2. **Files Created/Modified**
   - ✅ `backend/src/services/booking-service/index.ts` - Complete service
   - ✅ `backend/src/services/api-gateway/routes.ts` - Added booking routes
   - ✅ `backend/package.json` - Added `start:booking` script
   - ✅ `web-owner/src/pages/booking/BookingsPage.tsx` - Updated with mock data

---

## 🔧 How to Start the Booking Service

### Option 1: Locally (Development)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Start the booking service
npm run start:booking
```

The service will start on **Port 3007** and run in **mock mode** (no database needed for testing).

### Option 2: With Database (Production)

Add to `.env`:
```bash
BOOKING_SERVICE_PORT=3007
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
```

Then start:
```bash
npm run start:booking
```

---

## 📡 Testing the Booking Service

### 1. **Health Check**
```bash
curl http://localhost:3007/health
```

**Expected Response:**
```json
{
  "service": "booking-service",
  "status": "healthy",
  "timestamp": "2024-11-04T...",
  "database": "mock"
}
```

### 2. **Get All Bookings**
```bash
curl http://localhost:3007/api/v1/bookings
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "studentName": "Rajesh Kumar",
      "libraryName": "Central Study Hub",
      "status": "confirmed",
      "totalAmount": 500
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 1,
    "total": 1,
    "totalPages": 1
  }
}
```

### 3. **Create New Booking**
```bash
curl -X POST http://localhost:3007/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "library_id": "lib456",
    "start_time": "2024-11-05T09:00:00Z",
    "end_time": "2024-11-05T12:00:00Z",
    "total_amount": 500,
    "status": "pending"
  }'
```

---

## 🌐 Frontend Integration

### Owner Portal - Already Integrated!

The Owner Portal's Bookings Page (`web-owner/src/pages/booking/BookingsPage.tsx`) is ready to use:

**Current Behavior:**
- ✅ Shows mock data if API fails
- ✅ Real-time updates when connected
- ✅ Beautiful UI with status chips
- ✅ Connection status indicator

**Once Backend is Running:**
- Will automatically fetch real bookings
- Real-time notifications will work
- All WebSocket events active

### Student Portal - Can Also Use

```typescript
// In Student Portal
import { BookingService } from '../services/bookingService';

const bookingService = new BookingService();
const response = await bookingService.getBookings({ userId: currentUser.id });
```

---

## 🔴 Real-time Events

When booking service is running, it automatically emits:

| Event | When | Who Receives |
|-------|------|--------------|
| `booking:created` | New booking | Student, Library Owner, All Owners |
| `booking:updated` | Status changes | Student, Library Owner |
| `booking:cancelled` | Cancellation | Student, Library Owner |

**These events are already handled in:**
- ✅ Owner Portal Dashboard
- ✅ Owner Portal Bookings Page
- ✅ Student Portal (Phase 2)

---

## 🗄️ Database Setup (Optional)

If you want to use real database instead of mock data:

### Create Bookings Table in Supabase:
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  library_id UUID NOT NULL REFERENCES libraries(id),
  seat_id UUID REFERENCES seats(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_library ON bookings(library_id);
CREATE INDEX idx_bookings_status ON bookings(status);
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/bookings` | Get all bookings |
| `GET` | `/api/v1/bookings/:id` | Get one booking |
| `POST` | `/api/v1/bookings` | Create booking |
| `PUT` | `/api/v1/bookings/:id` | Update booking |
| `PATCH` | `/api/v1/bookings/:id/cancel` | Cancel booking |
| `DELETE` | `/api/v1/bookings/:id` | Delete booking |
| `GET` | `/api/v1/bookings/user/:userId` | User's bookings |
| `GET` | `/api/v1/bookings/library/:libraryId` | Library's bookings |

---

## 🚀 Deployment to Render

### 1. Add Booking Service to Render

**Blueprint (`render.yaml`):**
```yaml
services:
  - type: web
    name: studyspot-booking-service
    env: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm run start:booking
    envVars:
      - key: BOOKING_SERVICE_PORT
        value: 3007
      - key: NODE_ENV
        value: production
```

### 2. Update API Gateway Environment
Add to Auth Service (main backend) environment variables:
```
BOOKING_SERVICE_URL=https://studyspot-booking-service.onrender.com
```

### 3. Test via Gateway
```bash
curl https://studyspot-api.onrender.com/api/bookings
```

---

## ✅ Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Booking Service Code | ✅ Complete | Fully implemented |
| API Gateway Routes | ✅ Complete | `/api/bookings*` routes added |
| Real-time Events | ✅ Complete | Socket.io integration |
| Mock Data Mode | ✅ Working | No database needed |
| Frontend Integration | ✅ Complete | Owner Portal ready |
| Deployment Script | ✅ Complete | `npm run start:booking` |
| Database Schema | ✅ Documented | Optional Supabase setup |
| Testing Guide | ✅ Complete | This document |

---

## 🎯 Next Steps

### To Use Mock Data (No Setup Required):
1. Start booking service: `npm run start:booking`
2. Start Owner Portal: `npm start`
3. View bookings - shows mock data
4. Real-time updates work for new bookings

### To Use Real Data:
1. Setup Supabase database table
2. Add environment variables
3. Start booking service
4. Frontend automatically switches to real data

### To Deploy:
1. Add booking service to Render
2. Update API Gateway URL
3. Frontend works without changes

---

## 💡 Tips

- **Mock mode is perfect for development** - no database setup needed
- **Real-time events work in both modes** - test WebSocket features immediately
- **Frontend is smart** - automatically falls back to mock data if API fails
- **Owner Portal shows "Demo Data" badge** - clear indication of mode

---

## 🎉 Summary

**The Booking Service is FULLY IMPLEMENTED and ready to use!**

- ✅ Complete REST API (9 endpoints)
- ✅ Real-time WebSocket notifications  
- ✅ Mock mode for instant testing
- ✅ Database support for production
- ✅ API Gateway integration
- ✅ Frontend already connected
- ✅ Deployment ready

**Start it now and see it working!** 🚀

```bash
cd backend
npm run start:booking
```

Then open Owner Portal and navigate to Bookings page! 📊

