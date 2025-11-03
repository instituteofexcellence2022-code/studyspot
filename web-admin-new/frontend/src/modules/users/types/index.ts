/**
 * User Module Types
 */

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'library_owner' | 'library_admin' | 'staff' | 'student' | 'parent';
  tenantId: string;
  tenantName: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin?: string;
  registeredAt: string;
  subscriptionPlan?: string;
  metadata?: {
    libraryCount?: number;
    totalUsers?: number;
    revenue?: number;
    linkedStudents?: string[];
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'support' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  createdBy?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  growthRate: number;
}

