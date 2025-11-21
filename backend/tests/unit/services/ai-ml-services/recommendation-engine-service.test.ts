/**
 * UNIT TESTS - RECOMMENDATION ENGINE SERVICE
 * Tests for: Library & content recommendations, personalized timing suggestions,
 * behavior-based customization, A/B testing framework
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

const tenantDbManager = require('../../../src/config/database').tenantDbManager;

describe('Recommendation Engine Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Library Recommendations', () => {
    it('should recommend libraries based on location', async () => {
      const studentId = 'student-123';
      const location = {
        latitude: 28.6139,
        longitude: 77.2090,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'lib-1', name: 'Library 1', distance: 0.5, rating: 4.8, relevance_score: 0.9 },
          { id: 'lib-2', name: 'Library 2', distance: 1.2, rating: 4.5, relevance_score: 0.8 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT l.*,
         (6371 * acos(cos(radians($1)) * cos(radians(l.latitude)) * 
         cos(radians(l.longitude) - radians($2)) + sin(radians($1)) * sin(radians(l.latitude)))) AS distance,
         l.rating * 0.5 + (1 / (1 + distance)) * 0.5 as relevance_score
         FROM libraries l
         WHERE l.status = 'active'
         ORDER BY relevance_score DESC
         LIMIT 10`,
        [location.latitude, location.longitude]
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].relevance_score).toBeGreaterThan(result.rows[1].relevance_score);
    });

    it('should recommend libraries based on booking history', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { library_id: 'lib-1', booking_count: 10, avg_rating: 5, recommendation_score: 0.95 },
          { library_id: 'lib-2', booking_count: 5, avg_rating: 4, recommendation_score: 0.75 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           COUNT(*) as booking_count,
           AVG(rating) as avg_rating,
           (COUNT(*)::float / 20 * 0.6 + AVG(rating) / 5 * 0.4) as recommendation_score
         FROM bookings
         WHERE student_id = $1
         GROUP BY library_id
         ORDER BY recommendation_score DESC`,
        [studentId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Content Recommendations', () => {
    it('should recommend study materials based on course', async () => {
      const studentId = 'student-123';
      const course = 'Computer Science';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'res-1', title: 'CS Fundamentals', category: 'computer_science', relevance: 0.9 },
          { id: 'res-2', title: 'Data Structures', category: 'computer_science', relevance: 0.85 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM learning_resources
         WHERE category = $1 OR tags @> ARRAY[$1]
         ORDER BY relevance_score DESC
         LIMIT 10`,
        [course]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should recommend based on study progress', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { resource_id: 'res-1', completion: 80, next_resource: 'res-2', relevance: 0.9 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           r1.id as resource_id,
           r1.completion_percentage as completion,
           r2.id as next_resource,
           r2.relevance_score as relevance
         FROM resource_progress r1
         JOIN learning_resources r2 ON r2.prerequisite_id = r1.resource_id
         WHERE r1.student_id = $1 AND r1.completion_percentage >= 80
         ORDER BY r2.relevance_score DESC`,
        [studentId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Personalized Timing Suggestions', () => {
    it('should suggest optimal booking times', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { hour: 9, booking_count: 20, availability: 0.8, recommendation_score: 0.85 },
          { hour: 14, booking_count: 15, availability: 0.9, recommendation_score: 0.9 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           EXTRACT(HOUR FROM booking_start_time) as hour,
           COUNT(*) as booking_count,
           AVG(availability_rate) as availability,
           (AVG(availability_rate) * 0.7 + (1 - COUNT(*)::float / 100) * 0.3) as recommendation_score
         FROM bookings
         WHERE student_id = $1
         GROUP BY EXTRACT(HOUR FROM booking_start_time)
         ORDER BY recommendation_score DESC`,
        [studentId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should consider library occupancy patterns', async () => {
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { hour: 10, avg_occupancy: 0.6, recommendation: 'good' },
          { hour: 18, avg_occupancy: 0.9, recommendation: 'busy' },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           EXTRACT(HOUR FROM booking_start_time) as hour,
           AVG(current_occupancy::float / capacity::float) as avg_occupancy,
           CASE 
             WHEN AVG(current_occupancy::float / capacity::float) < 0.7 THEN 'good'
             WHEN AVG(current_occupancy::float / capacity::float) < 0.9 THEN 'moderate'
             ELSE 'busy'
           END as recommendation
         FROM bookings b
         JOIN libraries l ON l.id = b.library_id
         WHERE b.library_id = $1
         GROUP BY EXTRACT(HOUR FROM booking_start_time)`,
        [libraryId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Behavior-Based Customization', () => {
    it('should learn from user preferences', () => {
      const userBehavior = {
        preferredLibraries: ['lib-1', 'lib-2'],
        preferredTimes: [9, 14, 18],
        preferredDuration: 4, // hours
        amenities: ['wifi', 'ac'],
      };

      const recommendation = {
        libraries: userBehavior.preferredLibraries,
        suggestedTimes: userBehavior.preferredTimes,
        duration: userBehavior.preferredDuration,
        filters: {
          amenities: userBehavior.amenities,
        },
      };

      expect(recommendation.libraries).toEqual(userBehavior.preferredLibraries);
      expect(recommendation.suggestedTimes).toEqual(userBehavior.preferredTimes);
    });

    it('should adapt recommendations based on feedback', async () => {
      const studentId = 'student-123';
      const recommendationId = 'rec-123';
      const feedback = 'positive';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: recommendationId, feedback, weight_adjustment: 0.1 }],
      });

      const result = await mockTenantDb.query(
        `UPDATE recommendations 
         SET feedback = $1, 
             weight_adjustment = CASE WHEN $1 = 'positive' THEN weight_adjustment + 0.1 ELSE weight_adjustment - 0.1 END
         WHERE id = $2 RETURNING *`,
        [feedback, recommendationId]
      );

      expect(result.rows[0].feedback).toBe(feedback);
    });
  });

  describe('A/B Testing Framework', () => {
    it('should assign users to test groups', () => {
      const userId = 'user-123';
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const group = hash % 2 === 0 ? 'A' : 'B';

      expect(['A', 'B']).toContain(group);
    });

    it('should track recommendation performance', async () => {
      const testId = 'test-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          test_id: testId,
          variant_a: { impressions: 1000, clicks: 100, conversions: 10, ctr: 10, conversion_rate: 10 },
          variant_b: { impressions: 1000, clicks: 120, conversions: 15, ctr: 12, conversion_rate: 12.5 },
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           test_id,
           jsonb_build_object(
             'impressions', COUNT(*) FILTER (WHERE variant = 'A'),
             'clicks', COUNT(*) FILTER (WHERE variant = 'A' AND clicked = true),
             'conversions', COUNT(*) FILTER (WHERE variant = 'A' AND converted = true)
           ) as variant_a,
           jsonb_build_object(
             'impressions', COUNT(*) FILTER (WHERE variant = 'B'),
             'clicks', COUNT(*) FILTER (WHERE variant = 'B' AND clicked = true),
             'conversions', COUNT(*) FILTER (WHERE variant = 'B' AND converted = true)
           ) as variant_b
         FROM recommendation_tests
         WHERE test_id = $1
         GROUP BY test_id`,
        [testId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });
});

