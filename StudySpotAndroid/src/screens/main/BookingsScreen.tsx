/**
 * StudySpot Mobile App - Bookings Screen
 * User's booking history and management
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
  Pressable,
  Spinner,
  Alert,
  Button,
  Divider,
  Avatar,
} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

import {COLORS, LAYOUT} from '@constants/index';
import {RootStackParamList, Booking, BookingStatus} from '../../types/index';
import {selectUser, selectTokens} from '@store/slices/authSlice';
import {
  getBookings,
  cancelBooking,
  checkIn,
  checkOut,
  selectBookings,
  selectBookingsLoading,
  selectBookingsError,
} from '@store/slices/bookingsSlice';

type BookingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const BookingsScreen: React.FC = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const dispatch = useAppDispatch();const tokens = useAppSelector(selectTokens);
  const bookings = useAppSelector(selectBookings);
  const isLoading = useAppSelector(selectBookingsLoading);
  const error = useAppSelector(selectBookingsError);

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  useEffect(() => {
    if (tokens?.accessToken) {
      loadBookings();
    }
  }, [tokens]);

  const loadBookings = () => {
    if (tokens?.accessToken) {
      dispatch(getBookings({accessToken: tokens.accessToken}));
    }
  };

  const handleBookingPress = (bookingId: string) => {
    navigation.navigate('BookingDetails', {bookingId});
  };

  const handleCancelBooking = (bookingId: string) => {
    if (tokens?.accessToken) {
      dispatch(cancelBooking({bookingId, accessToken: tokens.accessToken}));
    }
  };

  const handleCheckIn = (bookingId: string) => {
    if (tokens?.accessToken) {
      dispatch(checkIn({bookingId, accessToken: tokens.accessToken}));
    }
  };

  const handleCheckOut = (bookingId: string) => {
    if (tokens?.accessToken) {
      dispatch(checkOut({bookingId, accessToken: tokens.accessToken}));
    }
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

  const canCancel = (booking: Booking) => {
    const bookingTime = moment(`${booking.bookingDate} ${booking.startTime}`);
    const now = moment();
    const hoursUntilBooking = bookingTime.diff(now, 'hours');
    return booking.status === 'confirmed' && hoursUntilBooking > 2;
  };

  const canCheckIn = (booking: Booking) => {
    const bookingTime = moment(`${booking.bookingDate} ${booking.startTime}`);
    const now = moment();
    const minutesUntilBooking = bookingTime.diff(now, 'minutes');
    return booking.status === 'confirmed' && minutesUntilBooking <= 15 && minutesUntilBooking >= -15;
  };

  const canCheckOut = (booking: Booking) => {
    return booking.status === 'confirmed' && booking.checkInTime && !booking.checkOutTime;
  };

  const filteredBookings = bookings.filter(booking => {
    const now = moment();
    const bookingTime = moment(`${booking.bookingDate} ${booking.startTime}`);

    switch (selectedFilter) {
      case 'upcoming':
        return bookingTime.isAfter(now) && booking.status !== 'cancelled';
      case 'past':
        return bookingTime.isBefore(now) || booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} backgroundColor={COLORS.BACKGROUND.CARD} p={4} mb={3}>
      <Pressable onPress={() => handleBookingPress(booking.id)}>
        <VStack space={3}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack flex={1} space={1}>
              <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                {booking.library.name}
              </Text>
              <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                {booking.library.address}
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
          </HStack>

          {/* Booking Details */}
          <VStack space={2}>
            <HStack alignItems="center" space={2}>
              <Icon name="event" size={16} color={COLORS.TEXT.SECONDARY} />
              <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                {moment(booking.bookingDate).format('MMM DD, YYYY')}
              </Text>
            </HStack>

            <HStack alignItems="center" space={2}>
              <Icon name="access-time" size={16} color={COLORS.TEXT.SECONDARY} />
              <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                {moment(booking.startTime, 'HH:mm').format('h:mm A')} - {moment(booking.endTime, 'HH:mm').format('h:mm A')}
              </Text>
            </HStack>

            <HStack alignItems="center" space={2}>
              <Icon name="chair" size={16} color={COLORS.TEXT.SECONDARY} />
              <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                Seat {booking.seat.number} - {booking.seat.zone}
              </Text>
            </HStack>

            <HStack alignItems="center" space={2}>
              <Icon name="payment" size={16} color={COLORS.TEXT.SECONDARY} />
              <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                ₹{booking.totalAmount} ({booking.bookingType})
              </Text>
            </HStack>
          </VStack>

          {/* Check-in/Check-out Times */}
          {(booking.checkInTime || booking.checkOutTime) && (
            <VStack space={1}>
              <Divider />
              {booking.checkInTime && (
                <HStack alignItems="center" space={2}>
                  <Icon name="login" size={16} color={COLORS.SUCCESS} />
                  <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                    Checked in: {moment(booking.checkInTime).format('h:mm A')}
                  </Text>
                </HStack>
              )}
              {booking.checkOutTime && (
                <HStack alignItems="center" space={2}>
                  <Icon name="logout" size={16} color={COLORS.INFO} />
                  <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                    Checked out: {moment(booking.checkOutTime).format('h:mm A')}
                  </Text>
                </HStack>
              )}
            </VStack>
          )}

          {/* Action Buttons */}
          <HStack space={2} justifyContent="flex-end">
            {canCheckIn(booking) && (
              <Button
                size="sm"
                backgroundColor={COLORS.SUCCESS}
                _pressed={{backgroundColor: COLORS.SUCCESS + '80'}}
                onPress={() => handleCheckIn(booking.id)}
                leftIcon={<Icon name="login" size={16} color="white" />}>
                Check In
              </Button>
            )}

            {canCheckOut(booking) && (
              <Button
                size="sm"
                backgroundColor={COLORS.INFO}
                _pressed={{backgroundColor: COLORS.INFO + '80'}}
                onPress={() => handleCheckOut(booking.id)}
                leftIcon={<Icon name="logout" size={16} color="white" />}>
                Check Out
              </Button>
            )}

            {canCancel(booking) && (
              <Button
                size="sm"
                variant="outline"
                borderColor={COLORS.ERROR}
                _pressed={{backgroundColor: COLORS.ERROR + '20'}}
                onPress={() => handleCancelBooking(booking.id)}>
                Cancel
              </Button>
            )}
          </HStack>
        </VStack>
      </Pressable>
    </Card>
  );

  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
      {/* Header */}
      <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD} backgroundColor={COLORS.WHITE}>
        <VStack space={3}>
          <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
            My Bookings
          </Text>

          {/* Filter Tabs */}
          <HStack space={2}>
            {[
              {key: 'all', label: 'All'},
              {key: 'upcoming', label: 'Upcoming'},
              {key: 'past', label: 'Past'},
              {key: 'cancelled', label: 'Cancelled'},
            ].map((filter) => (
              <Pressable
                key={filter.key}
                onPress={() => setSelectedFilter(filter.key as any)}
                flex={1}>
                <Box
                  backgroundColor={selectedFilter === filter.key ? COLORS.PRIMARY : COLORS.BACKGROUND.SECONDARY}
                  borderRadius="full"
                  py={2}
                  px={4}
                  alignItems="center">
                  <Text
                    color={selectedFilter === filter.key ? 'white' : COLORS.TEXT.SECONDARY}
                    fontSize="sm"
                    fontWeight="medium">
                    {filter.label}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </HStack>
        </VStack>
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

      {/* Content */}
      <ScrollView flex={1} px={LAYOUT.PADDING.LG}>
        {isLoading ? (
          <Box alignItems="center" py={8}>
            <Spinner size="lg" color={COLORS.PRIMARY} />
            <Text color={COLORS.TEXT.SECONDARY} mt={2}>
              Loading bookings...
            </Text>
          </Box>
        ) : filteredBookings.length === 0 ? (
          <Box alignItems="center" py={8}>
            <Avatar size="xl" backgroundColor={COLORS.GRAY[200]} mb={4}>
              <Icon name="event-busy" size={40} color={COLORS.GRAY[500]} />
            </Avatar>
            <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY} mb={2}>
              No bookings found
            </Text>
            <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} textAlign="center" mb={4}>
              {selectedFilter === 'all'
                ? "You haven't made any bookings yet. Start by finding a library near you."
                : `No ${selectedFilter} bookings found.`}
            </Text>
            {selectedFilter === 'all' && (
              <Button
                backgroundColor={COLORS.PRIMARY}
                _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
                onPress={() => navigation.navigate('Search' as any)}
                leftIcon={<Icon name="search" size={16} color="white" />}>
                Find Libraries
              </Button>
            )}
          </Box>
        ) : (
          <VStack space={3} py={LAYOUT.PADDING.MD}>
            {filteredBookings.map(renderBookingCard)}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
};

export default BookingsScreen;
