# 🔌 STUDYSPOT Platform - API Specifications

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [User Management APIs](#user-management-apis)
4. [Library Management APIs](#library-management-apis)
5. [Booking System APIs](#booking-system-apis)
6. [Payment Processing APIs](#payment-processing-apis)
7. [Communication APIs](#communication-apis)
8. [Analytics APIs](#analytics-apis)
9. [File Management APIs](#file-management-apis)
10. [Real-time APIs](#real-time-apis)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)
13. [API Versioning](#api-versioning)

## 🎯 API Overview

### Base URL
```
Production: https://api.studyspot.com/v1
Staging: https://staging-api.studyspot.com/v1
Development: https://dev-api.studyspot.com/v1
```

### API Standards
- **RESTful Design**: Following REST principles
- **JSON Format**: All requests and responses in JSON
- **HTTPS Only**: All communications encrypted
- **API Versioning**: URL-based versioning (/v1/, /v2/)
- **Pagination**: Cursor-based pagination for large datasets
- **Filtering**: Query parameter-based filtering
- **Sorting**: Query parameter-based sorting

### Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    },
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "errors": []
}
```

### Error Response Format
```json
{
  "success": false,
  "data": null,
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input data",
      "field": "email",
      "details": "Email format is invalid"
    }
  ]
}
```

---

## 🔐 Authentication & Authorization

### Authentication Endpoints

#### POST /auth/login
**Description**: User login with email/password or social login

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "loginType": "email" // "email" | "google" | "facebook" | "linkedin"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student",
      "tenantId": "tenant_456"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

#### POST /auth/register
**Description**: User registration

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "student",
  "tenantId": "tenant_456"
}
```

#### POST /auth/refresh
**Description**: Refresh access token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
**Description**: User logout

**Headers**:
```
Authorization: Bearer <access_token>
```

#### POST /auth/forgot-password
**Description**: Request password reset

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
**Description**: Reset password with token

**Request Body**:
```json
{
  "token": "reset_token_123",
  "newPassword": "newpassword123"
}
```

### Authorization Headers
```
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id> (for multi-tenant requests)
```

---

## 👥 User Management APIs

### User Profile Endpoints

#### GET /users/profile
**Description**: Get current user profile

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "student",
    "status": "active",
    "kycStatus": "verified",
    "profileImage": "https://s3.amazonaws.com/...",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /users/profile
**Description**: Update user profile

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "profileImage": "base64_encoded_image"
}
```

#### POST /users/upload-document
**Description**: Upload KYC documents

**Request Body** (multipart/form-data):
```
file: <file>
documentType: "aadhaar" | "pan" | "passport" | "driving_license"
```

#### GET /users/kyc-status
**Description**: Get KYC verification status

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "verified", // "pending" | "verified" | "rejected"
    "documents": [
      {
        "type": "aadhaar",
        "status": "verified",
        "uploadedAt": "2024-01-10T00:00:00Z"
      }
    ]
  }
}
```

### User Management (Admin)

#### GET /admin/users
**Description**: Get all users with filtering and pagination

**Query Parameters**:
```
page: 1
limit: 20
search: "john"
role: "student"
status: "active"
sortBy: "createdAt"
sortOrder: "desc"
```

#### GET /admin/users/:userId
**Description**: Get specific user details

#### PUT /admin/users/:userId
**Description**: Update user details

#### DELETE /admin/users/:userId
**Description**: Deactivate user account

---

## 🏢 Library Management APIs

### Library Endpoints

#### GET /libraries
**Description**: Get all libraries with filtering

**Query Parameters**:
```
page: 1
limit: 20
search: "library name"
city: "Mumbai"
amenities: "wifi,ac"
priceRange: "100-500"
sortBy: "distance"
latitude: 19.0760
longitude: 72.8777
radius: 10
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "lib_123",
      "name": "StudyHub Library",
      "address": "123 Main Street, Mumbai",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "capacity": 100,
      "amenities": ["wifi", "ac", "parking"],
      "pricing": {
        "hourly": 50,
        "daily": 300,
        "monthly": 5000
      },
      "rating": 4.5,
      "reviewCount": 120,
      "images": ["https://s3.amazonaws.com/..."],
      "isOpen": true,
      "currentOccupancy": 45
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

#### GET /libraries/:libraryId
**Description**: Get specific library details

#### POST /libraries
**Description**: Create new library (Admin only)

**Request Body**:
```json
{
  "name": "New Study Library",
  "address": "456 Oak Street, Mumbai",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "capacity": 80,
  "amenities": ["wifi", "ac", "parking", "cafeteria"],
  "pricing": {
    "hourly": 60,
    "daily": 350,
    "monthly": 6000
  },
  "description": "Modern study space with all amenities",
  "images": ["base64_encoded_image1", "base64_encoded_image2"]
}
```

#### PUT /libraries/:libraryId
**Description**: Update library details

#### DELETE /libraries/:libraryId
**Description**: Delete library (Admin only)

### Seat Management

#### GET /libraries/:libraryId/seats
**Description**: Get all seats for a library

**Query Parameters**:
```
date: "2024-01-15"
zone: "quiet" | "group" | "general"
isAvailable: true
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "seat_123",
      "seatNumber": "A1",
      "zone": "quiet",
      "seatType": "desk",
      "isAvailable": true,
      "amenities": ["power_outlet", "lamp"],
      "location": {
        "floor": 1,
        "section": "A",
        "coordinates": {"x": 10, "y": 20}
      }
    }
  ]
}
```

#### POST /libraries/:libraryId/seats
**Description**: Create new seat (Admin only)

#### PUT /libraries/:libraryId/seats/:seatId
**Description**: Update seat details

#### DELETE /libraries/:libraryId/seats/:seatId
**Description**: Delete seat

---

## 💺 Booking System APIs

### Booking Endpoints

#### GET /bookings/availability
**Description**: Check seat availability

**Query Parameters**:
```
libraryId: "lib_123"
date: "2024-01-15"
startTime: "09:00"
endTime: "17:00"
zone: "quiet"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "availableSeats": [
      {
        "seatId": "seat_123",
        "seatNumber": "A1",
        "zone": "quiet",
        "price": 50
      }
    ],
    "totalAvailable": 15,
    "timeSlots": [
      {
        "startTime": "09:00",
        "endTime": "12:00",
        "availableSeats": 10
      },
      {
        "startTime": "12:00",
        "endTime": "17:00",
        "availableSeats": 8
      }
    ]
  }
}
```

#### POST /bookings
**Description**: Create new booking

**Request Body**:
```json
{
  "libraryId": "lib_123",
  "seatId": "seat_456",
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "bookingType": "daily", // "hourly" | "daily" | "monthly"
  "paymentMethod": "online" // "online" | "offline"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_789",
    "status": "confirmed",
    "totalAmount": 300,
    "paymentRequired": true,
    "paymentUrl": "https://payment.studyspot.com/...",
    "qrCode": "data:image/png;base64,...",
    "checkInCode": "ABC123"
  }
}
```

#### GET /bookings
**Description**: Get user's bookings

**Query Parameters**:
```
page: 1
limit: 20
status: "confirmed" | "cancelled" | "completed"
dateFrom: "2024-01-01"
dateTo: "2024-01-31"
```

#### GET /bookings/:bookingId
**Description**: Get specific booking details

#### PUT /bookings/:bookingId
**Description**: Update booking (modify time, extend, etc.)

#### DELETE /bookings/:bookingId
**Description**: Cancel booking

#### POST /bookings/:bookingId/checkin
**Description**: Check-in to library

**Request Body**:
```json
{
  "qrCode": "ABC123",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  }
}
```

#### POST /bookings/:bookingId/checkout
**Description**: Check-out from library

### Waitlist Management

#### POST /bookings/waitlist
**Description**: Join waitlist for full time slots

#### GET /bookings/waitlist
**Description**: Get user's waitlist entries

#### DELETE /bookings/waitlist/:waitlistId
**Description**: Remove from waitlist

---

## 💰 Payment Processing APIs

### Payment Endpoints

#### POST /payments/create-order
**Description**: Create payment order

**Request Body**:
```json
{
  "bookingId": "booking_789",
  "amount": 300,
  "currency": "INR",
  "paymentMethod": "razorpay", // "razorpay" | "stripe"
  "customerDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "orderId": "order_123",
    "paymentId": "pay_456",
    "amount": 300,
    "currency": "INR",
    "status": "created",
    "paymentUrl": "https://checkout.razorpay.com/...",
    "expiresAt": "2024-01-15T11:00:00Z"
  }
}
```

#### POST /payments/verify
**Description**: Verify payment

**Request Body**:
```json
{
  "paymentId": "pay_456",
  "orderId": "order_123",
  "signature": "razorpay_signature"
}
```

#### GET /payments/history
**Description**: Get payment history

**Query Parameters**:
```
page: 1
limit: 20
status: "success" | "failed" | "pending"
dateFrom: "2024-01-01"
dateTo: "2024-01-31"
```

#### POST /payments/refund
**Description**: Process refund

**Request Body**:
```json
{
  "paymentId": "pay_456",
  "amount": 300,
  "reason": "cancellation"
}
```

### Subscription Management

#### GET /subscriptions
**Description**: Get subscription plans

#### POST /subscriptions
**Description**: Subscribe to a plan

#### PUT /subscriptions/:subscriptionId
**Description**: Update subscription

#### DELETE /subscriptions/:subscriptionId
**Description**: Cancel subscription

---

## 📞 Communication APIs

### Notification Endpoints

#### GET /notifications
**Description**: Get user notifications

**Query Parameters**:
```
page: 1
limit: 20
type: "booking" | "payment" | "system"
isRead: false
```

#### PUT /notifications/:notificationId/read
**Description**: Mark notification as read

#### PUT /notifications/read-all
**Description**: Mark all notifications as read

#### GET /notifications/preferences
**Description**: Get notification preferences

#### PUT /notifications/preferences
**Description**: Update notification preferences

**Request Body**:
```json
{
  "email": {
    "bookingUpdates": true,
    "paymentAlerts": true,
    "promotional": false
  },
  "push": {
    "bookingUpdates": true,
    "paymentAlerts": true,
    "promotional": false
  },
  "sms": {
    "bookingUpdates": false,
    "paymentAlerts": true,
    "promotional": false
  }
}
```

### Messaging Endpoints

#### POST /messages/send
**Description**: Send message to library

**Request Body**:
```json
{
  "libraryId": "lib_123",
  "subject": "Issue with seat",
  "message": "The seat A1 is not working properly",
  "category": "maintenance",
  "attachments": ["base64_encoded_image"]
}
```

#### GET /messages
**Description**: Get user's messages

#### GET /messages/:messageId
**Description**: Get specific message

#### POST /messages/:messageId/reply
**Description**: Reply to message

---

## 📊 Analytics APIs

### User Analytics

#### GET /analytics/dashboard
**Description**: Get user dashboard analytics

**Response**:
```json
{
  "success": true,
  "data": {
    "totalBookings": 25,
    "totalHours": 120,
    "favoriteLibrary": {
      "id": "lib_123",
      "name": "StudyHub Library",
      "bookings": 15
    },
    "monthlyStats": [
      {
        "month": "2024-01",
        "bookings": 8,
        "hours": 40,
        "amount": 2400
      }
    ],
    "studyPatterns": {
      "preferredTime": "09:00-17:00",
      "preferredDays": ["Monday", "Tuesday", "Wednesday"],
      "averageSession": 4.5
    }
  }
}
```

#### GET /analytics/study-time
**Description**: Get study time analytics

#### GET /analytics/performance
**Description**: Get performance metrics

### Library Analytics (Admin)

#### GET /admin/analytics/overview
**Description**: Get library overview analytics

#### GET /admin/analytics/revenue
**Description**: Get revenue analytics

#### GET /admin/analytics/occupancy
**Description**: Get occupancy analytics

#### GET /admin/analytics/users
**Description**: Get user analytics

---

## 📁 File Management APIs

### File Upload Endpoints

#### POST /files/upload
**Description**: Upload file

**Request Body** (multipart/form-data):
```
file: <file>
type: "profile_image" | "document" | "issue_attachment"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "fileId": "file_123",
    "fileName": "profile.jpg",
    "fileSize": 1024000,
    "fileType": "image/jpeg",
    "url": "https://s3.amazonaws.com/studyspot/files/...",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /files/:fileId
