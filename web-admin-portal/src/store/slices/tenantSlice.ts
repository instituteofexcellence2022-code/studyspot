// ============================================
// TENANT REDUX SLICE
// ============================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tenantService } from '../../services/api/tenants';
import { Tenant, ApiMeta } from '../../types';

interface TenantState {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  loading: boolean;
  error: string | null;
  meta: ApiMeta | null;
  filters: {
    search: string;
    status: string;
    subscriptionPlan: string;
    page: number;
    limit: number;
  };
}

const initialState: TenantState = {
  tenants: [],
  currentTenant: null,
  loading: false,
  error: null,
  meta: null,
  filters: {
    search: '',
    status: '',
    subscriptionPlan: '',
    page: 1,
    limit: 10,
  },
};

// Async thunks
export const fetchTenants = createAsyncThunk(
  'tenant/fetchTenants',
  async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    subscriptionPlan?: string;
  }) => {
    const response = await tenantService.getTenants(params);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch tenants');
    }
    return { data: response.data || [], meta: response.meta };
  }
);

export const fetchTenantById = createAsyncThunk(
  'tenant/fetchTenantById',
  async (id: string) => {
    const response = await tenantService.getTenantById(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch tenant');
    }
    return response.data;
  }
);

export const createTenant = createAsyncThunk(
  'tenant/createTenant',
  async (data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await tenantService.createTenant(data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create tenant');
    }
    return response.data;
  }
);

export const updateTenant = createAsyncThunk(
  'tenant/updateTenant',
  async ({ id, data }: { id: string; data: Partial<Tenant> }) => {
    const response = await tenantService.updateTenant(id, data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update tenant');
    }
    return response.data;
  }
);

export const deleteTenant = createAsyncThunk(
  'tenant/deleteTenant',
  async (id: string) => {
    const response = await tenantService.deleteTenant(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete tenant');
    }
    return id;
  }
);

// Slice
const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TenantState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentTenant: (state) => {
      state.currentTenant = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch tenants
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload.data;
        state.meta = action.payload.meta || null;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tenants';
      });

    // Fetch tenant by ID
    builder
      .addCase(fetchTenantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenantById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTenant = action.payload || null;
      })
      .addCase(fetchTenantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tenant';
      });

    // Create tenant
    builder
      .addCase(createTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.tenants.unshift(action.payload);
        }
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create tenant';
      });

    // Update tenant
    builder
      .addCase(updateTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.tenants.findIndex(t => t.id === action.payload!.id);
          if (index !== -1) {
            state.tenants[index] = action.payload;
          }
          if (state.currentTenant?.id === action.payload.id) {
            state.currentTenant = action.payload;
          }
        }
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update tenant';
      });

    // Delete tenant
    builder
      .addCase(deleteTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = state.tenants.filter(t => t.id !== action.payload);
        if (state.currentTenant?.id === action.payload) {
          state.currentTenant = null;
        }
      })
      .addCase(deleteTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete tenant';
      });
  },
});

export const { setFilters, clearFilters, clearCurrentTenant, clearError } = tenantSlice.actions;

export default tenantSlice.reducer;

