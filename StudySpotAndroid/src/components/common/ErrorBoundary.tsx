/**
 * StudySpot Mobile App - Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Button, VStack, HStack, Alert } from 'native-base';
import { COLORS } from '../constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to crash reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to analytics/crash reporting
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Log to Firebase Crashlytics or other crash reporting service
    try {
      // Example: Firebase Crashlytics
      // crashlytics().recordError(error);
      
      // Log to console for development
      console.error('Error logged to service:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReportError = () => {
    // Open error reporting dialog or send error report
    console.log('Reporting error:', this.state.error);
    // Implementation for error reporting
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} p={6}>
          <VStack space={4} alignItems="center" justifyContent="center" flex={1}>
            {/* Error Icon */}
            <Box
              w={80}
              h={80}
              borderRadius="full"
              backgroundColor="red.100"
              alignItems="center"
              justifyContent="center"
            >
              <Text style={styles.errorIcon}>⚠️</Text>
            </Box>

            {/* Error Title */}
            <Text style={styles.errorTitle}>
              Oops! Something went wrong
            </Text>

            {/* Error Message */}
            <Text style={styles.errorMessage}>
              We're sorry, but something unexpected happened. Our team has been notified.
            </Text>

            {/* Error Details (Development only) */}
            {__DEV__ && this.state.error && (
              <Alert status="error" borderRadius="md" w="100%">
                <Alert.Icon />
                <VStack space={2} flex={1}>
                  <Text style={styles.errorDetailsTitle}>
                    Error Details:
                  </Text>
                  <Text style={styles.errorDetails}>
                    {this.state.error.message}
                  </Text>
                  {this.state.errorInfo && (
                    <Text style={styles.errorStack}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </VStack>
              </Alert>
            )}

            {/* Action Buttons */}
            <HStack space={3} mt={6}>
              <Button
                variant="outline"
                onPress={this.handleRetry}
                _pressed={{ backgroundColor: COLORS.BACKGROUND.SECONDARY }}
              >
                Try Again
              </Button>
              
              <Button
                backgroundColor={COLORS.PRIMARY}
                onPress={this.handleReportError}
                _pressed={{ backgroundColor: COLORS.PRIMARY_DARK }}
              >
                Report Issue
              </Button>
            </HStack>

            {/* Help Text */}
            <Text style={styles.helpText}>
              If this problem persists, please contact our support team.
            </Text>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorIcon: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT.PRIMARY,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  errorDetails: {
    fontSize: 12,
    color: '#d32f2f',
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  helpText: {
    fontSize: 14,
    color: COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ErrorBoundary;
