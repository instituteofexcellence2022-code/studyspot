/**
 * Role Definitions for StudySpot Platform
 * Defines all roles and their associated permissions
 */

// ============================================
// ROLE TYPES
// ============================================

const ROLES = {
  // Platform-level roles
  SUPER_ADMIN: 'super_admin',
  PLATFORM_SUPPORT: 'platform_support',
  // Library-level roles (6 granular roles)
  LIBRARY_OWNER: 'library_owner',
  // Full access to library
  BRANCH_MANAGER: 'branch_manager',
  // Branch-level management
  FRONT_DESK_STAFF: 'front_desk_staff',
  // Daily operations & student interactions
  FACILITY_MANAGER: 'facility_manager',
  // Maintenance & facility management
  FINANCE_MANAGER: 'finance_manager',
  // Financial operations
  ANALYTICS_MANAGER: 'analytics_manager',
  // Data analysis & reporting

  // Student role
  STUDENT: 'student'
};

// ============================================
// PERMISSION DEFINITIONS
// ============================================

const PERMISSIONS = {
  // Dashboard
  'dashboard:view': 'View dashboard',
  'dashboard:view_all_branches': 'View all branches dashboard',
  'dashboard:view_revenue': 'View revenue metrics',
  'dashboard:view_analytics': 'View analytics',
  // Student Management
  'students:view': 'View students',
  'students:create': 'Create student accounts',
  'students:edit': 'Edit student profiles',
  'students:delete': 'Delete student accounts',
  'students:import': 'Bulk import students',
  'students:export': 'Export student data',
  'students:verify_kyc': 'Verify student KYC',
  'students:manage_groups': 'Manage student groups',
  'students:view_history': 'View student history',
  // Staff Management
  'staff:view': 'View staff',
  'staff:create': 'Create staff accounts',
  'staff:edit': 'Edit staff profiles',
  'staff:delete': 'Delete staff accounts',
  'staff:assign_roles': 'Assign staff roles',
  'staff:manage_shifts': 'Manage staff shifts',
  'staff:view_performance': 'View staff performance',
  'staff:manage_leaves': 'Manage staff leaves',
  // Attendance
  'attendance:view': 'View attendance',
  'attendance:mark': 'Mark attendance',
  'attendance:edit': 'Edit attendance records',
  'attendance:export': 'Export attendance data',
  'attendance:manage_overstay': 'Manage overstay alerts',
  // Fee & Payment
  'fees:view': 'View fee plans',
  'fees:create': 'Create fee plans',
  'fees:edit': 'Edit fee plans',
  'fees:delete': 'Delete fee plans',
  'payments:view': 'View payments',
  'payments:process': 'Process payments',
  'payments:refund': 'Process refunds',
  'payments:view_revenue': 'View revenue reports',
  'invoices:generate': 'Generate invoices',
  'invoices:view': 'View invoices',
  'expenses:manage': 'Manage expenses',
  // Seat & Space Management
  'seats:view': 'View seat layout',
  'seats:edit_layout': 'Edit seat layout',
  'seats:manage_zones': 'Manage zones',
  'seats:view_availability': 'View seat availability',
  'seats:configure_shifts': 'Configure shifts',
  // Bookings
  'bookings:view': 'View bookings',
  'bookings:create': 'Create bookings',
  'bookings:edit': 'Edit bookings',
  'bookings:cancel': 'Cancel bookings',
  'bookings:view_all': 'View all bookings',
  // Communication
  'communication:send_individual': 'Send individual messages',
  'communication:send_bulk': 'Send bulk messages',
  'communication:manage_templates': 'Manage message templates',
  'communication:view_history': 'View communication history',
  'communication:manage_campaigns': 'Manage campaigns',
  // Issues & Maintenance
  'issues:view': 'View issues',
  'issues:create': 'Create issues',
  'issues:assign': 'Assign issues',
  'issues:resolve': 'Resolve issues',
  'issues:manage_vendors': 'Manage vendors',
  'maintenance:schedule': 'Schedule maintenance',
  'maintenance:view_history': 'View maintenance history',
  // Resources
  'resources:view': 'View resources',
  'resources:upload': 'Upload resources',
  'resources:edit': 'Edit resources',
  'resources:delete': 'Delete resources',
  'resources:manage_categories': 'Manage resource categories',
  // Marketing
  'marketing:manage_referrals': 'Manage referral program',
  'marketing:manage_discounts': 'Manage discounts',
  'marketing:manage_campaigns': 'Manage marketing campaigns',
  'marketing:view_analytics': 'View marketing analytics',
  // Analytics
  'analytics:view_basic': 'View basic analytics',
  'analytics:view_advanced': 'View advanced analytics',
  'analytics:create_reports': 'Create custom reports',
  'analytics:export': 'Export analytics data',
  'analytics:view_predictions': 'View predictive analytics',
  // IoT & Smart Controls
  'iot:view_devices': 'View IoT devices',
  'iot:control_devices': 'Control IoT devices',
  'iot:manage_automation': 'Manage automation rules',
  'iot:view_energy': 'View energy consumption',
  // Multi-Branch
  'branches:view_all': 'View all branches',
  'branches:create': 'Create branches',
  'branches:edit': 'Edit branches',
  'branches:delete': 'Delete branches',
  'branches:view_analytics': 'View cross-branch analytics',
  // Subscription & Billing
  'subscription:view': 'View subscription details',
  'subscription:manage': 'Manage subscription',
  'subscription:view_invoices': 'View subscription invoices',
  // System Configuration
  'system:configure': 'Configure system settings',
  'system:manage_branding': 'Manage branding',
  'system:manage_security': 'Manage security settings',
  'system:manage_integrations': 'Manage integrations',
  'system:view_audit_logs': 'View audit logs',
  // Security
  'security:manage_mfa': 'Manage multi-factor authentication',
  'security:manage_sessions': 'Manage user sessions',
  'security:view_security_logs': 'View security logs'
};

