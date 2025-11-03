/**
 * Credit Purchase Page
 * 
 * Allows users to buy SMS or WhatsApp credits
 * Phase 6 - Sprint 4: Credit Management
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  GridLegacy as Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchCreditPackages,
  purchaseCredits,
  fetchCreditBalance,
} from '../../store/slices/creditSlice';
import { CreditType, CreditPackage as CreditPackageType } from '../../types';
import CreditPackageCard from '../../components/credits/CreditPackageCard';

const CreditPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [creditType, setCreditType] = useState<CreditType>('sms');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
  const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);

  const { packages, balance } = useAppSelector((state) => state.credit);

  useEffect(() => {
    dispatch(fetchCreditPackages(creditType));
    dispatch(fetchCreditBalance());
  }, [creditType, dispatch]);

  const handleCreditTypeChange = (_e: React.MouseEvent<HTMLElement>, newType: CreditType | null) => {
    if (newType !== null) {
      setCreditType(newType);
      setSelectedPackage(null);
      setQuantity(1);
    }
  };

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handlePurchaseClick = () => {
    if (!selectedPackage) return;
    setConfirmDialogOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;

    setPurchaseLoading(true);
    try {
      await dispatch(
        purchaseCredits({
          packageId: selectedPackage,
          quantity,
          paymentMethodId: 'default', // In production, get from payment method selection
          useWalletBalance: useWallet,
        })
      ).unwrap();

      setPurchaseSuccess(true);
      setConfirmDialogOpen(false);
      
      // Refresh balance
      dispatch(fetchCreditBalance());
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleCloseConfirmDialog = () => {
    if (!purchaseLoading) {
      setConfirmDialogOpen(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/credits');
  };

  const selectedPkg = packages.items.find((pkg) => pkg.id === selectedPackage);
  const totalAmount = selectedPkg ? selectedPkg.price * quantity : 0;
  const totalCredits = selectedPkg ? (selectedPkg.credits + (selectedPkg.bonusCredits || 0)) * quantity : 0;

  const filteredPackages = packages.items.filter((pkg) => pkg.type === creditType);

  if (purchaseSuccess) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h2" gutterBottom>
              🎉
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Purchase Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your {creditType === 'sms' ? 'SMS' : 'WhatsApp'} credits have been added to your account.
            </Typography>
            <Box my={3}>
              <Typography variant="body2" color="text.secondary">
                Credits Added
              </Typography>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {totalCredits.toLocaleString()}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="center" gap={2} mt={4}>
              <Button
                variant="outlined"
                onClick={() => navigate('/credits/transactions')}
              >
                View Transaction
              </Button>
              <Button variant="contained" onClick={handleBackToDashboard}>
                Back to Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Button startIcon={<BackIcon />} onClick={handleBackToDashboard} sx={{ mb: 2 }}>
            Back to Dashboard
          </Button>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🛒 Buy Credits
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose a package and add credits to your account
          </Typography>
        </Box>
      </Box>

      {/* Current Balance */}
      {balance.data && (
        <Card sx={{ mb: 4, bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Current Balance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  SMS Credits
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {balance.data.smsAvailable.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  WhatsApp Credits
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {balance.data.whatsappAvailable.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Credit Type Selector */}
      <Box mb={4} textAlign="center">
        <ToggleButtonGroup
          value={creditType}
          exclusive
          onChange={handleCreditTypeChange}
          aria-label="credit type"
          size="large"
        >
          <ToggleButton value="sms" aria-label="sms">
            📱 SMS Credits
          </ToggleButton>
          <ToggleButton value="whatsapp" aria-label="whatsapp">
            💬 WhatsApp Credits
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Packages */}
      {packages.loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : filteredPackages.length > 0 ? (
        <>
          <Grid container spacing={3} mb={4}>
            {filteredPackages.map((pkg) => (
              <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                <CreditPackageCard
                  package={pkg}
                  onSelect={handleSelectPackage}
                  selected={selectedPackage === pkg.id}
                />
              </Grid>
            ))}
          </Grid>

          {/* Purchase Summary */}
          {selectedPackage && selectedPkg && (
            <Card sx={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Selected Package
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedPkg.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPkg.credits.toLocaleString()} credits
                      {selectedPkg.bonusCredits && ` + ${selectedPkg.bonusCredits} bonus`}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      inputProps={{ min: 1, max: 10 }}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      ₹{totalAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {totalCredits.toLocaleString()} total credits
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<CartIcon />}
                      onClick={handlePurchaseClick}
                    >
                      Buy Now
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Alert severity="info">
          No {creditType === 'sms' ? 'SMS' : 'WhatsApp'} credit packages available at the moment.
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          {selectedPkg && (
            <>
              <Typography variant="body1" paragraph>
                You are about to purchase:
              </Typography>
              <Box bgcolor="grey.100" p={2} borderRadius={1} mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedPkg.name} × {quantity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {creditType === 'sms' ? 'SMS' : 'WhatsApp'} Credits
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">Credits:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {totalCredits.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Amount:</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    ₹{totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} />
                }
                label="Use wallet balance if available"
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                You will be redirected to the payment gateway to complete the purchase.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} disabled={purchaseLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={purchaseLoading ? <CircularProgress size={20} /> : <PaymentIcon />}
            onClick={handleConfirmPurchase}
            disabled={purchaseLoading}
          >
            {purchaseLoading ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreditPurchasePage;

