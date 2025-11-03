/**
 * Credit Package Card Component
 * 
 * Displays a credit package with pricing and features
 * Phase 6 - Sprint 4: Credit Management
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  LocalOffer as OfferIcon

  } from '@mui/icons-material';
import { CreditPackage
  } from '../../types';

interface CreditPackageCardProps {
  package: CreditPackage;
  onSelect: (packageId: string) => void;
  loading?: boolean;
  selected?: boolean;
}

const CreditPackageCard: React.FC<CreditPackageCardProps> = ({
  package: pkg,
  onSelect,
  loading = false,
  selected = false}) => {
  const totalCredits = pkg.credits + (pkg.bonusCredits || 0);
  const pricePerCredit = pkg.price / pkg.credits;

  return (
    <Card
      sx={{
        height: '100%',
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        position: 'relative',
        '&:hover': {
          boxShadow: 6}}}
    >
      {pkg.isPopular && (
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            right: 16,
            bgcolor: 'primary.main',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold'}}
        >
          POPULAR
        </Box>
      )}

      <CardContent>
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {pkg.name}
          </Typography>

          {pkg.description && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {pkg.description}
            </Typography>
          )}

          <Box my={2}>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              {pkg.currency} {pkg.price.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pkg.currency} {pricePerCredit.toFixed(4)} per credit
            </Typography>
          </Box>

          <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
            <Chip
              label={`${pkg.credits.toLocaleString()} Credits`}
              color="primary"
              variant="outlined"
              size="small"
            />
            {pkg.bonusCredits && pkg.bonusCredits > 0 && (
              <Chip
                icon={<OfferIcon />}
                label={`+${pkg.bonusCredits} Bonus`}
                color="success"
                size="small"
              />
            )}
            {pkg.discount && pkg.discount > 0 && (
              <Chip
                label={`${pkg.discount}% OFF`}
                color="error"
                size="small"
              />
            )}
          </Box>

          {totalCredits > pkg.credits && (
            <Typography variant="caption" color="success.main" display="block" mt={1}>
              Total: {totalCredits.toLocaleString()} credits
            </Typography>
          )}
        </Box>

        {pkg.features && pkg.features.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Features:
            </Typography>
            <List dense disablePadding>
              {pkg.features.map((feature, index) => (
                <ListItem key={index} disableGutters>
                  <CheckIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                  <ListItemText
                    primary={feature}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {pkg.validityDays && (
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Valid for {pkg.validityDays} days
          </Typography>
        )}

        <Button
          fullWidth
          variant={selected ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => onSelect(pkg.id)}
          disabled={loading}
          size="large"
        >
          {selected ? 'Selected' : 'Select Package'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreditPackageCard;


