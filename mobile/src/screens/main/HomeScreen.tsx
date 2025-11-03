/**
 * StudySpot Mobile App - Enhanced Home Screen with React Query
 * Professional home screen with data fetching and animations
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Box, Text, VStack, HStack, Button, Card, CardBody } from 'native-base';
import { useQuery } from '@tanstack/react-query';
import { performanceMonitoring } from '../../services/PerformanceMonitoringService';
import { deepLinkingService } from '../../services/DeepLinkingService';
import { 
  LoadingAnimation, 
  EmptyStateAnimation, 
  WelcomeAnimation 
} from '../../components/common/LottieAnimations';
import { COLORS } from '../../constants';

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Track screen load
  useEffect(() => {
    const screenLoadTracker = performanceMonitoring.trackScreenLoad('HomeScreen');
    
    // Simulate welcome animation
    setTimeout(() => setShowWelcome(false), 3000);
    
    return () => {
      screenLoadTracker.end();
    };
  }, []);

  // Fetch libraries data with React Query
  const { 
    data: libraries, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['libraries'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return [
        { id: '1', name: 'Central Library', location: 'Downtown', rating: 4.5 },
        { id: '2', name: 'Tech Library', location: 'Tech Park', rating: 4.8 },
        { id: '3', name: 'Study Hub', location: 'University Area', rating: 4.2 },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user bookings
  const { data: bookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        { id: '1', library: 'Central Library', date: '2024-01-15', time: '10:00 AM' },
        { id: '2', library: 'Tech Library', date: '2024-01-16', time: '2:00 PM' },
      ];
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    performanceMonitoring.trackUserInteraction('HomeScreen', 'pull_to_refresh', true);
    
    await refetch();
    setRefreshing(false);
  };

  const handleLibraryPress = (libraryId: string) => {
    performanceMonitoring.trackUserInteraction('HomeScreen', 'library_card_click', true);
    
    // Generate deep link for library details
    const deepLink = deepLinkingService.generateDeepLink('LibraryDetails', { id: libraryId });
    console.log('Deep link generated:', deepLink);
    
    // Navigate to library details (this would be handled by navigation)
    // navigation.navigate('LibraryDetails', { id: libraryId });
  };

  const handleBookingPress = (bookingId: string) => {
    performanceMonitoring.trackUserInteraction('HomeScreen', 'booking_card_click', true);
    
    // Generate deep link for booking details
    const deepLink = deepLinkingService.generateDeepLink('BookingConfirmation', { id: bookingId });
    console.log('Booking deep link:', deepLink);
  };

  const handleShareLibrary = async (libraryId: string) => {
    performanceMonitoring.trackUserInteraction('HomeScreen', 'share_library', true);
    
    try {
      await deepLinkingService.shareDeepLink('LibraryDetails', { id: libraryId });
    } catch (error) {
      console.error('Failed to share library:', error);
    }
  };

  if (showWelcome) {
    return (
      <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} justifyContent="center" alignItems="center">
        <WelcomeAnimation onFinish={() => setShowWelcome(false)} />
        <Text fontSize="xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY} mt={4}>
          Welcome to StudySpot!
        </Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} justifyContent="center" alignItems="center">
        <LoadingAnimation size={150} />
        <Text fontSize="lg" color={COLORS.TEXT.PRIMARY} mt={4}>
          Loading libraries...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY} justifyContent="center" alignItems="center">
        <EmptyStateAnimation type="no-data" size={200} />
        <Text fontSize="lg" color={COLORS.TEXT.PRIMARY} mt={4}>
          Failed to load libraries
        </Text>
        <Button onPress={() => refetch()} mt={4}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        <VStack space={6}>
          {/* Header */}
          <VStack space={2}>
            <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
              Find Your Perfect Study Space
            </Text>
            <Text fontSize="md" color={COLORS.TEXT.SECONDARY}>
              Discover libraries near you and book your spot
            </Text>
          </VStack>

          {/* Quick Stats */}
          <HStack space={4}>
            <Card flex={1}>
              <CardBody>
                <VStack space={2} alignItems="center">
                  <Text fontSize="2xl" fontWeight="bold" color={COLORS.PRIMARY}>
                    {libraries?.length || 0}
                  </Text>
                  <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                    Libraries Available
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            
            <Card flex={1}>
              <CardBody>
                <VStack space={2} alignItems="center">
                  <Text fontSize="2xl" fontWeight="bold" color={COLORS.PRIMARY}>
                    {bookings?.length || 0}
                  </Text>
                  <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                    Your Bookings
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </HStack>

          {/* Libraries Section */}
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
              Nearby Libraries
            </Text>
            
            {libraries?.map((library) => (
              <Card key={library.id} onPress={() => handleLibraryPress(library.id)}>
                <CardBody>
                  <VStack space={3}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <VStack space={1} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                          {library.name}
                        </Text>
                        <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                          {library.location}
                        </Text>
                      </VStack>
                      
                      <VStack space={1} alignItems="flex-end">
                        <Text fontSize="sm" fontWeight="bold" color={COLORS.PRIMARY}>
                          ⭐ {library.rating}
                        </Text>
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => handleShareLibrary(library.id)}
                        >
                          Share
                        </Button>
                      </VStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>

          {/* Recent Bookings */}
          {bookings && bookings.length > 0 && (
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                Recent Bookings
              </Text>
              
              {bookings.map((booking) => (
                <Card key={booking.id} onPress={() => handleBookingPress(booking.id)}>
                  <CardBody>
                    <HStack justifyContent="space-between" alignItems="center">
                      <VStack space={1} flex={1}>
                        <Text fontSize="md" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
                          {booking.library}
                        </Text>
                        <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                          {booking.date} at {booking.time}
                        </Text>
                      </VStack>
                      
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}

          {/* Empty State for No Libraries */}
          {(!libraries || libraries.length === 0) && (
            <Box alignItems="center" py={8}>
              <EmptyStateAnimation type="no-results" size={150} />
              <Text fontSize="lg" color={COLORS.TEXT.PRIMARY} mt={4}>
                No libraries found
              </Text>
              <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} textAlign="center" mt={2}>
                Try adjusting your search or check back later
              </Text>
            </Box>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default HomeScreen;