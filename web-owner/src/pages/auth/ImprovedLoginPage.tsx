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
  BusinessCenter,
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
  email: 'owner@demo.com',
  password: 'Demo123456',
  firstName: 'Demo',
  lastName: 'Owner',
  phone: '+1234567890',
  role: 'library_owner' as const,
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
        message: '✅ Welcome back!',
        severity: 'success',
      }));
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      dispatch(showSnackbar({
        message: error || '❌ Login failed. Please check your credentials.',
        severity: 'error',
      }));
    }
  };

  const handleDemoLogin = async () => {
    try {
      dispatch(showSnackbar({
        message: '🔄 Setting up demo account...',
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
          message: '✅ Demo account created!',
          severity: 'success',
        }));
      } catch (regError: any) {
        // If user already exists, that's fine - we'll just login
        if (!regError.includes('already exists')) {
          throw regError;
        }
      }

      // Now login with demo credentials
      await dispatch(login({
        email: DEMO_CREDENTIALS.email,
        password: DEMO_CREDENTIALS.password,
      })).unwrap();

      dispatch(showSnackbar({
        message: '🎉 Welcome to Demo Account!',
        severity: 'success',
      }));
      
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      dispatch(showSnackbar({
        message: `❌ Demo login failed: ${error}`,
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
            borderColor: 'primary.main',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <BusinessCenter sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              🏢 Library Owner Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your library business with powerful tools
            </Typography>
            <Chip 
              label="Owner & Staff Access" 
              color="primary" 
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
            Try Demo Account (No Registration Required)
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
                    label="Email Address"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
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
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
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
                disabled={isLoading}
                sx={{ py: 1.5, mt: 1 }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
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
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to={ROUTES.REGISTER}
                sx={{ fontWeight: 600, textDecoration: 'none' }}
              >
                Sign Up for Free
              </Link>
            </Typography>
          </Box>

          {/* Footer Info */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              🔒 Secure Login • 256-bit Encryption
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 0.5 }}>
              Need help? Contact support@studyspot.com
            </Typography>
          </Box>
        </Paper>

        {/* Demo Credentials Info */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2,
            bgcolor: 'success.50',
            border: '1px solid',
            borderColor: 'success.main',
          }}
        >
          <Typography variant="subtitle2" color="success.main" gutterBottom sx={{ fontWeight: 600 }}>
            🎯 Demo Account Credentials
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Email:</strong> {DEMO_CREDENTIALS.email}
            <br />
            <strong>Password:</strong> {DEMO_CREDENTIALS.password}
            <br />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Click "Try Demo Account" button above to auto-fill these credentials
            </Typography>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ImprovedLoginPage;

