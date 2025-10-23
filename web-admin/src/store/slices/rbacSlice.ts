/**
 * RBAC Redux Slice
 * Manages Role-Based Access Control state
 * 
 * @author Agent 2 - Senior Frontend Developer (20+ years)
 * @date October 21, 2025
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import rbacService from '../../services/rbacService';
import {
  RBACState,
  Role,
  RoleCreateRequest,
  RoleUpdateRequest,
  Permission,
  PermissionGroup,
  AuditLog,
  AuditLogFilters,
  SecuritySettings,
  SecuritySettingsUpdateRequest,
  SecurityAuditSummary,
} from '../../types';

const initialState: RBACState = {
  roles: {
    items: [],
    loading: false,
    error: null,
    total: 0,
  },
  permissions: {
    items: [],
    groups: [],
    loading: false,
    error: null,
  },
  auditLogs: {
    items: [],
    loading: false,
    error: null,
    total: 0,
    filters: {
      page: 1,
      limit: 20,
    },
  },
  securitySettings: {
    data: null,
    loading: false,
    error: null,
  },
  securityAudit: {
    data: null,
    loading: false,
    error: null,
  },
};

// ==================== ROLE THUNKS ====================

export const fetchRoles = createAsyncThunk(
  'rbac/fetchRoles',
  async (tenantId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await rbacService.getRoles(tenantId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
    }
  }
);

export const fetchRoleById = createAsyncThunk(
  'rbac/fetchRoleById',
  async (roleId: string, { rejectWithValue }) => {
    try {
      const response = await rbacService.getRoleById(roleId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch role');
    }
  }
);

export const createRole = createAsyncThunk(
  'rbac/createRole',
  async (data: RoleCreateRequest, { rejectWithValue }) => {
    try {
      const response = await rbacService.createRole(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create role');
    }
  }
);

export const updateRole = createAsyncThunk(
  'rbac/updateRole',
  async ({ roleId, data }: { roleId: string; data: RoleUpdateRequest }, { rejectWithValue }) => {
    try {
      const response = await rbacService.updateRole(roleId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update role');
    }
  }
);

export const deleteRole = createAsyncThunk(
  'rbac/deleteRole',
  async (roleId: string, { rejectWithValue }) => {
    try {
      await rbacService.deleteRole(roleId);
      return roleId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete role');
    }
  }
);

export const assignPermissionsToRole = createAsyncThunk(
  'rbac/assignPermissionsToRole',
  async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await rbacService.assignPermissions(roleId, permissionIds);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign permissions');
    }
  }
);

// ==================== PERMISSION THUNKS ====================

export const fetchPermissions = createAsyncThunk(
  'rbac/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rbacService.getPermissions();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
    }
  }
);

export const fetchPermissionGroups = createAsyncThunk(
  'rbac/fetchPermissionGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rbacService.getPermissionGroups();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch permission groups');
    }
  }
);

export const fetchRolePermissions = createAsyncThunk(
  'rbac/fetchRolePermissions',
  async (roleId: string, { rejectWithValue }) => {
    try {
      const response = await rbacService.getRolePermissions(roleId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch role permissions');
    }
  }
);

// ==================== USER ROLE THUNKS ====================

export const assignRolesToUser = createAsyncThunk(
  'rbac/assignRolesToUser',
  async ({ userId, roleIds }: { userId: string; roleIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await rbacService.assignRolesToUser(userId, roleIds);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign roles to user');
    }
  }
);

export const removeRoleFromUser = createAsyncThunk(
  'rbac/removeRoleFromUser',
  async ({ userId, roleId }: { userId: string; roleId: string }, { rejectWithValue }) => {
    try {
      await rbacService.removeRoleFromUser(userId, roleId);
      return { userId, roleId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove role from user');
    }
  }
);

// ==================== AUDIT LOG THUNKS ====================

export const fetchAuditLogs = createAsyncThunk(
  'rbac/fetchAuditLogs',
  async (filters: AuditLogFilters, { rejectWithValue }) => {
    try {
      const response = await rbacService.getAuditLogs(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit logs');
    }
  }
);

export const fetchAuditLogById = createAsyncThunk(
  'rbac/fetchAuditLogById',
  async (logId: string, { rejectWithValue }) => {
    try {
      const response = await rbacService.getAuditLogById(logId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit log');
    }
  }
);

export const exportAuditLogs = createAsyncThunk(
  'rbac/exportAuditLogs',
  async (filters: AuditLogFilters, { rejectWithValue }) => {
    try {
      const blob = await rbacService.exportAuditLogs(filters);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export audit logs');
    }
  }
);

// ==================== SECURITY SETTINGS THUNKS ====================

export const fetchSecuritySettings = createAsyncThunk(
  'rbac/fetchSecuritySettings',
  async (tenantId: string, { rejectWithValue }) => {
    try {
      const response = await rbacService.getSecuritySettings(tenantId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch security settings');
    }
  }
);

export const updateSecuritySettings = createAsyncThunk(
  'rbac/updateSecuritySettings',
  async ({ tenantId, data }: { tenantId: string; data: SecuritySettingsUpdateRequest }, { rejectWithValue }) => {
    try {
      const response = await rbacService.updateSecuritySettings(tenantId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update security settings');
    }
  }
);

export const fetchSecurityAuditSummary = createAsyncThunk(
  'rbac/fetchSecurityAuditSummary',
  async (tenantId: string, { rejectWithValue }) => {
    try {
      const response = await rbacService.getSecurityAuditSummary(tenantId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch security audit summary');
    }
  }
);

// ==================== SLICE ====================

const rbacSlice = createSlice({
  name: 'rbac',
  initialState,
  reducers: {
    setAuditLogFilters: (state, action: PayloadAction<Partial<AuditLogFilters>>) => {
      state.auditLogs.filters = { ...state.auditLogs.filters, ...action.payload };
    },
    clearAuditLogFilters: (state) => {
      state.auditLogs.filters = { page: 1, limit: 20 };
    },
    clearRolesError: (state) => {
      state.roles.error = null;
    },
    clearPermissionsError: (state) => {
      state.permissions.error = null;
    },
    clearAuditLogsError: (state) => {
      state.auditLogs.error = null;
    },
    clearSecuritySettingsError: (state) => {
      state.securitySettings.error = null;
    },
  },
  extraReducers: (builder) => {
    // ==================== ROLES ====================
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.roles.loading = true;
        state.roles.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles.loading = false;
        state.roles.items = action.payload.data;
        state.roles.total = action.payload.total;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.roles.loading = false;
        state.roles.error = action.payload as string;
      });

    builder
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.items.push(action.payload);
        state.roles.total += 1;
      });

    builder
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.roles.items.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.roles.items[index] = action.payload;
        }
      });

    builder
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles.items = state.roles.items.filter((r) => r.id !== action.payload);
        state.roles.total -= 1;
      });

    builder
      .addCase(assignPermissionsToRole.fulfilled, (state, action) => {
        const index = state.roles.items.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.roles.items[index] = action.payload;
        }
      });

    // ==================== PERMISSIONS ====================
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.permissions.loading = true;
        state.permissions.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissions.loading = false;
        state.permissions.items = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.permissions.loading = false;
        state.permissions.error = action.payload as string;
      });

    builder
      .addCase(fetchPermissionGroups.fulfilled, (state, action) => {
        state.permissions.groups = action.payload;
      });

    // ==================== AUDIT LOGS ====================
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.auditLogs.loading = true;
        state.auditLogs.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs.loading = false;
        state.auditLogs.items = action.payload.data;
        state.auditLogs.total = action.payload.total;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.auditLogs.loading = false;
        state.auditLogs.error = action.payload as string;
      });

    // ==================== SECURITY SETTINGS ====================
    builder
      .addCase(fetchSecuritySettings.pending, (state) => {
        state.securitySettings.loading = true;
        state.securitySettings.error = null;
      })
      .addCase(fetchSecuritySettings.fulfilled, (state, action) => {
        state.securitySettings.loading = false;
        state.securitySettings.data = action.payload;
      })
      .addCase(fetchSecuritySettings.rejected, (state, action) => {
        state.securitySettings.loading = false;
        state.securitySettings.error = action.payload as string;
      });

    builder
      .addCase(updateSecuritySettings.fulfilled, (state, action) => {
        state.securitySettings.data = action.payload;
      });

    builder
      .addCase(fetchSecurityAuditSummary.pending, (state) => {
        state.securityAudit.loading = true;
        state.securityAudit.error = null;
      })
      .addCase(fetchSecurityAuditSummary.fulfilled, (state, action) => {
        state.securityAudit.loading = false;
        state.securityAudit.data = action.payload;
      })
      .addCase(fetchSecurityAuditSummary.rejected, (state, action) => {
        state.securityAudit.loading = false;
        state.securityAudit.error = action.payload as string;
      });
  },
});

export const {
  setAuditLogFilters,
  clearAuditLogFilters,
  clearRolesError,
  clearPermissionsError,
  clearAuditLogsError,
  clearSecuritySettingsError,
} = rbacSlice.actions;

export default rbacSlice.reducer;

