/**
 * StudySpot Mobile App - Lottie Animation Components
 * Professional animations for better user experience
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

interface LottieAnimationProps {
  source: any;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: any;
  onAnimationFinish?: () => void;
}

/**
 * Generic Lottie Animation Component
 */
export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  source,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
  onAnimationFinish,
}) => {
  return (
    <LottieView
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      style={[styles.default, style]}
      onAnimationFinish={onAnimationFinish}
    />
  );
};

/**
 * Loading Animation Component
 */
export const LoadingAnimation: React.FC<{ size?: number }> = ({ 
  size = 200 
}) => {
  // You'll need to add your Lottie animation files to assets/animations/
  const loadingAnimation = require('../../assets/animations/loading.json');
  
  return (
    <LottieAnimation
      source={loadingAnimation}
      style={[styles.loading, { width: size, height: size }]}
    />
  );
};

/**
 * Success Animation Component
 */
export const SuccessAnimation: React.FC<{ 
  onFinish?: () => void;
  size?: number;
}> = ({ onFinish, size = 150 }) => {
  const successAnimation = require('../../assets/animations/success.json');
  
  return (
    <LottieAnimation
      source={successAnimation}
      autoPlay={true}
      loop={false}
      style={[styles.success, { width: size, height: size }]}
      onAnimationFinish={onFinish}
    />
  );
};

/**
 * Error Animation Component
 */
export const ErrorAnimation: React.FC<{ 
  onFinish?: () => void;
  size?: number;
}> = ({ onFinish, size = 150 }) => {
  const errorAnimation = require('../../assets/animations/error.json');
  
  return (
    <LottieAnimation
      source={errorAnimation}
      autoPlay={true}
      loop={false}
      style={[styles.error, { width: size, height: size }]}
      onAnimationFinish={onFinish}
    />
  );
};

/**
 * Empty State Animation Component
 */
export const EmptyStateAnimation: React.FC<{ 
  type: 'no-data' | 'no-results' | 'offline';
  size?: number;
}> = ({ type, size = 200 }) => {
  const animations = {
    'no-data': require('../../assets/animations/empty.json'),
    'no-results': require('../../assets/animations/no-results.json'),
    'offline': require('../../assets/animations/offline.json'),
  };
  
  return (
    <LottieAnimation
      source={animations[type]}
      style={[styles.emptyState, { width: size, height: size }]}
    />
  );
};

/**
 * Booking Success Animation
 */
export const BookingSuccessAnimation: React.FC<{ 
  onFinish?: () => void;
}> = ({ onFinish }) => {
  const bookingAnimation = require('../../assets/animations/booking-success.json');
  
  return (
    <LottieAnimation
      source={bookingAnimation}
      autoPlay={true}
      loop={false}
      style={styles.bookingSuccess}
      onAnimationFinish={onFinish}
    />
  );
};

/**
 * Payment Processing Animation
 */
export const PaymentProcessingAnimation: React.FC<{ 
  onFinish?: () => void;
}> = ({ onFinish }) => {
  const paymentAnimation = require('../../assets/animations/payment-processing.json');
  
  return (
    <LottieAnimation
      source={paymentAnimation}
      autoPlay={true}
      loop={true}
      style={styles.paymentProcessing}
      onAnimationFinish={onFinish}
    />
  );
};

/**
 * QR Code Scanning Animation
 */
export const QRScanningAnimation: React.FC<{ 
  isScanning: boolean;
  onFinish?: () => void;
}> = ({ isScanning, onFinish }) => {
  const qrAnimation = require('../../assets/animations/qr-scanning.json');
  
  return (
    <LottieAnimation
      source={qrAnimation}
      autoPlay={isScanning}
      loop={isScanning}
      style={styles.qrScanning}
      onAnimationFinish={onFinish}
    />
  );
};

/**
 * Welcome Animation Component
 */
export const WelcomeAnimation: React.FC<{ 
  onFinish?: () => void;
}> = ({ onFinish }) => {
  const welcomeAnimation = require('../../assets/animations/welcome.json');
  
  return (
    <LottieAnimation
      source={welcomeAnimation}
      autoPlay={true}
      loop={false}
      style={styles.welcome}
      onAnimationFinish={onFinish}
    />
  );
};

/**
 * Onboarding Animation Component
 */
export const OnboardingAnimation: React.FC<{ 
  step: number;
  onFinish?: () => void;
}> = ({ step, onFinish }) => {
  const animations = [
    require('../../assets/animations/onboarding-1.json'),
    require('../../assets/animations/onboarding-2.json'),
    require('../../assets/animations/onboarding-3.json'),
  ];
  
  return (
    <LottieAnimation
      source={animations[step - 1]}
      autoPlay={true}
      loop={false}
      style={styles.onboarding}
      onAnimationFinish={onFinish}
    />
  );
};

const styles = StyleSheet.create({
  default: {
    alignSelf: 'center',
  },
  loading: {
    alignSelf: 'center',
  },
  success: {
    alignSelf: 'center',
  },
  error: {
    alignSelf: 'center',
  },
  emptyState: {
    alignSelf: 'center',
  },
  bookingSuccess: {
    width: 250,
    height: 250,
    alignSelf: 'center',
  },
  paymentProcessing: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  qrScanning: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  welcome: {
    width: width * 0.8,
    height: width * 0.8,
    alignSelf: 'center',
  },
  onboarding: {
    width: width * 0.9,
    height: height * 0.4,
    alignSelf: 'center',
  },
});

export default LottieAnimation;
