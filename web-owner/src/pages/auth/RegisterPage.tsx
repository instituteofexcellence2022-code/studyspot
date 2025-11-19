import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Collapse,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Info,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
  CloudOff,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { register, clearError } from '../../store/slices/authSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { ROUTES, USER_ROLES } from '../../constants';
import { RegisterRequest } from '../../types';
import { healthService, HealthStatus } from '../../services/healthService';
import { testBackendConnection, testRegistrationEndpoint } from '../../utils/testConnection';

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthMenuAnchor, setHealthMenuAnchor] = useState<null | HTMLElement>(null);

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
    // Check backend health on mount
    checkBackendHealth();
  }, [dispatch]);

  // Check backend health
  const checkBackendHealth = async () => {
    setIsCheckingHealth(true);
    try {
      // Show a message that we're checking (especially for Render services)
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      if (apiUrl.includes('render.com') || apiUrl.includes('onrender.com')) {
        setHealthStatus({
          isHealthy: false,
          isConnected: false,
          status: 'checking',
          message: 'Checking backend... Render services may take 30-60 seconds to wake up on first request.',
          timestamp: Date.now(),
        });
      }
      
      const status = await healthService.checkHealth(true);
      setHealthStatus(status);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({
        isHealthy: false,
        isConnected: false,
        status: 'unknown',
        message: 'Failed to check backend health',
        timestamp: Date.now(),
        error: 'Health check error',
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: USER_ROLES.LIBRARY_OWNER, // All registrations are library owners by default
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Check backend health before registration (but don't block if health check fails)
      // The health check might fail due to timeout, but the actual API might work
      try {
        const health = await healthService.quickCheck();
        if (!health) {
          console.warn('[RegisterPage] Health check failed, but proceeding with registration attempt');
          // Don't block registration - let it try and show actual error if it fails
        }
      } catch (healthError) {
        console.warn('[RegisterPage] Health check error (non-blocking):', healthError);
        // Continue with registration attempt
      }

      const { confirmPassword, ...registerData } = data;
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      console.log('🔄 Attempting registration:', { 
        ...registerData, 
        password: '***',
        apiUrl,
      });
      
      const result = await dispatch(register(registerData)).unwrap();
      
      console.log('✅ Registration successful:', result);
      dispatch(showSnackbar({
        message: '✅ Registration successful! Please log in.',
        severity: 'success',
      }));
      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        response: error?.response,
        stack: error?.stack,
      });
      
      // Extract error message from various possible structures
      let errorMessage = 'Registration failed. Please try again.';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.payload) {
        // Redux thunk rejection payload
        errorMessage = typeof error.payload === 'string' ? error.payload : error.payload?.message || errorMessage;
      }
      
      console.log('📢 Showing error:', errorMessage);
      
      // Show detailed error with API URL for debugging
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const detailedMessage = errorMessage.includes('network') || errorMessage.includes('Unable to reach')
        ? `${errorMessage}\n\nAPI URL: ${apiUrl}\n\nPlease ensure:\n1. Backend is running\n2. API URL is correct\n3. CORS is configured`
        : errorMessage;
      
      dispatch(showSnackbar({
        message: `❌ ${errorMessage}`,
        severity: 'error',
      }));
      
      // Also log to console for debugging
      console.error('Registration failed. API URL:', apiUrl);
      console.error('Full error:', error);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Create Library Owner Account
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Sign up to manage your library with 🎓 STUDYSPOT
      </Typography>

      {/* Backend Health Status - Compact Dropdown */}
      {healthStatus && !healthStatus.isHealthy && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Chip
            icon={
              healthStatus.status === 'checking' ? (
                <Refresh fontSize="small" sx={{ animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
              ) : (
                <CloudOff fontSize="small" />
              )
            }
            label="Backend Status"
            onClick={(e) => setHealthMenuAnchor(e.currentTarget)}
            color={healthStatus.isHealthy ? 'success' : 'warning'}
            size="small"
            sx={{ cursor: 'pointer' }}
          />
          <Menu
            anchorEl={healthMenuAnchor}
            open={Boolean(healthMenuAnchor)}
            onClose={() => setHealthMenuAnchor(null)}
            PaperProps={{
              sx: { minWidth: 300, maxWidth: 400 }
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="caption" fontWeight={600} display="block">
                  {healthStatus.isHealthy ? 'Backend Connected' : 'Backend Unavailable'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {healthStatus.message}
                  {healthStatus.latency && ` (${healthStatus.latency}ms)`}
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                API URL: {process.env.REACT_APP_API_URL || 'http://localhost:3001'}
              </Typography>
            </MenuItem>
            {!healthStatus.isHealthy && (
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Troubleshooting: Check if backend is running, verify API URL in .env file, or restart the dev server.
                </Typography>
              </MenuItem>
            )}
            <MenuItem 
              onClick={async () => {
                await checkBackendHealth();
                setHealthMenuAnchor(null);
              }}
              disabled={isCheckingHealth}
            >
              <Refresh fontSize="small" sx={{ mr: 1 }} />
              Refresh Status
            </MenuItem>
            <MenuItem 
              onClick={async () => {
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                console.log('Testing connection to:', apiUrl);
                const healthTest = await testBackendConnection(apiUrl);
                const regTest = await testRegistrationEndpoint(apiUrl);
                console.log('Health test:', healthTest);
                console.log('Registration endpoint test:', regTest);
                dispatch(showSnackbar({
                  message: `Connection test: Health ${healthTest.success ? '✅' : '❌'}, Registration ${regTest.success ? '✅' : '❌'}`,
                  severity: healthTest.success && regTest.success ? 'success' : 'error',
                }));
                setHealthMenuAnchor(null);
              }}
            >
              <Info fontSize="small" sx={{ mr: 1 }} />
              Test Connection
            </MenuItem>
          </Menu>
        </Box>
      )}

      {/* Error messages are now shown via GlobalSnackbar instead */}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="firstName"
              control={control}
              rules={{
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'First name must be at least 2 characters',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoComplete="given-name"
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="lastName"
              control={control}
              rules={{
                validate: (value) => {
                  if (value && value.trim().length > 0 && value.trim().length < 2) {
                    return 'Last name must be at least 2 characters';
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="lastName"
                  label="Last Name (Optional)"
                  autoComplete="family-name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  autoComplete="tel"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to={ROUTES.LOGIN} variant="body2">
            Already have an account? Sign In
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;

