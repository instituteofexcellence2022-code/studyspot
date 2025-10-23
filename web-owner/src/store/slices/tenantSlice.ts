import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Tenant,
  TenantAnalytics,
  TenantOnboardingRequest,
  TenantSettings,
  TenantBranding,
  TenantListFilters,
  OnboardingProgress,
} from '../../types';
import { tenantService, onboardingHelpers } from '../../services/tenantService';

/**
 * Tenant State Interface
 * Enterprise-grade state management with caching and optimistic updates
 * 
 * @author Agent 2 - Senior Full-Stack Developer (20+ years experience)
 */
interface TenantState {
  // Current tenant (logged-in user's tenant)
  currentTenant: Tenant | null;
  currentTenantLoading: boolean;
  currentTenantError: string | null;

  // Tenant list (Super Admin)
  tenants: Tenant[];
  tenantsLoading: boolean;
  tenantsError: string | null;
  tenantsTotalPages: number;
  tenantsCurrentPage: number;
  tenantsTotal: number;

  // Selected tenant (for details view)
  selectedTenant: Tenant | null;
  selectedTenantLoading: boolean;
  selectedTenantError: string | null;

  // Tenant analytics
  analytics: TenantAnalytics | null;
  analyticsLoading: boolean;
  analyticsError: string | null;

  // Onboarding state
  onboardingProgress: OnboardingProgress | null;
  onboardingLoading: boolean;
  onboardingError: string | null;

  // UI state
  filters: TenantListFilters;
  selectedTenantId: string | null;

  // Cache timestamps (for smart refetching)
  lastFetched: {
    currentTenant?: number;
    tenants?: number;
    analytics?: number;
  };
}

/**
 * Initial State
 */
const initialState: TenantState = {
  currentTenant: null,
  currentTenantLoading: false,
  currentTenantError: null,

  tenants: [],
  tenantsLoading: false,
  tenantsError: null,
  tenantsTotalPages: 0,
  tenantsCurrentPage: 1,
  tenantsTotal: 0,

  selectedTenant: null,
  selectedTenantLoading: false,
  selectedTenantError: null,

  analytics: null,
  analyticsLoading: false,
  analyticsError: null,

  onboardingProgress: onboardingHelpers.loadProgress(),
  onboardingLoading: false,
  onboardingError: null,

  filters: {
    status: 'all',
    plan: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  },

  selectedTenantId: null,

  lastFetched: {},
};

/**
 * Async Thunks - Tenant Operations
 */

// Fetch current tenant with smart caching
export const fetchCurrentTenant = createAsyncThunk(
  'tenant/fetchCurrent',
  async (forceRefresh: boolean = false, { getState }) => {
    const state = getState() as { tenant: TenantState };
    const lastFetched = state.tenant.lastFetched.currentTenant;
    const cacheAge = lastFetched ? Date.now() - lastFetched : Infinity;
    
    // Cache for 5 minutes unless force refresh
    if (!forceRefresh && cacheAge < 5 * 60 * 1000 && state.tenant.currentTenant) {
      return state.tenant.currentTenant;
    }
    
    return await tenantService.getCurrentTenant();
  }
);

// Fetch tenant list (Super Admin)
export const fetchTenants = createAsyncThunk(
  'tenant/fetchList',
  async (filters?: TenantListFilters) => {
    return await tenantService.getTenants(filters);
  }
);

// Fetch tenant by ID
export const fetchTenantById = createAsyncThunk(
  'tenant/fetchById',
  async (id: string) => {
    return await tenantService.getTenantById(id);
  }
);

// Create tenant (Onboarding)
export const createTenant = createAsyncThunk(
  'tenant/create',
  async (data: TenantOnboardingRequest) => {
    const tenant = await tenantService.createTenant(data);
    
    // Clear onboarding progress on success
    onboardingHelpers.clearProgress();
    
    return tenant;
  }
);

// Update tenant
export const updateTenant = createAsyncThunk(
  'tenant/update',
  async ({ id, data }: { id: string; data: Partial<Tenant> }) => {
    return await tenantService.updateTenant(id, data);
  }
);

