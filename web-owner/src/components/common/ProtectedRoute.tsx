import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import { useAppSelector } from '../../hooks/redux';
import { ROUTES, USER_ROLES } from '../../constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    switch (user?.role) {
      case USER_ROLES.STUDENT:
        return <Navigate to={ROUTES.DASHBOARD} replace />;
      case USER_ROLES.LIBRARY_STAFF:
      case USER_ROLES.LIBRARY_OWNER:
        return <Navigate to={ROUTES.DASHBOARD} replace />;
      case USER_ROLES.SUPER_ADMIN:
        return <Navigate to={ROUTES.ADMIN} replace />;
      default:
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  // Check if user has access to admin routes
  if (location.pathname.startsWith('/admin') && user?.role !== USER_ROLES.SUPER_ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Check if user has access to user management routes
  if (location.pathname.startsWith('/users') && 
      user?.role && ![USER_ROLES.LIBRARY_OWNER, USER_ROLES.SUPER_ADMIN].includes(user.role as any)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

