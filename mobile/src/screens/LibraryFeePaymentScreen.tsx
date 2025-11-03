/**
 * StudySpot Mobile App - Library Fee Payment Screen
 * Screen for students to pay library fees (one-time or recurring)
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
  Badge,
  Pressable,
  Radio,
} from 'native-base';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAppDispatch, useAppSelector} from '../hooks/redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import RazorpayCheckout from 'react-native-razorpay';

import {COLORS} from '../constants/index';
import {RootStackParamList, Library} from '../types/index';
import {selectUser} from '../store/slices/authSlice';
import {selectTokens} from '../store/slices/authSlice';
import paymentService from '../services/PaymentService';

// =============================================================================
// TYPES
// =============================================================================

type LibraryFeePaymentScreenRouteProp = RouteProp<RootStackParamList, 'LibraryDetails'>;
type LibraryFeePaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LibraryDetails'>;

interface LibraryFeePlan {
  oneTime: { amount: number; description: string };
  monthly: { amount: number; description: string; savings?: number };
  quarterly: { amount: number; description: string; savings?: number };
  yearly: { amount: number; description: string; savings?: number };
}

// =============================================================================
// COMPONENT
// =============================================================================

const LibraryFeePaymentScreen: React.FC = () => {
  const route = useRoute<LibraryFeePaymentScreenRouteProp>();
  const navigation = useNavigation<LibraryFeePaymentScreenNavigationProp>();const user = useAppSelector(selectUser);
  const tokens = useAppSelector(selectTokens);

  const {libraryId} = route.params;

  // State
  const [library, setLibrary] = useState<Library | null>(null);
  const [feePlans, setFeePlans] = useState<LibraryFeePlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'one_time' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================================================
  // FUNCTIONS
  // =============================================================================

  const loadLibraryAndFeePlans = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load library details
      // TODO: Implement library service call
      const mockLibrary: Library = {
        id: libraryId,
        name: 'Central Library',
        description: 'Modern library with excellent facilities',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        location: { latitude: 19.0760, longitude: 72.8777 },
        capacity: 500,
        amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria'],
        pricing: { hourly: 50, daily: 300, monthly: 2000 },
        operatingHours: {},
        images: [],
        contactInfo: { phone: '+91-1234567890', email: 'info@centrallibrary.com' },
        rating: 4.5,
        reviewCount: 150,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLibrary(mockLibrary);

      // Load fee plans
      if (tokens?.accessToken) {
        const response = await paymentService.getLibraryFeePlans(libraryId, {
          Authorization: `Bearer ${tokens.accessToken}`,
        });

        if (response.success && response.data) {
          setFeePlans(response.data);
        } else {
          // Fallback to mock data
          setFeePlans({
            oneTime: { amount: 100, description: 'One-time library access fee' },
            monthly: { amount: 500, description: 'Monthly library membership', savings: 0 },
            quarterly: { amount: 1200, description: 'Quarterly membership (Save ₹300)', savings: 300 },
            yearly: { amount: 4000, description: 'Annual membership (Save ₹2000)', savings: 2000 },
          });
        }
      }
    } catch (err: any) {
      console.error('Error loading library fee plans:', err);
      setError('Failed to load library fee plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!feePlans || !library || !tokens?.accessToken) {return;}

    try {
      setProcessing(true);
      setError(null);

      const selectedAmount = feePlans[selectedPlan === 'one_time' ? 'oneTime' : selectedPlan].amount;
      const description = feePlans[selectedPlan === 'one_time' ? 'oneTime' : selectedPlan].description;

      // Create payment order
      const paymentResponse = await paymentService.createLibraryFeePayment(
        {
          libraryId: library.id,
          amount: selectedAmount,
          paymentType: selectedPlan,
          description,
        },
        {
          Authorization: `Bearer ${tokens.accessToken}`,
        }
      );

      if (!paymentResponse.success || !paymentResponse.data) {
        throw new Error(paymentResponse.message || 'Failed to create payment order');
      }

      const paymentData = paymentResponse.data;

      // Initialize Razorpay
      const options = {
        description: description,
        image: 'https://studyspot.com/logo.png',
        currency: paymentData.currency,
        key: paymentData.gatewayConfig.keyId,
        amount: paymentData.amount * 100, // Razorpay expects amount in paise
        name: 'StudySpot',
        order_id: paymentData.orderId,
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: `${user?.firstName} ${user?.lastName}`,
        },
        theme: { color: COLORS.PRIMARY },
      };

      // Open Razorpay checkout
      const razorpayResponse = await RazorpayCheckout.open(options);

      // Verify payment
      const verifyResponse = await paymentService.verifyPayment(
        razorpayResponse.razorpay_payment_id,
        razorpayResponse.razorpay_signature,
        paymentData.orderId,
        {
          Authorization: `Bearer ${tokens.accessToken}`,
        }
      );

      if (verifyResponse.success) {
        // Payment successful
        navigation.navigate('Main');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      if (err.description) {
        setError(err.description);
      } else {
        setError('Payment failed. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'one_time':
        return 'payment';
      case 'monthly':
        return 'schedule';
      case 'quarterly':
        return 'date-range';
      case 'yearly':
        return 'calendar-today';
      default:
        return 'payment';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'one_time':
        return COLORS.GRAY[500];
      case 'monthly':
        return COLORS.PRIMARY;
      case 'quarterly':
        return COLORS.SECONDARY;
      case 'yearly':
        return COLORS.SUCCESS;
      default:
        return COLORS.GRAY[500];
    }
  };

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    loadLibraryAndFeePlans();
  }, [libraryId, loadLibraryAndFeePlans]);

  // =============================================================================
  // RENDER
  // =============================================================================

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg={COLORS.BACKGROUND.PRIMARY}>
        <Spinner size="lg" color={COLORS.PRIMARY} />
        <Text mt={4} color={COLORS.TEXT.SECONDARY}>
          Loading library fee plans...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg={COLORS.BACKGROUND.PRIMARY} px={6}>
        <Alert status="error" w="100%">
          <Alert.Icon />
          <Text color="red.500" fontSize="sm">{error}</Text>
        </Alert>
        <Button
          mt={4}
          onPress={loadLibraryAndFeePlans}
          bg={COLORS.PRIMARY}
          _pressed={{ bg: COLORS.PRIMARY_DARK }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={COLORS.BACKGROUND.PRIMARY}>
      {/* Header */}
      <Box bg={COLORS.PRIMARY} pt={12} pb={4} px={6}>
        <HStack alignItems="center" justifyContent="space-between">
          <Button
            variant="ghost"
            onPress={() => navigation.goBack()}
            _pressed={{ bg: 'rgba(255,255,255,0.1)' }}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </Button>
          <Text fontSize="lg" fontWeight="bold" color="white">
            Library Fee Payment
          </Text>
          <Box w={10} />
        </HStack>
      </Box>

      <ScrollView flex={1} px={6} py={4}>
        {/* Library Info */}
        {library && (
          <Card mb={4} p={4}>
            <HStack alignItems="center" mb={3}>
              <Avatar
                size="md"
                bg={COLORS.PRIMARY}
                source={{ uri: library.images[0] }}
              >
                <Text color="white" fontWeight="bold">
                  {library.name.charAt(0)}
                </Text>
              </Avatar>
              <VStack ml={3} flex={1}>
                <Text fontSize="lg" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                  {library.name}
                </Text>
                <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                  {library.address}, {library.city}
                </Text>
              </VStack>
            </HStack>
            <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
              {library.description}
            </Text>
          </Card>
        )}

        {/* Fee Plans */}
        {feePlans && (
          <Card mb={4} p={4}>
            <Text fontSize="lg" fontWeight="bold" color={COLORS.TEXT.PRIMARY} mb={4}>
              Choose Payment Plan
            </Text>

            <VStack space={3}>
              {Object.entries(feePlans).map(([planKey, planData]) => {
                const isSelected = selectedPlan === planKey;
                const planColor = getPlanColor(planKey);
                const planIcon = getPlanIcon(planKey);

                return (
                  <Pressable
                    key={planKey}
                    onPress={() => setSelectedPlan(planKey as any)}
                    _pressed={{ opacity: 0.7 }}
                  >
                    <Card
                      p={4}
                      borderWidth={isSelected ? 2 : 1}
                      borderColor={isSelected ? planColor : COLORS.BORDER.PRIMARY}
                      bg={isSelected ? `${planColor}10` : 'white'}
                    >
                      <HStack alignItems="center" justifyContent="space-between">
                        <HStack alignItems="center" flex={1}>
                            <Radio
                              value={planKey}
                              colorScheme="primary"
                              mr={3}
                            />
                          <Icon name={planIcon} size={24} color={planColor} />
                          <VStack ml={3} flex={1}>
                            <Text fontSize="md" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                              {planKey === 'one_time' ? 'One-time Payment' :
                               planKey === 'monthly' ? 'Monthly Membership' :
                               planKey === 'quarterly' ? 'Quarterly Membership' :
                               'Annual Membership'}
                            </Text>
                            <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                              {planData.description}
                            </Text>
                            {planData.savings && planData.savings > 0 && (
                              <Badge bg={COLORS.SUCCESS} mt={1}>
                                <Text color="white" fontSize="xs">
                                  Save ₹{planData.savings}
                                </Text>
                              </Badge>
                            )}
                          </VStack>
                        </HStack>
                        <VStack alignItems="flex-end">
                          <Text fontSize="lg" fontWeight="bold" color={planColor}>
                            ₹{planData.amount}
                          </Text>
                          {planKey !== 'one_time' && (
                            <Text fontSize="xs" color={COLORS.TEXT.SECONDARY}>
                              per {planKey === 'monthly' ? 'month' :
                                   planKey === 'quarterly' ? '3 months' : 'year'}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </Card>
                  </Pressable>
                );
              })}
            </VStack>
          </Card>
        )}

        {/* Payment Summary */}
        {feePlans && (
          <Card mb={6} p={4}>
            <Text fontSize="lg" fontWeight="bold" color={COLORS.TEXT.PRIMARY} mb={3}>
              Payment Summary
            </Text>
            <VStack space={2}>
              <HStack justifyContent="space-between">
                <Text color={COLORS.TEXT.SECONDARY}>
                  {selectedPlan === 'one_time' ? 'One-time Fee' :
                   selectedPlan === 'monthly' ? 'Monthly Membership' :
                   selectedPlan === 'quarterly' ? 'Quarterly Membership' :
                   'Annual Membership'}
                </Text>
                <Text fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                  ₹{feePlans[selectedPlan === 'one_time' ? 'oneTime' : selectedPlan].amount}
                </Text>
              </HStack>
              <Divider />
              <HStack justifyContent="space-between">
                <Text fontSize="lg" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                  Total Amount
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={COLORS.PRIMARY}>
                  ₹{feePlans[selectedPlan === 'one_time' ? 'oneTime' : selectedPlan].amount}
                </Text>
              </HStack>
            </VStack>
          </Card>
        )}
      </ScrollView>

      {/* Payment Button */}
      <Box p={6} bg="white" borderTopWidth={1} borderTopColor={COLORS.BORDER.PRIMARY}>
        <Button
          onPress={handlePayment}
          bg={COLORS.PRIMARY}
          _pressed={{ bg: COLORS.PRIMARY_DARK }}
          disabled={processing || !feePlans}
          leftIcon={processing ? <Spinner size="sm" color="white" /> : <Icon name="payment" size={20} color="white" />}
        >
          {processing ? 'Processing...' : `Pay ₹${feePlans?.[selectedPlan === 'one_time' ? 'oneTime' : selectedPlan]?.amount || 0}`}
        </Button>
        <Text fontSize="xs" color={COLORS.TEXT.SECONDARY} textAlign="center" mt={2}>
          Secure payment powered by Razorpay
        </Text>
      </Box>
    </Box>
  );
};

export default LibraryFeePaymentScreen;
