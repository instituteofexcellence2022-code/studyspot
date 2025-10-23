# Security & Audit System Guide

## 🛡️ Overview

Comprehensive security monitoring and audit trail system for StudySpot Library Management Platform.

## 📋 Features

### 1. **Audit Trail**
- Comprehensive logging of all system actions
- User activity tracking
- Resource access monitoring
- Compliance reporting

### 2. **Session Management**
- Active session tracking
- Multi-device session management
- Session expiration handling
- Remote session termination

### 3. **Security Monitoring**
- Failed login tracking
- Unauthorized access detection
- Suspicious activity alerts
- IP-based monitoring

### 4. **Data Access Logs**
- Sensitive data access tracking
- Export/download monitoring
- Compliance audit trails

---

## 🔍 Audit Event Types

### Authentication Events
- `login_success` - Successful login
- `login_failed` - Failed login attempt
- `logout` - User logout
- `password_changed` - Password update
- `password_reset` - Password reset

### User Management
- `user_created` - New user created
- `user_updated` - User information updated
- `user_deleted` - User deleted
- `role_changed` - User role modified

### Student Management
- `student_created` - New student added
- `student_updated` - Student information updated
- `student_deleted` - Student removed
- `kyc_verified` - KYC verification completed
- `bulk_import` - Bulk student import

### Financial Events
- `payment_created` - Payment recorded
- `invoice_generated` - GST invoice generated
- `expense_recorded` - Expense added

### Bookings
- `booking_created` - New booking made
- `booking_cancelled` - Booking cancelled

### Attendance
- `check_in` - Student checked in
- `check_out` - Student checked out

### Security Events
- `unauthorized_access` - Unauthorized access attempt
- `permission_denied` - Permission denied
- `suspicious_activity` - Suspicious activity detected

### Data Access
- `sensitive_data_accessed` - Sensitive data viewed
- `bulk_export` - Bulk data export

### System Events
- `settings_changed` - System settings modified
- `integration_configured` - Integration settings changed

---

## 📡 API Endpoints

### Get Audit Logs
```http
GET /api/audit/logs
```

**Query Parameters:**
- `event_type` - Filter by event type
- `user_id` - Filter by user
- `severity` - Filter by severity (info/warning/critical)
- `start_date` - Start date for filtering
- `end_date` - End date for filtering
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Example:**
```bash
GET /api/audit/logs?event_type=login_success&start_date=2024-01-01&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "event_type": "login_success",
      "user_id": 123,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "action": "login",
      "description": "User logged in: john@example.com",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "severity": "info",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Get Security Events
```http
GET /api/audit/security-events
```

Returns only security-related events (failed logins, unauthorized access, etc.)

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "event_type": "login_failed",
      "user_email": "attacker@example.com",
      "ip_address": "203.0.113.42",
      "severity": "warning",
      "created_at": "2024-01-15T15:20:00Z"
    }
  ]
}
```

### Get Audit Statistics
```http
GET /api/audit/statistics
```

**Query Parameters:**
- `library_id` - Filter by library
- `start_date` - Start date
- `end_date` - End date

**Example Response:**
```json
{
  "success": true,
  "data": {
    "by_event_type": [
      {
        "event_type": "login_success",
        "count": 1250,
        "unique_users": 45
      },
      {
        "event_type": "payment_created",
        "count": 320,
        "unique_users": 28
      }
    ],
    "by_severity": [
      {
        "severity": "info",
        "count": 5420
      },
      {
        "severity": "warning",
        "count": 85
      },
      {
        "severity": "critical",
        "count": 3
      }
    ],
    "most_active_users": [
      {
        "user_id": 12,
        "name": "John Doe",
        "email": "john@example.com",
        "action_count": 450
      }
    ]
  }
}
```

### Get User Sessions
```http
GET /api/audit/sessions
```

