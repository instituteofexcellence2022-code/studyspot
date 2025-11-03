/**
 * RecommendationsScreen
 * Displays AI-powered personalized library recommendations
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {RootState, AppDispatch} from '@store/index';
import {
  fetchPersonalizedRecommendations,
  fetchTrendingLibraries,
} from '@store/slices/recommendationsSlice';
import {COLORS, LAYOUT, TYPOGRAPHY} from '@constants/index';
import {RecommendedLibrary, TrendingLibrary} from '@services/RecommendationsService';

const RecommendationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [selectedTab, setSelectedTab] = useState<'personalized' | 'trending'>('personalized');
  const [refreshing, setRefreshing] = useState(false);

  const {personalized, trending, loading, error} = useSelector(
    (state: RootState) => state.recommendations,
  );

  useEffect(() => {
    loadRecommendations();
  });

  const loadRecommendations = async () => {
    dispatch(fetchPersonalizedRecommendations({limit: 10}));
    dispatch(fetchTrendingLibraries(5));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleLibraryPress = (libraryId: string) => {
    navigation.navigate('LibraryDetails' as never, {libraryId} as never);
  };

  const renderRecommendationCard = (library: RecommendedLibrary | TrendingLibrary) => {
    const score = 'recommendationScore' in library
      ? library.recommendationScore
      : 'trendingScore' in library
      ? (library as any).trendingScore / 10 // Normalize trending score
      : 0;

    return (
      <TouchableOpacity
        key={library.id}
        style={styles.card}
        onPress={() => handleLibraryPress(library.id)}
        activeOpacity={0.7}>
        {/* Image */}
        <Image
          source={{uri: library.imageUrl || 'https://via.placeholder.com/400x200'}}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Score Badge */}
        <View style={styles.scoreBadge}>
          <Icon name="star" size={16} color={COLORS.WHITE} />
          <Text style={styles.scoreText}>
            {Math.round(score * 100)}% Match
          </Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={1}>
            {library.name}
          </Text>

          {/* Location */}
          <View style={styles.row}>
            <Icon name="location-on" size={16} color={COLORS.TEXT.SECONDARY} />
            <Text style={styles.locationText} numberOfLines={1}>
              {library.city}, {library.state}
            </Text>
          </View>

          {/* Rating */}
          <View style={styles.row}>
            <Icon name="star" size={16} color={COLORS.WARNING} />
            <Text style={styles.ratingText}>
              {library.rating.toFixed(1)} ({library.totalReviews} reviews)
            </Text>
          </View>

          {/* Explanation */}
          {'explanation' in library && library.explanation && (
            <Text style={styles.explanation} numberOfLines={2}>
              {library.explanation}
            </Text>
          )}

          {/* Match Reasons */}
          {'matchReasons' in library && library.matchReasons.length > 0 && (
            <View style={styles.matchReasonsContainer}>
              {library.matchReasons.slice(0, 3).map((reason, index) => (
                <View key={index} style={styles.reasonChip}>
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Pricing & Availability */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.priceLabel}>From</Text>
              <Text style={styles.priceText}>₹{library.pricing.hourly}/hr</Text>
            </View>
            <View style={styles.availabilityContainer}>
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
              <Text style={styles.availabilityText}>
                {library.availableSeats} seats available
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="lightbulb-outline" size={80} color={COLORS.GRAY[300]} />
      <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
      <Text style={styles.emptyText}>
        Make some bookings to help us understand your preferences better!
      </Text>
    </View>
  );

  const renderError = (errorMessage: string) => (
    <View style={styles.errorContainer}>
      <Icon name="error-outline" size={64} color={COLORS.ERROR} />
      <Text style={styles.errorText}>{errorMessage}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const isLoading = loading.personalized || loading.trending;
  const currentData = selectedTab === 'personalized' ? personalized : trending;
  const currentError = selectedTab === 'personalized' ? error.personalized : error.trending;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recommendations</Text>
        <Text style={styles.headerSubtitle}>
          Personalized suggestions just for you
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'personalized' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('personalized')}>
          <Icon
            name="person"
            size={20}
            color={
              selectedTab === 'personalized'
                ? COLORS.PRIMARY
                : COLORS.TEXT.SECONDARY
            }
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'personalized' && styles.tabTextActive,
            ]}>
            For You
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'trending' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('trending')}>
          <Icon
            name="trending-up"
            size={20}
            color={
              selectedTab === 'trending'
                ? COLORS.PRIMARY
                : COLORS.TEXT.SECONDARY
            }
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'trending' && styles.tabTextActive,
            ]}>
            Trending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
          />
        }
        showsVerticalScrollIndicator={false}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Finding best matches...</Text>
          </View>
        ) : currentError ? (
          renderError(currentError)
        ) : currentData.length === 0 ? (
          renderEmptyState()
        ) : (
          currentData.map(library => renderRecommendationCard(library))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.PRIMARY,
  },
  header: {
    paddingHorizontal: LAYOUT.PADDING.LG,
    paddingTop: LAYOUT.PADDING.LG,
    paddingBottom: LAYOUT.PADDING.MD,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER.PRIMARY,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: LAYOUT.PADDING.MD,
    paddingVertical: LAYOUT.PADDING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER.PRIMARY,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.PADDING.SM,
    paddingHorizontal: LAYOUT.PADDING.MD,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: COLORS.PRIMARY_LIGHT + '20',
  },
  tabText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    color: COLORS.TEXT.SECONDARY,
    marginLeft: 8,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM as any,
  },
  tabTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.PADDING.MD,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
    marginBottom: LAYOUT.MARGIN.MD,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.SHADOW.DARK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.GRAY[200],
  },
  scoreBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    marginLeft: 4,
  },
  cardContent: {
    padding: LAYOUT.PADDING.MD,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginLeft: 4,
    flex: 1,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginLeft: 4,
  },
  explanation: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  },
  matchReasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 8,
  },
  reasonChip: {
    backgroundColor: COLORS.PRIMARY_LIGHT + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  reasonText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM as any,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER.SECONDARY,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT.SECONDARY,
  },
  priceText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.PRIMARY,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: LAYOUT.MARGIN.MD,
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    color: COLORS.TEXT.SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: LAYOUT.PADDING.XL,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginTop: LAYOUT.MARGIN.MD,
    marginBottom: LAYOUT.MARGIN.SM,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    color: COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: LAYOUT.PADDING.XL,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    color: COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    marginTop: LAYOUT.MARGIN.MD,
    marginBottom: LAYOUT.MARGIN.LG,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: LAYOUT.PADDING.XL,
    paddingVertical: LAYOUT.PADDING.MD,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
  },
});

export default RecommendationsScreen;


