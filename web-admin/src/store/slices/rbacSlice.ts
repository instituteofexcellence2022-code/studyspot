/**
 * RBAC Redux Slice
 * Manages Role-Based Access Control state
 * 
 * @author Agent 2 - Senior Frontend Developer (20+ years)
 * @date October 21, 2025
 */

import { createSlice, createAsyncThunk, PayloadAction
  } from '@reduxjs/toolkit';
import rbacService from '../../services/rbacService';
import { RBACState,
  Role,
  RoleCreateRequest,
  RoleUpdateRequest,
  Permission,
  PermissionGroup,
  AuditLog,
  AuditLogFilters,
  SecuritySettings,
  SecuritySettingsUpdateRequest,
  SecurityAuditSummary

   } from '../../types';

const initialState: RBACState = {
  roles: [],
  permissions: [],
  auditLogs: [],
  auditLogFilters: {
    page: 1,
    limit: 10
  },
  securitySettings: {
    id: '',
    tenantId: '',
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      maxAge: 90
    },
    sessionPolicy: {
      timeout: 30,
      maxConcurrent: 5,
      requireReauth: false
    },
    mfaPolicy: {
      enabled: false,
      required: false,
      methods: []
    },
    ipWhitelist: [],
    isActive: true,
    updatedAt: ''
  },
  isLoading: false,
  error: null
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
    clearRolesError: (state) => {
      state.error = null;
    },
    clearPermissionsError: (state) => {
      state.error = null;
    },
    clearAuditLogsError: (state) => {
      state.error = null;
    },
    clearSecuritySettingsError: (state) => {
      state.error = null;
    },
    setAuditLogFilters: (state, action: PayloadAction<AuditLogFilters>) => {
      state.auditLogFilters = action.payload;
    },
    clearAuditLogFilters: (state) => {
      state.auditLogFilters = {
        page: 1,
        limit: 10
      };
    }
  },
  extraReducers: (builder) => {
    // ==================== ROLES ====================
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload.data || action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      });

    builder
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.roles.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      });

    builder
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload);
      });

    // ==================== PERMISSIONS ====================
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ==================== AUDIT LOGS ====================
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auditLogs = action.payload.data || action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ==================== SECURITY SETTINGS ====================
    builder
      .addCase(fetchSecuritySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSecuritySettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.securitySettings = action.payload;
      })
      .addCase(fetchSecuritySettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateSecuritySettings.fulfilled, (state, action) => {
        state.securitySettings = action.payload;
      });
  }
});

export const {
  clearRolesError,
  clearPermissionsError,
  clearAuditLogsError,
  clearSecuritySettingsError,
  setAuditLogFilters,
  clearAuditLogFilters
} = rbacSlice.actions;

export default rbacSlice.reducer;

