// ============================================
// FORGOT PASSWORD PAGE
// ============================================

import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Email as EmailIcon,
} from '@mui/icons-material';
import { authService } from '../../../services/api/auth';
import { ROUTES } from '../../../config/constants';
import { isValidEmail } from '../../../utils/validators';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (): boolean => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError('Invalid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
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
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <EmailIcon
              sx={{
                fontSize: 64,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
          </Box>

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset instructions have been sent to your email.
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                error={Boolean(emailError)}
                helperText={emailError}
                disabled={loading}
                autoComplete="email"
                autoFocus
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  mb: 2,
                }}
              >
                {loading ? <LoadingSpinner size={24} message="" /> : 'Send Reset Link'}
              </Button>

              <Button
                component={RouterLink}
                to={ROUTES.LOGIN}
                fullWidth
                variant="text"
                startIcon={<ArrowBack />}
                disabled={loading}
              >
                Back to Login
              </Button>
            </form>
          )}

          {/* Success Actions */}
          {success && (
            <Box>
              <Button
                component={RouterLink}
                to={ROUTES.LOGIN}
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
              >
                Return to Login
              </Button>
            </Box>
          )}

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Link
                component={RouterLink}
                to={ROUTES.LOGIN}
                underline="hover"
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;

