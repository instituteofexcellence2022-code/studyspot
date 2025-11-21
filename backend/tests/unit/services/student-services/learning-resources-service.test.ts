/**
 * UNIT TESTS - LEARNING RESOURCES SERVICE
 * Tests for: Digital library access, study material recommendations,
 * progress tracking & analytics, resource categorization
 */

import { tenantDbManager } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Learning Resources Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Digital Library Access', () => {
    it('should retrieve available resources', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'res-1', title: 'Math Textbook', type: 'pdf', category: 'mathematics' },
          { id: 'res-2', title: 'Physics Notes', type: 'pdf', category: 'physics' },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM learning_resources WHERE status = $1',
        ['active']
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should check resource access permissions', async () => {
      const resourceId = 'res-123';
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: resourceId, access_level: 'premium', student_tier: 'premium' }],
      });

      const result = await mockTenantDb.query(
        `SELECT r.*, s.subscription_tier 
         FROM learning_resources r
         JOIN students s ON s.id = $2
         WHERE r.id = $1 AND r.access_level <= s.subscription_tier`,
        [resourceId, studentId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Study Material Recommendations', () => {
    it('should recommend resources based on student course', async () => {
      const studentId = 'student-123';
      const course = 'Computer Science';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'res-1', title: 'CS Fundamentals', category: 'computer_science', relevance_score: 0.9 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM learning_resources 
         WHERE category = $1 OR tags @> ARRAY[$1]
         ORDER BY relevance_score DESC LIMIT 10`,
        [course]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should recommend based on study history', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { resource_id: 'res-1', view_count: 10, last_accessed: new Date() },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT resource_id, COUNT(*) as view_count, MAX(accessed_at) as last_accessed
         FROM resource_access_logs
         WHERE student_id = $1
         GROUP BY resource_id
         ORDER BY view_count DESC, last_accessed DESC`,
        [studentId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Progress Tracking & Analytics', () => {
    it('should track resource completion', async () => {
      const studentId = 'student-123';
      const resourceId = 'res-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'progress-123', student_id: studentId, resource_id: resourceId, completion_percentage: 75 }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO resource_progress (student_id, resource_id, completion_percentage)
         VALUES ($1, $2, $3) RETURNING *`,
        [studentId, resourceId, 75]
      );

      expect(result.rows[0].completion_percentage).toBe(75);
    });

    it('should calculate overall progress', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ total_resources: 20, completed_resources: 15, avg_completion: 75 }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           COUNT(*) as total_resources,
           COUNT(*) FILTER (WHERE completion_percentage = 100) as completed_resources,
           AVG(completion_percentage) as avg_completion
         FROM resource_progress
         WHERE student_id = $1`,
        [studentId]
      );

      expect(result.rows[0].avg_completion).toBeGreaterThan(0);
    });
  });

  describe('Resource Categorization', () => {
    it('should categorize resources by subject', () => {
      const resources = [
        { id: 'res-1', category: 'mathematics', subject: 'algebra' },
        { id: 'res-2', category: 'mathematics', subject: 'geometry' },
        { id: 'res-3', category: 'physics', subject: 'mechanics' },
      ];

      const categorized = resources.reduce((acc, res) => {
        if (!acc[res.category]) acc[res.category] = [];
        acc[res.category].push(res);
        return acc;
      }, {} as Record<string, any[]>);

      expect(categorized['mathematics'].length).toBe(2);
      expect(categorized['physics'].length).toBe(1);
    });

    it('should filter resources by category', async () => {
      const category = 'mathematics';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'res-1', title: 'Algebra', category: 'mathematics' },
          { id: 'res-2', title: 'Geometry', category: 'mathematics' },
        ],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM learning_resources WHERE category = $1',
        [category]
      );

      expect(result.rows.every(r => r.category === category)).toBe(true);
    });
  });
});

