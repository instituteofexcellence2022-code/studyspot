/**
 * StudySpot Mobile App - Offline Slice
 * Redux slice for managing offline state and data
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {offlineService} from '@services/OfflineService';

// =============================================================================
// INITIAL STATE
// =============================================================================

interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingActions: number;
  offlineData: {
    libraries: any[];
    bookings: any[];
    userProfile: any | null;
  };
  syncError: string | null;
}

const initialState: OfflineState = {
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
  pendingActions: 0,
  offlineData: {
    libraries: [],
    bookings: [],
    userProfile: null,
  },
  syncError: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Initialize offline service
 */
export const initializeOfflineService = createAsyncThunk(
  'offline/initializeOfflineService',
  async (_, {dispatch}) => {
    // Set up network listener
    const unsubscribe = offlineService.addNetworkListener((isOnline) => {
      dispatch(setOnlineStatus(isOnline));
    });

    // Load offline data
    const libraries = await offlineService.getOfflineData('libraries');
    const bookings = await offlineService.getOfflineData('bookings');
    const userProfile = await offlineService.getOfflineData('userProfile');
    const lastSyncTime = await offlineService.getOfflineData('lastSyncTime');

    return {
      libraries: libraries || [],
      bookings: bookings || [],
      userProfile,
      lastSyncTime,
      unsubscribe,
    };
  }
);

/**
 * Sync offline actions
 */
export const syncOfflineActions = createAsyncThunk(
  'offline/syncOfflineActions',
  async (_, {rejectWithValue}) => {
    try {
      await offlineService.syncOfflineActions();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync offline actions');
    }
  }
);

/**
 * Sync offline data
 */
export const syncOfflineData = createAsyncThunk(
  'offline/syncOfflineData',
  async (_, {rejectWithValue}) => {
    try {
      await offlineService.syncOfflineData();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync offline data');
    }
  }
);

/**
 * Add offline action
 */
export const addOfflineAction = createAsyncThunk(
  'offline/addOfflineAction',
  async (action: {
    type: 'CREATE_BOOKING' | 'CANCEL_BOOKING' | 'CHECKIN' | 'CHECKOUT' | 'UPDATE_PROFILE';
    data: any;
    maxRetries?: number;
  }, {rejectWithValue}) => {
    try {
      await offlineService.addOfflineAction({
        type: action.type,
        data: action.data,
        maxRetries: action.maxRetries || 3,
      });

      // Update pending actions count
      const actions = await offlineService.getOfflineActions();
      return actions.length;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add offline action');
    }
  }
);

/**
 * Get offline data
 */
export const getOfflineData = createAsyncThunk(
  'offline/getOfflineData',
  async (key: string, {rejectWithValue}) => {
    try {
      const data = await offlineService.getOfflineData(key);
      return {key, data};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get offline data');
    }
  }
);

/**
 * Store offline data
 */
export const storeOfflineData = createAsyncThunk(
  'offline/storeOfflineData',
  async (params: {key: string; data: any}, {rejectWithValue}) => {
    try {
      await offlineService.storeOfflineData(params.key, params.data);
      return params;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to store offline data');
    }
  }
);

/**
 * Clear offline data
 */
export const clearOfflineData = createAsyncThunk(
  'offline/clearOfflineData',
  async (_, {rejectWithValue}) => {
    try {
      await offlineService.clearAllOfflineData();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear offline data');
    }
  }
);

