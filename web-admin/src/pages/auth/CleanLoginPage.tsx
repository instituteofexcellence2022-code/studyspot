import { FormControl } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Link,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  AdminPanelSettings,
  PlayArrow,
  GitHub as GitHubIcon,
  Google as GoogleIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks/redux';
import { login as loginThunk } from '../../store/slices/authSlice';
import { ROUTES } from '../../constants';
import { handleAxiosError, logError } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { isDemoModeEnabled, getDemoAccount, logDemoUsage } from '../../config/demo';
import i18n from '../../utils/i18n';
import { usePerformance } from '../../hooks/usePerformance';
import axios from 'axios';
import { API_CONFIG } from '../../config/environment';

const CleanLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { trackInteraction } = usePerformance();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Focus management for accessibility
  useEffect(() => {
    const emailInput = document.getElementById('email-input');
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      trackInteraction('login_attempt');

      logger.auth.loginAttempt(loginEmail);
      
      // Use Redux thunk for consistent auth flow
      const result = await dispatch(loginThunk({
        email: loginEmail,
        password: loginPassword,
        rememberMe
      })).unwrap();

      logger.auth.loginSuccess(result.user.id);
      setSuccess(i18n.t('success.login'));
      
      // Navigate with replace to avoid back button issues
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }, 500);
      
    } catch (err: unknown) {
      const normalizedError = handleAxiosError(err);
      logError('Login', err, { email: loginEmail, retryCount });
      
      setError(normalizedError.message);
      setRetryCount(prev => prev + 1);
      
      logger.auth.loginFailure(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      console.log('🔵 Attempting registration to:', `${API_CONFIG.BASE_URL}/api/auth/register`);
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/auth/register`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json'},
          timeout: 10000}
      );

      console.log('✅ Registration response:', response.data);
      
      interface RegisterResponse {
        success: boolean;
        message?: string;
      }

      const data = response.data as RegisterResponse;
      if (data.success) {
        return { success: true, message: 'Account created successfully!' };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err: unknown) {
      console.error('❌ Registration error:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string }; statusText?: string } };
        const errorMsg = axiosError.response?.data?.message || axiosError.response?.statusText;
        
        // If user already exists, that's okay
        if (errorMsg && errorMsg.toLowerCase().includes('exists')) {
          return { success: true, message: 'Account already exists, logging in...' };
        }
        
        throw new Error(errorMsg || 'Registration failed');
      } else if (err && typeof err === 'object' && 'request' in err) {
        throw new Error('Cannot connect to server');
      } else if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown registration error');
      }
    }
  };

  const handleDemoAccountClick = async () => {
    if (!isDemoModeEnabled()) {
      setError('Demo mode is not available in this environment');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const demoAccount = getDemoAccount();
      logDemoUsage('demo_account_click', 'login_page');

      // Step 1: Try to register demo account
      setSuccess(i18n.t('success.demoSetup'));
      
      try {
        const regResult = await handleRegister(demoAccount);
        setSuccess(regResult.message);
      } catch (regError: unknown) {
        const errorMessage = regError instanceof Error ? regError.message : 'Unknown registration error';
        logger.debug('Registration error (might be okay if user exists)', 'DEMO', errorMessage);
      }

      // Step 2: Login with demo credentials
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess(i18n.t('success.demoSetup'));
      
      await handleLogin(demoAccount.email, demoAccount.password);

    } catch (err: unknown) {
      const normalizedError = handleAxiosError(err);
      logError('Demo Account Flow', err);
      setError(`Demo account failed: ${normalizedError.message}`);
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError(i18n.t('error.required'));
      return;
    }

    await handleLogin(email, password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4}}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'error.main'}}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AdminPanelSettings sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="error.main">
              {i18n.t('auth.login.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {i18n.t('auth.login.subtitle')}
            </Typography>
            <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1 }}>
              Super Admin Access Only
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }} 
              onClose={() => setError('')}
              role="alert"
              aria-live="polite"
            >
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              role="status"
              aria-live="polite"
            >
              {success}
            </Alert>
          )}

          {/* Demo Account Button - Only show in demo mode */}
          {isDemoModeEnabled() && (
            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleDemoAccountClick}
              disabled={loading}
              sx={{ mb: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : i18n.t('auth.login.demoAccount')}
            </Button>
          )}

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {i18n.t('auth.login.orLoginWithEmail')}
            </Typography>
          </Divider>

          {/* Login Form */}
          <form onSubmit={handleFormSubmit}>
            <Stack spacing={2}>
              <TextField
                id="email-input"
                fullWidth
                label={i18n.t('auth.login.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
                error={!!error && !email}
                helperText={!!error && !email ? i18n.t('error.required') : ''}
              />

              <TextField
                fullWidth
                label={i18n.t('auth.login.password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
                error={!!error && !password}
                helperText={!!error && !password ? i18n.t('error.required') : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                }
                label={i18n.t('auth.login.rememberMe')}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={loading || !email || !password}
                sx={{ py: 1.5 }}
                startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
              >
                {loading ? i18n.t('common.loading') : i18n.t('auth.login.signIn')}
              </Button>
            </Stack>
          </form>

          {/* Social Login */}
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {i18n.t('auth.login.socialLogin')}
              </Typography>
            </Divider>
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                disabled
                aria-label="Google login (coming soon)"
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHubIcon />}
                disabled
                aria-label="GitHub login (coming soon)"
              >
                GitHub
              </Button>
            </Stack>
          </Box>

          {/* Footer */}
          {isDemoModeEnabled() && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
              Demo Account: {getDemoAccount().email} / {getDemoAccount().password}
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default CleanLoginPage;

