/**
 * StudySpot Mobile App - Enhanced Booking Screen with Error Handling
 * Professional booking experience with error boundaries and animations
 */

import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Box, Text, VStack, HStack, Button, Card, CardBody, Alert } from 'native-base';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceMonitoring } from '../../services/PerformanceMonitoringService';
import { BookingSuccessAnimation, PaymentProcessingAnimation } from '../../components/common/LottieAnimations';
import { COLORS } from '../../constants';

interface BookingData {
  libraryId: string;
  date: string;
  time: string;
  duration: number;
  seatType: string;
}

const BookingScreen: React.FC = () => {
  const [bookingData, setBookingData] = useState<BookingData>({
    libraryId: '1',
    date: '2024-01-15',
    time: '10:00 AM',
    duration: 2,
    seatType: 'Study Desk',
  });
  
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showPaymentAnimation, setShowPaymentAnimation] = useState(false);
  
  const queryClient = useQueryClient();

  // Booking mutation with React Query
  const bookingMutation = useMutation({
    mutationFn: async (data: BookingData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      if (Math.random() > 0.3) {
        return { success: true, bookingId: 'BK' + Date.now() };
      } else {
        throw new Error('Booking failed. Please try again.');
      }
    },
    onSuccess: (result) => {
      performanceMonitoring.trackUserInteraction('BookingScreen', 'booking_success', true);
      
      // Show success animation
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 3000);
      
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      console.log('Booking successful:', result);
    },
    onError: (error) => {
      performanceMonitoring.trackUserInteraction('BookingScreen', 'booking_failed', false);
      console.error('Booking failed:', error);
    },
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      setShowPaymentAnimation(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return { success: true, transactionId: 'TXN' + Date.now() };
    },
    onSuccess: () => {
      setShowPaymentAnimation(false);
      performanceMonitoring.trackUserInteraction('BookingScreen', 'payment_success', true);
    },
    onError: () => {
      setShowPaymentAnimation(false);
      performanceMonitoring.trackUserInteraction('BookingScreen', 'payment_failed', false);
    },
  });

  const handleBooking = () => {
    performanceMonitoring.trackUserInteraction('BookingScreen', 'booking_attempt', true);
    bookingMutation.mutate(bookingData);
  };

  const handlePayment = () => {
    performanceMonitoring.trackUserInteraction('BookingScreen', 'payment_attempt', true);
    paymentMutation.mutate('BK123');
  };

  const handleShareBooking = async () => {
    performanceMonitoring.trackUserInteraction('BookingScreen', 'share_booking', true);
    
    try {
      const { deepLinkingService } = await import('../../services/DeepLinkingService');
      await deepLinkingService.shareDeepLink('BookingConfirmation', { 
        id: 'BK123',
        library: 'Central Library',
        date: bookingData.date,
        time: bookingData.time 
      });
    } catch (error) {
      console.error('Failed to share booking:', error);
    }
  };

  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space={6}>
          {/* Header */}
          <VStack space={2}>
            <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
              Book Your Study Space
            </Text>
            <Text fontSize="md" color={COLORS.TEXT.SECONDARY}>
              Reserve your spot at Central Library
            </Text>
          </VStack>

          {/* Success Animation */}
          {showSuccessAnimation && (
            <Box alignItems="center" py={4}>
              <BookingSuccessAnimation onFinish={() => setShowSuccessAnimation(false)} />
              <Text fontSize="lg" fontWeight="bold" color={COLORS.PRIMARY} mt={4}>
                Booking Confirmed!
              </Text>
            </Box>
          )}

          {/* Payment Processing Animation */}
          {showPaymentAnimation && (
            <Box alignItems="center" py={4}>
              <PaymentProcessingAnimation />
              <Text fontSize="md" color={COLORS.TEXT.PRIMARY} mt={4}>
                Processing Payment...
              </Text>
            </Box>
          )}

          {/* Booking Details */}
          <Card>
            <CardBody>
              <VStack space={4}>
                <Text fontSize="lg" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                  Booking Details
                </Text>
                
                <HStack justifyContent="space-between">
                  <Text color={COLORS.TEXT.SECONDARY}>Library:</Text>
                  <Text fontWeight="medium">Central Library</Text>
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text color={COLORS.TEXT.SECONDARY}>Date:</Text>
                  <Text fontWeight="medium">{bookingData.date}</Text>
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text color={COLORS.TEXT.SECONDARY}>Time:</Text>
                  <Text fontWeight="medium">{bookingData.time}</Text>
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text color={COLORS.TEXT.SECONDARY}>Duration:</Text>
                  <Text fontWeight="medium">{bookingData.duration} hours</Text>
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text color={COLORS.TEXT.SECONDARY}>Seat Type:</Text>
                  <Text fontWeight="medium">{bookingData.seatType}</Text>
                </HStack>
                
                <HStack justifyContent="space-between" borderTopWidth={1} borderTopColor={COLORS.BORDER.PRIMARY} pt={2}>
                  <Text fontSize="lg" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>Total:</Text>
                  <Text fontSize="lg" fontWeight="bold" color={COLORS.PRIMARY}>₹150</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Error Alert */}
          {bookingMutation.error && (
            <Alert status="error" borderRadius="md">
              <Alert.Icon />
              <Text color="red.500" fontSize="sm">
                {bookingMutation.error.message}
              </Text>
            </Alert>
          )}

          {/* Action Buttons */}
          <VStack space={3}>
            <Button
              onPress={handleBooking}
              backgroundColor={COLORS.PRIMARY}
              _pressed={{ backgroundColor: COLORS.PRIMARY_DARK }}
              isDisabled={bookingMutation.isPending || showSuccessAnimation}
              isLoading={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
            </Button>

            {showSuccessAnimation && (
              <>
                <Button
                  onPress={handlePayment}
                  backgroundColor="green.500"
                  _pressed={{ backgroundColor: "green.600" }}
                  isDisabled={paymentMutation.isPending || showPaymentAnimation}
                  isLoading={paymentMutation.isPending}
                >
                  {paymentMutation.isPending ? 'Processing...' : 'Make Payment'}
                </Button>

                <Button
                  variant="outline"
                  borderColor={COLORS.BORDER.PRIMARY}
                  onPress={handleShareBooking}
                >
                  Share Booking
                </Button>
              </>
            )}
          </VStack>

          {/* Additional Information */}
          <Card backgroundColor={COLORS.BACKGROUND.SECONDARY}>
            <CardBody>
              <VStack space={2}>
                <Text fontSize="md" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                  Important Notes:
                </Text>
                <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                  • Please arrive 10 minutes before your booking time
                </Text>
                <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                  • Bring a valid ID for verification
                </Text>
                <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                  • Cancellation is allowed up to 2 hours before booking
                </Text>
                <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                  • Late arrivals may result in booking cancellation
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default BookingScreen;












