import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { LinearProgressProps } from '@mui/material';

/**
 * Props for UsageProgressBar Component
 */
interface UsageProgressBarProps {
  label: string;
  used: number;
  limit?: number;
  unit?: string;
  showPercentage?: boolean;
}

/**
 * Usage Progress Bar Component
 * Displays resource usage with a progress bar and labels
 */
const UsageProgressBar: React.FC<UsageProgressBarProps> = ({
  label,
  used,
  limit,
  unit = '',
  showPercentage = true}) => {
  // Calculate percentage
  const percentage = !limit || limit === 0 ? 0 : Math.min((used / limit) * 100, 100);

  // Get color based on usage
  const getColor = (): LinearProgressProps['color'] => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatNumber(used)} / {formatNumber(limit || 0)} {unit}
          {showPercentage && ` (${Math.round(percentage)}%)`}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={getColor()}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

export default UsageProgressBar;


