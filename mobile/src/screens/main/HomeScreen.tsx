/**
 * StudySpot Mobile App - Home Screen
 * Main dashboard screen with library discovery
 */

import React, {useEffect, useState} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  ScrollView,
  Card,
  Badge,
  Pressable,
  Spinner,
  Alert,
  Avatar,
  Divider,
} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useSelector, useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {COLORS, LAYOUT, APP_CONFIG} from '@constants/index';
import {RootStackParamList, Library} from '@types/index';
import {selectUser} from '@store/slices/authSlice';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [isLoading, setIsLoading] = useState(false);
  const [nearbyLibraries, setNearbyLibraries] = useState<Library[]>([]);

  useEffect(() => {
    // TODO: Load nearby libraries and user data
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API calls to load:
      // - Nearby libraries
      // - Recent bookings
      // - User preferences
      // - Notifications
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchLibraries = () => {
    navigation.navigate('Search' as any);
  };

  const handleLibraryPress = (libraryId: string) => {
    navigation.navigate('LibraryDetails', {libraryId});
  };

  const handleViewAllBookings = () => {
    navigation.navigate('Bookings' as any);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
      <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD}>
        <VStack space={6}>
          {/* Header */}
          <VStack space={2}>
            <Text fontSize="2xl" fontWeight="bold" color={COLORS.TEXT.PRIMARY}>
              {getGreeting()}, {user?.firstName || 'Student'}! 👋
            </Text>
            <Text fontSize="md" color={COLORS.TEXT.SECONDARY}>
              Find your perfect study space today
            </Text>
          </VStack>

          {/* Quick Actions */}
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
              Quick Actions
            </Text>
            <HStack space={3}>
              <Button
                flex={1}
                backgroundColor={COLORS.PRIMARY}
                _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
                onPress={handleSearchLibraries}
                leftIcon={<Icon name="search" size={20} color="white" />}>
                Find Libraries
              </Button>
              <Button
                flex={1}
                variant="outline"
                borderColor={COLORS.PRIMARY}
                _pressed={{backgroundColor: COLORS.BACKGROUND.SECONDARY}}
                onPress={handleViewAllBookings}
                leftIcon={<Icon name="event" size={20} color={COLORS.PRIMARY} />}>
                My Bookings
              </Button>
            </HStack>
          </VStack>

          {/* Recent Bookings */}
          <VStack space={3}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                Recent Bookings
              </Text>
              <Pressable onPress={handleViewAllBookings}>
                <Text color={COLORS.TEXT.LINK} fontSize="sm">
                  View All
                </Text>
              </Pressable>
            </HStack>
            
            <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
              <VStack space={3}>
                <HStack alignItems="center" space={3}>
                  <Avatar size="sm" backgroundColor={COLORS.PRIMARY}>
                    <Icon name="event" size={16} color="white" />
                  </Avatar>
                  <VStack flex={1}>
                    <Text fontSize="md" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                      No recent bookings
                    </Text>
                    <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                      Start by finding a library near you
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor={COLORS.PRIMARY}
                  onPress={handleSearchLibraries}>
                  Find Libraries
                </Button>
              </VStack>
            </Card>
          </VStack>

          {/* Nearby Libraries */}
          <VStack space={3}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                Nearby Libraries
              </Text>
              <Pressable onPress={handleSearchLibraries}>
                <Text color={COLORS.TEXT.LINK} fontSize="sm">
                  View All
                </Text>
              </Pressable>
            </HStack>

            {isLoading ? (
              <Box alignItems="center" py={8}>
                <Spinner size="lg" color={COLORS.PRIMARY} />
                <Text color={COLORS.TEXT.SECONDARY} mt={2}>
                  Loading libraries...
                </Text>
              </Box>
            ) : (
              <VStack space={3}>
                {/* Sample Library Cards */}
                <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
                  <Pressable onPress={() => handleLibraryPress('1')}>
                    <VStack space={3}>
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack flex={1} space={1}>
                          <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                            Central Library
                          </Text>
                          <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                            123 Main Street, Downtown
                          </Text>
                        </VStack>
                        <Badge backgroundColor={COLORS.SUCCESS} borderRadius="full">
                          <Text color="white" fontSize="xs" fontWeight="medium">
                            Open
                          </Text>
                        </Badge>
                      </HStack>
                      
                      <HStack space={4}>
                        <HStack alignItems="center" space={1}>
                          <Icon name="star" size={16} color={COLORS.WARNING} />
                          <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                            4.8 (120 reviews)
                          </Text>
                        </HStack>
                        <HStack alignItems="center" space={1}>
                          <Icon name="people" size={16} color={COLORS.TEXT.SECONDARY} />
                          <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                            45/100 seats
                          </Text>
                        </HStack>
                      </HStack>

                      <HStack space={2} flexWrap="wrap">
                        <Badge variant="outline" size="sm">
                          <Text fontSize="xs">WiFi</Text>
                        </Badge>
                        <Badge variant="outline" size="sm">
                          <Text fontSize="xs">AC</Text>
                        </Badge>
                        <Badge variant="outline" size="sm">
                          <Text fontSize="xs">Quiet Zone</Text>
                        </Badge>
                      </HStack>

                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="md" fontWeight="semibold" color={COLORS.PRIMARY}>
                          ₹50/hour
                        </Text>
                        <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                          0.5 km away
                        </Text>
                      </HStack>
                    </VStack>
                  </Pressable>
                </Card>

                <Card backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
                  <Pressable onPress={() => handleLibraryPress('2')}>
                    <VStack space={3}>
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack flex={1} space={1}>
                          <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                            Study Hub
                          </Text>
                          <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                            456 University Road, Campus
                          </Text>
                        </VStack>
                        <Badge backgroundColor={COLORS.SUCCESS} borderRadius="full">
                          <Text color="white" fontSize="xs" fontWeight="medium">
                            Open
                          </Text>
                        </Badge>
                      </HStack>
                      
                      <HStack space={4}>
                        <HStack alignItems="center" space={1}>
                          <Icon name="star" size={16} color={COLORS.WARNING} />
                          <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                            4.6 (89 reviews)
                          </Text>
                        </HStack>
                        <HStack alignItems="center" space={1}>
                          <Icon name="people" size={16} color={COLORS.TEXT.SECONDARY} />
                          <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                            12/50 seats
                          </Text>
                        </HStack>
                      </HStack>

                      <HStack space={2} flexWrap="wrap">
                        <Badge variant="outline" size="sm">
                          <Text fontSize="xs">WiFi</Text>
                        </Badge>
                        <Badge variant="outline" size="sm">
                          <Text fontSize="xs">Coffee</Text>
                        </Badge>
                        <Badge variant="outline" size="sm">
                          <Text fontSize="xs">Group Study</Text>
                        </Badge>
                      </HStack>

                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="md" fontWeight="semibold" color={COLORS.PRIMARY}>
                          ₹40/hour
                        </Text>
                        <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                          1.2 km away
                        </Text>
                      </HStack>
                    </VStack>
                  </Pressable>
                </Card>
              </VStack>
            )}
          </VStack>

          {/* App Info */}
          <Card backgroundColor={COLORS.BACKGROUND.SECONDARY} p={4}>
            <VStack space={2} alignItems="center">
              <Text fontSize="md" fontWeight="medium" color={COLORS.TEXT.PRIMARY}>
                {APP_CONFIG.NAME} v{APP_CONFIG.VERSION}
              </Text>
              <Text fontSize="sm" color={COLORS.TEXT.SECONDARY} textAlign="center">
                Find, book, and study at the best libraries in your city
              </Text>
            </VStack>
          </Card>
        </VStack>
      </Box>
    </ScrollView>
  );
};

export default HomeScreen;
