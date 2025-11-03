import { createSlice, PayloadAction
  } from '@reduxjs/toolkit';

interface UiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  loading: boolean;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  dialog: {
    open: boolean;
    type: string | null;
    data: any;
  };
  drawerWidth: number;
  language: string;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
  }>;
}

const initialState: UiState = {
  theme: 'light',
  sidebarOpen: true,
  loading: false,
  snackbar: {
    open: false,
    message: '',
    severity: 'info'},
  dialog: {
    open: false,
    type: null,
    data: null},
  drawerWidth: 240,
  language: 'en',
  notifications: []};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state: any) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state: any) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    showSnackbar: (state, action: PayloadAction<{
      message: string;
      severity?: 'success' | 'error' | 'warning' | 'info';
    }>) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info'};
    },
    hideSnackbar: (state: any) => {
      state.snackbar = {
        open: false,
        message: '',
        severity: 'info'};
    },
    showDialog: (state, action: PayloadAction<{
      type: string;
      data?: any;
    }>) => {
      state.dialog = {
        open: true,
        type: action.payload.type,
        data: action.payload.data || null};
    },
    hideDialog: (state: any) => {
      state.dialog = {
        open: false,
        type: null,
        data: null};
    },
    setDrawerWidth: (state, action: PayloadAction<number>) => {
      state.drawerWidth = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    addNotification: (state, action: PayloadAction<{
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
    }>) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload};
      state.notifications.unshift(notification);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state: any) => {
      state.notifications.forEach((notification: any) => {
        notification.read = true;
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n: any) => n.id !== action.payload);
    },
    clearAllNotifications: (state: any) => {
      state.notifications = [];
    }}});

export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setLoading,
  showSnackbar,
  hideSnackbar,
  showDialog,
  hideDialog,
  setDrawerWidth,
  setLanguage,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearAllNotifications} = uiSlice.actions;

export default uiSlice.reducer;


