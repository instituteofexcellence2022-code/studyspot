/**
 * StudySpot Mobile App - Payment Screen
 * Payment processing screen with Razorpay integration
 */

import React, {useEffect, useState} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Card,
  Button,
  Spinner,
  Alert,
  Divider,
  Avatar,
  Pressable,
} from 'native-base';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAppDispatch, useAppSelector} from '../hooks/redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import RazorpayCheckout from 'react-native-razorpay';

import {COLORS, LAYOUT} from '@constants/index';
import {RootStackParamList, PaymentRequest} from '../types/index';
import {selectUser, selectTokens} from '@store/slices/authSlice';
import {selectCurrentBooking} from '@store/slices/bookingsSlice';
import {
  createPaymentOrder,
  verifyPayment,
  getRazorpayConfig,
  selectCurrentPayment,
  selectPaymentsLoading,
  selectPaymentsError,
  selectRazorpayConfig,
} from '@store/slices/paymentsSlice';

type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

const PaymentScreen: React.FC = () => {const navigation = useNavigation<PaymentScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const tokens = useAppSelector(selectTokens);
  const currentBooking = useAppSelector(selectCurrentBooking);const isLoading = useAppSelector(selectPaymentsLoading);
  const error = useAppSelector(selectPaymentsError);
  const razorpayConfig = useAppSelector(selectRazorpayConfig);

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'card'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    if (tokens?.accessToken) {
      loadRazorpayConfig();
    }
  }, [tokens]);

  const loadRazorpayConfig = () => {
    if (tokens?.accessToken) {
      dispatch(getRazorpayConfig({accessToken: tokens.accessToken}));
    }
  };

  const handlePayment = async () => {
    if (!tokens?.accessToken || !currentBooking || !razorpayConfig) {return;}

    setIsProcessing(true);
    try {
      // Create payment order
      const paymentData: PaymentRequest = {
        amount: currentBooking.totalAmount * 100, // Convert to paise
        currency: razorpayConfig.currency,
        bookingId: currentBooking.id,
        description: `Payment for booking at ${currentBooking.library.name}`,
        customerId: user?.id || '',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        paymentMethod: 'razorpay',
        paymentGateway: 'razorpay',
      };

      const paymentOrderResponse = await dispatch(createPaymentOrder({
        paymentData,
        accessToken: tokens.accessToken,
      }));

      if (createPaymentOrder.fulfilled.match(paymentOrderResponse)) {
        const order = paymentOrderResponse.payload;

        // Initialize Razorpay checkout
        const options = {
          description: paymentData.description,
          image: 'https://your-app-logo-url.com/logo.png',
          currency: razorpayConfig.currency,
          key: razorpayConfig.keyId,
          amount: paymentData.amount,
          order_id: order.id,
          name: 'StudySpot',
          prefill: {
            email: user?.email || '',
            contact: user?.phone || '',
            name: user?.name || '',
          },
          theme: {
            color: COLORS.PRIMARY,
          },
        };

        RazorpayCheckout.open(options)
          .then(async (data: any) => {
            // Payment successful, verify payment
            await dispatch(verifyPayment({
              paymentId: data.razorpay_payment_id,
              signature: data.razorpay_signature,
              orderId: order.id || order.orderId,
              accessToken: tokens.accessToken,
            }));

            setPaymentStatus('success');
            setTimeout(() => {
              navigation.navigate('BookingConfirmation', {
                bookingId: currentBooking.id,
              });
            }, 2000);
          })
          .catch((error: any) => {
            console.error('Payment failed:', error);
            setPaymentStatus('failed');
          });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Credit/Debit Card, UPI, Net Banking',
      icon: 'payment',
      color: COLORS.PRIMARY,
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Google Pay, PhonePe, Paytm',
      icon: 'account-balance-wallet',
      color: COLORS.INFO,
    },
    {
      id: 'card',
      name: 'Card',
      description: 'Credit/Debit Card',
      icon: 'credit-card',
      color: COLORS.WARNING,
    },
  ];

  if (paymentStatus === 'success') {
    return (
      <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
        <VStack flex={1} justifyContent="center" alignItems="center" px={LAYOUT.PADDING.LG}>
          <Avatar size="xl" backgroundColor={COLORS.SUCCESS} mb={4}>
            <Icon name="check-circle" size={40} color="white" />
          </Avatar>
          <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY} mb={2}>
            Payment Successful!
          </Text>
          <Text fontSize="md" color={COLORS.TEXT.SECONDARY} textAlign="center">
            Your booking has been confirmed. Redirecting to confirmation...
          </Text>
          <Spinner size="lg" color={COLORS.PRIMARY} mt={4} />
        </VStack>
      </Box>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
        <VStack flex={1} justifyContent="center" alignItems="center" px={LAYOUT.PADDING.LG}>
          <Avatar size="xl" backgroundColor={COLORS.ERROR} mb={4}>
            <Icon name="error" size={40} color="white" />
          </Avatar>
          <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY} mb={2}>
            Payment Failed
          </Text>
          <Text fontSize="md" color={COLORS.TEXT.SECONDARY} textAlign="center" mb={6}>
            Your payment could not be processed. Please try again.
          </Text>
          <HStack space={3}>
            <Button
              variant="outline"
              borderColor={COLORS.PRIMARY}
              _pressed={{backgroundColor: COLORS.PRIMARY + '20'}}
              onPress={handleCancel}>
              Go Back
            </Button>
            <Button
              backgroundColor={COLORS.PRIMARY}
              _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
              onPress={() => setPaymentStatus('pending')}>
              Try Again
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
      <ScrollView>
        {/* Header */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD} backgroundColor={COLORS.WHITE}>
          <VStack space={3}>
            <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
              Complete Payment
            </Text>
            <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
              Secure payment powered by Razorpay
            </Text>
          </VStack>
        </Box>

        {/* Booking Summary */}
        {currentBooking && (
          <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                  Booking Summary
                </Text>
                <VStack space={2}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Library</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      {currentBooking.library.name}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Date & Time</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      {moment(currentBooking.bookingDate).format('MMM DD')} - {moment(currentBooking.startTime, 'HH:mm').format('h:mm A')}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Seat</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      {currentBooking.seat.seatNumber} ({currentBooking.seat.zone})
                    </Text>
                  </HStack>

                  <Divider />

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="md" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>Total Amount</Text>
                    <Text fontSize="xl" fontWeight="bold" color={COLORS.PRIMARY}>
                      ₹{currentBooking.totalAmount}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Card>
          </Box>
        )}

        {/* Payment Methods */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
              Choose Payment Method
            </Text>

            <VStack space={2}>
              {paymentMethods.map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => setPaymentMethod(method.id as any)}>
                  <Card
                    backgroundColor={
                      paymentMethod === method.id ? COLORS.PRIMARY + '10' : COLORS.BACKGROUND.CARD
                    }
                    p={4}
                    borderWidth={paymentMethod === method.id ? 2 : 0}
                    borderColor={paymentMethod === method.id ? COLORS.PRIMARY : 'transparent'}>
                    <HStack alignItems="center" space={3}>
                      <Avatar
                        size="md"
                        backgroundColor={method.color}
                        borderRadius="md">
                        <Icon name={method.icon} size={20} color="white" />
                      </Avatar>

                      <VStack flex={1} space={1}>
                        <Text fontSize="md" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                          {method.name}
                        </Text>
                        <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                          {method.description}
                        </Text>
                      </VStack>

                      {paymentMethod === method.id && (
                        <Icon name="check-circle" size={20} color={COLORS.PRIMARY} />
                      )}
                    </HStack>
                  </Card>
                </Pressable>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Security Notice */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
          <Card backgroundColor={COLORS.INFO + '10'} p={4} borderWidth={1} borderColor={COLORS.INFO}>
            <HStack alignItems="flex-start" space={3}>
              <Icon name="security" size={20} color={COLORS.INFO} style={{marginTop: 2}} />
              <VStack flex={1} space={1}>
                <Text fontSize="sm" fontWeight="semibold" color={COLORS.INFO}>
                  Secure Payment
                </Text>
                <Text fontSize="xs" color={COLORS.TEXT.SECONDARY}>
                  Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                </Text>
              </VStack>
            </HStack>
          </Card>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.SM}>
            <Alert status="error" borderRadius="md">
              <Alert.Icon />
              <Text color="red.500" fontSize="sm">{error}</Text>
            </Alert>
          </Box>
        )}

        {/* Action Buttons */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
          <VStack space={3}>
            <Button
              backgroundColor={COLORS.PRIMARY}
              _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
              onPress={handlePayment}
              isLoading={isProcessing}
              isDisabled={!razorpayConfig || isLoading}
              leftIcon={<Icon name="payment" size={16} color="white" />}>
              {isProcessing ? 'Processing Payment...' : `Pay ₹${currentBooking?.totalAmount || 0}`}
            </Button>

            <Button
              variant="outline"
              borderColor={COLORS.PRIMARY}
              _pressed={{backgroundColor: COLORS.PRIMARY + '20'}}
              onPress={handleCancel}
              isDisabled={isProcessing}>
              Cancel
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default PaymentScreen;
