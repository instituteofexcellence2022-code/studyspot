/**
 * StudySpot Mobile App - Authentication Slice
 * Redux slice for managing authentication state
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {AuthState, User, AuthTokens, LoginCredentials, RegisterData} from '../../types/index';
import {authService} from '@services/AuthService';
import {STORAGE_KEYS} from '@constants/index';

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Login user with email/password or social login
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, {rejectWithValue}) => {
    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

/**
 * Register new user
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterData, {rejectWithValue}) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

/**
 * Refresh access token
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, {getState, rejectWithValue}) => {
    try {
      const state = getState() as any;
      const refreshTokenValue = state.auth.tokens?.refreshToken;

      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshTokenValue);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

/**
 * Logout user
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, {getState, rejectWithValue}) => {
    try {
      const state = getState() as any;
      const tokens = state.auth.tokens;

      if (tokens) {
        await authService.logout(tokens.accessToken);
      }

      return true;
    } catch (error: any) {
      // Even if logout fails on server, we should clear local state
      return true;
    }
  }
);

/**
 * Forgot password
 */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, {rejectWithValue}) => {
    try {
      const response = await authService.forgotPassword(email);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

/**
 * Reset password
 */
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: {token: string; newPassword: string}, {rejectWithValue}) => {
    try {
      const response = await authService.resetPassword(data.token, data.newPassword);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

/**
 * Verify OTP
 */
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: {email: string; otp: string; type: 'register' | 'reset'}, {rejectWithValue}) => {
    try {
      const response = await authService.verifyOTP(data.email, data.otp, data.type);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

// =============================================================================
// AUTH SLICE
// =============================================================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: state => {
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set user data
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    // Set tokens
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
    },

    // Clear tokens
    clearTokens: state => {
      state.tokens = null;
    },

    // Clear user data
    clearUser: state => {
      state.user = null;
      state.isAuthenticated = false;
    },

    // Initialize auth state from storage
    initializeAuth: (state, action: PayloadAction<{user: User; tokens: AuthTokens}>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
    },
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Register
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Refresh Token
      .addCase(refreshToken.pending, state => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokens = action.payload.tokens;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.tokens = null;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isLoading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Still clear the state even if logout fails
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reset Password
      .addCase(resetPassword.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify OTP
      .addCase(verifyOTP.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// =============================================================================
// ACTIONS
// =============================================================================

export const {
  clearError,
  setLoading,
  setUser,
  setTokens,
  clearTokens,
  clearUser,
  initializeAuth,
} = authSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectAuth = (state: {auth: AuthState}) => state.auth;
export const selectUser = (state: {auth: AuthState}) => state.auth.user;
export const selectTokens = (state: {auth: AuthState}) => state.auth.tokens;
export const selectIsAuthenticated = (state: {auth: AuthState}) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: {auth: AuthState}) => state.auth.isLoading;
export const selectAuthError = (state: {auth: AuthState}) => state.auth.error;

// =============================================================================
// EXPORTS
// =============================================================================

export default authSlice.reducer;
