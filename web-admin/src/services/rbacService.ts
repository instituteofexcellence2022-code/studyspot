/**
 * RBAC Service
 * Handles all Role-Based Access Control API calls
 * 
 * @author Agent 2 - Senior Frontend Developer (20+ years)
 * @date October 21, 2025
 */

import axios from 'axios';
import { Role,
  RoleCreateRequest,
  RoleUpdateRequest,
  Permission,
  PermissionGroup,
  AuditLog,
  AuditLogFilters,
  SecuritySettings,
  SecuritySettingsUpdateRequest,
  SecurityAuditSummary,
  UserRoleAssignment

   } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class RBACService {
  // ==================== ROLE MANAGEMENT ====================

  /**
   * Get all roles
   */
  async getRoles(tenantId?: string): Promise<{ data: Role[]; total: number }> {
    try {
      const params = tenantId ? { tenantId } : {};
      const response: any = await axios.get(`${API_BASE_URL}/roles`, { params });
      return response.data?.data || response.data || { data: [], total: 0 };
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string): Promise<Role> {
    try {
      const response: any = await axios.get(`${API_BASE_URL}/roles/${roleId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  /**
   * Create new role
   */
  async createRole(data: RoleCreateRequest): Promise<Role> {
    try {
      const response: any = await axios.post(`${API_BASE_URL}/roles`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update role
   */
  async updateRole(roleId: string, data: RoleUpdateRequest): Promise<Role> {
    try {
      const response: any = await axios.put(`${API_BASE_URL}/roles/${roleId}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/roles/${roleId}`);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    try {
      const response = await axios.put(`${API_BASE_URL}/roles/${roleId}/permissions`, {
        permissions: permissionIds});
      return (response.data as any).data;
    } catch (error) {
      console.error('Error assigning permissions:', error);
      throw error;
    }
  }

  // ==================== PERMISSION MANAGEMENT ====================

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/permissions`);
      return (response.data as any).data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }

  /**
   * Get permissions grouped by category
   */
  async getPermissionGroups(): Promise<PermissionGroup[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/permissions/groups`);
      return (response.data as any).data;
    } catch (error) {
      console.error('Error fetching permission groups:', error);
      throw error;
    }
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles/${roleId}/permissions`);
      return (response.data as any).data;
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
  }

  // ==================== USER ROLE ASSIGNMENT ====================

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/roles`);
      return (response.data as any).data;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      throw error;
    }
  }

  /**
   * Assign roles to user
   */
  async assignRolesToUser(userId: string, roleIds: string[]): Promise<UserRoleAssignment> {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}/roles`, {
        roleIds});
      return (response.data as any).data;
    } catch (error) {
      console.error('Error assigning roles to user:', error);
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}/roles/${roleId}`);
    } catch (error) {
      console.error('Error removing role from user:', error);
      throw error;
    }
  }

  // ==================== AUDIT LOGS ====================

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: AuditLogFilters): Promise<{ data: AuditLog[]; total: number; page?: number; limit?: number }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/audit-logs`, {
        params: filters});
      return response.data as any;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(logId: string): Promise<AuditLog> {
    try {
      const response = await axios.get(`${API_BASE_URL}/audit-logs/${logId}`);
      return (response.data as any).data;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filters: AuditLogFilters): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/audit-logs/export`, {
        params: filters,
        responseType: 'blob'});
      return response.data as Blob;
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }

  // ==================== SECURITY SETTINGS ====================

  /**
   * Get security settings for tenant
   */
  async getSecuritySettings(tenantId: string): Promise<SecuritySettings> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants/${tenantId}/security-settings`);
      return (response.data as any).data;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(
    tenantId: string,
    data: SecuritySettingsUpdateRequest
  ): Promise<SecuritySettings> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tenants/${tenantId}/security-settings`,
        data
      );
      return (response.data as any).data;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  /**
   * Get security audit summary
   */
  async getSecurityAuditSummary(tenantId: string): Promise<SecurityAuditSummary> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants/${tenantId}/security-audit`);
      return (response.data as any).data;
    } catch (error) {
      console.error('Error fetching security audit summary:', error);
      throw error;
    }
  }

  /**
   * Test IP address against whitelist/blacklist
   */
  async testIPAddress(tenantId: string, ipAddress: string): Promise<{ allowed: boolean; reason: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tenants/${tenantId}/security-settings/test-ip`, {
        ipAddress});
      return (response.data as any).data;
    } catch (error) {
      console.error('Error testing IP address:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Check if user has permission
   */
  async checkUserPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/check-permission`, {
        params: { permission }});
      return (response.data as any).data.hasPermission;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  /**
   * Get current user's permissions
   */
  async getCurrentUserPermissions(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/permissions`);
      return (response.data as any).data;
    } catch (error) {
      console.error('Error fetching current user permissions:', error);
      throw error;
    }
  }
}

export default new RBACService();

