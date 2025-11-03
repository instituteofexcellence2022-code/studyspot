// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { UserRole } from '../../types';
import { ROUTES } from '../../config/constants';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireSuperAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requireSuperAdmin = false,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner fullscreen message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check if super admin is required
  if (requireSuperAdmin && user.role !== 'super_admin') {
    return (
      <Navigate
        to={ROUTES.DASHBOARD}
        state={{ error: 'Super admin access required' }}
        replace
      />
    );
  }

  // Check if user has required role
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return (
        <Navigate
          to={ROUTES.DASHBOARD}
          state={{ error: 'Insufficient permissions' }}
          replace
        />
      );
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;

