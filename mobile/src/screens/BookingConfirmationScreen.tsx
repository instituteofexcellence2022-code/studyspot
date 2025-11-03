/**
 * StudySpot Mobile App - Booking Confirmation Screen
 * Booking confirmation and details
 */

import React, {useEffect, useState} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Card,
  Badge,
  Button,
  Alert,
  Divider,
  Avatar,
} from 'native-base';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAppDispatch, useAppSelector} from '../hooks/redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

import {COLORS, LAYOUT} from '@constants/index';
import {RootStackParamList, Booking, BookingStatus, BookingRequest} from '../types/index';
import {selectUser, selectTokens} from '@store/slices/authSlice';
import {
  getBookingDetails,
  createBooking,
  selectCurrentBooking,
  selectBookingsLoading,
  selectBookingsError,
} from '@store/slices/bookingsSlice';

type BookingConfirmationScreenRouteProp = RouteProp<RootStackParamList, 'BookingConfirmation'>;
type BookingConfirmationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BookingConfirmation'>;

const BookingConfirmationScreen: React.FC = () => {
  const route = useRoute<BookingConfirmationScreenRouteProp>();
  const navigation = useNavigation<BookingConfirmationScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const tokens = useAppSelector(selectTokens);
  const currentBooking = useAppSelector(selectCurrentBooking);const error = useAppSelector(selectBookingsError);

  const {bookingId} = route.params;
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (tokens?.accessToken && bookingId !== 'temp-booking-id') {
      loadBookingDetails();
    }
  }, [bookingId, tokens]);

  const loadBookingDetails = () => {
    if (tokens?.accessToken) {
      dispatch(getBookingDetails({
        bookingId,
        accessToken: tokens.accessToken,
      }));
    }
  };

  const handleCreateBooking = async () => {
    if (!tokens?.accessToken) {return;}

    setIsCreating(true);
    try {
      // Sample booking data - in real app, this would come from previous screen
      const bookingData: BookingRequest = {
        libraryId: 'lib-1',
        seatId: 'seat-1',
        date: moment().format('YYYY-MM-DD'),
        bookingDate: moment().format('YYYY-MM-DD'),
        startTime: '09:00',
        endTime: '12:00',
        bookingType: 'hourly' as const,
        specialRequests: '',
        paymentMethod: 'razorpay',
      };

      await dispatch(createBooking({
        bookingData,
        accessToken: tokens.accessToken,
      }));
    } catch (err) {
      console.error('Failed to create booking:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewBooking = () => {
    if (currentBooking) {
      navigation.navigate('BookingDetails', {bookingId: currentBooking.id});
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Main' as any);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return COLORS.SUCCESS;
      case 'pending':
        return COLORS.WARNING;
      case 'cancelled':
        return COLORS.ERROR;
      case 'completed':
        return COLORS.INFO;
      case 'no_show':
        return COLORS.GRAY[500];
      default:
        return COLORS.GRAY[500];
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'check-circle';
      case 'pending':
        return 'schedule';
      case 'cancelled':
        return 'cancel';
      case 'completed':
        return 'done-all';
      case 'no_show':
        return 'person-off';
      default:
        return 'help';
    }
  };

  // Sample booking data for temp booking
  const tempBooking: Booking = {
    id: 'temp-booking-id',
    userId: user?.id || 'user-1',
    libraryId: 'lib-1',
    seatId: 'seat-1',
    bookingDate: moment().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '12:00',
    bookingType: 'hourly',
    status: 'pending',
    paymentStatus: 'pending',
    totalAmount: 150,
    specialRequests: '',
    qrCode: 'temp-qr-code',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    library: {
      id: 'lib-1',
      name: 'Central Library',
      address: '123 Main Street, Downtown',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      location: {latitude: 19.0760, longitude: 72.8777},
      capacity: 100,
      amenities: ['wifi', 'ac', 'quiet_zone', 'parking', 'printing', 'coffee'],
      pricing: {hourly: 50, daily: 300, monthly: 5000},
      operatingHours: {
        monday: {open: '06:00', close: '23:00', isOpen: true},
        tuesday: {open: '06:00', close: '23:00', isOpen: true},
        wednesday: {open: '06:00', close: '23:00', isOpen: true},
        thursday: {open: '06:00', close: '23:00', isOpen: true},
        friday: {open: '06:00', close: '23:00', isOpen: true},
        saturday: {open: '08:00', close: '22:00', isOpen: true},
        sunday: {open: '08:00', close: '22:00', isOpen: true},
      },
      images: [],
      contactInfo: {
        phone: '+91-9876543210',
        email: 'info@centrallibrary.com',
      },
      rating: 4.8,
      reviewCount: 120,
      distance: 0.5,
      seatStats: {total: 100, available: 45},
      isOpen: true,
      currentOccupancy: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    seat: {
      id: 'seat-1',
      number: 'A1',
      seatNumber: 'A1',
      zone: 'quiet',
      seatType: 'desk',
      amenities: ['wifi', 'power'],
      location: {floor: 1, section: 'A', coordinates: {x: 1, y: 1}},
    },
  };

  const booking = currentBooking || tempBooking;

  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
      <ScrollView>
        {/* Success Header */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD} backgroundColor={COLORS.WHITE}>
          <VStack space={4} alignItems="center">
            <Avatar size="xl" backgroundColor={COLORS.SUCCESS}>
              <Icon name="check-circle" size={40} color="white" />
            </Avatar>
            <VStack space={2} alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                Booking {booking.status === 'pending' ? 'Created' : 'Confirmed'}
              </Text>
              <Text fontSize="md" color={COLORS.TEXT.SECONDARY} textAlign="center">
                {booking.status === 'pending'
                  ? 'Your booking request has been submitted. Please complete payment to confirm.'
                  : 'Your booking has been confirmed successfully!'}
              </Text>
            </VStack>
            <Badge backgroundColor={getStatusColor(booking.status)} borderRadius="full">
              <HStack alignItems="center" space={1}>
                <Icon name={getStatusIcon(booking.status)} size={12} color="white" />
                <Text color="white" fontSize="xs" fontWeight="medium" textTransform="capitalize">
                  {booking.status.replace('_', ' ')}
                </Text>
              </HStack>
            </Badge>
          </VStack>
        </Box>

        {/* Booking Details */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
          <VStack space={4}>
            {/* Library Information */}
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                  Library Details
                </Text>
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                    {booking.library.name}
                  </Text>
                  <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                    {booking.library.address}
                  </Text>
                  <HStack alignItems="center" space={2}>
                    <Icon name="location-on" size={16} color={COLORS.TEXT.SECONDARY} />
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                      {booking.library.distance} km away
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Card>

            {/* Booking Information */}
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                  Booking Details
                </Text>
                <VStack space={3}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Booking ID</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      #{booking.id.slice(-8).toUpperCase()}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Date</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      {moment(booking.bookingDate).format('MMM DD, YYYY')}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Time</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      {moment(booking.startTime, 'HH:mm').format('h:mm A')} - {moment(booking.endTime, 'HH:mm').format('h:mm A')}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Seat</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      {booking.seat.seatNumber} ({booking.seat.zone})
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Duration</Text>
                    <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      {moment(booking.endTime, 'HH:mm').diff(moment(booking.startTime, 'HH:mm'), 'hours')} hours
                    </Text>
                  </HStack>

                  <Divider />

                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="md" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>Total Amount</Text>
                    <Text fontSize="lg" fontWeight="bold" color={COLORS.PRIMARY}>
                      ₹{booking.totalAmount}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Card>

            {/* Special Instructions */}
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                  Important Instructions
                </Text>
                <VStack space={2}>
                  <HStack alignItems="flex-start" space={2}>
                    <Icon name="info" size={16} color={COLORS.INFO} style={{marginTop: 2}} />
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} flex={1}>
                      Please arrive 15 minutes before your booking time
                    </Text>
                  </HStack>
                  <HStack alignItems="flex-start" space={2}>
                    <Icon name="qr-code" size={16} color={COLORS.INFO} style={{marginTop: 2}} />
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} flex={1}>
                      Use the QR code at the library entrance for check-in
                    </Text>
                  </HStack>
                  <HStack alignItems="flex-start" space={2}>
                    <Icon name="cancel" size={16} color={COLORS.INFO} style={{marginTop: 2}} />
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} flex={1}>
                      Cancellation is allowed up to 2 hours before booking time
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert status="error" borderRadius="md">
                <Alert.Icon />
                <Text color="red.500" fontSize="sm">{error}</Text>
              </Alert>
            )}

            {/* Action Buttons */}
            <VStack space={3}>
              {booking.status === 'pending' ? (
                <Button
                  backgroundColor={COLORS.PRIMARY}
                  _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
                  onPress={handleCreateBooking}
                  isLoading={isCreating}
                  leftIcon={<Icon name="payment" size={16} color="white" />}>
                  Complete Payment - ₹{booking.totalAmount}
                </Button>
              ) : (
                <Button
                  backgroundColor={COLORS.PRIMARY}
                  _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
                  onPress={handleViewBooking}
                  leftIcon={<Icon name="event" size={16} color="white" />}>
                  View Booking Details
                </Button>
              )}

              <Button
                variant="outline"
                borderColor={COLORS.PRIMARY}
                _pressed={{backgroundColor: COLORS.PRIMARY + '20'}}
                onPress={handleGoHome}
                leftIcon={<Icon name="home" size={16} color={COLORS.PRIMARY} />}>
                Go to Home
              </Button>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default BookingConfirmationScreen;
