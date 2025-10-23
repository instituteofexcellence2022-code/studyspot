import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface SkeletonLoaderProps {
  variant?: 'list' | 'card' | 'table' | 'detail';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = 'list', count = 3 }) => {
  if (variant === 'list') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: '100%' }}>
            <Card>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={20} />
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'table') {
    return (
      <Box>
        <Skeleton variant="rectangular" height={56} sx={{ mb: 1 }} />
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={52} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (variant === 'detail') {
    return (
      <Box>
        <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
        <Skeleton variant="text" width="80%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={20} />
      </Box>
    );
  }

  return null;
};

export default SkeletonLoader;


