/**
 * 🎓 STUDYSPOT - Gamification Service
 * Handles points, badges, rewards, and leaderboards
 */

import {API_CONFIG} from '@constants/index';
import NetworkService from './NetworkService';

export interface UserLevel {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
  currentPoints: number;
  pointsToNextLevel: number;
  progressPercentage: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: {
    type: string;
    value: number | boolean;
  };
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  type: 'discount' | 'voucher' | 'freebie' | 'upgrade' | 'multiplier';
  value: string | number;
  affordable: boolean;
  pointsNeeded: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  value: number;
  level: UserLevel;
  badges: Badge[];
  rank: number;
  medal?: '🥇' | '🥈' | '🥉';
}

export interface GamificationSummary {
  points: {
    total: number;
    weeklyEarned: number;
    monthlyEarned: number;
  };
  level: UserLevel;
  badges: {
    total: number;
    list: Badge[];
    bronzeCount: number;
    silverCount: number;
    goldCount: number;
    platinumCount: number;
  };
  streak: {
    current: number;
    longest: number;
    bonus: number;
  };
  rewards: {
    available: number;
    upcoming: Reward[];
  };
  stats: {
    totalBookings: number;
    totalStudyHours: number;
    totalReviews: number;
    successfulReferrals: number;
  };
}

class GamificationService {
  /**
   * Get user's gamification summary
   */
  async getUserSummary(): Promise<GamificationSummary> {
    try {
      const response = await NetworkService.get<{
        success: boolean;
        data: GamificationSummary;
        meta: {
          timestamp: string;
        };
      }>(API_CONFIG.ENDPOINTS.GAMIFICATION.ME);

      return response.data;
    } catch (error) {
      console.error('Error fetching gamification summary:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    metric: string = 'totalPoints',
    limit: number = 10,
  ): Promise<LeaderboardEntry[]> {
    try {
      const response = await NetworkService.get<{
        success: boolean;
        data: LeaderboardEntry[];
        meta: {
          metric: string;
          total: number;
          timestamp: string;
        };
      }>(`${API_CONFIG.ENDPOINTS.GAMIFICATION.LEADERBOARD}?metric=${metric}&limit=${limit}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get available rewards
   */
  async getAvailableRewards(): Promise<Reward[]> {
    try {
      const response = await NetworkService.get<{
        success: boolean;
        data: Reward[];
        meta: {
          userPoints: number;
          totalRewards: number;
          affordableRewards: number;
          timestamp: string;
        };
      }>(API_CONFIG.ENDPOINTS.GAMIFICATION.REWARDS);

      return response.data;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
  }

  /**
   * Redeem a reward
   */
  async redeemReward(rewardId: string): Promise<{success: boolean; message: string}> {
    try {
      const response = await NetworkService.post<{
        success: boolean;
        message: string;
      }>(`${API_CONFIG.ENDPOINTS.GAMIFICATION.REWARDS}/${rewardId}/redeem`, {});

      return response;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      throw error;
    }
  }
}

export default new GamificationService();


