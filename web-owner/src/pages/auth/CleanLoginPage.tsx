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
} from '@mui/icons-material';
import axios from 'axios';
import { useAppDispatch } from '../../hooks/redux';
import { ROUTES, API_CONFIG, STORAGE_KEYS } from '../../constants';
import errorService from '../../services/errorService';
import ENV from '../../config/environment';

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

      console.log('🔵 Attempting login to:', `${API_CONFIG.BASE_URL}/api/auth/login`);
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/auth/login`,
        { 
          email: loginEmail, 
          password: loginPassword 
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Login response:', response.data);

      const data = response.data as any;
      if (data.success && data.data) {
        const { user, tokens } = data.data;
        
        // Store tokens
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        setSuccess('✅ Login successful! Redirecting...');
        
        setTimeout(() => {
          navigate(ROUTES.DASHBOARD);
        }, 500);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      const appError = errorService.parseError(err);
      errorService.logError(appError, 'Login');
      setError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: typeof DEMO_ACCOUNT) => {
    try {
      console.log('🔵 Attempting registration to:', `${API_CONFIG.BASE_URL}/api/auth/register`);
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/auth/register`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Registration response:', response.data);
      
      const data = response.data as any;
      if (data.success) {
        return { success: true, message: 'Account created successfully!' };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err: any) {
      const appError = errorService.parseError(err);
      errorService.logError(appError, 'Registration');
      
      // If user already exists, that's okay for demo account
      if (appError.code === 'CONFLICT' || appError.message.toLowerCase().includes('exists')) {
        return { success: true, message: 'Account already exists, logging in...' };
      }
      
      throw new Error(appError.userMessage);
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
            sx={{ mb: 3, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Try Demo Account'}
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

