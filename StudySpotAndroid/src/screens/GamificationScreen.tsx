/**
 * GamificationScreen
 * Displays user points, badges, leaderboard, and rewards
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {RootState, AppDispatch} from '@store/index';
import {
  fetchGamificationSummary,
  fetchLeaderboard,
  fetchRewards,
  redeemReward,
} from '@store/slices/gamificationSlice';
import {COLORS, LAYOUT, TYPOGRAPHY} from '@constants/index';
import { Reward} from '@services/GamificationService';

const GamificationScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'badges' | 'leaderboard' | 'rewards'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const {summary, leaderboard, rewards, loading, error} = useSelector(
    (state: RootState) => state.gamification,
  );

  const loadGamificationData = async () => {
    dispatch(fetchGamificationSummary());
    dispatch(fetchLeaderboard({metric: 'totalPoints', limit: 10}));
    dispatch(fetchRewards());
  };

  useEffect(() => {
    loadGamificationData();
  }, [loadGamificationData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGamificationData();
    setRefreshing(false);
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!reward.affordable) {
      Alert.alert(
        'Not Enough Points',
        `You need ${reward.pointsNeeded} more points to redeem this reward.`,
      );
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Redeem ${reward.name} for ${reward.cost} points?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              await dispatch(redeemReward(reward.id)).unwrap();
              Alert.alert('Success!', 'Reward redeemed successfully!');
            } catch (err: any) {
              Alert.alert('Error', err || 'Failed to redeem reward');
            }
          },
        },
      ],
    );
  };

  // Render Level Progress
  const renderLevelProgress = () => {
    if (!summary) {return null;}

    const {level} = summary;
    const progressWidth = `${level.progressPercentage}%`;

    return (
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.levelIconContainer}>
            <Text style={styles.levelIcon}>{level.icon}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Level {level.level}</Text>
            <Text style={styles.levelName}>{level.name}</Text>
          </View>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsValue}>{level.currentPoints}</Text>
            <Text style={styles.pointsLabel}>Points</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, {width: parseFloat(progressWidth)}]} />
          </View>
          <Text style={styles.progressText}>
            {level.pointsToNextLevel} points to level {level.level + 1}
          </Text>
        </View>
      </View>
    );
  };

  // Render Stats Overview
  const renderStatsOverview = () => {
    if (!summary) {return null;}

    const stats = [
      {
        icon: 'event',
        label: 'Bookings',
        value: summary.stats.totalBookings,
        color: COLORS.PRIMARY,
      },
      {
        icon: 'access-time',
        label: 'Study Hours',
        value: summary.stats.totalStudyHours,
        color: COLORS.ACCENT,
      },
      {
        icon: 'star',
        label: 'Reviews',
        value: summary.stats.totalReviews,
        color: COLORS.WARNING,
      },
      {
        icon: 'people',
        label: 'Referrals',
        value: summary.stats.successfulReferrals,
        color: COLORS.SUCCESS,
      },
    ];

    return (
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIconContainer, {backgroundColor: stat.color + '20'}]}>
              <Icon name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render Streak
  const renderStreak = () => {
    if (!summary) {return null;}

    return (
      <View style={styles.streakCard}>
        <Icon name="local-fire-department" size={48} color={COLORS.SECONDARY} />
        <View style={styles.streakInfo}>
          <Text style={styles.streakValue}>{summary.streak.current} Days</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
        </View>
        <View style={styles.streakBonusContainer}>
          <Text style={styles.streakBonusValue}>+{summary.streak.bonus}</Text>
          <Text style={styles.streakBonusLabel}>Bonus Points</Text>
        </View>
      </View>
    );
  };

  // Render Badges
  const renderBadges = () => {
    if (!summary) {return null;}

    const badges = summary.badges.list;

    return (
      <View style={styles.badgesContainer}>
        <View style={styles.badgesSummary}>
          <Text style={styles.badgesSummaryText}>
            {summary.badges.total} Badges Earned
          </Text>
          <View style={styles.badgeTierCounts}>
            <Text style={styles.tierCount}>🥉 {summary.badges.bronzeCount}</Text>
            <Text style={styles.tierCount}>🥈 {summary.badges.silverCount}</Text>
            <Text style={styles.tierCount}>🥇 {summary.badges.goldCount}</Text>
            <Text style={styles.tierCount}>💎 {summary.badges.platinumCount}</Text>
          </View>
        </View>

        <View style={styles.badgesGrid}>
          {badges.map((badge, index) => (
            <View key={index} style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={styles.badgeName} numberOfLines={1}>
                {badge.name}
              </Text>
              <Text style={styles.badgeDescription} numberOfLines={2}>
                {badge.description}
              </Text>
              <View style={[styles.badgeTier, styles[`tier_${badge.tier}`]]}>
                <Text style={styles.badgeTierText}>{badge.tier}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render Leaderboard
  const renderLeaderboard = () => {
    return (
      <View style={styles.leaderboardContainer}>
        {leaderboard.map((entry, index) => (
          <View key={entry.userId} style={styles.leaderboardEntry}>
            <View style={styles.leaderboardRank}>
              {entry.medal ? (
                <Text style={styles.medalText}>{entry.medal}</Text>
              ) : (
                <Text style={styles.rankText}>{entry.rank}</Text>
              )}
            </View>

            <View style={styles.leaderboardInfo}>
              <Text style={styles.leaderboardName}>{entry.name}</Text>
              <View style={styles.leaderboardLevel}>
                <Text style={styles.leaderboardLevelText}>
                  {entry.level.icon} {entry.level.name}
                </Text>
              </View>
            </View>

            <View style={styles.leaderboardPoints}>
              <Text style={styles.leaderboardPointsValue}>{entry.value}</Text>
              <Text style={styles.leaderboardPointsLabel}>points</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render Rewards
  const renderRewards = () => {
    const affordableRewards = rewards.filter(r => r.affordable);
    const upcomingRewards = rewards.filter(r => !r.affordable);

    return (
      <View style={styles.rewardsContainer}>
        {/* Affordable Rewards */}
        {affordableRewards.length > 0 && (
          <>
            <Text style={styles.rewardsSectionTitle}>Available Now</Text>
            {affordableRewards.map(reward => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <Text style={styles.rewardCost}>{reward.cost} points</Text>
                </View>
                <TouchableOpacity
                  style={styles.redeemButton}
                  onPress={() => handleRedeemReward(reward)}>
                  <Text style={styles.redeemButtonText}>Redeem</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Upcoming Rewards */}
        {upcomingRewards.length > 0 && (
          <>
            <Text style={[styles.rewardsSectionTitle, {marginTop: 24}]}>
              Coming Soon
            </Text>
            {upcomingRewards.slice(0, 5).map(reward => (
              <View key={reward.id} style={[styles.rewardCard, styles.rewardCardLocked]}>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <Text style={styles.rewardCost}>{reward.cost} points</Text>
                </View>
                <View style={styles.lockedBadge}>
                  <Icon name="lock" size={16} color={COLORS.TEXT.SECONDARY} />
                  <Text style={styles.lockedText}>{reward.pointsNeeded} more</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    );
  };

  // Render Content based on selected tab
  const renderContent = () => {
    if (loading.summary && !summary) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (error.summary) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error.summary}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {renderLevelProgress()}
            {renderStreak()}
            {renderStatsOverview()}
          </>
        );
      case 'badges':
        return renderBadges();
      case 'leaderboard':
        return renderLeaderboard();
      case 'rewards':
        return renderRewards();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gamification</Text>
        <Text style={styles.headerSubtitle}>Track your progress & earn rewards</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            {key: 'overview', label: 'Overview', icon: 'dashboard'},
            {key: 'badges', label: 'Badges', icon: 'military-tech'},
            {key: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard'},
            {key: 'rewards', label: 'Rewards', icon: 'card-giftcard'},
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
              onPress={() => setSelectedTab(tab.key as any)}>
              <Icon
                name={tab.icon}
                size={20}
                color={selectedTab === tab.key ? COLORS.PRIMARY : COLORS.TEXT.SECONDARY}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.tabTextActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.SECONDARY,
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
    backgroundColor: COLORS.WHITE,
    paddingVertical: LAYOUT.PADDING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER.PRIMARY,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.PADDING.SM,
    paddingHorizontal: LAYOUT.PADDING.MD,
    marginHorizontal: 4,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
  },
  tabActive: {
    backgroundColor: COLORS.PRIMARY_LIGHT + '20',
  },
  tabText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginLeft: 6,
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
  levelCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
    padding: LAYOUT.PADDING.LG,
    marginBottom: LAYOUT.MARGIN.MD,
    elevation: 2,
    shadowColor: COLORS.SHADOW.DARK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.MARGIN.MD,
  },
  levelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY_LIGHT + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.MARGIN.MD,
  },
  levelIcon: {
    fontSize: 32,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
  },
  levelName: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM as any,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.PRIMARY,
  },
  pointsLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
  },
  progressBarContainer: {
    marginTop: LAYOUT.MARGIN.SM,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.GRAY[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginTop: 8,
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
    padding: LAYOUT.PADDING.LG,
    marginBottom: LAYOUT.MARGIN.MD,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.SHADOW.DARK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakInfo: {
    flex: 1,
    marginLeft: LAYOUT.MARGIN.MD,
  },
  streakValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
  },
  streakBonusContainer: {
    alignItems: 'flex-end',
  },
  streakBonusValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.SUCCESS,
  },
  streakBonusLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT.SECONDARY,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '50%',
    padding: 6,
  },
  statCardInner: {
    backgroundColor: COLORS.WHITE,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    padding: LAYOUT.PADDING.MD,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginTop: 8,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
    marginTop: 4,
  },
  badgesContainer: {
    paddingBottom: LAYOUT.PADDING.LG,
  },
  badgesSummary: {
    backgroundColor: COLORS.WHITE,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    padding: LAYOUT.PADDING.MD,
    marginBottom: LAYOUT.MARGIN.MD,
  },
  badgesSummaryText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 8,
  },
  badgeTierCounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tierCount: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  badgeCard: {
    width: '50%',
    padding: 6,
    marginBottom: 12,
  },
  badgeCardInner: {
    backgroundColor: COLORS.WHITE,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    padding: LAYOUT.PADDING.MD,
    alignItems: 'center',
    minHeight: 140,
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  badgeTier: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeTierText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.WHITE,
    textTransform: 'uppercase',
  },
  tier_bronze: {
    backgroundColor: '#CD7F32',
  },
  tier_silver: {
    backgroundColor: '#C0C0C0',
  },
  tier_gold: {
    backgroundColor: '#FFD700',
  },
  tier_platinum: {
    backgroundColor: '#E5E4E2',
  },
  leaderboardContainer: {
    paddingBottom: LAYOUT.PADDING.LG,
  },
  leaderboardEntry: {
    backgroundColor: COLORS.WHITE,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    padding: LAYOUT.PADDING.MD,
    marginBottom: LAYOUT.MARGIN.SM,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: COLORS.SHADOW.LIGHT,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
    marginRight: LAYOUT.MARGIN.MD,
  },
  medalText: {
    fontSize: 24,
  },
  rankText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.SECONDARY,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 4,
  },
  leaderboardLevel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardLevelText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.TEXT.SECONDARY,
  },
  leaderboardPoints: {
    alignItems: 'flex-end',
  },
  leaderboardPointsValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.PRIMARY,
  },
  leaderboardPointsLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT.SECONDARY,
  },
  rewardsContainer: {
    paddingBottom: LAYOUT.PADDING.LG,
  },
  rewardsSectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginBottom: LAYOUT.MARGIN.MD,
  },
  rewardCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    padding: LAYOUT.PADDING.MD,
    marginBottom: LAYOUT.MARGIN.SM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: COLORS.SHADOW.LIGHT,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rewardCardLocked: {
    opacity: 0.6,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 4,
  },
  rewardCost: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM as any,
  },
  redeemButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: LAYOUT.PADDING.LG,
    paddingVertical: LAYOUT.PADDING.SM,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
  },
  redeemButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD as any,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY[200],
    paddingHorizontal: LAYOUT.PADDING.MD,
    paddingVertical: LAYOUT.PADDING.SM,
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
  },
  lockedText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XS,
    color: COLORS.TEXT.SECONDARY,
    marginLeft: 4,
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

export default GamificationScreen;


