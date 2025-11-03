/**
 * StudySpot Mobile App - Redux Store Configuration
 * Centralized state management with Redux Toolkit
 */

import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from 'redux-persist';

// Import all slices
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import librariesSlice from './slices/librariesSlice';
import bookingsSlice from './slices/bookingsSlice';
import paymentsSlice from './slices/paymentsSlice';
import notificationsSlice from './slices/notificationsSlice';
import offlineSlice from './slices/offlineSlice';
import appSlice from './slices/appSlice';
import recommendationsSlice from './slices/recommendationsSlice';
import gamificationSlice from './slices/gamificationSlice';
import chatbotSlice from './slices/chatbotSlice';
import analyticsSlice from './slices/analyticsSlice';

// =============================================================================
// PERSIST CONFIGURATION
// =============================================================================

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'app', 'offline'], // Only persist these slices
  blacklist: ['libraries', 'bookings', 'payments', 'notifications', 'recommendations', 'gamification', 'chatbot', 'analytics'], // Don't persist these
};

// =============================================================================
// ROOT REDUCER
// =============================================================================

const rootReducer = combineReducers({
  auth: authSlice,
  user: userSlice,
  libraries: librariesSlice,
  bookings: bookingsSlice,
  payments: paymentsSlice,
  notifications: notificationsSlice,
  offline: offlineSlice,
  app: appSlice,
  recommendations: recommendationsSlice,
  gamification: gamificationSlice,
  chatbot: chatbotSlice,
  analytics: analyticsSlice,
});

// =============================================================================
// PERSISTED REDUCER
// =============================================================================

const persistedReducer = persistReducer(persistConfig, rootReducer);

// =============================================================================
// STORE CONFIGURATION
// =============================================================================

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: __DEV__,
});

// =============================================================================
// PERSISTOR
// =============================================================================

export const persistor = persistStore(store);

// =============================================================================
// TYPES
// =============================================================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// =============================================================================
// EXPORTS
// =============================================================================

export default store;
