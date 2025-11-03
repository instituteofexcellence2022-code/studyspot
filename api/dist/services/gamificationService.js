/**
 * 🎓 STUDYSPOT - Gamification Service
 * Phase 5: Advanced Mobile Features
 * 
 * This service handles:
 * - Points & rewards system
 * - Achievement badges
 * - Leaderboards
 * - Study streaks
 * - Referral bonuses
 * - Loyalty programs
 */

class GamificationService {
  constructor() {
    // Points configuration
    this.POINTS = {
      BOOKING_COMPLETED: 10,
      BOOKING_ATTENDED: 20,
      REVIEW_WRITTEN: 15,
      FIRST_BOOKING: 50,
      REFERRAL_SUCCESS: 100,
      DAILY_STREAK_BONUS: 5,
      WEEKLY_STREAK_BONUS: 30,
      MONTHLY_STREAK_BONUS: 150,
      PROFILE_COMPLETE: 25,
      PHOTO_UPLOAD: 10,
      EARLY_BOOKING: 5,
      // Book 3+ days in advance
      STUDY_HOUR: 2 // Per hour studied
    };

    // Achievement badges
    this.BADGES = {
      // Beginner badges
      FIRST_STEP: {
        id: 'first_step',
        name: 'First Step',
        description: 'Complete your first booking',
        icon: '🎯',
        tier: 'bronze',
        requirement: {
          type: 'bookings_count',
          value: 1
        }
      },
      GETTING_STARTED: {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Complete your profile',
        icon: '✨',
        tier: 'bronze',
        requirement: {
          type: 'profile_complete',
          value: true
        }
      },
      // Booking badges
      REGULAR_STUDENT: {
        id: 'regular_student',
        name: 'Regular Student',
        description: 'Complete 10 bookings',
        icon: '📚',
        tier: 'silver',
        requirement: {
          type: 'bookings_count',
          value: 10
        }
      },
      DEDICATED_LEARNER: {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Complete 50 bookings',
        icon: '🎓',
        tier: 'gold',
        requirement: {
          type: 'bookings_count',
          value: 50
        }
      },
      KNOWLEDGE_SEEKER: {
        id: 'knowledge_seeker',
        name: 'Knowledge Seeker',
        description: 'Complete 100 bookings',
        icon: '🏆',
        tier: 'platinum',
        requirement: {
          type: 'bookings_count',
          value: 100
        }
      },
      // Streak badges
      WEEK_WARRIOR: {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: '7-day study streak',
        icon: '🔥',
        tier: 'silver',
        requirement: {
          type: 'streak_days',
          value: 7
        }
      },
      MONTH_MASTER: {
        id: 'month_master',
        name: 'Month Master',
        description: '30-day study streak',
        icon: '⚡',
        tier: 'gold',
        requirement: {
          type: 'streak_days',
          value: 30
        }
      },
      UNSTOPPABLE: {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: '100-day study streak',
        icon: '💎',
        tier: 'platinum',
        requirement: {
          type: 'streak_days',
          value: 100
        }
      },
      // Study time badges
      NIGHT_OWL: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Study 50 hours total',
        icon: '🦉',
        tier: 'silver',
        requirement: {
          type: 'study_hours',
          value: 50
        }
      },
      STUDY_CHAMPION: {
        id: 'study_champion',
        name: 'Study Champion',
        description: 'Study 200 hours total',
        icon: '👑',
        tier: 'gold',
        requirement: {
          type: 'study_hours',
          value: 200
        }
      },
      // Social badges
      COMMUNITY_BUILDER: {
        id: 'community_builder',
        name: 'Community Builder',
        description: 'Write 10 helpful reviews',
        icon: '⭐',
        tier: 'silver',
        requirement: {
          type: 'reviews_count',
          value: 10
        }
      },
      REFERRAL_STAR: {
        id: 'referral_star',
        name: 'Referral Star',
        description: 'Refer 5 friends successfully',
        icon: '🌟',
        tier: 'gold',
        requirement: {
          type: 'referrals_count',
          value: 5
        }
      },
      // Explorer badges
      CITY_EXPLORER: {
        id: 'city_explorer',
        name: 'City Explorer',
        description: 'Visit libraries in 3 different cities',
        icon: '🗺️',
        tier: 'silver',
        requirement: {
          type: 'unique_cities',
          value: 3
        }
      },
      LIBRARY_HOPPER: {
        id: 'library_hopper',
        name: 'Library Hopper',
        description: 'Visit 10 different libraries',
        icon: '🏛️',
        tier: 'gold',
        requirement: {
          type: 'unique_libraries',
          value: 10
        }
      },
      // Special badges
      EARLY_BIRD: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Book 10 times at least 3 days in advance',
        icon: '🐦',
        tier: 'silver',
        requirement: {
          type: 'early_bookings',
          value: 10
        }
      },
      WEEKEND_WARRIOR: {
        id: 'weekend_warrior',
        name: 'Weekend Warrior',
        description: 'Study 20 weekends',
        icon: '💪',
        tier: 'silver',
        requirement: {
          type: 'weekend_sessions',
          value: 20
        }
      }
    };

    // Levels system
    this.LEVELS = [{
      level: 1,
      name: 'Beginner',
      minPoints: 0,
      maxPoints: 100,
      icon: '🌱'
    }, {
      level: 2,
      name: 'Student',
      minPoints: 101,
      maxPoints: 300,
      icon: '📖'
    }, {
      level: 3,
      name: 'Scholar',
      minPoints: 301,
      maxPoints: 600,
      icon: '📚'
    }, {
      level: 4,
      name: 'Expert',
      minPoints: 601,
      maxPoints: 1000,
      icon: '🎓'
    }, {
      level: 5,
      name: 'Master',
      minPoints: 1001,
      maxPoints: 1500,
      icon: '👨‍🎓'
    }, {
      level: 6,
      name: 'Legend',
      minPoints: 1501,
      maxPoints: 2500,
      icon: '🏆'
    }, {
      level: 7,
      name: 'Champion',
      minPoints: 2501,
      maxPoints: 5000,
      icon: '👑'
    }, {
      level: 8,
      name: 'Grandmaster',
      minPoints: 5001,
      maxPoints: 10000,
      icon: '💎'
    }, {
      level: 9,
      name: 'Elite',
      minPoints: 10001,
      maxPoints: 20000,
      icon: '⭐'
    }, {
      level: 10,
      name: 'Legendary',
      minPoints: 20001,
      maxPoints: Infinity,
      icon: '🌟'
    }];
  }

  /**
   * Award points for an action
   */
  awardPoints(userId, action, metadata = {}) {
    const points = this.POINTS[action] || 0;
    if (points === 0) {
      return {
        success: false,
        message: 'Invalid action'
      };
    }
    return {
      success: true,
      userId,
      action,
      points,
      timestamp: new Date().toISOString(),
      message: `Earned ${points} points for ${action}!`
    };
  }

  /**
   * Calculate user level based on total points
   */
  getUserLevel(totalPoints) {
    const level = this.LEVELS.find(l => totalPoints >= l.minPoints && totalPoints <= l.maxPoints) || this.LEVELS[0];
    const nextLevel = this.LEVELS.find(l => l.level === level.level + 1);
    const pointsToNext = nextLevel ? nextLevel.minPoints - totalPoints : 0;
    const progress = nextLevel ? (totalPoints - level.minPoints) / (nextLevel.minPoints - level.minPoints) * 100 : 100;
    return {
      ...level,
      currentPoints: totalPoints,
      pointsToNextLevel: Math.max(pointsToNext, 0),
      progressPercentage: Math.min(Math.round(progress), 100)
    };
  }

  /**
   * Check if user has earned any new badges
   */
  checkBadges(userStats) {
    const earnedBadges = [];
    Object.values(this.BADGES).forEach(badge => {
      const {
        type,
        value
      } = badge.requirement;
      let earned = false;
      switch (type) {
        case 'bookings_count':
          earned = (userStats.totalBookings || 0) >= value;
          break;
        case 'profile_complete':
          earned = userStats.profileComplete === true;
          break;
        case 'streak_days':
          earned = (userStats.currentStreak || 0) >= value;
          break;
        case 'study_hours':
          earned = (userStats.totalStudyHours || 0) >= value;
          break;
        case 'reviews_count':
          earned = (userStats.totalReviews || 0) >= value;
          break;
        case 'referrals_count':
          earned = (userStats.successfulReferrals || 0) >= value;
          break;
        case 'unique_cities':
          earned = (userStats.uniqueCities || []).length >= value;
          break;
        case 'unique_libraries':
          earned = (userStats.uniqueLibraries || []).length >= value;
          break;
        case 'early_bookings':
          earned = (userStats.earlyBookings || 0) >= value;
          break;
        case 'weekend_sessions':
          earned = (userStats.weekendSessions || 0) >= value;
          break;
        default:
          earned = false;
      }
      if (earned) {
        earnedBadges.push(badge);
      }
    });
    return earnedBadges;
  }

  /**
   * Calculate study streak
   */
  calculateStreak(bookingDates) {
    if (!bookingDates || bookingDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0
      };
    }

    // Sort dates
    const sortedDates = bookingDates.map(d => new Date(d).toDateString()).sort((a, b) => new Date(a) - new Date(b));
    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
        currentStreak = tempStreak;
      } else if (diffDays === 0) {
        // Same day, don't count
        continue;
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    return {
      currentStreak,
      longestStreak
    };
  }

  /**
   * Generate leaderboard
   */
  generateLeaderboard(users, metric = 'points', limit = 10) {
    const sortedUsers = users.map(user => ({
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      value: user[metric] || 0,
      level: this.getUserLevel(user.totalPoints || 0),
      badges: user.badges || []
    })).sort((a, b) => b.value - a.value).slice(0, limit).map((user, index) => ({
      ...user,
      rank: index + 1,
      medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
    }));
    return sortedUsers;
  }

  /**
   * Calculate rewards based on points
   */
  getAvailableRewards(totalPoints) {
    const rewards = [{
      id: 'discount_10',
      name: '10% Off Next Booking',
      cost: 100,
      type: 'discount',
      value: 10
    }, {
      id: 'discount_20',
      name: '20% Off Next Booking',
      cost: 250,
      type: 'discount',
      value: 20
    }, {
      id: 'free_coffee',
      name: 'Free Coffee Voucher',
      cost: 50,
      type: 'voucher',
      value: 'coffee'
    }, {
      id: 'free_hour',
      name: '1 Free Hour',
      cost: 150,
      type: 'freebie',
      value: '1_hour'
    }, {
      id: 'free_day',
      name: '1 Free Day Pass',
      cost: 500,
      type: 'freebie',
      value: '1_day'
    }, {
      id: 'priority_booking',
      name: 'Priority Booking (1 week)',
      cost: 200,
      type: 'upgrade',
      value: '7_days'
    }, {
      id: 'premium_seat',
      name: 'Premium Seat Upgrade',
      cost: 100,
      type: 'upgrade',
      value: 'premium_seat'
    }, {
      id: 'refer_bonus',
      name: 'Double Referral Points',
      cost: 300,
      type: 'multiplier',
      value: '2x'
    }];
    return rewards.map(reward => ({
      ...reward,
      affordable: totalPoints >= reward.cost,
      pointsNeeded: Math.max(0, reward.cost - totalPoints)
    }));
  }

  /**
   * Get gamification summary for a user
   */
  getUserGamificationSummary(userStats) {
    const totalPoints = userStats.totalPoints || 0;
    const level = this.getUserLevel(totalPoints);
    const badges = this.checkBadges(userStats);
    const streak = this.calculateStreak(userStats.bookingDates || []);
    const rewards = this.getAvailableRewards(totalPoints);
    return {
      points: {
        total: totalPoints,
        weeklyEarned: userStats.weeklyPoints || 0,
        monthlyEarned: userStats.monthlyPoints || 0
      },
      level,
      badges: {
        total: badges.length,
        list: badges,
        bronzeCount: badges.filter(b => b.tier === 'bronze').length,
        silverCount: badges.filter(b => b.tier === 'silver').length,
        goldCount: badges.filter(b => b.tier === 'gold').length,
        platinumCount: badges.filter(b => b.tier === 'platinum').length
      },
      streak: {
        current: streak.currentStreak,
        longest: streak.longestStreak,
        bonus: streak.currentStreak * this.POINTS.DAILY_STREAK_BONUS
      },
      rewards: {
        available: rewards.filter(r => r.affordable).length,
        upcoming: rewards.filter(r => !r.affordable).slice(0, 3)
      },
      stats: {
        totalBookings: userStats.totalBookings || 0,
        totalStudyHours: userStats.totalStudyHours || 0,
        totalReviews: userStats.totalReviews || 0,
        successfulReferrals: userStats.successfulReferrals || 0
      }
    };
  }
}
module.exports = new GamificationService();