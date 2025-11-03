/**
 * LibraryAnalyticsWidget
 * Displays predictive analytics for a library
 */

import React, {useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {RootState, AppDispatch} from '@store/index';
import {
  predictOccupancy,
  fetchPeakHours,
  fetchPricingSuggestion,
} from '@store/slices/analyticsSlice';
import {COLORS, LAYOUT, TYPOGRAPHY} from '@constants/index';

interface LibraryAnalyticsWidgetProps {
  libraryId: string;
  datetime?: string;
}

const LibraryAnalyticsWidget: React.FC<LibraryAnalyticsWidgetProps> = ({
  libraryId,
  datetime,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const {occupancy, peakHours, pricing, loading} = useSelector(
    (state: RootState) => state.analytics,
  );

  const currentOccupancy = occupancy[libraryId];
  const currentPeakHours = peakHours[libraryId];
  const currentPricing = pricing[libraryId];

  const loadAnalytics = useCallback(() => {
    dispatch(predictOccupancy({libraryId, datetime}));
    dispatch(fetchPeakHours({libraryId}));
    dispatch(fetchPricingSuggestion({libraryId, datetime}));
  }, [dispatch, libraryId, datetime]);

  useEffect(() => {
    loadAnalytics();
  }, [libraryId, loadAnalytics]);

  if (loading.occupancy && !currentOccupancy) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="insights" size={20} color={COLORS.PRIMARY} />
        <Text style={styles.headerTitle}>AI Insights</Text>
        <Icon name="auto-awesome" size={16} color={COLORS.WARNING} />
      </View>

      {/* Occupancy Prediction */}
      {currentOccupancy && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="people" size={20} color={COLORS.INFO} />
            <Text style={styles.cardTitle}>Expected Occupancy</Text>
          </View>

          <View style={styles.occupancyContent}>
            <View style={styles.occupancyMain}>
              <Text style={styles.occupancyPercentage}>
                {currentOccupancy.occupancyRate}%
              </Text>
              <Text style={styles.occupancyLabel}>
                {currentOccupancy.predictedAvailable} seats available
              </Text>
            </View>

            {/* Occupancy Bar */}
            <View style={styles.occupancyBar}>
              <View
                style={[
                  styles.occupancyBarFill,
                  {
                    width: `${currentOccupancy.occupancyRate}%`,
                    backgroundColor:
                      currentOccupancy.occupancyRate > 80
                        ? COLORS.ERROR
                        : currentOccupancy.occupancyRate > 60
                        ? COLORS.WARNING
                        : COLORS.SUCCESS,
                  },
                ]}
              />
            </View>

            <Text style={styles.recommendation}>
              💡 {currentOccupancy.recommendation}
            </Text>
          </View>
        </View>
      )}

      {/* Best Time to Visit */}
      {currentPeakHours && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="schedule" size={20} color={COLORS.SUCCESS} />
            <Text style={styles.cardTitle}>Best Time to Visit</Text>
          </View>

          <View style={styles.timeContent}>
            <View style={styles.timeSlot}>
              <View style={styles.timeIconContainer}>
                <Icon name="wb-sunny" size={24} color={COLORS.SUCCESS} />
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Best Time</Text>
                <Text style={styles.timeValue}>
                  {currentPeakHours.bestTimeToVisit.time}
                </Text>
                <Text style={styles.timeOccupancy}>
                  ~{currentPeakHours.bestTimeToVisit.occupancyRate}% full
                </Text>
              </View>
            </View>

            <View style={styles.timeDivider} />

            <View style={styles.timeSlot}>
              <View style={[styles.timeIconContainer, {backgroundColor: COLORS.ERROR + '20'}]}>
                <Icon name="warning" size={24} color={COLORS.ERROR} />
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Busiest Time</Text>
                <Text style={styles.timeValue}>
                  {currentPeakHours.worstTimeToVisit.time}
                </Text>
                <Text style={styles.timeOccupancy}>
                  ~{currentPeakHours.worstTimeToVisit.occupancyRate}% full
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Dynamic Pricing */}
      {currentPricing && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="local-offer" size={20} color={COLORS.SECONDARY} />
            <Text style={styles.cardTitle}>Smart Pricing</Text>
          </View>

          <View style={styles.pricingContent}>
            {currentPricing.savingsOpportunity ? (
              <View style={styles.savingsContainer}>
                <Icon name="celebration" size={32} color={COLORS.SUCCESS} />
                <View style={styles.savingsInfo}>
                  <Text style={styles.savingsTitle}>Great Deal!</Text>
                  <Text style={styles.savingsText}>
                    Save {currentPricing.discount}% right now
                  </Text>
                </View>
              </View>
            ) : currentPricing.surge > 0 ? (
              <View style={styles.surgeContainer}>
                <Icon name="trending-up" size={32} color={COLORS.ERROR} />
                <View style={styles.surgeInfo}>
                  <Text style={styles.surgeTitle}>Peak Demand</Text>
                  <Text style={styles.surgeText}>
                    +{currentPricing.surge}% surge pricing
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.pricingComparison}>
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>Standard</Text>
                <Text style={styles.priceValue}>
                  ₹{currentPricing.standardPricing.hourly}/hr
                </Text>
              </View>

              <Icon name="arrow-forward" size={20} color={COLORS.TEXT.SECONDARY} />

              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>Current</Text>
                <Text
                  style={[
                    styles.priceValue,
                    {
                      color: currentPricing.savingsOpportunity
                        ? COLORS.SUCCESS
                        : currentPricing.surge > 0
                        ? COLORS.ERROR
                        : COLORS.PRIMARY,
                    },
                  ]}>
                  ₹{currentPricing.suggestedPricing.hourly}/hr
                </Text>
              </View>
            </View>

            <Text style={styles.pricingRecommendation}>
              💡 {currentPricing.recommendation}
            </Text>
          </View>
        </View>
      )}

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={loadAnalytics}>
        <Icon name="refresh" size={16} color={COLORS.PRIMARY} />
        <Text style={styles.refreshText}>Refresh Insights</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: LAYOUT.PADDING.MD,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.PADDING.LG,
    paddingBottom: LAYOUT.PADDING.SM,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginLeft: 8,
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: LAYOUT.MARGIN.LG,
    marginVertical: LAYOUT.MARGIN.SM,
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
    padding: LAYOUT.PADDING.MD,
    elevation: 2,
    shadowColor: COLORS.SHADOW.LIGHT,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.MARGIN.MD,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginLeft: 8,
  },
  occupancyContent: {
    alignItems: 'stretch',
  },
  occupancyMain: {
    alignItems: 'center',
    marginBottom: LAYOUT.MARGIN.MD,
  },
  occupancyPercentage: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.PRIMARY,
  },
  occupancyLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    color: COLORS.TEXT.SECONDARY,
    marginTop: 4,
  },
  occupancyBar: {
    height: 8,
    backgroundColor: COLORS.GRAY[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: LAYOUT.MARGIN.MD,
  },
  occupancyBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendation: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  timeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.SUCCESS + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.MARGIN.SM,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT.SECONDARY,
  },
  timeValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginTop: 2,
  },
  timeOccupancy: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT.TERTIARY,
    marginTop: 2,
  },
  timeDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.BORDER.PRIMARY,
    marginHorizontal: LAYOUT.MARGIN.SM,
  },
  pricingContent: {
    alignItems: 'stretch',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SUCCESS + '10',
    padding: LAYOUT.PADDING.MD,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    marginBottom: LAYOUT.MARGIN.MD,
  },
  savingsInfo: {
    marginLeft: LAYOUT.MARGIN.MD,
    flex: 1,
  },
  savingsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.SUCCESS,
  },
  savingsText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginTop: 2,
  },
  surgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ERROR + '10',
    padding: LAYOUT.PADDING.MD,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    marginBottom: LAYOUT.MARGIN.MD,
  },
  surgeInfo: {
    marginLeft: LAYOUT.MARGIN.MD,
    flex: 1,
  },
  surgeTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.ERROR,
  },
  surgeText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginTop: 2,
  },
  pricingComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: LAYOUT.MARGIN.MD,
    paddingVertical: LAYOUT.PADDING.SM,
  },
  priceColumn: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT.SECONDARY,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.PRIMARY,
  },
  pricingRecommendation: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.PADDING.SM,
    marginHorizontal: LAYOUT.MARGIN.LG,
    marginTop: LAYOUT.MARGIN.SM,
  },
  refreshText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.PRIMARY,
    marginLeft: 6,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM as any,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: LAYOUT.PADDING.LG,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginLeft: 8,
  },
});

export default LibraryAnalyticsWidget;


