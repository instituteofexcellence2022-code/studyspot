import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { 
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { validateLoginForm } from '../utils/validation';
import { useLanguage } from '../contexts/LanguageContext';

interface LocationState {
  from?: { pathname: string };
  message?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error: authError, clearError } = useAuth();
  const { t } = useLanguage();
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authError || Object.keys(fieldErrors).length > 0) {
      clearError();
      setFieldErrors({});
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateLoginForm(formData.email, formData.password);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    try {
      await login(formData);
      const state = location.state as LocationState;
      const from = state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const state = location.state as LocationState;
  const redirectMessage = state?.message;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper 
          elevation={24} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mb: 2,
              }}
            >
              <LoginIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              {t('auth.welcomeBack')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.signInToStudySpot')}
            </Typography>
          </Box>

          {/* Alerts */}
          {redirectMessage && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {redirectMessage}
            </Alert>
          )}

          {authError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {authError}
            </Alert>
          )}

          {/* Demo Credentials */}
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="600" gutterBottom>
              🎓 Demo Account
            </Typography>
            <Typography variant="body2" component="div">
              Email: <strong>demo@studyspot.com</strong>
            </Typography>
            <Typography variant="body2" component="div">
              Password: <strong>Demo@123</strong>
            </Typography>
          </Alert>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label={t('profile.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              autoFocus
              autoComplete="email"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label={t('auth.password')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              autoComplete="current-password"
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
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

            {/* Remember Me */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }}
                />
              }
              label={<Typography variant="body2">{t('auth.rememberMe')}</Typography>}
              sx={{ mb: 1, mt: 0.5 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ 
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : t('auth.login')}
            </Button>

            {/* Social Login Divider */}
            <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                OR
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
            </Box>

            {/* Social Login Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                size="medium"
                sx={{ 
                  py: 1.2,
                  borderColor: '#e0e0e0',
                  color: '#757575',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#DB4437',
                    bgcolor: 'rgba(219, 68, 55, 0.04)',
                  }
                }}
                startIcon={<GoogleIcon sx={{ color: '#DB4437' }} />}
              >
                Google
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="medium"
                sx={{ 
                  py: 1.2,
                  borderColor: '#e0e0e0',
                  color: '#757575',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#1877F2',
                    bgcolor: 'rgba(24, 119, 242, 0.04)',
                  }
                }}
                startIcon={<FacebookIcon sx={{ color: '#1877F2' }} />}
              >
                Facebook
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="medium"
                sx={{ 
                  py: 1.2,
                  borderColor: '#e0e0e0',
                  color: '#757575',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#000',
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
                startIcon={<AppleIcon sx={{ color: '#000' }} />}
              >
                Apple
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.dontHaveAccount')}{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    color: '#667eea', 
                    textDecoration: 'none', 
                    fontWeight: 600 
                  }}
                >
                  {t('auth.createAccount')}
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
