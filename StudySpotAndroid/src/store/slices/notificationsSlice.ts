/**
 * StudySpot Mobile App - Notifications Slice
 * Redux slice for managing notifications state
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Notification} from '../../types/index';

// =============================================================================
// INITIAL STATE
// =============================================================================

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fcmToken: string | null;
  permissions: {
    granted: boolean;
    alert: boolean;
    badge: boolean;
    sound: boolean;
  };
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fcmToken: null,
  permissions: {
    granted: false,
    alert: false,
    badge: false,
    sound: false,
  },
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Get notifications
 */
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (params: {page?: number; limit?: number; accessToken: string}, {rejectWithValue}) => {
    try {
      // This would call your actual API
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      });
      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

/**
 * Mark notification as read
 */
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (params: {notificationId: string; accessToken: string}, {rejectWithValue}) => {
    try {
      // This would call your actual API
      const response = await fetch(`/api/notifications/${params.notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      });
      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (params: {accessToken: string}, {rejectWithValue}) => {
    try {
      // This would call your actual API
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      });
      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = createAsyncThunk(
  'notifications/updateNotificationPreferences',
  async (params: {
    preferences: {
      booking: boolean;
      payment: boolean;
      system: boolean;
      promotional: boolean;
    };
    accessToken: string;
  }, {rejectWithValue}) => {
    try {
      // This would call your actual API
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`,
        },
        body: JSON.stringify(params.preferences),
      });
      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update notification preferences');
    }
  }
);

// =============================================================================
// NOTIFICATIONS SLICE
// =============================================================================

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    // Remove notification
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },

    // Mark notification as read locally
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },

    // Mark all notifications as read locally
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set FCM token
    setFCMToken: (state, action: PayloadAction<string>) => {
      state.fcmToken = action.payload;
    },

    // Set permissions
    setPermissions: (state, action: PayloadAction<{
      granted: boolean;
      alert: boolean;
      badge: boolean;
      sound: boolean;
    }>) => {
      state.permissions = action.payload;
    },

    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: builder => {
    builder
      // Get Notifications
      .addCase(getNotifications.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.error = null;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Mark Notification As Read
      .addCase(markNotificationAsRead.pending, state => {
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload.id);
        if (notification) {
          notification.isRead = true;
          state.unreadCount -= 1;
        }
        state.error = null;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Mark All Notifications As Read
      .addCase(markAllNotificationsAsRead.pending, state => {
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Update Notification Preferences
      .addCase(updateNotificationPreferences.pending, state => {
        state.error = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// =============================================================================
// ACTIONS
// =============================================================================

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  clearError,
  setFCMToken,
  setPermissions,
  clearAllNotifications,
} = notificationsSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectNotifications = (state: {notifications: NotificationsState}) =>
  state.notifications.notifications;
export const selectUnreadCount = (state: {notifications: NotificationsState}) =>
  state.notifications.unreadCount;
export const selectNotificationsLoading = (state: {notifications: NotificationsState}) =>
  state.notifications.isLoading;
export const selectNotificationsError = (state: {notifications: NotificationsState}) =>
  state.notifications.error;
export const selectFCMToken = (state: {notifications: NotificationsState}) =>
  state.notifications.fcmToken;
export const selectNotificationPermissions = (state: {notifications: NotificationsState}) =>
  state.notifications.permissions;

// =============================================================================
// EXPORTS
// =============================================================================

export default notificationsSlice.reducer;