// ============================================
// ROLE PERMISSIONS MAPPING
// ============================================

const ROLE_PERMISSIONS = {
  // Platform Super Admin - Full access to everything
  [ROLES.SUPER_ADMIN]: Object.keys(PERMISSIONS),
  // Library Owner - Full access to library features
  [ROLES.LIBRARY_OWNER]: [
  // Dashboard
  'dashboard:view', 'dashboard:view_all_branches', 'dashboard:view_revenue', 'dashboard:view_analytics',
  // Student Management - Full access
  'students:view', 'students:create', 'students:edit', 'students:delete', 'students:import', 'students:export', 'students:verify_kyc', 'students:manage_groups', 'students:view_history',
  // Staff Management - Full access
  'staff:view', 'staff:create', 'staff:edit', 'staff:delete', 'staff:assign_roles', 'staff:manage_shifts', 'staff:view_performance', 'staff:manage_leaves',
  // Attendance - Full access
  'attendance:view', 'attendance:mark', 'attendance:edit', 'attendance:export', 'attendance:manage_overstay',
  // Payments - Full access
  'fees:view', 'fees:create', 'fees:edit', 'fees:delete', 'payments:view', 'payments:process', 'payments:refund', 'payments:view_revenue', 'invoices:generate', 'invoices:view', 'expenses:manage',
  // Everything else - Full access
  'seats:view', 'seats:edit_layout', 'seats:manage_zones', 'seats:view_availability', 'seats:configure_shifts', 'bookings:view', 'bookings:create', 'bookings:edit', 'bookings:cancel', 'bookings:view_all', 'communication:send_individual', 'communication:send_bulk', 'communication:manage_templates', 'communication:view_history', 'communication:manage_campaigns', 'issues:view', 'issues:create', 'issues:assign', 'issues:resolve', 'issues:manage_vendors', 'maintenance:schedule', 'maintenance:view_history', 'resources:view', 'resources:upload', 'resources:edit', 'resources:delete', 'resources:manage_categories', 'marketing:manage_referrals', 'marketing:manage_discounts', 'marketing:manage_campaigns', 'marketing:view_analytics', 'analytics:view_basic', 'analytics:view_advanced', 'analytics:create_reports', 'analytics:export', 'analytics:view_predictions', 'iot:view_devices', 'iot:control_devices', 'iot:manage_automation', 'iot:view_energy', 'branches:view_all', 'branches:create', 'branches:edit', 'branches:delete', 'branches:view_analytics', 'subscription:view', 'subscription:manage', 'subscription:view_invoices', 'system:configure', 'system:manage_branding', 'system:manage_security', 'system:manage_integrations', 'system:view_audit_logs', 'security:manage_mfa', 'security:manage_sessions', 'security:view_security_logs'],
  // Branch Manager - Branch-level management
  [ROLES.BRANCH_MANAGER]: ['dashboard:view', 'dashboard:view_analytics', 'students:view', 'students:create', 'students:edit', 'students:import', 'students:export', 'students:verify_kyc', 'students:manage_groups', 'students:view_history', 'staff:view', 'staff:manage_shifts', 'staff:view_performance', 'staff:manage_leaves', 'attendance:view', 'attendance:mark', 'attendance:edit', 'attendance:export', 'attendance:manage_overstay', 'fees:view', 'payments:view', 'payments:process', 'invoices:view', 'seats:view', 'seats:view_availability', 'seats:configure_shifts', 'bookings:view', 'bookings:create', 'bookings:edit', 'bookings:cancel', 'bookings:view_all', 'communication:send_individual', 'communication:send_bulk', 'communication:view_history', 'issues:view', 'issues:create', 'issues:assign', 'issues:resolve', 'resources:view', 'resources:upload', 'marketing:manage_discounts', 'analytics:view_basic', 'analytics:view_advanced', 'analytics:export'],
  // Front Desk Staff - Daily operations
  [ROLES.FRONT_DESK_STAFF]: ['dashboard:view', 'students:view', 'students:create', 'students:edit', 'students:view_history', 'attendance:view', 'attendance:mark', 'attendance:export', 'payments:view', 'payments:process', 'invoices:view', 'seats:view', 'seats:view_availability', 'bookings:view', 'bookings:create', 'bookings:edit', 'bookings:cancel', 'communication:send_individual', 'communication:view_history', 'issues:view', 'issues:create', 'resources:view'],
  // Facility Manager - Maintenance & facilities
  [ROLES.FACILITY_MANAGER]: ['dashboard:view', 'seats:view', 'seats:edit_layout', 'seats:manage_zones', 'seats:view_availability', 'issues:view', 'issues:create', 'issues:assign', 'issues:resolve', 'issues:manage_vendors', 'maintenance:schedule', 'maintenance:view_history', 'iot:view_devices', 'iot:control_devices', 'iot:manage_automation', 'iot:view_energy', 'analytics:view_basic'],
  // Finance Manager - Financial operations
  [ROLES.FINANCE_MANAGER]: ['dashboard:view', 'dashboard:view_revenue', 'fees:view', 'fees:create', 'fees:edit', 'fees:delete', 'payments:view', 'payments:process', 'payments:refund', 'payments:view_revenue', 'invoices:generate', 'invoices:view', 'expenses:manage', 'subscription:view', 'subscription:manage', 'subscription:view_invoices', 'analytics:view_basic', 'analytics:view_advanced', 'analytics:export'],
  // Analytics Manager - Data analysis & reporting
  [ROLES.ANALYTICS_MANAGER]: ['dashboard:view', 'dashboard:view_all_branches', 'dashboard:view_analytics', 'students:view', 'students:export', 'attendance:view', 'attendance:export', 'payments:view', 'payments:view_revenue', 'bookings:view', 'bookings:view_all', 'analytics:view_basic', 'analytics:view_advanced', 'analytics:create_reports', 'analytics:export', 'analytics:view_predictions', 'marketing:view_analytics', 'branches:view_analytics'],
  // Student - Basic access
  [ROLES.STUDENT]: ['dashboard:view', 'seats:view', 'seats:view_availability', 'bookings:view', 'bookings:create', 'bookings:cancel', 'resources:view']
};

