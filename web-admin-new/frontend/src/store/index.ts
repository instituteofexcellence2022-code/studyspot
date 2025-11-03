// ============================================
// REDUX STORE CONFIGURATION
// ============================================

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import tenantReducer from './slices/tenantSlice';
import userReducer from './slices/userSlice';
import revenueReducer from './slices/revenueSlice';
import creditsReducer from './slices/creditsSlice';
import subscriptionsReducer from './slices/subscriptionsSlice';
import analyticsReducer from './slices/analyticsSlice';
import studentReducer from './slices/studentSlice';
import libraryReducer from './slices/librarySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    tenant: tenantReducer,
    user: userReducer,
    revenue: revenueReducer,
    credits: creditsReducer,
    subscriptions: subscriptionsReducer,
    analytics: analyticsReducer,
    student: studentReducer,
    library: libraryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