// Update settings
export const updateSettings = createAsyncThunk(
  'tenant/updateSettings',
  async ({ id, settings }: { id: string; settings: Partial<TenantSettings> }) => {
    return await tenantService.updateSettings(id, settings);
  }
);

// Update branding
export const updateBranding = createAsyncThunk(
  'tenant/updateBranding',
  async ({ id, branding }: { id: string; branding: Partial<TenantBranding> }) => {
    return await tenantService.updateBranding(id, branding);
  }
);

// Upload logo
export const uploadLogo = createAsyncThunk(
  'tenant/uploadLogo',
  async ({ id, file }: { id: string; file: File }) => {
    return await tenantService.uploadLogo(id, file);
  }
);

// Suspend tenant
export const suspendTenant = createAsyncThunk(
  'tenant/suspend',
  async ({ id, reason }: { id: string; reason: string }) => {
    return await tenantService.suspendTenant(id, reason);
  }
);

// Reactivate tenant
export const reactivateTenant = createAsyncThunk(
  'tenant/reactivate',
  async (id: string) => {
    return await tenantService.reactivateTenant(id);
  }
);

// Delete tenant
export const deleteTenant = createAsyncThunk(
  'tenant/delete',
  async ({ id, hardDelete }: { id: string; hardDelete?: boolean }) => {
    await tenantService.deleteTenant(id, hardDelete);
    return id;
  }
);

// Fetch analytics
export const fetchAnalytics = createAsyncThunk(
  'tenant/fetchAnalytics',
  async ({
    id,
    params,
  }: {
    id: string;
    params?: { startDate?: string; endDate?: string; metrics?: string[] };
  }) => {
    return await tenantService.getAnalytics(id, params);
  }
);

// Export data
export const exportData = createAsyncThunk(
  'tenant/exportData',
  async ({ id, format }: { id: string; format?: 'csv' | 'json' | 'xlsx' }) => {
    return await tenantService.exportData(id, format);
  }
);

/**
 * Tenant Slice
 */