// ============================================
// ROLE HIERARCHY (for inheritance)
// ============================================

const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 10,
  [ROLES.LIBRARY_OWNER]: 9,
  [ROLES.BRANCH_MANAGER]: 8,
  [ROLES.FINANCE_MANAGER]: 7,
  [ROLES.ANALYTICS_MANAGER]: 7,
  [ROLES.FACILITY_MANAGER]: 6,
  [ROLES.FRONT_DESK_STAFF]: 5,
  [ROLES.STUDENT]: 1
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a role has a specific permission
 */
function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission) || permissions.includes('*');
}

/**
 * Get all permissions for a role
 */
function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role A can manage role B (based on hierarchy)
 */
function canManageRole(roleA, roleB) {
  const hierarchyA = ROLE_HIERARCHY[roleA] || 0;
  const hierarchyB = ROLE_HIERARCHY[roleB] || 0;
  return hierarchyA > hierarchyB;
}

/**
 * Get role display name
 */
function getRoleDisplayName(role) {
  const names = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.LIBRARY_OWNER]: 'Library Owner',
    [ROLES.BRANCH_MANAGER]: 'Branch Manager',
    [ROLES.FRONT_DESK_STAFF]: 'Front Desk Staff',
    [ROLES.FACILITY_MANAGER]: 'Facility Manager',
    [ROLES.FINANCE_MANAGER]: 'Finance Manager',
    [ROLES.ANALYTICS_MANAGER]: 'Analytics Manager',
    [ROLES.STUDENT]: 'Student'
  };
  return names[role] || role;
}
module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  hasPermission,
  getRolePermissions,
  canManageRole,
  getRoleDisplayName
};