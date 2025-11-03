/**
 * StudySpot Mobile App - Root Component
 * Main entry point for the React Native application
 */

import React, {useEffect, useRef} from 'react';
import {StatusBar, Platform} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {NativeBaseProvider} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClientProvider} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// Store
import {store, persistor} from './src/store';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Services
import {notificationService} from './src/services/NotificationService';
import {offlineService} from './src/services/OfflineService';
import {queryClient} from './src/services/queryClient';
import {deepLinkingService} from './src/services/DeepLinkingService';
import {performanceMonitoring} from './src/services/PerformanceMonitoringService';

// Components
import LoadingScreen from './src/components/LoadingScreen';
import OfflineIndicator from './src/components/OfflineIndicator';
import ErrorBoundary from './src/components/common/ErrorBoundary';

// Theme
import {theme} from './src/constants/theme';

// =============================================================================
// APP COMPONENT
// =============================================================================

const App: React.FC = () => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    initializeServices();
    setupStatusBar();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize performance monitoring
      await performanceMonitoring.initialize();
      console.log('Performance monitoring initialized');

      // Initialize notification service
      await notificationService.initialize();
      console.log('Notification service initialized');

      // Initialize offline service
      console.log('Offline service initialized');

      // Initialize deep linking
      if (navigationRef.current) {
        deepLinkingService.initialize(navigationRef.current);
        console.log('Deep linking service initialized');
      }
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
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <NativeBaseProvider theme={theme}>
                <NavigationContainer ref={navigationRef}>
                  <AppNavigator />
                  <OfflineIndicator />
                  <Toast />
                </NavigationContainer>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;












