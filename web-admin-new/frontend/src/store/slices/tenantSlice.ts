// ============================================
// TENANT REDUX SLICE
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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

// Mock data
const MOCK_TENANTS: Tenant[] = [
  {
    id: '1',
    name: 'Delhi Central Library',
    slug: 'delhi-central-library',
    email: 'contact@delhicentral.com',
    phone: '+91 98765 43210',
    address: 'Connaught Place, New Delhi',
    subscriptionPlan: 'Pro',
    subscriptionStatus: 'active',
    status: 'active',
    logo: '',
    metadata: {
      librariesCount: 1,
      usersCount: 450,
      seatsCount: 200,
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-10-31T10:00:00Z',
  },
  {
    id: '2',
    name: 'Mumbai Study Center',
    slug: 'mumbai-study-center',
    email: 'info@mumbaistudycenter.com',
    phone: '+91 98765 43211',
    address: 'Andheri West, Mumbai',
    subscriptionPlan: 'Enterprise',
    subscriptionStatus: 'active',
    status: 'active',
    logo: '',
    metadata: {
      librariesCount: 3,
      usersCount: 1200,
      seatsCount: 500,
    },
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-10-31T10:00:00Z',
  },
  {
    id: '3',
    name: 'Bangalore Tech Library',
    slug: 'bangalore-tech-library',
    email: 'admin@bangaloretechlib.com',
    phone: '+91 98765 43212',
    address: 'Koramangala, Bangalore',
    subscriptionPlan: 'Starter',
    subscriptionStatus: 'trial',
    status: 'trial',
    logo: '',
    metadata: {
      librariesCount: 1,
      usersCount: 80,
      seatsCount: 50,
    },
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-10-31T10:00:00Z',
  },
  {
    id: '4',
    name: 'Pune Learning Hub',
    slug: 'pune-learning-hub',
    email: 'contact@punelearninghub.com',
    phone: '+91 98765 43213',
    address: 'Kothrud, Pune',
    subscriptionPlan: 'Pro',
    subscriptionStatus: 'active',
    status: 'active',
    logo: '',
    metadata: {
      librariesCount: 2,
      usersCount: 600,
      seatsCount: 300,
    },
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-10-31T10:00:00Z',
  },
  {
    id: '5',
    name: 'Chennai Study Point',
    slug: 'chennai-study-point',
    email: 'info@chennaistudypoint.com',
    phone: '+91 98765 43214',
    address: 'T Nagar, Chennai',
    subscriptionPlan: 'Free',
    subscriptionStatus: 'expired',
    status: 'suspended',
    logo: '',
    metadata: {
      librariesCount: 1,
      usersCount: 30,
      seatsCount: 20,
    },
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-10-31T10:00:00Z',
  },
];

const initialState: TenantState = {
  tenants: MOCK_TENANTS,
  currentTenant: null,
  loading: false,
  error: null,
  meta: {
    total: MOCK_TENANTS.length,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  filters: {
    search: '',
    status: '',
    subscriptionPlan: '',
    page: 1,
    limit: 10,
  },
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenants: (state, action: PayloadAction<Tenant[]>) => {
      state.tenants = action.payload;
    },
    setCurrentTenant: (state, action: PayloadAction<Tenant | null>) => {
      state.currentTenant = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<TenantState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addTenant: (state, action: PayloadAction<Tenant>) => {
      state.tenants.unshift(action.payload);
      if (state.meta) {
        state.meta.total += 1;
      }
    },
    updateTenantInList: (state, action: PayloadAction<Tenant>) => {
      const index = state.tenants.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tenants[index] = action.payload;
      }
    },
    removeTenant: (state, action: PayloadAction<string>) => {
      state.tenants = state.tenants.filter((t) => t.id !== action.payload);
      if (state.meta) {
        state.meta.total -= 1;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setTenants,
  setCurrentTenant,
  setFilters,
  setLoading,
  setError,
  addTenant,
  updateTenantInList,
  removeTenant,
  clearError,
} = tenantSlice.actions;

export default tenantSlice.reducer;
