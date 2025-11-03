/**
 * RecommendationsWidget
 * Horizontal carousel of personalized library recommendations
 */

import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {RootState, AppDispatch} from '@store/index';
import {fetchPersonalizedRecommendations} from '@store/slices/recommendationsSlice';
import {COLORS, LAYOUT, TYPOGRAPHY} from '@constants/index';
import {RecommendedLibrary} from '@services/RecommendationsService';

const RecommendationsWidget: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const {personalized, loading, error} = useSelector(
    (state: RootState) => state.recommendations,
  );

  const loadRecommendations = () => {
    dispatch(fetchPersonalizedRecommendations({limit: 5}));
  };

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleLibraryPress = (libraryId: string) => {
    navigation.navigate('LibraryDetails' as never, {libraryId} as never);
  };

  const handleViewAll = () => {
    navigation.navigate('Recommendations' as never);
  };

  const renderRecommendationCard = (library: RecommendedLibrary) => {
    const matchPercentage = Math.round(library.recommendationScore * 100);

    return (
      <TouchableOpacity
        key={library.id}
        style={styles.card}
        onPress={() => handleLibraryPress(library.id)}
        activeOpacity={0.7}>
        {/* Image */}
        <Image
          source={{uri: library.imageUrl || 'https://via.placeholder.com/300x180'}}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Match Badge */}
        <View style={styles.matchBadge}>
          <Icon name="star" size={14} color={COLORS.WHITE} />
          <Text style={styles.matchText}>{matchPercentage}%</Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {library.name}
          </Text>

          <View style={styles.cardRow}>
            <Icon name="location-on" size={14} color={COLORS.TEXT.SECONDARY} />
            <Text style={styles.cardLocation} numberOfLines={1}>
              {library.city}
            </Text>
          </View>

          <View style={styles.cardRow}>
            <Icon name="star" size={14} color={COLORS.WARNING} />
            <Text style={styles.cardRating}>
              {library.rating.toFixed(1)} ({library.totalReviews})
            </Text>
          </View>

          {/* Primary match reason */}
          {library.matchReasons.length > 0 && (
            <View style={styles.reasonChip}>
              <Text style={styles.reasonText} numberOfLines={1}>
                {library.matchReasons[0]}
              </Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.cardFooter}>
            <Text style={styles.priceText}>₹{library.pricing.hourly}/hr</Text>
            <View
              style={[
                styles.availabilityDot,
                {
                  backgroundColor:
                    library.availableSeats > 20
                      ? COLORS.SUCCESS
                      : library.availableSeats > 10
                      ? COLORS.WARNING
                      : COLORS.ERROR,
                },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading.personalized && personalized.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (error.personalized || personalized.length === 0) {
    return null; // Don't show widget if there are no recommendations
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="auto-awesome" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.headerTitle}>Recommended for You</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Icon name="arrow-forward" size={16} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + LAYOUT.MARGIN.MD}>
        {personalized.slice(0, 5).map(library => renderRecommendationCard(library))}
      </ScrollView>
    </View>
  );
};

const CARD_WIDTH = 280;

const styles = StyleSheet.create({
  container: {
    marginVertical: LAYOUT.MARGIN.LG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.PADDING.LG,
    marginBottom: LAYOUT.MARGIN.MD,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM as any,
    marginRight: 4,
  },
  scrollContent: {
    paddingLeft: LAYOUT.PADDING.LG,
    paddingRight: LAYOUT.PADDING.MD,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.WHITE,
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
    marginRight: LAYOUT.MARGIN.MD,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.SHADOW.MEDIUM,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.GRAY[200],
  },
  matchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  matchText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    marginLeft: 3,
  },
  cardContent: {
    padding: LAYOUT.PADDING.MD,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginLeft: 4,
    flex: 1,
  },
  cardRating: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginLeft: 4,
  },
  reasonChip: {
    backgroundColor: COLORS.PRIMARY_LIGHT + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  reasonText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM as any,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER.SECONDARY,
  },
  priceText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.PRIMARY,
  },
  availabilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingContainer: {
    padding: LAYOUT.PADDING.XL,
    alignItems: 'center',
  },
});

export default RecommendationsWidget;


