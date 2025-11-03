/**
 * StudySpot Mobile App - User Slice
 * Redux slice for managing user profile and preferences
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {User, ProfileForm, DocumentData, UserAnalytics} from '../../types/index';
import UserService from '../../services/UserService';

// =============================================================================
// INITIAL STATE
// =============================================================================

interface UserState {
  profile: User | null;
  analytics: UserAnalytics | null;
  documents: DocumentData[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  analytics: null,
  documents: [],
  isLoading: false,
  error: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Get user profile
 */
export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (_, {rejectWithValue}) => {
    try {
      const response = await UserService.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
    }
  }
);

/**
 * Update user profile
 */
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData: ProfileForm, {rejectWithValue}) => {
    try {
      const response = await UserService.updateProfile(profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

/**
 * Upload document
 */
export const uploadDocument = createAsyncThunk(
  'user/uploadDocument',
  async (data: {file: any; documentType: string}, {rejectWithValue}) => {
    try {
      const response = await UserService.uploadDocument(data.file, data.documentType);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

/**
 * Get KYC status
 */
export const getKYCStatus = createAsyncThunk(
  'user/getKYCStatus',
  async (_, {rejectWithValue}) => {
    try {
      const response = await UserService.getKYCStatus();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get KYC status');
    }
  }
);

/**
 * Get user analytics
 */
export const getUserAnalytics = createAsyncThunk(
  'user/getUserAnalytics',
  async (_, {rejectWithValue}) => {
    try {
      const response = await UserService.getAnalytics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get analytics');
    }
  }
);

/**
 * Get user documents
 */
export const getUserDocuments = createAsyncThunk(
  'user/getUserDocuments',
  async (_, {rejectWithValue}) => {
    try {
      const response = await UserService.getDocuments();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get documents');
    }
  }
);

// =============================================================================
// USER SLICE
// =============================================================================

const userSlice = createSlice({
  name: 'user',
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

    // Set user profile
    setUserProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
    },

    // Clear user profile
    clearUserProfile: state => {
      state.profile = null;
      state.analytics = null;
      state.documents = [];
    },

    // Update profile locally
    updateProfileLocally: (state, action: PayloadAction<Partial<User>>) => {
      if (state.profile) {
        state.profile = {...state.profile, ...action.payload};
      }
    },

    // Add document
    addDocument: (state, action: PayloadAction<DocumentData>) => {
      state.documents.push(action.payload);
    },

    // Remove document
    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    },

    // Update document status
    updateDocumentStatus: (state, action: PayloadAction<{id: string; status: string}>) => {
      const document = state.documents.find(doc => doc.id === action.payload.id);
      if (document) {
        document.status = action.payload.status as any;
      }
    },
  },
  extraReducers: builder => {
    builder
      // Get User Profile
      .addCase(getUserProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update User Profile
      .addCase(updateUserProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Upload Document
      .addCase(uploadDocument.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.push(action.payload);
        state.error = null;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get KYC Status
      .addCase(getKYCStatus.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getKYCStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getKYCStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get User Analytics
      .addCase(getUserAnalytics.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
        state.error = null;
      })
      .addCase(getUserAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get User Documents
      .addCase(getUserDocuments.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
        state.error = null;
      })
      .addCase(getUserDocuments.rejected, (state, action) => {
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
  setUserProfile,
  clearUserProfile,
  updateProfileLocally,
  addDocument,
  removeDocument,
  updateDocumentStatus,
} = userSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectUser = (state: {user: UserState}) => state.user;
export const selectUserProfile = (state: {user: UserState}) => state.user.profile;
export const selectUserAnalytics = (state: {user: UserState}) => state.user.analytics;
export const selectUserDocuments = (state: {user: UserState}) => state.user.documents;
export const selectUserLoading = (state: {user: UserState}) => state.user.isLoading;
export const selectUserError = (state: {user: UserState}) => state.user.error;

// =============================================================================
// EXPORTS
// =============================================================================

export default userSlice.reducer;
