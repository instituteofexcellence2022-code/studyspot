import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Paper,
  Stack,
  Alert,
  Divider,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  School as SchoolIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import { UserRole, UserStatus } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const EnhancedAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);
  
  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  // Registration form data
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'library_owner',
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
  };

  const handleInputChange = (field: string, value: string, form: 'login' | 'register') => {
    if (form === 'login') {
      setLoginData(prev => ({ ...prev, [field]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authService.login(loginData.email, loginData.password);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.register(
        registerData.email,
        registerData.password,
        `${registerData.firstName} ${registerData.lastName}`,
        registerData.role
      );
      
      if (result.success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAuth = () => {
    // Create test user object
    const testUser = {
      id: '1',
      email: 'admin@studyspot.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'library_owner' as UserRole,
      tenantId: 'default-tenant',
      status: 'active' as UserStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Set localStorage
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('user', JSON.stringify(testUser));
    localStorage.setItem('isAuthenticated', 'true');

    // Update Redux store
    dispatch(setCredentials({
      user: testUser,
      token: 'test-token',
      refreshToken: 'test-token'
    }));

    toast.success('Authentication skipped - using test user');

    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login coming soon!`);
    // TODO: Implement social login
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, minHeight: '90vh' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            StudySpot
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Library Management Portal
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Sign In" />
            <Tab label="Create Account" />
          </Tabs>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Login Tab */}
        <TabPanel value={activeTab} index={0}>
          <form onSubmit={handleLogin}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={loginData.email}
                onChange={(e) => handleInputChange('email', e.target.value, 'login')}
                required
                placeholder="admin@studyspot.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) => handleInputChange('password', e.target.value, 'login')}
                required
                placeholder="Enter your password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
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
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.5, mt: 1 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </form>
        </TabPanel>

        {/* Registration Tab */}
        <TabPanel value={activeTab} index={1}>
          <form onSubmit={handleRegister}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={registerData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value, 'register')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={registerData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value, 'register')}
                  required
                />
              </Box>
              
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={registerData.email}
                onChange={(e) => handleInputChange('email', e.target.value, 'register')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Phone Number"
                value={registerData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value, 'register')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={registerData.role}
                  label="Role"
                  onChange={(e) => handleInputChange('role', e.target.value, 'register')}
                >
                  <MenuItem value="library_owner">Library Owner</MenuItem>
                  <MenuItem value="library_staff">Library Staff</MenuItem>
                  <MenuItem value="branch_manager">Branch Manager</MenuItem>
                  <MenuItem value="finance_manager">Finance Manager</MenuItem>
                  <MenuItem value="facility_manager">Facility Manager</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={registerData.password}
                onChange={(e) => handleInputChange('password', e.target.value, 'register')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
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
              
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={registerData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value, 'register')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.5, mt: 1 }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Stack>
          </form>
        </TabPanel>

        {/* Social Login Section */}
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }}>
            <Chip label="OR" size="small" />
          </Divider>
          
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleSocialLogin('Google')}
              sx={{ flex: 1 }}
            >
              Google
            </Button>
            <Button
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={() => handleSocialLogin('Facebook')}
              sx={{ flex: 1 }}
            >
              Facebook
            </Button>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<AppleIcon />}
              onClick={() => handleSocialLogin('Apple')}
              sx={{ flex: 1 }}
            >
              Apple
            </Button>
            <Button
              variant="outlined"
              startIcon={<GitHubIcon />}
              onClick={() => handleSocialLogin('GitHub')}
              sx={{ flex: 1 }}
            >
              GitHub
            </Button>
          </Stack>
        </Box>

        {/* Skip Authentication */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            For testing purposes:
          </Typography>
          <Button
            variant="outlined"
            onClick={handleSkipAuth}
            sx={{ mt: 1 }}
            color="secondary"
          >
            Skip Authentication (Test Mode)
          </Button>
        </Box>

        {/* Test Credentials */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Test Credentials:</strong><br />
            Email: admin@studyspot.com | Password: password123<br />
            Or use "Skip Authentication" for quick access.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default EnhancedAuthPage;
