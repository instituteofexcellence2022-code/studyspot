import React from 'react';
import { Box, Container, Paper, Typography
 } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2}}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'}}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              🎓 STUDYSPOT
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Library Booking Platform
            </Typography>
          </Box>
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;

