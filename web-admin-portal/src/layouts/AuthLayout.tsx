// ============================================
// AUTH LAYOUT
// ============================================

import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';

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
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo & Title */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              mb: 2,
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            STUDYSPOT
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Admin Portal
          </Typography>
        </Box>

        {/* Auth Form Card */}
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {children}
        </Paper>

        {/* Footer */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 3,
            color: 'white',
            opacity: 0.8,
          }}
        >
          <Typography variant="body2">
            © 2025 StudySpot. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;

