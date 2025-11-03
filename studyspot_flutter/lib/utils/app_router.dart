import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/auth_provider.dart';
import '../screens/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/auth/verify_otp_screen.dart';
import '../screens/auth/onboarding_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/main/main_navigator.dart';
import '../screens/main/booking_screen.dart';
import '../screens/main/bookings_screen.dart';
import '../screens/main/search_screen.dart';
import '../screens/main/profile_tab_screen.dart';
import '../screens/library/library_detail_screen.dart';
import '../screens/payment/payment_screen.dart';
import '../screens/payment/library_fee_payment_screen.dart';
import '../screens/qr/qr_code_screen.dart';
import '../screens/qr/qr_scanner_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/help/help_screen.dart';
import '../screens/about/about_screen.dart';
import '../screens/recommendations/recommendations_screen.dart';
import '../screens/gamification/gamification_screen.dart';
import '../screens/chatbot/chatbot_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      // Add authentication logic here if needed
      return null;
    },
    routes: [
      // Splash Screen
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      
      // Auth Routes
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/verify-otp',
        builder: (context, state) => const VerifyOTPScreen(),
      ),
      
      // Main App Routes
      GoRoute(
        path: '/main',
        builder: (context, state) => const MainNavigator(),
        routes: [
          GoRoute(
            path: 'home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: 'booking',
            builder: (context, state) => const BookingScreen(),
          ),
          GoRoute(
            path: 'bookings',
            builder: (context, state) => const BookingsScreen(),
          ),
          GoRoute(
            path: 'search',
            builder: (context, state) => const SearchScreen(),
          ),
          GoRoute(
            path: 'profile',
            builder: (context, state) => const ProfileTabScreen(),
          ),
        ],
      ),
      
      // Library Routes
      GoRoute(
        path: '/library/:id',
        builder: (context, state) {
          final libraryId = state.pathParameters['id']!;
          return LibraryDetailScreen(libraryId: libraryId);
        },
      ),
      
      // Payment Routes
      GoRoute(
        path: '/payment',
        builder: (context, state) => const PaymentScreen(),
      ),
      GoRoute(
        path: '/library-fee-payment',
        builder: (context, state) => const LibraryFeePaymentScreen(),
      ),
      
      // QR Code Routes
      GoRoute(
        path: '/qr-code',
        builder: (context, state) => const QRCodeScreen(),
      ),
      GoRoute(
        path: '/qr-scanner',
        builder: (context, state) => const QRScannerScreen(),
      ),
      
      // Profile & Settings Routes
      GoRoute(
        path: '/profile-screen',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/help',
        builder: (context, state) => const HelpScreen(),
      ),
      GoRoute(
        path: '/about',
        builder: (context, state) => const AboutScreen(),
      ),
      
      // Feature Routes
      GoRoute(
        path: '/recommendations',
        builder: (context, state) => const RecommendationsScreen(),
      ),
      GoRoute(
        path: '/gamification',
        builder: (context, state) => const GamificationScreen(),
      ),
      GoRoute(
        path: '/chatbot',
        builder: (context, state) => const ChatbotScreen(),
      ),
    ],
  );
}











