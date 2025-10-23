/**
 * Hook to check user permissions
 * Usage: const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
 */

import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Permission list (must match backend)
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_VIEW_ALL_BRANCHES: 'dashboard:view_all_branches',
  DASHBOARD_VIEW_REVENUE: 'dashboard:view_revenue',
  DASHBOARD_VIEW_ANALYTICS: 'dashboard:view_analytics',
  
  // Student Management
  STUDENTS_VIEW: 'students:view',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_EDIT: 'students:edit',
  STUDENTS_DELETE: 'students:delete',
  STUDENTS_IMPORT: 'students:import',
  STUDENTS_EXPORT: 'students:export',
  
  // Staff Management
  STAFF_VIEW: 'staff:view',
  STAFF_CREATE: 'staff:create',
  STAFF_EDIT: 'staff:edit',
  STAFF_DELETE: 'staff:delete',
  STAFF_ASSIGN_ROLES: 'staff:assign_roles',
  
  // Attendance
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_MARK: 'attendance:mark',
  ATTENDANCE_EDIT: 'attendance:edit',
  ATTENDANCE_EXPORT: 'attendance:export',
  
  // Fees & Payments
  FEES_VIEW: 'fees:view',
  FEES_CREATE: 'fees:create',
  FEES_EDIT: 'fees:edit',
  FEES_DELETE: 'fees:delete',
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_PROCESS: 'payments:process',
  PAYMENTS_VIEW_REVENUE: 'payments:view_revenue',
  
  // Seats & Bookings
  SEATS_VIEW: 'seats:view',
  SEATS_EDIT_LAYOUT: 'seats:edit_layout',
  BOOKINGS_VIEW: 'bookings:view',
  BOOKINGS_CREATE: 'bookings:create',
  BOOKINGS_EDIT: 'bookings:edit',
  BOOKINGS_CANCEL: 'bookings:cancel',
  
  // Communication
  COMMUNICATION_SEND_INDIVIDUAL: 'communication:send_individual',
  COMMUNICATION_SEND_BULK: 'communication:send_bulk',
  COMMUNICATION_MANAGE_TEMPLATES: 'communication:manage_templates',
  
  // Analytics
  ANALYTICS_VIEW_BASIC: 'analytics:view_basic',
  ANALYTICS_VIEW_ADVANCED: 'analytics:view_advanced',
  ANALYTICS_CREATE_REPORTS: 'analytics:create_reports',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // System
  SYSTEM_CONFIGURE: 'system:configure',
  SYSTEM_MANAGE_SECURITY: 'system:manage_security',
  SYSTEM_VIEW_AUDIT_LOGS: 'system:view_audit_logs',
};

export const usePermissions = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userPermissions = user?.permissions || [];

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    return userPermissions.includes(permission);
  };

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return permissions.some(permission => userPermissions.includes(permission));
  };

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return permissions.every(permission => userPermissions.includes(permission));
  };

  /**
   * Get all user permissions
   */
  const getAllPermissions = (): string[] => {
    return userPermissions;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAllPermissions,
    permissions: userPermissions,
  };
};

export default usePermissions;



