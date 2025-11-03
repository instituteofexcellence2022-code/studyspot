// ============================================
// LOGIN PAGE
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { login, clearError } from '../../../store/slices/authSlice';
import { showError } from '../../../store/slices/uiSlice';
import { ROUTES } from '../../../config/constants';
import { isValidEmail } from '../../../utils/validators';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || ROUTES.DASHBOARD;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Invalid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    dispatch(clearError());

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Attempt login
      await dispatch(
        login({ email, password, rememberMe })
      ).unwrap();

      // Success - redirect will happen via useEffect
    } catch (err: any) {
      dispatch(showError(err || 'Login failed. Please try again.'));
    }
  };

  // Handle field changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AdminPanelSettings
              sx={{
                fontSize: 64,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              StudySpot Admin Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your platform
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              error={Boolean(emailError)}
              helperText={emailError}
              disabled={loading}
              autoComplete="email"
              autoFocus
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              error={Boolean(passwordError)}
              helperText={passwordError}
              disabled={loading}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Remember me"
              />
              <Link
                component={RouterLink}
                to={ROUTES.FORGOT_PASSWORD}
                variant="body2"
                underline="hover"
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? null : <LoginIcon />}
              sx={{
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {loading ? <LoadingSpinner size={24} message="" /> : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Development Helper */}
          <Alert severity="info">
            <Typography variant="caption" display="block" gutterBottom>
              <strong>Test Credentials:</strong>
            </Typography>
            <Typography variant="caption" display="block">
              Email: admin@studyspot.com
            </Typography>
            <Typography variant="caption" display="block">
              Password: admin123
            </Typography>
          </Alert>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2025 StudySpot. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
