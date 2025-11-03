/**
 * StudySpot Mobile App - Search Screen
 * Library search and discovery screen
 */

import React, {useState, useEffect} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  ScrollView,
  Card,
  Badge,
  Pressable,
  Spinner,
  Select,
  CheckIcon,
} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {COLORS, LAYOUT} from '@constants/index';
import {RootStackParamList, Library, LibraryFilters} from '../../types/index';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [filters, setFilters] = useState<LibraryFilters>({
    city: '',
    amenities: [],
    priceRange: {min: 0, max: 1000},
    rating: 0,
    distance: 10,
    isOpen: true,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // TODO: Load initial libraries or search results
    loadLibraries();
  }, []);

  const loadLibraries = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to search libraries
      // For now, using sample data
      const sampleLibraries: Library[] = [
        {
          id: '1',
          name: 'Central Library',
          description: 'A modern library with excellent study facilities',
          address: '123 Main Street, Downtown',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          location: {latitude: 19.0760, longitude: 72.8777},
          capacity: 100,
          amenities: ['wifi', 'ac', 'quiet_zone', 'parking'],
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
        {
          id: '2',
          name: 'Study Hub',
          description: 'Cozy study space with coffee and snacks',
          address: '456 University Road, Campus',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          location: {latitude: 19.0760, longitude: 72.8777},
          capacity: 50,
          amenities: ['wifi', 'coffee', 'group_study', 'printing'],
          pricing: {hourly: 40, daily: 250, monthly: 4000},
          operatingHours: {
            monday: {open: '07:00', close: '22:00', isOpen: true},
            tuesday: {open: '07:00', close: '22:00', isOpen: true},
            wednesday: {open: '07:00', close: '22:00', isOpen: true},
            thursday: {open: '07:00', close: '22:00', isOpen: true},
            friday: {open: '07:00', close: '22:00', isOpen: true},
            saturday: {open: '09:00', close: '21:00', isOpen: true},
            sunday: {open: '09:00', close: '21:00', isOpen: true},
          },
          images: [],
          contactInfo: {
            phone: '+91-9876543211',
            email: 'info@studyhub.com',
          },
          rating: 4.6,
          reviewCount: 89,
          distance: 1.2,
          seatStats: {total: 50, available: 12},
          isOpen: true,
          currentOccupancy: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setLibraries(sampleLibraries);
    } catch (error) {
      console.error('Failed to load libraries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    loadLibraries();
  };

  const handleLibraryPress = (libraryId: string) => {
    navigation.navigate('LibraryDetails', {libraryId});
  };

  const handleFilterChange = (key: keyof LibraryFilters, value: any) => {
    setFilters(prev => ({...prev, [key]: value}));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      amenities: [],
      priceRange: {min: 0, max: 1000},
      rating: 0,
      distance: 10,
      isOpen: true,
    });
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

  return (
    <Box flex={1} backgroundColor={COLORS.BACKGROUND.PRIMARY}>
      {/* Search Header */}
      <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD} backgroundColor={COLORS.WHITE}>
        <VStack space={3}>
          <HStack space={3} alignItems="center">
            <Input
              flex={1}
              placeholder="Search libraries, locations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftElement={<Icon name="search" size={20} color={COLORS.GRAY[500]} style={{marginLeft: 12}} />}
              rightElement={
                searchQuery ? (
                  <Pressable onPress={() => setSearchQuery('')} style={{marginRight: 12}}>
                    <Icon name="clear" size={20} color={COLORS.GRAY[500]} />
                  </Pressable>
                ) : undefined
              }
            />
            <Button
              backgroundColor={COLORS.PRIMARY}
              _pressed={{backgroundColor: COLORS.PRIMARY_DARK}}
              onPress={handleSearch}
              px={4}>
              <Icon name="search" size={20} color="white" />
            </Button>
          </HStack>

          <HStack space={3} alignItems="center">
            <Button
              variant="outline"
              borderColor={COLORS.BORDER.PRIMARY}
              _pressed={{backgroundColor: COLORS.BACKGROUND.SECONDARY}}
              onPress={() => setShowFilters(!showFilters)}
              leftIcon={<Icon name="tune" size={16} color={COLORS.PRIMARY} />}
              flex={1}>
              Filters
            </Button>
            <Button
              variant="outline"
              borderColor={COLORS.BORDER.PRIMARY}
              _pressed={{backgroundColor: COLORS.BACKGROUND.SECONDARY}}
              onPress={() => {/* TODO: Implement map view */}}
              leftIcon={<Icon name="map" size={16} color={COLORS.PRIMARY} />}
              flex={1}>
              Map
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Box px={LAYOUT.PADDING.LG} py={LAYOUT.PADDING.MD} backgroundColor={COLORS.BACKGROUND.SECONDARY}>
          <VStack space={3}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="md" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                Filters
              </Text>
              <Pressable onPress={clearFilters}>
                <Text color={COLORS.TEXT.LINK} fontSize="sm">
                  Clear All
                </Text>
              </Pressable>
            </HStack>

            <HStack space={3}>
              <Select
                flex={1}
                placeholder="City"
                selectedValue={filters.city}
                onValueChange={(value) => handleFilterChange('city', value)}
                _selectedItem={{
                  bg: COLORS.PRIMARY,
                  endIcon: <CheckIcon size="5" />,
                }}>
                <Select.Item label="Mumbai" value="mumbai" />
                <Select.Item label="Delhi" value="delhi" />
                <Select.Item label="Bangalore" value="bangalore" />
                <Select.Item label="Chennai" value="chennai" />
              </Select>

              <Select
                flex={1}
                placeholder="Rating"
                selectedValue={filters.rating?.toString() || '0'}
                onValueChange={(value) => handleFilterChange('rating', parseFloat(value))}
                _selectedItem={{
                  bg: COLORS.PRIMARY,
                  endIcon: <CheckIcon size="5" />,
                }}>
                <Select.Item label="Any Rating" value="0" />
                <Select.Item label="4+ Stars" value="4" />
                <Select.Item label="4.5+ Stars" value="4.5" />
                <Select.Item label="5 Stars" value="5" />
              </Select>
            </HStack>

            <HStack space={2} flexWrap="wrap">
              {['wifi', 'ac', 'coffee', 'parking', 'quiet_zone'].map((amenity) => (
                <Pressable
                  key={amenity}
                  onPress={() => {
                    const newAmenities = filters.amenities?.includes(amenity)
                      ? filters.amenities.filter(a => a !== amenity)
                      : [...(filters.amenities || []), amenity];
                    handleFilterChange('amenities', newAmenities);
                  }}>
                  <Badge
                    variant={filters.amenities?.includes(amenity) ? 'solid' : 'outline'}
                    backgroundColor={filters.amenities?.includes(amenity) ? COLORS.PRIMARY : 'transparent'}
                    borderColor={COLORS.PRIMARY}
                    borderRadius="full"
                    px={3}
                    py={1}>
                    <Text
                      color={filters.amenities?.includes(amenity) ? 'white' : COLORS.PRIMARY}
                      fontSize="xs"
                      textTransform="capitalize">
                      {amenity.replace('_', ' ')}
                    </Text>
                  </Badge>
                </Pressable>
              ))}
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Results */}
      <ScrollView flex={1} px={LAYOUT.PADDING.LG}>
        <VStack space={4} py={LAYOUT.PADDING.MD}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
              {libraries.length} Libraries Found
            </Text>
            <Select
              placeholder="Sort by"
              selectedValue="distance"
              onValueChange={(value) => {/* TODO: Implement sorting */}}
              _selectedItem={{
                bg: COLORS.PRIMARY,
                endIcon: <CheckIcon size="5" />,
              }}
              minWidth="120">
              <Select.Item label="Distance" value="distance" />
              <Select.Item label="Rating" value="rating" />
              <Select.Item label="Price" value="price" />
              <Select.Item label="Availability" value="availability" />
            </Select>
          </HStack>

          {isLoading ? (
            <Box alignItems="center" py={8}>
              <Spinner size="lg" color={COLORS.PRIMARY} />
              <Text color={COLORS.TEXT.SECONDARY} mt={2}>
                Searching libraries...
              </Text>
            </Box>
          ) : (
            <VStack space={3}>
              {libraries.map((library) => (
                <Card key={library.id} backgroundColor={COLORS.BACKGROUND.CARD} p={4}>
                  <Pressable onPress={() => handleLibraryPress(library.id)}>
                    <VStack space={3}>
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack flex={1} space={1}>
                          <Text fontSize="lg" fontWeight="semibold" color={COLORS.TEXT.PRIMARY}>
                            {library.name}
                          </Text>
                          <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                            {library.address}
                          </Text>
                        </VStack>
                        <Badge
                          backgroundColor={library.isOpen ? COLORS.SUCCESS : COLORS.ERROR}
                          borderRadius="full">
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
                      </HStack>

                      <HStack space={2} flexWrap="wrap">
                        {library.amenities.slice(0, 4).map((amenity) => (
                          <Badge key={amenity} variant="outline" size="sm">
                            <HStack alignItems="center" space={1}>
                              <Icon name={getAmenityIcon(amenity)} size={12} color={COLORS.PRIMARY} />
                              <Text fontSize="xs" textTransform="capitalize">
                                {amenity.replace('_', ' ')}
                              </Text>
                            </HStack>
                          </Badge>
                        ))}
                        {library.amenities.length > 4 && (
                          <Badge variant="outline" size="sm">
                            <Text fontSize="xs">+{library.amenities.length - 4} more</Text>
                          </Badge>
                        )}
                      </HStack>

                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="md" fontWeight="semibold" color={COLORS.PRIMARY}>
                          ₹{library.pricing.hourly}/hour
                        </Text>
                        <Text fontSize="sm" color={COLORS.TEXT.SECONDARY}>
                          {library.distance} km away
                        </Text>
                      </HStack>
                    </VStack>
                  </Pressable>
                </Card>
              ))}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default SearchScreen;
