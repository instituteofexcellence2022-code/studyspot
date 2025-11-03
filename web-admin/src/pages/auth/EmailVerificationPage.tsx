import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
;
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EmailIcon from '@mui/icons-material/Email';
import { showSuccess, showError } from '../../utils/notifications';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerifying(false);
      setError('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      // TODO: Call API to verify email
      // await authService.verifyEmail(verificationToken);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVerified(true);
      showSuccess('Email verified successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to verify email');
      showError('Email verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      // TODO: Call API to resend verification email
      // await authService.resendVerificationEmail();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Verification email sent!');
    } catch (err: any) {
      showError(err.message || 'Failed to resend email');
    } finally {
      setResending(false);
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
          py: 4}}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {verifying && (
            <>
              <CircularProgress size={64} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Verifying your email...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we verify your email address.
              </Typography>
            </>
          )}

          {!verifying && verified && (
            <>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom color="success.main">
                Email Verified!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your email has been successfully verified. You can now access all features of StudySpot.
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {!verifying && !verified && error && (
            <>
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom color="error.main">
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {error}
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                The verification link may have expired or is invalid. Please request a new verification email.
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleResendEmail}
                disabled={resending}
                startIcon={<EmailIcon />}
                sx={{ mb: 2 }}
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerificationPage;


