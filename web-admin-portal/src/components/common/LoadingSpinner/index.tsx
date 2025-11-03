// ============================================
// LOADING SPINNER COMPONENT
// ============================================

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullscreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message = 'Loading...',
  fullscreen = false,
}) => {
  if (fullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }}
      >
        <CircularProgress size={size} />
        {message && (
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;

