/**
 * StudySpot Mobile App - App Slice
 * Redux slice for managing general app state
 */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppState, NetworkStatus, Theme} from '../../types/index';

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AppState = {
  isLoading: false,
  error: null,
  networkStatus: {
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
  },
  isOffline: false,
  lastSyncTime: undefined,
  theme: 'light',
  language: 'en',
  onboardingCompleted: false,
};

// =============================================================================
// APP SLICE
// =============================================================================

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: state => {
      state.error = null;
    },

    // Set network status
    setNetworkStatus: (state, action: PayloadAction<NetworkStatus>) => {
      state.networkStatus = action.payload;
      state.isOffline = !action.payload.isConnected || !action.payload.isInternetReachable;
    },

    // Set offline mode
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },

    // Set last sync time
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },

    // Set theme
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },

    // Set language
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    // Set onboarding completed
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },

    // Reset app state
    resetAppState: state => {
      state.isLoading = false;
      state.error = null;
      state.isOffline = false;
      state.lastSyncTime = undefined;
    },
  },
});

// =============================================================================
// ACTIONS
// =============================================================================

export const {
  setLoading,
  setError,
  clearError,
  setNetworkStatus,
  setOfflineMode,
  setLastSyncTime,
  setTheme,
  setLanguage,
  setOnboardingCompleted,
  resetAppState,
} = appSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectApp = (state: {app: AppState}) => state.app;
export const selectAppLoading = (state: {app: AppState}) => state.app.isLoading;
export const selectAppError = (state: {app: AppState}) => state.app.error;
export const selectNetworkStatus = (state: {app: AppState}) => state.app.networkStatus;
export const selectIsOffline = (state: {app: AppState}) => state.app.isOffline;
export const selectLastSyncTime = (state: {app: AppState}) => state.app.lastSyncTime;
export const selectTheme = (state: {app: AppState}) => state.app.theme;
export const selectLanguage = (state: {app: AppState}) => state.app.language;
export const selectOnboardingCompleted = (state: {app: AppState}) => state.app.onboardingCompleted;

// =============================================================================
// EXPORTS
// =============================================================================

export default appSlice.reducer;
