/**
 * Credit Balance Card Component
 * 
 * Displays credit balance for SMS or WhatsApp with visual indicators
 * Phase 6 - Sprint 4: Credit Management
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon

  } from '@mui/icons-material';
import { CreditType } from '../../types';

interface CreditBalanceCardProps {
  type: CreditType;
  balance: number;
  reserved?: number;
  available?: number;
  threshold?: number;
  loading?: boolean;
  onRefresh?: () => void;
}

const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({
  type,
  balance,
  reserved = 0,
  available,
  threshold = 100,
  loading = false,
  onRefresh}) => {
  const actualAvailable = available !== undefined ? available : balance - reserved;
  const usagePercentage = Math.min((reserved / balance) * 100, 100);
  const isLow = actualAvailable < threshold;
  const isCritical = actualAvailable < threshold / 2;

  const getStatusColor = () => {
    if (isCritical) return 'error';
    if (isLow) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (isCritical || isLow) return <WarningIcon />;
    return <CheckCircleIcon />;
  };

  const getIcon = () => {
    if (type === 'sms') return '📱';
    return '💬';
  };

  const getLabel = () => {
    if (type === 'sms') return 'SMS Credits';
    return 'WhatsApp Credits';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h4">{getIcon()}</Typography>
            <Typography variant="h6" fontWeight="bold">
              {getLabel()}
            </Typography>
          </Box>
          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box mb={2}>
          <Typography variant="h3" fontWeight="bold" color="primary.main">
            {actualAvailable.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Available Credits
          </Typography>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" color="text.secondary">
              Total: {balance.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reserved: {reserved.toLocaleString()}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={usagePercentage}
            color={getStatusColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Chip
            icon={getStatusIcon()}
            label={isCritical ? 'Critical Low' : isLow ? 'Low Balance' : 'Healthy'}
            color={getStatusColor()}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            Threshold: {threshold.toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreditBalanceCard;


