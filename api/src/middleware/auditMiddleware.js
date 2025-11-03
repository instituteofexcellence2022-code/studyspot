/**
 * Audit Middleware
 * Automatically logs important actions
 */

const { logAudit, AUDIT_EVENTS } = require('../services/auditService');

/**
 * Middleware to automatically log API requests
 */
function auditLogger(options = {}) {
  const {
    eventType,
    action,
    getDescription,
    getMetadata,
    getTargetResourceId,
    getTargetResourceType,
    severity = 'info',
  } = options;

  return async (req, res, next) => {
    // Capture original send function
    const originalSend = res.send;

    // Override send to log after response
    res.send = function (data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log audit event asynchronously (don't block response)
        setImmediate(() => {
          const auditData = {
            event_type: typeof eventType === 'function' ? eventType(req, res) : eventType,
            user_id: req.user?.id,
            action: typeof action === 'function' ? action(req, res) : action,
            description: getDescription ? getDescription(req, res) : `${req.method} ${req.path}`,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            metadata: getMetadata ? getMetadata(req, res, data) : undefined,
            target_resource_type: getTargetResourceType ? getTargetResourceType(req, res) : undefined,
            target_resource_id: getTargetResourceId ? getTargetResourceId(req, res, data) : undefined,
            severity,
            library_id: req.user?.library_id,
            tenant_id: req.user?.tenant_id,
          };

          logAudit(auditData).catch(err => {
            console.error('Error logging audit event:', err);
          });
        });
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Audit specific actions
 */

// Login audit
function auditLogin() {
  return auditLogger({
    eventType: AUDIT_EVENTS.LOGIN_SUCCESS,
    action: 'login',
    getDescription: (req) => `User logged in: ${req.body.email}`,
    getMetadata: (req) => ({
      email: req.body.email,
      login_method: req.body.login_method || 'password',
    }),
  });
}

// Logout audit
function auditLogout() {
  return auditLogger({
    eventType: AUDIT_EVENTS.LOGOUT,
    action: 'logout',
    getDescription: (req) => `User logged out`,
  });
}

// Student creation audit
function auditStudentCreate() {
  return auditLogger({
    eventType: AUDIT_EVENTS.STUDENT_CREATED,
    action: 'create_student',
    getDescription: (req, res) => `Created student: ${req.body.name}`,
    getTargetResourceType: () => 'student',
    getTargetResourceId: (req, res, data) => {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        return parsedData?.data?.id;
      } catch {
        return null;
      }
    },
    getMetadata: (req) => ({
      student_name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    }),
  });
}

// Student update audit
function auditStudentUpdate() {
  return auditLogger({
    eventType: AUDIT_EVENTS.STUDENT_UPDATED,
    action: 'update_student',
    getDescription: (req) => `Updated student ID: ${req.params.id}`,
    getTargetResourceType: () => 'student',
    getTargetResourceId: (req) => req.params.id,
    getMetadata: (req) => ({
      updated_fields: Object.keys(req.body),
    }),
  });
}

// Student deletion audit
function auditStudentDelete() {
  return auditLogger({
    eventType: AUDIT_EVENTS.STUDENT_DELETED,
    action: 'delete_student',
    getDescription: (req) => `Deleted student ID: ${req.params.id}`,
    getTargetResourceType: () => 'student',
    getTargetResourceId: (req) => req.params.id,
    severity: 'warning',
  });
}

// Payment creation audit
function auditPaymentCreate() {
  return auditLogger({
    eventType: AUDIT_EVENTS.PAYMENT_CREATED,
    action: 'create_payment',
    getDescription: (req) => `Payment created: ₹${req.body.amount}`,
    getTargetResourceType: () => 'payment',
    getTargetResourceId: (req, res, data) => {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        return parsedData?.data?.id;
      } catch {
        return null;
      }
    },
    getMetadata: (req) => ({
      amount: req.body.amount,
      payment_method: req.body.payment_method,
      student_id: req.body.student_id,
    }),
  });
}

// Invoice generation audit
function auditInvoiceGenerate() {
  return auditLogger({
    eventType: AUDIT_EVENTS.INVOICE_GENERATED,
    action: 'generate_invoice',
    getDescription: (req) => `Invoice generated`,
    getTargetResourceType: () => 'invoice',
    getMetadata: (req) => ({
      customer_name: req.body.customer_name,
      total_amount: req.body.total_amount,
      gst_amount: req.body.gst_amount,
    }),
  });
}

// Booking creation audit
function auditBookingCreate() {
  return auditLogger({
    eventType: AUDIT_EVENTS.BOOKING_CREATED,
    action: 'create_booking',
    getDescription: (req) => `Booking created`,
    getTargetResourceType: () => 'booking',
    getTargetResourceId: (req, res, data) => {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        return parsedData?.data?.id;
      } catch {
        return null;
      }
    },
    getMetadata: (req) => ({
      student_id: req.body.student_id,
      seat_id: req.body.seat_id,
      plan_id: req.body.plan_id,
    }),
  });
}

// Settings change audit
function auditSettingsChange() {
  return auditLogger({
    eventType: AUDIT_EVENTS.SETTINGS_CHANGED,
    action: 'update_settings',
    getDescription: (req) => `System settings updated`,
    getMetadata: (req) => ({
      changed_settings: Object.keys(req.body),
    }),
    severity: 'warning',
  });
}

// Bulk import audit
function auditBulkImport() {
  return auditLogger({
    eventType: AUDIT_EVENTS.BULK_IMPORT,
    action: 'bulk_import',
    getDescription: (req) => `Bulk import: ${req.body.type}`,
    getMetadata: (req, res, data) => {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        return {
          import_type: req.body.type,
          records_imported: parsedData?.data?.imported_count || 0,
          records_failed: parsedData?.data?.failed_count || 0,
        };
      } catch {
        return { import_type: req.body.type };
      }
    },
    severity: 'info',
  });
}

// Bulk export audit
function auditBulkExport() {
  return auditLogger({
    eventType: AUDIT_EVENTS.BULK_EXPORT,
    action: 'bulk_export',
    getDescription: (req) => `Bulk export: ${req.query.type || 'data'}`,
    getMetadata: (req) => ({
      export_type: req.query.type,
      filters: req.query,
    }),
    severity: 'info',
  });
}

// KYC verification audit
function auditKYCVerification() {
  return auditLogger({
    eventType: AUDIT_EVENTS.KYC_VERIFIED,
    action: 'verify_kyc',
    getDescription: (req) => `KYC verified for student ID: ${req.params.id}`,
    getTargetResourceType: () => 'student',
    getTargetResourceId: (req) => req.params.id,
    getMetadata: (req) => ({
      verification_status: req.body.status,
      documents_verified: req.body.documents,
    }),
    severity: 'info',
  });
}

// Role change audit
function auditRoleChange() {
  return auditLogger({
    eventType: AUDIT_EVENTS.ROLE_CHANGED,
    action: 'change_role',
    getDescription: (req) => `User role changed`,
    getTargetResourceType: () => 'user',
    getTargetResourceId: (req) => req.params.id,
    getMetadata: (req) => ({
      new_role: req.body.role,
      new_permissions: req.body.permissions,
    }),
    severity: 'warning',
  });
}

module.exports = {
  auditLogger,
  auditLogin,
  auditLogout,
  auditStudentCreate,
  auditStudentUpdate,
  auditStudentDelete,
  auditPaymentCreate,
  auditInvoiceGenerate,
  auditBookingCreate,
  auditSettingsChange,
  auditBulkImport,
  auditBulkExport,
  auditKYCVerification,
  auditRoleChange,
};








