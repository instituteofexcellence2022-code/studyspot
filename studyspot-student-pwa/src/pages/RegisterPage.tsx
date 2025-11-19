import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from '@mui/material';
import { 
  PersonAdd as RegisterIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { validateRegisterForm } from '../utils/validation';
import { useLanguage } from '../contexts/LanguageContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error: authError, clearError } = useAuth();
  const { t } = useLanguage();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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

    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'student',
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: { message: t('auth.registrationSuccessfulMessage') }
        });
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
        py: 3,
      }}
    >
      <Container maxWidth="sm">
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
              <RegisterIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              {t('auth.createAccount')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.joinStudySpot')}
            </Typography>
          </Box>

          {/* Alerts */}
          {authError && !success && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {authError}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              ✓ {t('auth.registrationSuccessful')}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label={t('profile.firstName')}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label={t('profile.lastName')}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TextField
              fullWidth
              label={t('profile.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
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
              label={t('profile.phone')}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone || '10 digits'}
              placeholder="9876543210"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
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
              helperText={fieldErrors.password || '8+ characters'}
              sx={{ mb: 2 }}
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
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label={t('auth.confirmPassword')}
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading || success}
              sx={{ 
                mt: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : t('auth.createAccount')}
            </Button>

            {/* Social Login Divider */}
            <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                OR SIGN UP WITH
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
            </Box>

            {/* Social Login Buttons - Compact Icons */}
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mb: 2 }}>
              <IconButton
                sx={{ 
                  width: 48,
                  height: 48,
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    borderColor: '#DB4437',
                    bgcolor: 'rgba(219, 68, 55, 0.04)',
                  }
                }}
              >
                <GoogleIcon sx={{ color: '#DB4437', fontSize: 24 }} />
              </IconButton>

              <IconButton
                sx={{ 
                  width: 48,
                  height: 48,
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    borderColor: '#1877F2',
                    bgcolor: 'rgba(24, 119, 242, 0.04)',
                  }
                }}
              >
                <FacebookIcon sx={{ color: '#1877F2', fontSize: 24 }} />
              </IconButton>

              <IconButton
                sx={{ 
                  width: 48,
                  height: 48,
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    borderColor: '#000',
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <AppleIcon sx={{ color: '#000', fontSize: 24 }} />
              </IconButton>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#667eea', 
                    textDecoration: 'none', 
                    fontWeight: 600 
                  }}
                >
                  {t('auth.login')}
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
