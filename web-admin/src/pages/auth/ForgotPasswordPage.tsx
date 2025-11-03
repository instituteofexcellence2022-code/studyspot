import React from 'react';
import { Box, Container, Typography } from '@mui/material';
;

const ForgotPasswordPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4">Forgot Password</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          This feature is coming soon.
        </Typography>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
