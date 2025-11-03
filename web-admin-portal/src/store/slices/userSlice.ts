// ============================================
// USER REDUX SLICE
// ============================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../../services/api/users';
import { User, ApiMeta } from '../../types';

interface UserState {
  users: User[];
  currentUser: User | null;
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

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  meta: null,
  filters: {
    search: '',
    role: '',
    status: '',
    tenantId: '',
    page: 1,
    limit: 10,
  },
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    tenantId?: string;
  }) => {
    const response = await userService.getUsers(params);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch users');
    }
    return { data: response.data || [], meta: response.meta };
  }
);

export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id: string) => {
    const response = await userService.getUserById(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch user');
    }
    return response.data;
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>) => {
    const response = await userService.createUser(data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create user');
    }
    return response.data;
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, data }: { id: string; data: Partial<User> }) => {
    const response = await userService.updateUser(id, data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update user');
    }
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: string) => {
    const response = await userService.deleteUser(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete user');
    }
    return id;
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<UserState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.meta = action.payload.meta || null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload || null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user';
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.users.unshift(action.payload);
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create user';
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.users.findIndex(u => u.id === action.payload!.id);
          if (index !== -1) {
            state.users[index] = action.payload;
          }
          if (state.currentUser?.id === action.payload.id) {
            state.currentUser = action.payload;
          }
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user';
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
        if (state.currentUser?.id === action.payload) {
          state.currentUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete user';
      });
  },
});

export const { setFilters, clearFilters, clearCurrentUser, clearError } = userSlice.actions;

export default userSlice.reducer;