const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action: PayloadAction<Partial<TenantListFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    // Select tenant
    setSelectedTenantId: (state, action: PayloadAction<string | null>) => {
      state.selectedTenantId = action.payload;
    },

    // Save onboarding progress
    saveOnboardingProgress: (
      state,
      action: PayloadAction<{ step: number; data: any }>
    ) => {
      const { step, data } = action.payload;
      
      state.onboardingProgress = {
        currentStep: step,
        totalSteps: 6,
        completedSteps: Array.from({ length: step }, (_, i) => i + 1),
        data: {
          ...state.onboardingProgress?.data,
          ...data,
        },
        savedAt: new Date().toISOString(),
      };

      // Persist to localStorage
      onboardingHelpers.saveProgress(step, state.onboardingProgress.data);
    },

    // Clear onboarding progress
    clearOnboardingProgress: (state) => {
      state.onboardingProgress = null;
      onboardingHelpers.clearProgress();
    },

    // Clear errors
    clearErrors: (state) => {
      state.currentTenantError = null;
      state.tenantsError = null;
      state.selectedTenantError = null;
      state.analyticsError = null;
      state.onboardingError = null;
    },

    // Optimistic update for tenant
    optimisticUpdateTenant: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Tenant> }>
    ) => {
      const { id, updates } = action.payload;

      // Update current tenant
      if (state.currentTenant?.id === id) {
        state.currentTenant = { ...state.currentTenant, ...updates };
      }

      // Update selected tenant
      if (state.selectedTenant?.id === id) {
        state.selectedTenant = { ...state.selectedTenant, ...updates };
      }

      // Update in list
      const index = state.tenants.findIndex((t) => t.id === id);
      if (index !== -1) {
        state.tenants[index] = { ...state.tenants[index], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Current Tenant
    builder
      .addCase(fetchCurrentTenant.pending, (state) => {
        state.currentTenantLoading = true;
        state.currentTenantError = null;
      })
      .addCase(fetchCurrentTenant.fulfilled, (state, action) => {
        state.currentTenantLoading = false;
        state.currentTenant = action.payload;
        state.lastFetched.currentTenant = Date.now();
      })
      .addCase(fetchCurrentTenant.rejected, (state, action) => {
        state.currentTenantLoading = false;
        state.currentTenantError = action.error.message || 'Failed to fetch tenant';
      });

    // Fetch Tenants List
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.tenantsLoading = true;
        state.tenantsError = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.tenantsLoading = false;
        state.tenants = action.payload.data;
        state.tenantsTotalPages = action.payload.pagination.totalPages;
        state.tenantsCurrentPage = action.payload.pagination.page;
        state.tenantsTotal = action.payload.pagination.total;
        state.lastFetched.tenants = Date.now();
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.tenantsLoading = false;
        state.tenantsError = action.error.message || 'Failed to fetch tenants';
      });

    // Fetch Tenant By ID
    builder
      .addCase(fetchTenantById.pending, (state) => {
        state.selectedTenantLoading = true;
        state.selectedTenantError = null;
      })
      .addCase(fetchTenantById.fulfilled, (state, action) => {
        state.selectedTenantLoading = false;
        state.selectedTenant = action.payload;
      })
      .addCase(fetchTenantById.rejected, (state, action) => {
        state.selectedTenantLoading = false;
        state.selectedTenantError = action.error.message || 'Failed to fetch tenant';
      });

    // Create Tenant
    builder
      .addCase(createTenant.pending, (state) => {
        state.onboardingLoading = true;
        state.onboardingError = null;
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.onboardingLoading = false;
        state.currentTenant = action.payload;
        state.onboardingProgress = null;
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.onboardingLoading = false;
        state.onboardingError = action.error.message || 'Failed to create tenant';
      });

    // Update Tenant
    builder
      .addCase(updateTenant.fulfilled, (state, action) => {
        if (state.currentTenant?.id === action.payload.id) {
          state.currentTenant = action.payload;
        }
        if (state.selectedTenant?.id === action.payload.id) {
          state.selectedTenant = action.payload;
        }
        const index = state.tenants.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tenants[index] = action.payload;
        }
      });

    // Update Settings
    builder.addCase(updateSettings.fulfilled, (state, action) => {
      if (state.currentTenant?.id === action.payload.id) {
        state.currentTenant = action.payload;
      }
    });

    // Update Branding
    builder.addCase(updateBranding.fulfilled, (state, action) => {
      if (state.currentTenant?.id === action.payload.id) {
        state.currentTenant = action.payload;
      }
    });

    // Upload Logo
    builder.addCase(uploadLogo.fulfilled, (state, action) => {
      if (state.currentTenant) {
        state.currentTenant.branding.logoUrl = action.payload.logoUrl;
      }
    });

    // Suspend Tenant
    builder.addCase(suspendTenant.fulfilled, (state, action) => {
      const index = state.tenants.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tenants[index] = action.payload;
      }
      if (state.selectedTenant?.id === action.payload.id) {
        state.selectedTenant = action.payload;
      }
    });

    // Reactivate Tenant
    builder.addCase(reactivateTenant.fulfilled, (state, action) => {
      const index = state.tenants.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tenants[index] = action.payload;
      }
      if (state.selectedTenant?.id === action.payload.id) {
        state.selectedTenant = action.payload;
      }
    });

    // Delete Tenant
    builder.addCase(deleteTenant.fulfilled, (state, action) => {
      state.tenants = state.tenants.filter((t) => t.id !== action.payload);
      if (state.selectedTenant?.id === action.payload) {
        state.selectedTenant = null;
      }
    });

    // Fetch Analytics
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
        state.lastFetched.analytics = Date.now();
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.error.message || 'Failed to fetch analytics';
      });
  },
});

export const {
  setFilters,
  setSelectedTenantId,
  saveOnboardingProgress,
  clearOnboardingProgress,
  clearErrors,
  optimisticUpdateTenant,
} = tenantSlice.actions;

export default tenantSlice.reducer;


