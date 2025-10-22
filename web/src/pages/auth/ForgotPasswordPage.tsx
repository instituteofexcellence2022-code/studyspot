import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { showSuccess, showError } from '../../utils/toast';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to send reset password email
      // await authService.forgotPassword(email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      showSuccess('Password reset link sent to your email');
    } catch (error: any) {
      showError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
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
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <EmailIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No worries! Enter your email and we'll send you reset instructions.
            </Typography>
          </Box>

          {emailSent ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                We've sent a password reset link to <strong>{email}</strong>
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please check your email and click the link to reset your password.
                The link will expire in 1 hour.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/login')}
                startIcon={<ArrowBackIcon />}
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                autoFocus
                disabled={loading}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ArrowBackIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Back to Login
                </Link>
              </Box>
            </form>
          )}
        </Paper>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          Don't have an account?{' '}
          <Link component="button" onClick={() => navigate('/register')}>
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;


