/**
 * RoleGuard Component
 * Protects components/routes based on user roles and permissions
 * 
 * Usage:
 * <RoleGuard roles={['library_owner', 'branch_manager']}>
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * <RoleGuard permissions={['students:create']}>
 *   <CreateStudentButton />
 * </RoleGuard>
 */

import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Alert, AlertTitle } from '@mui/material';
import { useRole } from '../hooks/useRole';
import { usePermissions } from '../hooks/usePermissions';
import { ROUTES } from '../constants';

interface RoleGuardProps {
  children: ReactNode;
  roles?: string | string[];              // Required role(s)
  permissions?: string | string[];        // Required permission(s)
  requireAll?: boolean;                   // If true, requires ALL permissions (default: ANY)
  fallback?: ReactNode;                   // Component to show if access denied
  redirect?: string;                      // Redirect URL if access denied
  showError?: boolean;                    // Show error message (default: true)
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  permissions,
  requireAll = false,
  fallback,
  redirect,
  showError = true,
}) => {
  const { hasRole, hasAnyRole } = useRole();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Check role-based access
  let hasRequiredRole = true;
  if (roles) {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    hasRequiredRole = hasAnyRole(roleArray);
  }

  // Check permission-based access
  let hasRequiredPermission = true;
  if (permissions) {
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
    
    if (requireAll) {
      hasRequiredPermission = hasAllPermissions(permissionArray);
    } else {
      hasRequiredPermission = hasAnyPermission(permissionArray);
    }
  }

  // Grant access if both role and permission checks pass
  const hasAccess = hasRequiredRole && hasRequiredPermission;

  // Access granted - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied - handle based on props
  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Access Denied</AlertTitle>
          You do not have permission to access this resource.
          {roles && <Box sx={{ mt: 1 }}>Required role: {Array.isArray(roles) ? roles.join(', ') : roles}</Box>}
          {permissions && <Box sx={{ mt: 1 }}>Required permission: {Array.isArray(permissions) ? permissions.join(', ') : permissions}</Box>}
        </Alert>
      </Box>
    );
  }

  // Don't render anything
  return null;
};

/**
 * PermissionGuard - Shorthand for permission-only checking
 */
export const PermissionGuard: React.FC<Omit<RoleGuardProps, 'roles'>> = (props) => {
  return <RoleGuard {...props} />;
};

/**
 * AdminGuard - Shorthand for admin-only access
 */
export const AdminGuard: React.FC<Omit<RoleGuardProps, 'roles'>> = (props) => {
  return <RoleGuard roles={['super_admin', 'library_owner']} {...props} />;
};

/**
 * LibraryStaffGuard - For any library staff role
 */
export const LibraryStaffGuard: React.FC<Omit<RoleGuardProps, 'roles'>> = (props) => {
  return <RoleGuard 
    roles={[
      'library_owner',
      'branch_manager',
      'front_desk_staff',
      'facility_manager',
      'finance_manager',
      'analytics_manager',
    ]} 
    {...props} 
  />;
};

/**
 * ManagementGuard - For library owner and branch manager only
 */
export const ManagementGuard: React.FC<Omit<RoleGuardProps, 'roles'>> = (props) => {
  return <RoleGuard roles={['library_owner', 'branch_manager']} {...props} />;
};

export default RoleGuard;








