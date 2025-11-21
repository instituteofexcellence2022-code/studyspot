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
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  FormHelperText,
  Fade,
} from '@mui/material';
import {
  BusinessCenter,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Visibility,
  VisibilityOff,
  Person,
  Groups,
  Domain,
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks/redux';
import { login } from '../../store/slices/authSlice';
import { ROUTES } from '../../constants';
import errorService from '../../services/errorService';
import { authService } from '../../services/authService';

const REMEMBER_ME_KEY = 'studyspot_remember_me';
const REMEMBERED_EMAIL_KEY = 'studyspot_remembered_email';

const CleanLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState(() => {
    // Load remembered email if available
    const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    return remembered || '';
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    // Check if remember me was previously enabled
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  });
  
  // User type and tenant ID for library staff
  const [userType, setUserType] = useState<'library_owner' | 'library_staff'>('library_owner');
  const [tenantId, setTenantId] = useState('');
  const [tenantIdError, setTenantIdError] = useState('');

  const handleUserTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newUserType: 'library_owner' | 'library_staff' | null,
  ) => {
    if (newUserType !== null) {
      setUserType(newUserType);
      setTenantId('');
      setTenantIdError('');
      setError('');
    }
  };

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    try {
      setError('');
      setSuccess('');
      setTenantIdError('');
      setLoading(true);

      // Validate tenantId for library staff
      if (userType === 'library_staff' && !tenantId.trim()) {
        setTenantIdError('Tenant ID is required for library staff');
        setLoading(false);
        return;
      }

      // Validate tenantId format (should be UUID)
      if (userType === 'library_staff' && tenantId.trim()) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(tenantId.trim())) {
          setTenantIdError('Please enter a valid Tenant ID (UUID format)');
          setLoading(false);
          return;
        }
      }

      console.log('🔵 Attempting login via Redux...', {
        email: loginEmail,
        userType,
        hasTenantId: !!tenantId,
      });
      
      // Use Redux login action with userType and tenantId
      const result = await dispatch(login({
        email: loginEmail,
        password: loginPassword,
        tenantId: userType === 'library_staff' ? tenantId.trim() : undefined,
        userType,
      })).unwrap();

      console.log('✅ Login successful:', result);

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
        localStorage.setItem(REMEMBERED_EMAIL_KEY, loginEmail);
        // Store user type preference
        if (userType === 'library_staff') {
          localStorage.setItem('preferred_user_type', userType);
        }
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        localStorage.removeItem('preferred_user_type');
      }

      setSuccess(`✅ Login successful as ${userType === 'library_owner' ? 'Library Owner' : 'Library Staff'}! Redirecting...`);
      
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


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setTenantIdError('');
    
    // Validate required fields
    if (!email || !password) {
      setError('❌ Please enter both email and password');
      return;
    }

    // Validate tenantId for library staff
    if (userType === 'library_staff' && !tenantId.trim()) {
      setTenantIdError('Tenant ID is required for library staff');
      setError('Please provide a Tenant ID to continue');
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
              Library Management Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your library business with powerful tools
            </Typography>
            <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 1 }}>
              Owner & Staff Access
            </Typography>
          </Box>

          {/* User Type Selector */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
              I am a:
            </Typography>
            <ToggleButtonGroup
              value={userType}
              exclusive
              onChange={handleUserTypeChange}
              fullWidth
              disabled={loading}
              sx={{
                '& .MuiToggleButton-root': {
                  py: 1.5,
                  px: 2,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  border: '2px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      borderColor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                },
              }}
            >
              <ToggleButton value="library_owner" aria-label="library owner">
                <Person sx={{ mr: 1, fontSize: 20 }} />
                Library Owner
              </ToggleButton>
              <ToggleButton value="library_staff" aria-label="library staff">
                <Groups sx={{ mr: 1, fontSize: 20 }} />
                Library Staff
              </ToggleButton>
            </ToggleButtonGroup>
            <FormHelperText sx={{ mt: 1, textAlign: 'center' }}>
              {userType === 'library_owner' 
                ? 'Own and manage your library business' 
                : 'Access your library workspace as staff member'}
            </FormHelperText>
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


          {/* Login Form */}
          <form onSubmit={handleFormSubmit}>
            <Stack spacing={2}>
              {/* Tenant ID Input - Only for Library Staff */}
              <Fade in={userType === 'library_staff'} timeout={300}>
                <Box>
                  <TextField
                    fullWidth
                    label="Tenant ID"
                    type="text"
                    value={tenantId}
                    onChange={(e) => {
                      setTenantId(e.target.value);
                      if (tenantIdError) setTenantIdError('');
                      if (error) setError('');
                    }}
                    disabled={loading || userType !== 'library_staff'}
                    required={userType === 'library_staff'}
                    error={!!tenantIdError}
                    helperText={tenantIdError || 'Enter your library\'s Tenant ID (required for staff login)'}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Domain sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      display: userType === 'library_staff' ? 'block' : 'none',
                    }}
                  />
                </Box>
              </Fade>

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                disabled={loading}
                autoComplete="email"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={loading}
                autoComplete="current-password"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Remember me
                    </Typography>
                  }
                />
                <Typography
                  variant="body2"
                  component={Link}
                  to={ROUTES.FORGOT_PASSWORD}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Forgot password?
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={loading || (userType === 'library_staff' && !tenantId.trim())}
                sx={{ 
                  py: 1.5, 
                  mt: 1,
                  background: userType === 'library_staff' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : undefined,
                  '&:hover': {
                    background: userType === 'library_staff' 
                      ? 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)' 
                      : undefined,
                  },
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : userType === 'library_owner' ? <BusinessCenter /> : <Groups />}
              >
                {loading 
                  ? 'Signing in...' 
                  : userType === 'library_owner' 
                    ? 'Sign In as Owner' 
                    : 'Sign In as Staff'}
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
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CleanLoginPage;