// =============================================================================
// OFFLINE SLICE
// =============================================================================

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    // Set online status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },

    // Set syncing status
    setSyncingStatus: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },

    // Clear sync error
    clearSyncError: (state) => {
      state.syncError = null;
    },

    // Update offline data
    updateOfflineData: (state, action: PayloadAction<{
      key: 'libraries' | 'bookings' | 'userProfile';
      data: any;
    }>) => {
      state.offlineData[action.payload.key] = action.payload.data;
    },

    // Update pending actions count
    updatePendingActions: (state, action: PayloadAction<number>) => {
      state.pendingActions = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Initialize Offline Service
      .addCase(initializeOfflineService.pending, state => {
        state.isSyncing = true;
        state.syncError = null;
      })
      .addCase(initializeOfflineService.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.offlineData.libraries = action.payload.libraries;
        state.offlineData.bookings = action.payload.bookings;
        state.offlineData.userProfile = action.payload.userProfile;
        state.lastSyncTime = action.payload.lastSyncTime;
        state.syncError = null;
      })
      .addCase(initializeOfflineService.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncError = action.payload as string;
      })

      // Sync Offline Actions
      .addCase(syncOfflineActions.pending, state => {
        state.isSyncing = true;
        state.syncError = null;
      })
      .addCase(syncOfflineActions.fulfilled, (state) => {
        state.isSyncing = false;
        state.syncError = null;
      })
      .addCase(syncOfflineActions.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncError = action.payload as string;
      })

      // Sync Offline Data
      .addCase(syncOfflineData.pending, state => {
        state.isSyncing = true;
        state.syncError = null;
      })
      .addCase(syncOfflineData.fulfilled, (state) => {
        state.isSyncing = false;
        state.lastSyncTime = new Date().toISOString();
        state.syncError = null;
      })
      .addCase(syncOfflineData.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncError = action.payload as string;
      })

      // Add Offline Action
      .addCase(addOfflineAction.pending, state => {
        state.syncError = null;
      })
      .addCase(addOfflineAction.fulfilled, (state, action) => {
        state.pendingActions = action.payload;
        state.syncError = null;
      })
      .addCase(addOfflineAction.rejected, (state, action) => {
        state.syncError = action.payload as string;
      })

      // Get Offline Data
      .addCase(getOfflineData.fulfilled, (state, action) => {
        const {key, data} = action.payload;
        if (key === 'libraries') {
          state.offlineData.libraries = data || [];
        } else if (key === 'bookings') {
          state.offlineData.bookings = data || [];
        } else if (key === 'userProfile') {
          state.offlineData.userProfile = data;
        }
      })

      // Store Offline Data
      .addCase(storeOfflineData.fulfilled, (state, action) => {
        const {key, data} = action.payload;
        if (key === 'libraries') {
          state.offlineData.libraries = data;
        } else if (key === 'bookings') {
          state.offlineData.bookings = data;
        } else if (key === 'userProfile') {
          state.offlineData.userProfile = data;
        }
      })

      // Clear Offline Data
      .addCase(clearOfflineData.fulfilled, (state) => {
        state.offlineData = {
          libraries: [],
          bookings: [],
          userProfile: null,
        };
        state.pendingActions = 0;
        state.lastSyncTime = null;
      });
  },
});

// =============================================================================
// ACTIONS
// =============================================================================

export const {
  setOnlineStatus,
  setSyncingStatus,
  clearSyncError,
  updateOfflineData,
  updatePendingActions,
} = offlineSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectIsOnline = (state: {offline: OfflineState}) => state.offline.isOnline;
export const selectIsSyncing = (state: {offline: OfflineState}) => state.offline.isSyncing;
export const selectLastSyncTime = (state: {offline: OfflineState}) => state.offline.lastSyncTime;
export const selectPendingActions = (state: {offline: OfflineState}) => state.offline.pendingActions;
export const selectOfflineData = (state: {offline: OfflineState}) => state.offline.offlineData;
export const selectOfflineLibraries = (state: {offline: OfflineState}) => state.offline.offlineData.libraries;
export const selectOfflineBookings = (state: {offline: OfflineState}) => state.offline.offlineData.bookings;
export const selectOfflineUserProfile = (state: {offline: OfflineState}) => state.offline.offlineData.userProfile;
export const selectSyncError = (state: {offline: OfflineState}) => state.offline.syncError;

// =============================================================================
// EXPORTS
// =============================================================================

export default offlineSlice.reducer;


