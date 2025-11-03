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
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  AlertTitle,
  LinearProgress,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Checkbox
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchCreditPackages, 
  fetchCreditBalance, 
  purchaseCredits 
} from '../../store/slices/creditSlice';
import { CreditType } from '../../types';
import CreditPackageCard from '../../components/credits/CreditPackageCard';
import { Payment as PaymentIcon,
  ShoppingCart as CartIcon,
  ArrowBack as BackIcon } from '@mui/icons-material';

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
    dispatch(fetchCreditPackages(creditType) as any);
    dispatch(fetchCreditBalance() as any);
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
      await (dispatch(
        purchaseCredits({
          packageId: selectedPackage,
          quantity,
          paymentMethodId: 'default', // In production, get from payment method selection
          useWalletBalance: useWallet} as any) as any
      ) as any).unwrap();

      setPurchaseSuccess(true);
      setConfirmDialogOpen(false);
      
      // Refresh balance
      dispatch(fetchCreditBalance() as any);
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
            <Box display="flex" gap={4}>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  SMS Credits
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                    {balance.data?.smsCredits?.toLocaleString() || 0}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  WhatsApp Credits
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                    {balance.data?.whatsappCredits?.toLocaleString() || 0}
                </Typography>
              </Box>
            </Box>
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
          <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
            {filteredPackages.map((pkg) => (
              <Box key={pkg.id} flex="1 1 300px" minWidth="300px">
                <CreditPackageCard
                  package={pkg}
                  onSelect={handleSelectPackage}
                  selected={selectedPackage === pkg.id}
                />
              </Box>
            ))}
          </Box>

          {/* Purchase Summary */}
          {selectedPackage && selectedPkg && (
            <Card sx={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
              <CardContent>
                <Box display="flex" flexWrap="wrap" gap={3} alignItems="center">
                  <Box flex="1 1 300px">
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
                  </Box>

                  <Box flex="1 1 200px">
                    <TextField
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      inputProps={{ min: 1, max: 10 }}
                      fullWidth
                      size="small"
                    />
                  </Box>

                  <Box flex="1 1 200px">
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      ₹{totalAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {totalCredits.toLocaleString()} total credits
                    </Typography>
                  </Box>

                  <Box flex="1 1 150px">
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<CartIcon />}
                      onClick={handlePurchaseClick}
                    >
                      Buy Now
                    </Button>
                  </Box>
                </Box>
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

