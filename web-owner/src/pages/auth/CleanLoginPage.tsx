import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  BusinessCenter,
  PlayArrow,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  SkipNext,
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks/redux';
import { login, setCredentials } from '../../store/slices/authSlice';
import { ROUTES, STORAGE_KEYS } from '../../constants';
import errorService from '../../services/errorService';
import ENV from '../../config/environment';
import { authService } from '../../services/authService';

const DEMO_ACCOUNT = {
  email: 'owner@demo.com',
  password: 'Demo123456',
  firstName: 'Demo',
  lastName: 'Owner',
  phone: '+1234567890',
  role: 'library_owner',
};

const CleanLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      console.log('🔵 Attempting login via Redux...');
      
      // Use Redux login action
      const result = await dispatch(login({
        email: loginEmail,
        password: loginPassword,
      })).unwrap();

      console.log('✅ Login successful:', result);

      setSuccess('✅ Login successful! Redirecting...');
      
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 500);
    } catch (err: any) {
      const appError = errorService.parseError(err);
      errorService.logError(appError, 'Login');
      setError(appError.userMessage || err || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: typeof DEMO_ACCOUNT) => {
    try {
      console.log('🔵 Attempting registration via authService...');
      
      // Use authService.registerDetailed for better data handling
      const response = await (authService as any).registerDetailed({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
      });

      console.log('✅ Registration response:', response);
      
      if (response.success) {
        return { success: true, message: 'Account created successfully!' };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err: any) {
      const appError = errorService.parseError(err);
      errorService.logError(appError, 'Registration');
      
      // If user already exists, that's okay for demo account
      if (appError.code === 'CONFLICT' || 
          appError.message?.toLowerCase().includes('exists') ||
          err?.message?.toLowerCase().includes('exists')) {
        return { success: true, message: 'Account already exists, logging in...' };
      }
      
      throw new Error(appError.userMessage || err?.message || 'Registration failed');
    }
  };

  const handleDemoAccountClick = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      // Step 1: Try to register demo account
      setSuccess('🔄 Setting up demo account...');
      console.log('Step 1: Registering demo account');
      
      try {
        const regResult = await handleRegister(DEMO_ACCOUNT);
        setSuccess(regResult.message);
        console.log('Registration result:', regResult);
      } catch (regError: any) {
        console.log('Registration error (might be okay if user exists):', regError.message);
      }

      // Step 2: Login with demo credentials
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause
      setSuccess('🔄 Logging in...');
      console.log('Step 2: Logging in with demo credentials');
      
      await handleLogin(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);

    } catch (err: any) {
      const appError = errorService.parseError(err);
      errorService.logError(appError, 'Demo Account');
      setError(appError.userMessage);
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('❌ Please enter both email and password');
      return;
    }

    await handleLogin(email, password);
  };

  const handleSkipLogin = () => {
    console.log('🔓 SKIP LOGIN - Bypassing authentication');
    
    // Create mock user data
    const mockUser = {
      id: 'demo-user-skip-123',
      email: 'owner@demo.com',
      firstName: 'Demo',
      lastName: 'Owner',
      role: 'library_owner' as const,
      phone: '+1234567890',
      status: 'active' as const,
      tenantId: '00000000-0000-0000-0000-000000000000',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockToken = 'skip-login-demo-token';

    // Store in localStorage
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, mockToken);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser));

    // Dispatch to Redux
    dispatch(setCredentials({
      user: mockUser,
      token: mockToken,
      refreshToken: mockToken,
    }));

    // Navigate to dashboard
    setSuccess('✅ Skipped login! Redirecting to dashboard...');
    setTimeout(() => {
      navigate(ROUTES.DASHBOARD);
    }, 500);
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
            <BusinessCenter sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Library Owner Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your library business with powerful tools
            </Typography>
            <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 1 }}>
              Owner & Staff Access
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Demo Account Button */}
          <Button
            fullWidth
            variant="contained"
            color="success"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleDemoAccountClick}
            disabled={loading}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Try Demo Account'}
          </Button>

          {/* Skip Login Button */}
          <Button
            fullWidth
            variant="outlined"
            color="warning"
            size="large"
            startIcon={<SkipNext />}
            onClick={handleSkipLogin}
            disabled={loading}
            sx={{ mb: 3, py: 1.5 }}
          >
            Skip Login (Go to Dashboard)
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR LOGIN WITH EMAIL
            </Typography>
          </Divider>

          {/* Login Form */}
          <form onSubmit={handleFormSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Stack>
          </form>

          {/* Social Login */}
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Social Login (Coming Soon)
              </Typography>
            </Divider>
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                disabled
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHubIcon />}
                disabled
              >
                GitHub
              </Button>
            </Stack>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                Create Account
              </Link>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Demo Account: owner@demo.com / Demo123456
            </Typography>
          </Box>
          
          {/* Diagnostic Info */}
          {ENV.DEBUG && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 1, fontSize: '0.75rem' }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', mb: 1 }}>
                🔍 DIAGNOSTIC INFO:
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                API URL: {ENV.API_URL}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                Portal: {ENV.PORTAL_NAME} ({ENV.PORTAL_TYPE})
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                Environment: {ENV.NODE_ENV}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                Version: {ENV.VERSION}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default CleanLoginPage;

