/**
 * StudySpot Mobile App - Main Navigator
 * Tab navigator for the main application screens
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {MainTabParamList, RootStackParamList} from '../types/index';
import {COLORS} from '../constants/index';

// Screens
import HomeScreen from '@screens/main/HomeScreen';
import SearchScreen from '@screens/main/SearchScreen';
import BookingsScreen from '@screens/main/BookingsScreen';
import ProfileTabScreen from '@screens/main/ProfileTabScreen';

// Additional Screens
import LibraryDetailsScreen from '@screens/LibraryDetailsScreen';
import BookingConfirmationScreen from '@screens/BookingConfirmationScreen';
import PaymentScreen from '@screens/PaymentScreen';
import LibraryFeePaymentScreen from '@screens/LibraryFeePaymentScreen';
import ProfileScreen from '@screens/ProfileScreen';
import SettingsScreen from '@screens/SettingsScreen';
import HelpScreen from '@screens/HelpScreen';
import AboutScreen from '@screens/AboutScreen';
import QRCodeScreen from '@screens/QRCodeScreen';
import RecommendationsScreen from '@screens/RecommendationsScreen';
import GamificationScreen from '@screens/GamificationScreen';
import ChatbotScreen from '@screens/ChatbotScreen';

// =============================================================================
// TAB NAVIGATOR
// =============================================================================

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Search':
              iconName = 'search';
              break;
            case 'Bookings':
              iconName = 'event';
              break;
            case 'ProfileTab':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY[500],
        tabBarStyle: {
          backgroundColor: COLORS.WHITE,
          borderTopColor: COLORS.BORDER.PRIMARY,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileTabScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// =============================================================================
// STACK NAVIGATOR
// =============================================================================

const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="LibraryDetails"
        component={LibraryDetailsScreen}
        options={{
          headerShown: true,
          title: 'Library Details',
        }}
      />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{
          headerShown: true,
          title: 'Booking Confirmation',
        }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          headerShown: true,
          title: 'Payment',
        }}
      />
      <Stack.Screen
        name="LibraryFeePayment"
        component={LibraryFeePaymentScreen}
        options={{
          headerShown: false,
          title: 'Library Fee Payment',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          headerShown: true,
          title: 'Help & Support',
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: true,
          title: 'About',
        }}
      />
      <Stack.Screen
        name="QRCode"
        component={QRCodeScreen}
        options={{
          headerShown: true,
          title: 'QR Code',
        }}
      />
      <Stack.Screen
        name="Recommendations"
        component={RecommendationsScreen}
        options={{
          headerShown: true,
          title: 'Recommendations',
        }}
      />
      <Stack.Screen
        name="Gamification"
        component={GamificationScreen}
        options={{
          headerShown: true,
          title: 'Gamification',
        }}
      />
      <Stack.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          headerShown: true,
          title: 'AI Assistant',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
