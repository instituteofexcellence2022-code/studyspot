// ============================================
// AUTH SLICE - Redux State Management
// ============================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginCredentials } from '../../types';
import { storage } from '../../utils/storage';

// Initial state
const initialState: AuthState = {
  isAuthenticated: !!storage.getAuthToken(),
  user: storage.get<User>('admin_user'),
  token: storage.getAuthToken(),
  refreshToken: storage.getRefreshToken(),
  loading: false,
  error: null,
};

// Mock user for development
const MOCK_USER: User = {
  id: '1',
  email: 'admin@studyspot.com',
  name: 'Super Admin',
  role: 'super_admin',
  tenantId: null,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Mock login - simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (credentials.email === 'admin@studyspot.com' && credentials.password === 'admin123') {
        const token = 'mock-jwt-token-' + Date.now();
        const refreshToken = 'mock-refresh-token-' + Date.now();

        // Store tokens
        storage.setAuthToken(token);
        storage.setRefreshToken(refreshToken);
        storage.set('admin_user', MOCK_USER);

        return {
          user: MOCK_USER,
          token,
          refreshToken,
        };
      }

      return rejectWithValue('Invalid email or password');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear auth data
      storage.clearAuthData();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      if (action.payload) {
        storage.set('admin_user', action.payload);
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) {
        storage.setAuthToken(action.payload);
      }
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      storage.clearAuthData();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        // Still clear auth even if logout API call fails
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setUser, setToken, clearAuth, clearError } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
