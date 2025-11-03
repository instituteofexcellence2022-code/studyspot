// ============================================
// UI SLICE - Redux State Management
// ============================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, Notification, SnackbarState } from '../../types';
import { storage } from '../../utils/storage';

// Initial state
const initialState: UIState = {
  sidebarOpen: storage.getSidebarState(),
  themeMode: storage.getThemeMode(),
  notifications: [],
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  loading: false,
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
      storage.setSidebarState(state.sidebarOpen);
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
      storage.setSidebarState(action.payload);
    },

    // Theme
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      storage.setThemeMode(state.themeMode);
    },
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.themeMode = action.payload;
      storage.setThemeMode(action.payload);
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Snackbar
    showSnackbar: (state, action: PayloadAction<Partial<SnackbarState>>) => {
      state.snackbar = {
        open: true,
        message: action.payload.message || '',
        severity: action.payload.severity || 'info',
        autoHideDuration: action.payload.autoHideDuration,
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },

    // Success message helper
    showSuccess: (state, action: PayloadAction<string>) => {
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: 'success',
        autoHideDuration: 5000,
      };
    },

    // Error message helper
    showError: (state, action: PayloadAction<string>) => {
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: 'error',
        autoHideDuration: 6000,
      };
    },

    // Warning message helper
    showWarning: (state, action: PayloadAction<string>) => {
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: 'warning',
        autoHideDuration: 5000,
      };
    },

    // Info message helper
    showInfo: (state, action: PayloadAction<string>) => {
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: 'info',
        autoHideDuration: 4000,
      };
    },

    // Loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  setThemeMode,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  showSnackbar,
  hideSnackbar,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  setLoading,
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;

