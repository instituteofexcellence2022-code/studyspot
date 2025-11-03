import React from 'react';
import { Box, CircularProgress, Typography, Skeleton, Grid, Card, CardContent } from '@mui/material';

const RouteFallback: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CircularProgress size={22} />
        <Typography variant='body2' color='text.secondary'>
          Loading content…
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Skeleton variant='text' width='60%' height={28} />
              <Skeleton variant='text' width='40%' />
              <Skeleton variant='rectangular' height={120} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Skeleton variant='text' width='50%' height={28} />
              <Skeleton variant='text' width='35%' />
              <Skeleton variant='rectangular' height={120} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Skeleton variant='text' width='55%' height={28} />
              <Skeleton variant='text' width='30%' />
              <Skeleton variant='rectangular' height={120} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RouteFallback;