**Description**: Get file details

#### DELETE /files/:fileId
**Description**: Delete file

### Document Management

#### GET /documents
**Description**: Get user documents

#### POST /documents
**Description**: Upload document

#### PUT /documents/:documentId
**Description**: Update document

#### DELETE /documents/:documentId
**Description**: Delete document

---

## 🔄 Real-time APIs

### WebSocket Endpoints

#### WebSocket Connection
```
wss://api.studyspot.com/v1/ws?token=<access_token>
```

#### Real-time Events

##### Seat Availability Updates
```json
{
  "type": "seat_availability_update",
  "data": {
    "libraryId": "lib_123",
    "seatId": "seat_456",
    "isAvailable": false,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

##### Booking Status Updates
```json
{
  "type": "booking_status_update",
  "data": {
    "bookingId": "booking_789",
    "status": "confirmed",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

##### Payment Status Updates
```json
{
  "type": "payment_status_update",
  "data": {
    "paymentId": "pay_456",
    "status": "success",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

##### Notification Updates
```json
{
  "type": "notification",
  "data": {
    "id": "notif_123",
    "title": "Booking Confirmed",
    "message": "Your booking for StudyHub Library is confirmed",
    "type": "booking",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### WebSocket Subscriptions

#### Subscribe to Library Updates
```json
{
  "action": "subscribe",
  "channel": "library:lib_123"
}
```

#### Subscribe to User Updates
```json
{
  "action": "subscribe",
  "channel": "user:user_123"
}
```

#### Unsubscribe
```json
{
  "action": "unsubscribe",
  "channel": "library:lib_123"
}
```

---

## ❌ Error Handling

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| AUTHENTICATION_ERROR | Authentication failed |
| AUTHORIZATION_ERROR | Insufficient permissions |
| RESOURCE_NOT_FOUND | Requested resource not found |
| RESOURCE_CONFLICT | Resource already exists |
| PAYMENT_ERROR | Payment processing failed |
| BOOKING_ERROR | Booking operation failed |
| RATE_LIMIT_EXCEEDED | Too many requests |
| INTERNAL_ERROR | Internal server error |

### Error Response Examples

#### Validation Error
```json
{
  "success": false,
  "data": null,
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input data",
      "field": "email",
      "details": "Email format is invalid"
    }
  ]
}
```

#### Authentication Error
```json
{
  "success": false,
  "data": null,
  "errors": [
    {
      "code": "AUTHENTICATION_ERROR",
      "message": "Invalid credentials",
      "details": "Email or password is incorrect"
    }
  ]
}
```

#### Resource Not Found
```json
{
  "success": false,
  "data": null,
  "errors": [
    {
      "code": "RESOURCE_NOT_FOUND",
      "message": "Library not found",
      "details": "Library with ID 'lib_123' does not exist"
    }
  ]
}
```

---

## 🚦 Rate Limiting

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Rate Limits by Endpoint

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| Booking | 10 requests | 1 minute |
| Payment | 5 requests | 1 minute |
| File Upload | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| Search | 20 requests | 1 minute |

### Rate Limit Response
```json
{
  "success": false,
  "data": null,
  "errors": [
    {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Too many requests",
      "details": "Rate limit exceeded. Try again in 60 seconds."
    }
  ]
}
```

---

## 🔄 API Versioning

### Version Strategy
- **URL Versioning**: `/v1/`, `/v2/`
- **Header Versioning**: `API-Version: 1.0`
- **Backward Compatibility**: Maintained for at least 12 months
- **Deprecation Notice**: 6 months advance notice

### Version Headers
```
API-Version: 1.0
Accept: application/vnd.studyspot.v1+json
```

### Version Lifecycle
1. **Development**: Alpha version for internal testing
2. **Beta**: Beta version for limited external testing
3. **Stable**: Production-ready version
4. **Deprecated**: Version marked for removal
5. **Retired**: Version no longer supported

---

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: Available at `/docs`
- **Postman Collection**: Available for download
- **OpenAPI Spec**: Available at `/openapi.json`

### SDKs and Libraries
- **JavaScript/Node.js**: `@studyspot/api-client`
- **Python**: `studyspot-python-sdk`
- **PHP**: `studyspot-php-sdk`
- **Java**: `studyspot-java-sdk`

### Testing Tools
- **Postman Collection**: Pre-configured requests
- **Insomnia**: API testing workspace
- **curl Examples**: Command-line examples
- **Mock Server**: Available for development

---

**Document Version**: 1.0.0  
**Last Updated**: [Current Date]  
**API Version**: v1.0  
**Next Review**: [Next Review Date]







































