/**
 * Hook to check user roles
 * Usage: const { isLibraryOwner, isBranchManager, canAccess } = useRole();
 */

import { useSelector } from 'react-redux';
import { RootState } from '../store';

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  LIBRARY_OWNER: 'library_owner',
  BRANCH_MANAGER: 'branch_manager',
  LIBRARIAN: 'librarian',
  USER: 'user',
  FRONT_DESK_STAFF: 'front_desk_staff',
  FACILITY_MANAGER: 'facility_manager',
  FINANCE_MANAGER: 'finance_manager',
  ANALYTICS_MANAGER: 'analytics_manager',
  STUDENT: 'student'
} as const;

export const useRole = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role;

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return userRole === role;
  };

  /**
   * Check if user has ANY of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user || !userRole) return false;
    return roles.includes(userRole);
  };

  /**
   * Specific role checks (for convenience)
   */
  const isSuperAdmin = hasRole(USER_ROLES.SUPER_ADMIN);
  const isLibraryOwner = hasRole(USER_ROLES.LIBRARY_OWNER);
  const isBranchManager = hasRole(USER_ROLES.BRANCH_MANAGER);
  const isFrontDeskStaff = hasRole(USER_ROLES.FRONT_DESK_STAFF);
  const isFacilityManager = hasRole(USER_ROLES.FACILITY_MANAGER);
  const isFinanceManager = hasRole(USER_ROLES.FINANCE_MANAGER);
  const isAnalyticsManager = hasRole(USER_ROLES.ANALYTICS_MANAGER);
  const isStudent = hasRole(USER_ROLES.STUDENT);

  /**
   * Check if user is any kind of library staff
   */
  const isLibraryStaff = hasAnyRole([
    USER_ROLES.LIBRARY_OWNER,
    USER_ROLES.BRANCH_MANAGER,
    USER_ROLES.FRONT_DESK_STAFF,
    USER_ROLES.FACILITY_MANAGER,
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.ANALYTICS_MANAGER,
  ]);

  /**
   * Check if user is library management (owner or branch manager)
   */
  const isLibraryManagement = hasAnyRole([
    USER_ROLES.LIBRARY_OWNER,
    USER_ROLES.BRANCH_MANAGER,
  ]);

  /**
   * Check if user can access admin features
   */
  const canAccessAdmin = hasAnyRole([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.LIBRARY_OWNER,
  ]);

  /**
   * Get role display name
   */
  const getRoleDisplayName = (): string => {
    const roleNames: Record<string, string> = {
      [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
      [USER_ROLES.LIBRARY_OWNER]: 'Library Owner',
      [USER_ROLES.BRANCH_MANAGER]: 'Branch Manager',
      [USER_ROLES.FRONT_DESK_STAFF]: 'Front Desk Staff',
      [USER_ROLES.FACILITY_MANAGER]: 'Facility Manager',
      [USER_ROLES.FINANCE_MANAGER]: 'Finance Manager',
      [USER_ROLES.ANALYTICS_MANAGER]: 'Analytics Manager',
      [USER_ROLES.STUDENT]: 'Student'};
    return roleNames[userRole || ''] || userRole || 'Unknown';
  };

  return {
    // Current role
    role: userRole,
    roleName: getRoleDisplayName(),
    
    // Role checks
    hasRole,
    hasAnyRole,
    
    // Specific role flags
    isSuperAdmin,
    isLibraryOwner,
    isBranchManager,
    isFrontDeskStaff,
    isFacilityManager,
    isFinanceManager,
    isAnalyticsManager,
    isStudent,
    
    // Group checks
    isLibraryStaff,
    isLibraryManagement,
    canAccessAdmin};
};

export default useRole;



