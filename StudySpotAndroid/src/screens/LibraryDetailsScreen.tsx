/**
 * StudySpot Mobile App - Library Details Screen
 * Detailed view of a library with booking functionality
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
  Pressable,
} from 'native-base';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAppDispatch, useAppSelector} from '../hooks/redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

import {COLORS, LAYOUT} from '@constants/index';
import {RootStackParamList, Library, Seat} from '../types/index';
import {selectTokens} from '@store/slices/authSlice';
import {getAvailability, selectAvailability, selectBookingsLoading, selectBookingsError} from '@store/slices/bookingsSlice';

type LibraryDetailsScreenRouteProp = RouteProp<RootStackParamList, 'LibraryDetails'>;
type LibraryDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LibraryDetails'>;

const LibraryDetailsScreen: React.FC = () => {
  const route = useRoute<LibraryDetailsScreenRouteProp>();
  const navigation = useNavigation<LibraryDetailsScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const tokens = useAppSelector(selectTokens);const {libraryId} = route.params;
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Sample library data - in real app, this would come from API
  const [library, setLibrary] = useState<Library>({
    id: libraryId,
    name: 'Central Library',
    description: 'A modern library with excellent study facilities, high-speed WiFi, and comfortable seating arrangements. Perfect for students and professionals looking for a quiet study environment.',
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
  });

  useEffect(() => {
    if (tokens?.accessToken) {
      loadAvailability();
    }
  }, [libraryId, selectedDate, tokens]);

  const loadAvailability = () => {
    if (tokens?.accessToken) {
      dispatch(getAvailability({
        libraryId,
        date: selectedDate,
        accessToken: tokens.accessToken,
      }));
    }
  };

  const handleBookNow = () => {
    if (selectedSeat && selectedTimeSlot) {
      // TODO: Navigate to booking confirmation screen
      navigation.navigate('BookingConfirmation', {
        bookingId: 'temp-booking-id',
      });
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return 'wifi';
      case 'ac': return 'ac-unit';
      case 'coffee': return 'local-cafe';
      case 'parking': return 'local-parking';
      case 'printing': return 'print';
      case 'quiet_zone': return 'volume-off';
      case 'group_study': return 'group';
      default: return 'check';
    }
  };

  const getOperatingHours = () => {
    const today = moment().format('dddd').toLowerCase();
    const hours = library.operatingHours[today as keyof typeof library.operatingHours];
    return hours ? `${hours.open} - ${hours.close}` : 'Closed';
  };

  const timeSlots = [
    {start: '09:00', end: '12:00', available: 15},
    {start: '12:00', end: '15:00', available: 8},
    {start: '15:00', end: '18:00', available: 12},
    {start: '18:00', end: '21:00', available: 20},
  ];

  const availableSeats = [
    {id: '1', seatNumber: 'A1', zone: 'quiet', seatType: 'desk', amenities: ['wifi', 'power'], location: {floor: 1, section: 'A', coordinates: {x: 1, y: 1}}, isAvailable: true},
    {id: '2', seatNumber: 'A2', zone: 'quiet', seatType: 'desk', amenities: ['wifi', 'power'], location: {floor: 1, section: 'A', coordinates: {x: 1, y: 2}}, isAvailable: true},
    {id: '3', seatNumber: 'B1', zone: 'group', seatType: 'desk', amenities: ['wifi', 'power'], location: {floor: 1, section: 'B', coordinates: {x: 2, y: 1}}, isAvailable: false},
    {id: '4', seatNumber: 'B2', zone: 'group', seatType: 'desk', amenities: ['wifi', 'power'], location: {floor: 1, section: 'B', coordinates: {x: 2, y: 2}}, isAvailable: true},
  ];

  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
      <ScrollView>
        {/* Library Header */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD} backgroundColor={COLORS.WHITE}>
          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack flex={1} space={2}>
                <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                  {library.name}
                </Text>
                <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                  {library.address}
                </Text>
              </VStack>
              <Badge backgroundColor={library.isOpen ? COLORS.SUCCESS : COLORS.ERROR} borderRadius="full">
                <Text color="white" fontSize="xs" fontWeight="medium">
                  {library.isOpen ? 'Open' : 'Closed'}
                </Text>
              </Badge>
            </HStack>

            <HStack space={4}>
              <HStack alignItems="center" space={1}>
                <Icon name="star" size={16} color={COLORS.WARNING} />
                <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                  {library.rating} ({library.reviewCount} reviews)
                </Text>
              </HStack>
              <HStack alignItems="center" space={1}>
                <Icon name="people" size={16} color={COLORS.TEXT.SECONDARY} />
                <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                  {library.seatStats?.available}/{library.seatStats?.total} seats
                </Text>
              </HStack>
              <HStack alignItems="center" space={1}>
                <Icon name="location-on" size={16} color={COLORS.TEXT.SECONDARY} />
                <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                  {library.distance} km
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        {/* Library Details */}
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
          <VStack space={4}>
            {/* Description */}
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                  About
                </Text>
                <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} lineHeight={20}>
                  {library.description}
                </Text>
              </VStack>
            </Card>

            {/* Amenities */}
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                  Amenities
                </Text>
                <HStack space={2} flexWrap="wrap">
                  {library.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" size="sm">
                      <HStack alignItems="center" space={1}>
                        <Icon name={getAmenityIcon(amenity)} size={12} color={COLORS.PRIMARY} />
                        <Text fontSize="xs" textTransform="capitalize">
                          {amenity.replace('_', ' ')}
                        </Text>
                      </HStack>
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            </Card>

            {/* Operating Hours */}
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                  Operating Hours
                </Text>
                <HStack alignItems="center" space={2}>
                  <Icon name="schedule" size={16} color={COLORS.TEXT.SECONDARY} />
                  <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                    Today: {getOperatingHours()}
                  </Text>
                </HStack>
              </VStack>
            </Card>

            {/* Pricing */}
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                  Pricing
                </Text>
                <HStack justifyContent="space-between">
                  <VStack space={1}>
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Hourly</Text>
                    <Text fontSize="md" fontWeight="semibold" color={COLORS.PRIMARY}>
                      ₹{library.pricing.hourly}
                    </Text>
                  </VStack>
                  <VStack space={1}>
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Daily</Text>
                    <Text fontSize="md" fontWeight="semibold" color={COLORS.PRIMARY}>
                      ₹{library.pricing.daily}
                    </Text>
                  </VStack>
                  <VStack space={1}>
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>Monthly</Text>
                    <Text fontSize="md" fontWeight="semibold" color={COLORS.PRIMARY}>
                      ₹{library.pricing.monthly}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Card>

            {/* Booking Section */}
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={4}>
                <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                  Book a Seat
                </Text>

                {/* Date Selection */}
                <VStack space={2}>
                  <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                    Select Date
                  </Text>
                  <HStack space={2}>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                      const date = moment().add(day, 'days');
                      const isSelected = selectedDate === date.format('YYYY-MM-DD');
                      return (
                        <Pressable
                          key={day}
                          onPress={() => setSelectedDate(date.format('YYYY-MM-DD'))}>
                          <Box
                            backgroundColor={isSelected ? COLORS.PRIMARY : COLORS.BACKGROUND.SECONDARY}
                            borderRadius="md"
                            p={3}
                            alignItems="center"
                            minWidth={60}>
                            <Text
                              fontSize="xs"
                              color={isSelected ? 'white' : COLORS.TEXT.SECONDARY}
                              fontWeight="medium">
                              {date.format('ddd')}
                            </Text>
                            <Text
                              fontSize="sm"
                              color={isSelected ? 'white' : COLORS.TEXT.PRIMARY}
                              fontWeight="semibold">
                              {date.format('DD')}
                            </Text>
                          </Box>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </VStack>

                {/* Time Slots */}
                <VStack space={2}>
                  <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                    Available Time Slots
                  </Text>
                  <HStack space={2} flexWrap="wrap">
                    {timeSlots.map((slot, index) => (
                      <Pressable
                        key={index}
                        onPress={() => setSelectedTimeSlot(`${slot.start}-${slot.end}`)}>
                        <Box
                          backgroundColor={selectedTimeSlot === `${slot.start}-${slot.end}` ? COLORS.PRIMARY : COLORS.BACKGROUND.SECONDARY}
                          borderRadius="md"
                          p={3}
                          alignItems="center"
                          minWidth={80}>
                          <Text
                            fontSize="xs"
                            color={selectedTimeSlot === `${slot.start}-${slot.end}` ? 'white' : COLORS.TEXT.SECONDARY}
                            fontWeight="medium">
                            {moment(slot.start, 'HH:mm').format('h:mm A')} - {moment(slot.end, 'HH:mm').format('h:mm A')}
                          </Text>
                          <Text
                            fontSize="xs"
                            color={selectedTimeSlot === `${slot.start}-${slot.end}` ? 'white' : COLORS.TEXT.SECONDARY}>
                            {slot.available} seats
                          </Text>
                        </Box>
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                {/* Seat Selection */}
                <VStack space={2}>
                  <Text fontSize="sm" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                    Available Seats
                  </Text>
                  <HStack space={2} flexWrap="wrap">
                    {availableSeats.map((seat) => (
                      <Pressable
                        key={seat.id}
                        onPress={() => seat.isAvailable && setSelectedSeat(seat as Seat)}>
                        <Box
                          backgroundColor={
                            !seat.isAvailable
                              ? COLORS.GRAY[300]
                              : selectedSeat?.id === seat.id
                              ? COLORS.PRIMARY
                              : COLORS.BACKGROUND.SECONDARY
                          }
                          borderRadius="md"
                          p={3}
                          alignItems="center"
                          minWidth={60}
                          opacity={!seat.isAvailable ? 0.5 : 1}>
                          <Text
                            fontSize="sm"
                            color={
                              !seat.isAvailable
                                ? COLORS.GRAY[500]
                                : selectedSeat?.id === seat.id
                                ? 'white'
                                : COLORS.TEXT.PRIMARY
                            }
                            fontWeight="semibold">
                            {seat.seatNumber}
                          </Text>
                          <Text
                            fontSize="xs"
                            color={
                              !seat.isAvailable
                                ? COLORS.GRAY[500]
                                : selectedSeat?.id === seat.id
                                ? 'white'
                                : COLORS.TEXT.SECONDARY
                            }>
                            {seat.zone}
                          </Text>
                        </Box>
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                {/* Book Button */}
                <Button
                  backgroundColor={COLORS.PRIMARY}
                  _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
                  onPress={handleBookNow}
                  isDisabled={!selectedSeat || !selectedTimeSlot}
                  leftIcon={<Icon name="event" size={16} color="white" />}>
                  Book Now - ₹{library.pricing.hourly}/hour
                </Button>
              </VStack>
            </Card>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default LibraryDetailsScreen;
