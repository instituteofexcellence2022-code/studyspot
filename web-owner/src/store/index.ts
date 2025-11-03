import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import librarySlice from './slices/librarySlice';
import bookingSlice from './slices/bookingSlice';
import uiSlice from './slices/uiSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import tenantSlice from './slices/tenantSlice';
import rbacSlice from './slices/rbacSlice';
import creditSlice from './slices/creditSlice';
import themeReducer from './themeSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui', 'theme'], // Only persist auth, UI, and theme state
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  user: userSlice,
  library: librarySlice,
  booking: bookingSlice,
  ui: uiSlice,
  subscription: subscriptionSlice,
  tenant: tenantSlice,
  rbac: rbacSlice,
  credit: creditSlice,
  theme: themeReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

