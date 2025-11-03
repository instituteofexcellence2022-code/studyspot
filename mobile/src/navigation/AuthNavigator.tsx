/**
 * StudySpot Mobile App - Authentication Navigator
 * Stack navigator for authentication-related screens
 */

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthStackParamList} from '../types/index';

// Screens
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import VerifyOTPScreen from '@screens/auth/VerifyOTPScreen';
import OnboardingScreen from '@screens/auth/OnboardingScreen';

// =============================================================================
// STACK NAVIGATOR
// =============================================================================

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
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
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
