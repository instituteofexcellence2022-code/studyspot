// ============================================
// USER REDUX SLICE
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlatformUser, AdminUser } from '../../modules/users/types';
import { ApiMeta } from '../../types';

interface UserState {
  platformUsers: PlatformUser[];
  adminUsers: AdminUser[];
  currentUser: PlatformUser | AdminUser | null;
  loading: boolean;
  error: string | null;
  meta: ApiMeta | null;
  filters: {
    search: string;
    role: string;
    status: string;
    tenantId: string;
    page: number;
    limit: number;
  };
}

// Mock Platform Users (Library Owners, Staff, Students)
const MOCK_PLATFORM_USERS: PlatformUser[] = [
  {
    id: 'pu1',
    name: 'Rajesh Kumar',
    email: 'rajesh@delhicentral.com',
    phone: '+91 98765 43210',
    role: 'library_owner',
    tenantId: '1',
    tenantName: 'Delhi Central Library',
    status: 'active',
    lastLogin: '2024-10-31T09:00:00Z',
    registeredAt: '2024-01-15T10:00:00Z',
    subscriptionPlan: 'Pro',
    metadata: {
      libraryCount: 1,
      totalUsers: 450,
      revenue: 125000,
    },
  },
  {
    id: 'pu2',
    name: 'Priya Sharma',
    email: 'priya@mumbaistudycenter.com',
    phone: '+91 98765 43211',
    role: 'library_owner',
    tenantId: '2',
    tenantName: 'Mumbai Study Center',
    status: 'active',
    lastLogin: '2024-10-31T08:30:00Z',
    registeredAt: '2024-02-10T10:00:00Z',
    subscriptionPlan: 'Enterprise',
    metadata: {
      libraryCount: 3,
      totalUsers: 1200,
      revenue: 485000,
    },
  },
  {
    id: 'pu3',
    name: 'Amit Patel',
    email: 'amit@bangaloretechlib.com',
    phone: '+91 98765 43212',
    role: 'library_owner',
    tenantId: '3',
    tenantName: 'Bangalore Tech Library',
    status: 'active',
    lastLogin: '2024-10-30T18:00:00Z',
    registeredAt: '2024-10-01T10:00:00Z',
    subscriptionPlan: 'Starter',
    metadata: {
      libraryCount: 1,
      totalUsers: 80,
      revenue: 25000,
    },
  },
  {
    id: 'pu4',
    name: 'Sneha Reddy',
    email: 'sneha@punelearninghub.com',
    phone: '+91 98765 43213',
    role: 'library_admin',
    tenantId: '4',
    tenantName: 'Pune Learning Hub',
    status: 'active',
    lastLogin: '2024-10-31T07:45:00Z',
    registeredAt: '2024-03-25T10:00:00Z',
  },
  {
    id: 'pu5',
    name: 'Vikram Singh',
    email: 'vikram@chennaistudypoint.com',
    phone: '+91 98765 43214',
    role: 'library_owner',
    tenantId: '5',
    tenantName: 'Chennai Study Point',
    status: 'suspended',
    lastLogin: '2024-09-15T10:00:00Z',
    registeredAt: '2024-01-05T10:00:00Z',
    subscriptionPlan: 'Free',
    metadata: {
      libraryCount: 1,
      totalUsers: 30,
      revenue: 0,
    },
  },
  {
    id: 'pu6',
    name: 'Anita Deshmukh',
    email: 'anita.deshmukh@example.com',
    phone: '+91 98765 43215',
    role: 'staff',
    tenantId: '1',
    tenantName: 'Delhi Central Library',
    status: 'active',
    lastLogin: '2024-10-31T08:00:00Z',
    registeredAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 'pu7',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phone: '+91 98765 43216',
    role: 'student',
    tenantId: '2',
    tenantName: 'Mumbai Study Center',
    status: 'active',
    lastLogin: '2024-10-31T10:30:00Z',
    registeredAt: '2024-06-10T10:00:00Z',
  },
  {
    id: 'pu8',
    name: 'Kavita Joshi',
    email: 'kavita.joshi@example.com',
    phone: '+91 98765 43217',
    role: 'student',
    tenantId: '1',
    tenantName: 'Delhi Central Library',
    status: 'pending',
    registeredAt: '2024-10-30T14:00:00Z',
  },
];

// Mock Admin Users (Platform Administrators)
const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'au1',
    name: 'Super Admin',
    email: 'admin@studyspot.com',
    phone: '+91 98765 00001',
    role: 'super_admin',
    status: 'active',
    permissions: ['all'],
    lastLogin: '2024-10-31T10:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'au2',
    name: 'John Manager',
    email: 'john@studyspot.com',
    phone: '+91 98765 00002',
    role: 'admin',
    status: 'active',
    permissions: ['tenants.manage', 'users.manage', 'billing.view', 'reports.view'],
    lastLogin: '2024-10-31T09:30:00Z',
    createdAt: '2023-03-15T10:00:00Z',
    createdBy: 'au1',
  },
  {
    id: 'au3',
    name: 'Sarah Support',
    email: 'sarah@studyspot.com',
    phone: '+91 98765 00003',
    role: 'support',
    status: 'active',
    permissions: ['tenants.view', 'users.view', 'tickets.manage'],
    lastLogin: '2024-10-31T08:00:00Z',
    createdAt: '2023-06-20T10:00:00Z',
    createdBy: 'au1',
  },
  {
    id: 'au4',
    name: 'Mike Analyst',
    email: 'mike@studyspot.com',
    phone: '+91 98765 00004',
    role: 'viewer',
    status: 'active',
    permissions: ['analytics.view', 'reports.view', 'dashboard.view'],
    lastLogin: '2024-10-30T16:00:00Z',
    createdAt: '2023-09-10T10:00:00Z',
    createdBy: 'au2',
  },
  {
    id: 'au5',
    name: 'Lisa Admin',
    email: 'lisa@studyspot.com',
    phone: '+91 98765 00005',
    role: 'admin',
    status: 'inactive',
    permissions: ['tenants.manage', 'users.manage'],
    lastLogin: '2024-08-15T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'au1',
  },
];

const initialState: UserState = {
  platformUsers: MOCK_PLATFORM_USERS,
  adminUsers: MOCK_ADMIN_USERS,
  currentUser: null,
  loading: false,
  error: null,
  meta: {
    total: MOCK_PLATFORM_USERS.length,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  filters: {
    search: '',
    role: '',
    status: '',
    tenantId: '',
    page: 1,
    limit: 10,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPlatformUsers: (state, action: PayloadAction<PlatformUser[]>) => {
      state.platformUsers = action.payload;
    },
    setAdminUsers: (state, action: PayloadAction<AdminUser[]>) => {
      state.adminUsers = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<PlatformUser | AdminUser | null>) => {
      state.currentUser = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<UserState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addPlatformUser: (state, action: PayloadAction<PlatformUser>) => {
      state.platformUsers.unshift(action.payload);
    },
    addAdminUser: (state, action: PayloadAction<AdminUser>) => {
      state.adminUsers.unshift(action.payload);
    },
    removePlatformUser: (state, action: PayloadAction<string>) => {
      state.platformUsers = state.platformUsers.filter((u) => u.id !== action.payload);
    },
    removeAdminUser: (state, action: PayloadAction<string>) => {
      state.adminUsers = state.adminUsers.filter((u) => u.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setPlatformUsers,
  setAdminUsers,
  setCurrentUser,
  setFilters,
  setLoading,
  setError,
  addPlatformUser,
  addAdminUser,
  removePlatformUser,
  removeAdminUser,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;

