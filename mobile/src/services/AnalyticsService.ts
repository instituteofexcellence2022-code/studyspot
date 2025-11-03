/**
 * 🎓 STUDYSPOT - Analytics Service
 * Handles predictive analytics and insights
 */

import {API_CONFIG} from '@constants/index';
import NetworkService from './NetworkService';

export interface OccupancyPrediction {
  datetime: string;
  predictedOccupancy: number;
  predictedAvailable: number;
  occupancyRate: number;
  confidence: number;
  factors: {
    day: number;
    hour: number;
    dayWeight: number;
    hourWeight: number;
    seasonWeight: number;
  };
  recommendation: string;
}

export interface HourlyPrediction {
  hour: number;
  time: string;
  occupancyRate: number;
  category: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
}

export interface PeakHoursAnalysis {
  date: string;
  libraryId: string;
  libraryName: string;
  hourlyPredictions: HourlyPrediction[];
  peakHours: HourlyPrediction[];
  offPeakHours: HourlyPrediction[];
  bestTimeToVisit: HourlyPrediction;
  worstTimeToVisit: HourlyPrediction;
}

export interface DailyDemand {
  date: string;
  dayName: string;
  averageOccupancy: number;
  category: string;
  peakHour: HourlyPrediction;
  bestHour: HourlyPrediction;
}

export interface WeeklyDemandForecast {
  libraryId: string;
  libraryName: string;
  weeklyForecast: DailyDemand[];
  busiestDay: DailyDemand;
  quietestDay: DailyDemand;
}

export interface PricingSuggestion {
  datetime: string;
  predictedOccupancy: number;
  standardPricing: {
    hourly: number;
    daily: number;
  };
  suggestedPricing: {
    hourly: number;
    daily: number;
  };
  priceMultiplier: number;
  savingsOpportunity: boolean;
  discount: number;
  surge: number;
  recommendation: string;
}

export interface UserBehaviorPattern {
  userType: string;
  pattern: string;
  confidence: number;
  totalBookings: number;
  preferences: {
    favoriteHour: number;
    favoriteHourTime: string;
    favoriteDay: string;
    favoriteLibraryId: string;
    averageSessionDuration: number;
  };
  predictions: {
    nextBookingLikely: {
      predictedDate: string;
      daysSinceLast: number;
      averageInterval: number;
      likelihood: string;
    };
    churnRisk: {
      risk: string;
      score: number;
    };
    lifetimeValue: {
      currentValue: number;
      projectedLifetimeValue: number;
      averageBookingValue: number;
      monthlyFrequency: number;
    };
  };
  recommendations: string[];
}

class AnalyticsService {
  /**
   * Predict library occupancy for a specific date/time
   */
  async predictOccupancy(
    libraryId: string,
    datetime?: string,
  ): Promise<OccupancyPrediction> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ANALYTICS.PREDICT_OCCUPANCY.replace(
        ':libraryId',
        libraryId,
      );

      const params = datetime ? `?datetime=${datetime}` : '';

      const response = await NetworkService.get<{
        success: boolean;
        data: OccupancyPrediction;
        meta: {
          libraryId: string;
          libraryName: string;
          timestamp: string;
        };
      }>(`${endpoint}${params}`);

      return response.data;
    } catch (error) {
      console.error('Error predicting occupancy:', error);
      throw error;
    }
  }

  /**
   * Get peak hours analysis for a library
   */
  async getPeakHours(
    libraryId: string,
    date?: string,
  ): Promise<PeakHoursAnalysis> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ANALYTICS.PEAK_HOURS.replace(
        ':libraryId',
        libraryId,
      );

      const params = date ? `?date=${date}` : '';

      const response = await NetworkService.get<{
        success: boolean;
        data: PeakHoursAnalysis;
        meta: {
          timestamp: string;
        };
      }>(`${endpoint}${params}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching peak hours:', error);
      throw error;
    }
  }

  /**
   * Get weekly demand forecast for a library
   */
  async getWeeklyDemand(libraryId: string): Promise<WeeklyDemandForecast> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ANALYTICS.WEEKLY_DEMAND.replace(
        ':libraryId',
        libraryId,
      );

      const response = await NetworkService.get<{
        success: boolean;
        data: WeeklyDemandForecast;
        meta: {
          timestamp: string;
        };
      }>(endpoint);

      return response.data;
    } catch (error) {
      console.error('Error fetching weekly demand:', error);
      throw error;
    }
  }

  /**
   * Get dynamic pricing suggestion
   */
  async getPricingSuggestion(
    libraryId: string,
    datetime?: string,
  ): Promise<PricingSuggestion> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ANALYTICS.PRICING_SUGGESTION.replace(
        ':libraryId',
        libraryId,
      );

      const params = datetime ? `?datetime=${datetime}` : '';

      const response = await NetworkService.get<{
        success: boolean;
        data: PricingSuggestion;
        meta: {
          timestamp: string;
        };
      }>(`${endpoint}${params}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching pricing suggestion:', error);
      throw error;
    }
  }

  /**
   * Get user behavior patterns and predictions
   */
  async getUserBehavior(): Promise<UserBehaviorPattern> {
    try {
      const response = await NetworkService.get<{
        success: boolean;
        data: UserBehaviorPattern;
        meta: {
          userId: string;
          timestamp: string;
        };
      }>(API_CONFIG.ENDPOINTS.ANALYTICS.USER_BEHAVIOR);

      return response.data;
    } catch (error) {
      console.error('Error fetching user behavior:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();


