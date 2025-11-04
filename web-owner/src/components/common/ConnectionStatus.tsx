/**
 * 🔴 REAL-TIME CONNECTION STATUS INDICATOR
 * 
 * Displays WebSocket connection status for Owner Portal
 */

import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { Wifi, WifiOff, Refresh } from '@mui/icons-material';
import { useSocket } from '../../hooks/useSocket';

interface ConnectionStatusProps {
  role?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  role = 'library_owner',
  showLabel = true,
  size = 'small',
}) => {
  const { connected, error } = useSocket(role);

  if (error) {
    return (
      <Tooltip title={`Connection error: ${error}`}>
        <Chip
          icon={<WifiOff />}
          label={showLabel ? 'Offline' : ''}
          color="error"
          size={size}
          sx={{ fontWeight: 600 }}
        />
      </Tooltip>
    );
  }

  if (connected) {
    return (
      <Tooltip title="Real-time updates are active">
        <Chip
          icon={<Wifi />}
          label={showLabel ? 'Live' : ''}
          color="success"
          size={size}
          sx={{ 
            fontWeight: 600,
            '& .MuiChip-icon': {
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
            },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Connecting to real-time server...">
      <Chip
        icon={<Refresh />}
        label={showLabel ? 'Connecting...' : ''}
        color="default"
        size={size}
        sx={{ 
          fontWeight: 600,
          '& .MuiChip-icon': {
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' },
            },
          },
        }}
      />
    </Tooltip>
  );
};

