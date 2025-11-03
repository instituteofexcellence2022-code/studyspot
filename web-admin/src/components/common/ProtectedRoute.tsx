import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '../../hooks/redux';
import { ROUTES } from '../../constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredPermission,
  requireAll = false,
  fallback
}) => {
  const location = useLocation();
  const { user, token, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Check if user has required role(s)
  const hasRequiredRole = () => {
    if (!requiredRole || !user) return true;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Super admin has access to everything
    if (user.role === 'super_admin') return true;
    
    // Check if user has any of the required roles
    return roles.includes(user.role);
  };

  // Check if user has required permission(s)
  const hasRequiredPermission = () => {
    if (!requiredPermission || !user) return true;
    
    const permissions = Array.isArray(requiredPermission) 
      ? requiredPermission 
      : [requiredPermission];
    const userPermissions = user.permissions || [];
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Check if user has required permissions
    if (requireAll) {
      return permissions.every(perm => userPermissions.includes(perm));
    } else {
      return permissions.some(perm => userPermissions.includes(perm));
    }
  };

  // Verify token on mount
  useEffect(() => {
    if (token && !isLoading) {
      // Token is present, user should be authenticated
      // You can add token validation logic here
    }
  }, [token, isLoading]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh' 
          }}
        >
          <CircularProgress />
        </Box>
      )
    );
  }

  // Check authentication
  if (!isAuthenticated || !user || !token) {
    // Redirect to login with return URL
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (!hasRequiredRole()) {
    console.warn(`Access denied: User ${user.email} lacks required role(s)`, requiredRole);
    return (
      <Navigate 
        to="/" 
        state={{ 
          error: 'You do not have permission to access this resource.',
          requiredRole 
        }} 
        replace 
      />
    );
  }

  // Check permission-based access
  if (!hasRequiredPermission()) {
    console.warn(`Access denied: User ${user.email} lacks required permission(s)`, requiredPermission);
    return (
      <Navigate 
        to="/" 
        state={{ 
          error: 'You do not have the required permissions to access this resource.',
          requiredPermission 
        }} 
        replace 
      />
    );
  }

  // User is authenticated and has required access
  return <>{children}</>;
};

export default ProtectedRoute;