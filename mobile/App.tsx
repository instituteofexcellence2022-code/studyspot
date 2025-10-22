/**
 * StudySpot Mobile App - Root Component
 * Main entry point for the React Native application
 */

import React, {useEffect} from 'react';
import {StatusBar, Platform} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {NativeBaseProvider} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// Store
import {store, persistor} from './src/store';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Services
import {notificationService} from './src/services/NotificationService';
import {offlineService} from './src/services/OfflineService';

// Components
import LoadingScreen from './src/components/LoadingScreen';
import OfflineIndicator from './src/components/OfflineIndicator';

// Theme
import {theme} from './src/constants/theme';

// =============================================================================
// APP COMPONENT
// =============================================================================

const App: React.FC = () => {
  useEffect(() => {
    initializeServices();
    setupStatusBar();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize notification service
      await notificationService.initialize();
      console.log('Notification service initialized');

      // Initialize offline service
      console.log('Offline service initialized');
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  };

  const setupStatusBar = () => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.primary[500]);
    }
    StatusBar.setBarStyle('light-content');
  };

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <SafeAreaProvider>
          <NativeBaseProvider theme={theme}>
            <NavigationContainer>
              <AppNavigator />
              <OfflineIndicator />
              <Toast />
            </NavigationContainer>
          </NativeBaseProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;