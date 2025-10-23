import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
  Container,
  Stack,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  GitHub,
  AdminPanelSettings,
  PlayArrow,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login, register } from '../../store/slices/authSlice';
import { showSnackbar } from '../../store/slices/uiSlice';
import { ROUTES } from '../../constants';

interface LoginFormData {
  email: string;
  password: string;
}

const DEMO_CREDENTIALS = {
  email: 'admin@demo.com',
  password: 'Admin123456',
  firstName: 'Platform',
  lastName: 'Admin',
  phone: '+1234567890',
  role: 'super_admin' as const,
};

const ImprovedLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(login(data)).unwrap();
      dispatch(showSnackbar({
        message: '✅ Welcome back, Admin!',
        severity: 'success',
      }));
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract meaningful error message
      let errorMessage = '❌ Login failed. Please check your credentials.';
      
      if (typeof error === 'string') {
        errorMessage = `❌ ${error}`;
      } else if (error?.message) {
        errorMessage = `❌ ${error.message}`;
      } else if (error?.response?.data?.message) {
        errorMessage = `❌ ${error.response.data.message}`;
      } else if (error?.response?.status === 401) {
        errorMessage = '❌ Invalid email or password';
      } else if (error?.response?.status === 404) {
        errorMessage = '❌ User not found';
      } else if (error?.response?.status === 403) {
        errorMessage = '❌ Account is suspended or inactive';
      } else if (error?.code === 'ERR_NETWORK') {
        errorMessage = '❌ Network error - Cannot connect to server';
      } else if (error?.code === 'ECONNREFUSED') {
        errorMessage = '❌ Server is not running';
      }
      
      dispatch(showSnackbar({
        message: errorMessage,
        severity: 'error',
      }));
    }
  };

  const handleDemoLogin = async () => {
    try {
      dispatch(showSnackbar({
        message: '🔄 Setting up demo admin account...',
        severity: 'info',
      }));

      // Try to register the demo account first (in case it doesn't exist)
      try {
        await dispatch(register({
          email: DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password,
          firstName: DEMO_CREDENTIALS.firstName,
          lastName: DEMO_CREDENTIALS.lastName,
          phone: DEMO_CREDENTIALS.phone,
          role: DEMO_CREDENTIALS.role,
        })).unwrap();
        
        dispatch(showSnackbar({
          message: '✅ Demo admin account created!',
          severity: 'success',
        }));
      } catch (regError: any) {
        console.log('Registration error:', regError);
        // If user already exists, that's fine - we'll just login
        const errorMessage = typeof regError === 'string' ? regError : 
                            regError?.message || 
                            regError?.response?.data?.message || 
                            String(regError);
        
        if (!errorMessage.toLowerCase().includes('already exists') && 
            !errorMessage.toLowerCase().includes('user exists')) {
          console.error('Registration failed:', errorMessage);
          throw new Error(`Registration failed: ${errorMessage}`);
        }
        console.log('Admin already exists, proceeding to login...');
      }

      // Now login with demo credentials
      await dispatch(login({
        email: DEMO_CREDENTIALS.email,
        password: DEMO_CREDENTIALS.password,
      })).unwrap();

      dispatch(showSnackbar({
        message: '🎉 Welcome to Admin Portal!',
        severity: 'success',
      }));
      
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      console.error('Demo login error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Unknown error';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.statusText) {
        errorMessage = `${error.response.status}: ${error.response.statusText}`;
      } else if (error?.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - Cannot connect to server';
      } else if (error?.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused - Server is not running';
      }
      
      dispatch(showSnackbar({
        message: `❌ Demo login failed: ${errorMessage}`,
        severity: 'error',
      }));
      
      // Still fill the form for manual retry
      setValue('email', DEMO_CREDENTIALS.email);
      setValue('password', DEMO_CREDENTIALS.password);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    dispatch(showSnackbar({
      message: `🚀 ${provider === 'google' ? 'Google' : 'GitHub'} Sign-In coming soon!`,
      severity: 'info',
    }));
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'error.main',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AdminPanelSettings sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              ⚙️ Platform Admin Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage the entire StudySpot platform
            </Typography>
            <Chip 
              label="Super Admin Access Only" 
              color="error" 
              size="small" 
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Demo Account Button */}
          <Button
            fullWidth
            variant="outlined"
            color="success"
            startIcon={<PlayArrow />}
            onClick={handleDemoLogin}
            sx={{ mb: 3, py: 1.5, borderWidth: 2 }}
          >
            Try Demo Admin Account
          </Button>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              {/* Email Field */}
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Admin Email Address"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="error" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* Password Field */}
              <Controller
                name="password"
                control={control}
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Admin Password"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="error" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
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

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                color="error"
                disabled={isLoading}
                sx={{ py: 1.5, mt: 1 }}
              >
                {isLoading ? 'Signing In...' : 'Admin Sign In'}
              </Button>
            </Stack>
          </form>

          {/* Forgot Password */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component={RouterLink}
              to={ROUTES.FORGOT_PASSWORD}
              variant="body2"
              sx={{ textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Social Login */}
          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              onClick={() => handleSocialLogin('google')}
              sx={{ py: 1.2 }}
            >
              Continue with Google
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHub />}
              onClick={() => handleSocialLogin('github')}
              sx={{ py: 1.2 }}
            >
              Continue with GitHub
            </Button>
          </Stack>

          {/* Register Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Need admin access?{' '}
              <Link
                component={RouterLink}
                to={ROUTES.REGISTER}
                sx={{ fontWeight: 600, textDecoration: 'none' }}
              >
                Request Access
              </Link>
            </Typography>
          </Box>

          {/* Footer Info */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              🔒 Secure Admin Login • 256-bit Encryption
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 0.5 }}>
              Technical Support: tech@studyspot.com
            </Typography>
          </Box>
        </Paper>

        {/* Demo Credentials Info */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2,
            bgcolor: 'error.50',
            border: '1px solid',
            borderColor: 'error.main',
          }}
        >
          <Typography variant="subtitle2" color="error.main" gutterBottom sx={{ fontWeight: 600 }}>
            🎯 Demo Admin Credentials
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Email:</strong> {DEMO_CREDENTIALS.email}
            <br />
            <strong>Password:</strong> {DEMO_CREDENTIALS.password}
            <br />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Click "Try Demo Admin Account" button above to auto-fill
            </Typography>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ImprovedLoginPage;

