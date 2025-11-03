/**
 * Enhanced Error Boundary Component
 * Advanced error handling with recovery options and detailed reporting
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon,
  Report as ReportIcon,
} from '@mui/icons-material';
import { trackError, trackActivity } from '../../utils/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  enableReporting?: boolean;
  enableRecovery?: boolean;
  level?: 'page' | 'component' | 'global';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  showDetails: boolean;
  isReporting: boolean;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      showDetails: props.showDetails || false,
      isReporting: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    this.setState({
      error,
      errorInfo,
    });

    // Track error for monitoring
    trackError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      errorBoundary: level,
      severity: this.getErrorSeverity(error),
      category: 'javascript',
    });

    // Track user activity
    trackActivity('error_boundary_triggered', level, {
      errorId: this.state.errorId,
      errorMessage: error.message,
      componentStack: errorInfo.componentStack || undefined,
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', this.state.errorId);
      console.groupEnd();
    }
  }

  private getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium';
    }
    
    if (message.includes('chunk') || message.includes('loading')) {
      return 'low';
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'high';
    }
    
    if (message.includes('memory') || message.includes('out of memory')) {
      return 'critical';
    }
    
    return 'high';
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      trackActivity('error_boundary_max_retries_reached', 'recovery', {
        errorId: this.state.errorId,
        retryCount,
      });
      return;
    }

    trackActivity('error_boundary_retry', 'recovery', {
      errorId: this.state.errorId,
      retryCount: retryCount + 1,
    });

    // Clear retry timeout if exists
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    // Retry after a short delay
    this.retryTimeout = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }, 1000);
  };

  private handleGoHome = () => {
    trackActivity('error_boundary_go_home', 'recovery', {
      errorId: this.state.errorId,
    });
    
    window.location.href = '/';
  };

  private handleReload = () => {
    trackActivity('error_boundary_reload', 'recovery', {
      errorId: this.state.errorId,
    });
    
    window.location.reload();
  };

  private handleReportError = async () => {
    const { error, errorInfo, errorId } = this.state;
    
    if (!error) return;

    this.setState({ isReporting: true });

    try {
      // Send error report to server
      const response = await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo?.componentStack,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userId: localStorage.getItem('studyspot_user_data') ? 
            JSON.parse(localStorage.getItem('studyspot_user_data')!).id : 'anonymous',
        }),
      });

      if (response.ok) {
        trackActivity('error_boundary_report_sent', 'reporting', {
          errorId,
        });
        
        alert('Error report sent successfully. Thank you for helping us improve!');
      } else {
        throw new Error('Failed to send error report');
      }
    } catch (reportError) {
      console.error('Failed to send error report:', reportError);
      alert('Failed to send error report. Please try again later.');
    } finally {
      this.setState({ isReporting: false });
    }
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    const { hasError, error, errorInfo, errorId, retryCount, showDetails, isReporting } = this.state;
    const { children, fallback, enableReporting = true, enableRecovery = true, level = 'component' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const severity = error ? this.getErrorSeverity(error) : 'high';
      const isChunkError = error?.message.includes('chunk') || error?.message.includes('Loading');
      const isNetworkError = error?.message.includes('network') || error?.message.includes('fetch');

      return (
        <Box sx={{ p: 3 }}>
          <Card variant="outlined" sx={{ maxWidth: 800, mx: 'auto' }}>
            <CardContent>
              <Stack spacing={3}>
                {/* Error Header */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" component="h1" gutterBottom>
                      {isChunkError ? 'Loading Error' : 'Something went wrong'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {isChunkError 
                        ? 'There was a problem loading this part of the application.'
                        : 'An unexpected error occurred. We apologize for the inconvenience.'
                      }
                    </Typography>
                  </Box>
                </Stack>

                {/* Error ID */}
                <Alert severity="info">
                  <AlertTitle>Error ID: {errorId}</AlertTitle>
                  Please include this ID when reporting the issue.
                </Alert>

                {/* Error Details */}
                <Accordion expanded={showDetails} onChange={this.toggleDetails}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BugReportIcon />
                      <Typography>Error Details</Typography>
                      <Chip 
                        size="small" 
                        label={severity} 
                        color={severity === 'critical' ? 'error' : severity === 'high' ? 'warning' : 'default'}
                      />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Error Message:
                        </Typography>
                        <Typography variant="body2" component="pre" sx={{ 
                          backgroundColor: 'grey.100', 
                          p: 1, 
                          borderRadius: 1,
                          overflow: 'auto',
                          fontSize: '0.875rem',
                        }}>
                          {error?.message}
                        </Typography>
                      </Box>
                      
                      {error?.stack && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Stack Trace:
                          </Typography>
                          <Typography variant="body2" component="pre" sx={{ 
                            backgroundColor: 'grey.100', 
                            p: 1, 
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.75rem',
                            maxHeight: 200,
                          }}>
                            {error.stack}
                          </Typography>
                        </Box>
                      )}
                      
                      {errorInfo?.componentStack && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Component Stack:
                          </Typography>
                          <Typography variant="body2" component="pre" sx={{ 
                            backgroundColor: 'grey.100', 
                            p: 1, 
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.75rem',
                            maxHeight: 200,
                          }}>
                            {errorInfo.componentStack}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                <Divider />

                {/* Recovery Actions */}
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {enableRecovery && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={this.handleRetry}
                        disabled={retryCount >= 3}
                      >
                        {retryCount >= 3 ? 'Max Retries Reached' : `Try Again (${retryCount}/3)`}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<HomeIcon />}
                        onClick={this.handleGoHome}
                      >
                        Go to Home
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={this.handleReload}
                      >
                        Reload Page
                      </Button>
                    </>
                  )}
                  
                  {enableReporting && (
                    <Button
                      variant="outlined"
                      startIcon={<ReportIcon />}
                      onClick={this.handleReportError}
                      disabled={isReporting}
                    >
                      {isReporting ? 'Reporting...' : 'Report Error'}
                    </Button>
                  )}
                </Stack>

                {/* Recovery Suggestions */}
                {isChunkError && (
                  <Alert severity="warning">
                    <AlertTitle>Chunk Loading Error</AlertTitle>
                    This is usually caused by a network issue or outdated cache. Try refreshing the page or clearing your browser cache.
                  </Alert>
                )}

                {isNetworkError && (
                  <Alert severity="info">
                    <AlertTitle>Network Error</AlertTitle>
                    Please check your internet connection and try again. If the problem persists, the server might be temporarily unavailable.
                  </Alert>
                )}

                {retryCount >= 3 && (
                  <Alert severity="error">
                    <AlertTitle>Maximum Retries Reached</AlertTitle>
                    We've tried to recover from this error multiple times. Please reload the page or contact support if the problem persists.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return children;
  }
}

export default EnhancedErrorBoundary;