Returns active sessions for the current user.

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "session_token": "eyJhbGciOiJIUzI1NiIs...",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "created_at": "2024-01-15T09:00:00Z",
      "last_activity": "2024-01-15T14:30:00Z",
      "expires_at": "2024-01-16T09:00:00Z",
      "is_active": true
    }
  ]
}
```

### End Session
```http
DELETE /api/audit/sessions/:sessionToken
```

Terminates a specific session (useful for remote logout).

### Cleanup Expired Sessions
```http
POST /api/audit/sessions/cleanup
```

Manually trigger cleanup of expired sessions (admin only).

### Get Available Event Types
```http
GET /api/audit/event-types
```

Returns list of all available audit event types.

---

## 🔧 Using Audit Middleware

### Automatic Audit Logging

Import and use the audit middleware in your routes:

```javascript
const {
  auditStudentCreate,
  auditPaymentCreate,
  auditSettingsChange,
} = require('../middleware/auditMiddleware');

// Automatically log student creation
router.post('/students', 
  authenticate, 
  authorize(['admin', 'create_students']),
  auditStudentCreate(),  // Audit middleware
  async (req, res) => {
    // Your route logic
  }
);
```

### Manual Audit Logging

For custom audit events:

```javascript
const { logAudit, AUDIT_EVENTS } = require('../services/auditService');

// Log a custom event
await logAudit({
  event_type: AUDIT_EVENTS.SUSPICIOUS_ACTIVITY,
  user_id: req.user.id,
  action: 'attempted_unauthorized_access',
  description: 'User tried to access restricted resource',
  ip_address: req.ip,
  user_agent: req.get('user-agent'),
  metadata: {
    resource: '/api/admin/settings',
    method: 'POST',
  },
  severity: 'critical',
  library_id: req.user.library_id,
  tenant_id: req.user.tenant_id,
});
```

### Available Audit Middlewares

- `auditLogin()` - Login events
- `auditLogout()` - Logout events
- `auditStudentCreate()` - Student creation
- `auditStudentUpdate()` - Student updates
- `auditStudentDelete()` - Student deletion
- `auditPaymentCreate()` - Payment creation
- `auditInvoiceGenerate()` - Invoice generation
- `auditBookingCreate()` - Booking creation
- `auditSettingsChange()` - Settings changes
- `auditBulkImport()` - Bulk imports
- `auditBulkExport()` - Bulk exports
- `auditKYCVerification()` - KYC verification
- `auditRoleChange()` - Role changes

---

## 🔐 Session Management

### Creating Sessions

Sessions are automatically created during login:

```javascript
const { createSession } = require('../services/auditService');

const sessionResult = await createSession({
  user_id: user.id,
  session_token: jwtToken,
  ip_address: req.ip,
  user_agent: req.get('user-agent'),
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
});
```

### Ending Sessions

End a session when user logs out:

```javascript
const { endSession } = require('../services/auditService');

await endSession(sessionToken);
```

### Cleanup Expired Sessions

Run periodically (e.g., via cron job):

```javascript
const { cleanupExpiredSessions } = require('../services/auditService');

// Clean up every hour
setInterval(async () => {
  const result = await cleanupExpiredSessions();
  console.log(`Cleaned up ${result.cleaned} expired sessions`);
}, 60 * 60 * 1000);
```

---

## 📊 Database Schema

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    target_user_id INTEGER REFERENCES users(id),
    target_resource_type VARCHAR(50),
    target_resource_id INTEGER,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    severity VARCHAR(20) DEFAULT 'info',
    library_id INTEGER REFERENCES libraries(id),
    tenant_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);
```

