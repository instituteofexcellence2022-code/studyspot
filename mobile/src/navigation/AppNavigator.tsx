/**
 * StudySpot Mobile App - Main App Navigator
 * Root navigator that handles authentication flow
 */

import React from 'react';
import {useSelector} from 'react-redux';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from '../types/index';
import {selectIsAuthenticated} from '../store/slices/authSlice';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// =============================================================================
// STACK NAVIGATOR
// =============================================================================

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({current, layouts}) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
