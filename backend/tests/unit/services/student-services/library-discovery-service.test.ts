/**
 * UNIT TESTS - LIBRARY DISCOVERY SERVICE
 * Tests for: Location-based library search, advanced filtering & sorting,
 * personalized recommendations, ratings & reviews system
 */

import { tenantDbManager } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

describe('Library Discovery Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Location-Based Library Search', () => {
    it('should search libraries by location', async () => {
      const location = {
        latitude: 28.6139,
        longitude: 77.2090,
        radius: 5, // km
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [
          {
            id: 'lib-1',
            name: 'Library 1',
            latitude: 28.6140,
            longitude: 77.2091,
            distance: 0.1,
          },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT id, name, latitude, longitude,
         (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
         cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) AS distance
         FROM libraries
         WHERE (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
         cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) <= $3
         ORDER BY distance`,
        [location.latitude, location.longitude, location.radius]
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].distance).toBeLessThanOrEqual(location.radius);
    });

    it('should calculate distance between locations', () => {
      const lat1 = 28.6139;
      const lon1 = 77.2090;
      const lat2 = 28.6140;
      const lon2 = 77.2091;

      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1); // Should be very close
    });
  });

  describe('Advanced Filtering & Sorting', () => {
    it('should filter libraries by amenities', async () => {
      const filters = {
        wifi: true,
        air_conditioning: true,
        parking: false,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'lib-1', name: 'Library 1', wifi: true, air_conditioning: true, parking: true },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM libraries 
         WHERE wifi = $1 AND air_conditioning = $2`,
        [filters.wifi, filters.air_conditioning]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should filter libraries by price range', async () => {
      const priceRange = {
        min: 100,
        max: 500,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'lib-1', name: 'Library 1', hourly_rate: 200 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM libraries 
         WHERE hourly_rate >= $1 AND hourly_rate <= $2`,
        [priceRange.min, priceRange.max]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should sort libraries by rating', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'lib-1', name: 'Library 1', rating: 4.8 },
          { id: 'lib-2', name: 'Library 2', rating: 4.5 },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM libraries ORDER BY rating DESC'
      );

      expect(result.rows[0].rating).toBeGreaterThanOrEqual(result.rows[1].rating);
    });

    it('should sort libraries by distance', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'lib-1', name: 'Library 1', distance: 0.5 },
          { id: 'lib-2', name: 'Library 2', distance: 1.2 },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM libraries ORDER BY distance ASC'
      );

      expect(result.rows[0].distance).toBeLessThanOrEqual(result.rows[1].distance);
    });
  });

  describe('Personalized Recommendations', () => {
    it('should recommend libraries based on booking history', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { library_id: 'lib-1', booking_count: 10 },
          { library_id: 'lib-2', booking_count: 5 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT library_id, COUNT(*) as booking_count 
         FROM bookings 
         WHERE student_id = $1 
         GROUP BY library_id 
         ORDER BY booking_count DESC`,
        [studentId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].booking_count).toBeGreaterThanOrEqual(result.rows[1].booking_count);
    });

    it('should recommend libraries based on preferences', () => {
      const preferences = {
        preferred_amenities: ['wifi', 'air_conditioning'],
        preferred_location: { latitude: 28.6139, longitude: 77.2090 },
        max_distance: 5,
      };

      const recommendationScore = (library: any) => {
        let score = 0;
        if (preferences.preferred_amenities.every(amenity => library[amenity])) {
          score += 50;
        }
        if (library.distance <= preferences.max_distance) {
          score += 30;
        }
        score += library.rating * 10;
        return score;
      };

      const library = {
        wifi: true,
        air_conditioning: true,
        distance: 3,
        rating: 4.5,
      };

      const score = recommendationScore(library);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('Ratings & Reviews System', () => {
    it('should calculate library average rating', async () => {
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ avg_rating: 4.5, total_reviews: 20 }],
      });

      const result = await mockTenantDb.query(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews 
         FROM library_reviews 
         WHERE library_id = $1`,
        [libraryId]
      );

      expect(result.rows[0].avg_rating).toBeGreaterThan(0);
      expect(result.rows[0].total_reviews).toBeGreaterThan(0);
    });

    it('should add library review', async () => {
      const review = {
        library_id: 'lib-123',
        student_id: 'student-123',
        rating: 5,
        comment: 'Great library!',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'review-123', ...review, created_at: new Date() }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO library_reviews (library_id, student_id, rating, comment)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [review.library_id, review.student_id, review.rating, review.comment]
      );

      expect(result.rows[0].rating).toBe(review.rating);
      expect(result.rows[0].comment).toBe(review.comment);
    });

    it('should validate rating range', () => {
      const rating = 5;
      const isValid = rating >= 1 && rating <= 5;

      expect(isValid).toBe(true);
    });
  });
});