### Security Events Table
```sql
CREATE TABLE security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    reason TEXT,
    metadata JSONB,
    severity VARCHAR(20) DEFAULT 'warning',
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 Best Practices

### 1. **What to Audit**
✅ **DO Audit:**
- Authentication events (login, logout)
- User/role changes
- Financial transactions
- Data exports
- Settings changes
- Permission changes
- Sensitive data access

❌ **DON'T Audit:**
- Read-only operations (unless sensitive)
- Health checks
- Static file requests
- Excessive detail on every API call

### 2. **Severity Levels**
- **info** - Normal operations (login, create, update)
- **warning** - Potentially sensitive (delete, export, role change)
- **critical** - Security events (unauthorized access, suspicious activity)

### 3. **Performance Considerations**
- Audit logging is asynchronous - won't block requests
- Use indexes on frequently queried columns
- Archive old logs periodically
- Consider separate audit database for high-volume systems

### 4. **Compliance**
- Retain audit logs for required period (90+ days)
- Include enough context for investigations
- Protect audit logs from tampering
- Regular review of security events

---

## 🚀 Usage Examples

### Example 1: Track Failed Login Attempts

```javascript
// In auth route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await authenticateUser(email, password);
  
  if (!user) {
    // Log failed login
    await logAudit({
      event_type: AUDIT_EVENTS.LOGIN_FAILED,
      action: 'login_failed',
      description: `Failed login attempt for: ${email}`,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      metadata: { email },
      severity: 'warning',
    });
    
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Log successful login
  await logAudit({
    event_type: AUDIT_EVENTS.LOGIN_SUCCESS,
    user_id: user.id,
    action: 'login',
    description: `User logged in: ${email}`,
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
    library_id: user.library_id,
    tenant_id: user.tenant_id,
  });
  
  // Create session
  await createSession({
    user_id: user.id,
    session_token: jwtToken,
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
});
```

### Example 2: Detect Suspicious Bulk Exports

```javascript
router.get('/students/export', authenticate, async (req, res) => {
  // Log bulk export
  await logAudit({
    event_type: AUDIT_EVENTS.BULK_EXPORT,
    user_id: req.user.id,
    action: 'export_students',
    description: `User exported ${count} student records`,
    metadata: {
      export_type: 'students',
      record_count: count,
      filters: req.query,
    },
    severity: 'warning',  // Bulk exports are sensitive
    library_id: req.user.library_id,
    tenant_id: req.user.tenant_id,
  });
  
  // Generate and send CSV
  res.csv(students);
});
```

### Example 3: Monitor Settings Changes

```javascript
router.put('/settings', authenticate, authorize(['admin']), async (req, res) => {
  const oldSettings = await getSettings();
  const newSettings = await updateSettings(req.body);
  
  // Log settings change
  await logAudit({
    event_type: AUDIT_EVENTS.SETTINGS_CHANGED,
    user_id: req.user.id,
    action: 'update_settings',
    description: 'System settings updated',
    metadata: {
      old_values: oldSettings,
      new_values: newSettings,
      changed_keys: Object.keys(req.body),
    },
    severity: 'warning',
    library_id: req.user.library_id,
    tenant_id: req.user.tenant_id,
  });
  
  res.json({ success: true });
});
```

---

## 🔧 Maintenance

### Archive Old Logs

```sql
-- Archive logs older than 90 days (info level only)
SELECT archive_old_audit_logs(90);
```

### Cleanup Expired Sessions

```sql
-- Clean up expired sessions
SELECT cleanup_expired_sessions();
```

### Monitor Critical Events

```sql
-- Get recent critical events
SELECT * FROM audit_logs 
WHERE severity = 'critical' 
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 📈 Reporting

### Daily Activity Summary

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE severity = 'critical') as critical_events,
  COUNT(*) FILTER (WHERE severity = 'warning') as warnings
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Most Active Users

```sql
SELECT * FROM user_activity_summary
ORDER BY total_actions DESC
LIMIT 10;
```

### Security Event Trends

```sql
SELECT 
  DATE(created_at) as date,
  event_type,
  COUNT(*) as occurrences
FROM security_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, occurrences DESC;
```

---

## 🛡️ Security Considerations

1. **Access Control**
   - Only admins can view audit logs
   - Users can only view their own sessions
   - Audit logs should be tamper-proof

2. **Data Retention**
   - Keep audit logs for compliance period
   - Archive old logs for long-term storage
   - Securely delete when no longer needed

3. **Performance**
   - Use indexes for common queries
   - Archive/partition old data
   - Async logging to avoid blocking

4. **Privacy**
   - Don't log sensitive data (passwords, tokens)
   - Anonymize where appropriate
   - Comply with data protection regulations

---

## 📝 Notes

- All timestamps are stored in UTC
- IP addresses support both IPv4 and IPv6
- Metadata is stored as JSONB for flexibility
- Sessions auto-expire based on `expires_at`
- Failed login tracking can be used for rate limiting

---

For more information, see the [API Documentation](/api/docs) or contact support.








