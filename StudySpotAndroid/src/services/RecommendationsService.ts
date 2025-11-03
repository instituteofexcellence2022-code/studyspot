/**
 * 🎓 STUDYSPOT - Recommendations Service
 * Handles AI-powered library recommendations
 */

import {API_CONFIG} from '@constants/index';
import NetworkService from './NetworkService';

export interface RecommendedLibrary {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  description: string;
  capacity: number;
  availableSeats: number;
  amenities: string[];
  pricing: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  rating: number;
  totalReviews: number;
  openingTime: string;
  closingTime: string;
  imageUrl: string;
  recommendationScore: number;
  explanation?: string;
  matchReasons: string[];
}

export interface TrendingLibrary extends RecommendedLibrary {
  trendingScore: number;
}

export interface SimilarLibrary extends RecommendedLibrary {
  similarityScore: number;
}

class RecommendationsService {
  /**
   * Get personalized library recommendations
   */
  async getPersonalizedRecommendations(options?: {
    limit?: number;
    minScore?: number;
  }): Promise<RecommendedLibrary[]> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) {params.append('limit', options.limit.toString());}
      if (options?.minScore) {params.append('minScore', options.minScore.toString());}

      const response = await NetworkService.get<{
        success: boolean;
        data: RecommendedLibrary[];
        meta: {
          total: number;
          timestamp: string;
        };
      }>(`${API_CONFIG.ENDPOINTS.RECOMMENDATIONS.PERSONALIZED}?${params.toString()}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Get trending libraries
   */
  async getTrendingLibraries(limit: number = 5): Promise<TrendingLibrary[]> {
    try {
      const response = await NetworkService.get<{
        success: boolean;
        data: TrendingLibrary[];
        meta: {
          total: number;
          timestamp: string;
        };
      }>(`${API_CONFIG.ENDPOINTS.RECOMMENDATIONS.TRENDING}?limit=${limit}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching trending libraries:', error);
      throw error;
    }
  }

  /**
   * Get similar libraries to a specific library
   */
  async getSimilarLibraries(
    libraryId: string,
    limit: number = 4,
  ): Promise<SimilarLibrary[]> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.RECOMMENDATIONS.SIMILAR.replace(
        ':id',
        libraryId,
      );

      const response = await NetworkService.get<{
        success: boolean;
        data: SimilarLibrary[];
        meta: {
          total: number;
          timestamp: string;
        };
      }>(`${endpoint}?limit=${limit}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching similar libraries:', error);
      throw error;
    }
  }
}

export default new RecommendationsService();


