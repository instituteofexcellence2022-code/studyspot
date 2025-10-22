import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const BookingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Bookings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Booking management interface will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default BookingsPage;


