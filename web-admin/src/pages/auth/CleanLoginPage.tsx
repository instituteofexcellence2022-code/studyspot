import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AdminPanelSettings,
  PlayArrow,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAppDispatch } from '../../hooks/redux';
import { ROUTES, API_CONFIG, STORAGE_KEYS } from '../../constants';

const DEMO_ACCOUNT = {
  email: 'admin@demo.com',
  password: 'Admin123456',
  firstName: 'Demo',
  lastName: 'Admin',
  phone: '+1234567891',
  role: 'super_admin',
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
      console.error('❌ Login error:', err);
      
      let errorMsg = '❌ Login failed. ';
      
      if (err.response) {
        // Server responded with error
        errorMsg += err.response.data?.message || err.response.statusText || 'Unknown error';
      } else if (err.request) {
        // Request made but no response
        errorMsg += 'Cannot connect to server. Please check if API is running.';
      } else {
        // Something else happened
        errorMsg += err.message || 'Unknown error occurred';
      }
      
      setError(errorMsg);
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
      console.error('❌ Registration error:', err);
      
      if (err.response) {
        const errorMsg = err.response.data?.message || err.response.statusText;
        
        // If user already exists, that's okay
        if (errorMsg.toLowerCase().includes('exists')) {
          return { success: true, message: 'Account already exists, logging in...' };
        }
        
        throw new Error(errorMsg);
      } else if (err.request) {
        throw new Error('Cannot connect to server');
      } else {
        throw new Error(err.message);
      }
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
      console.error('❌ Demo account flow error:', err);
      setError(`❌ Demo account failed: ${err.message}`);
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
            borderColor: 'error.main',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AdminPanelSettings sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="error.main">
              Platform Admin Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage the entire StudySpot platform
            </Typography>
            <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1 }}>
              Super Admin Access Only
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
            {loading ? <CircularProgress size={24} /> : 'Try Demo Admin Account'}
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
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
            Demo Account: admin@demo.com / Admin123456
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default CleanLoginPage;

