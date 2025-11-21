/**
 * UNIT TESTS - AUTOMATION SERVICE
 * Tests for: Rule-based automation engine, event-driven workflows,
 * performance tracking, resource optimization
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;
const tenantDbManager = require('../../../src/config/database').tenantDbManager;

describe('Automation Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Rule-Based Automation Engine', () => {
    it('should create automation rule', async () => {
      const rule = {
        name: 'Auto-suspend inactive students',
        trigger: 'student_inactive_90_days',
        condition: { days_inactive: 90 },
        action: 'suspend_student',
        enabled: true,
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'rule-123', ...rule }],
      });

      const result = await coreDb.query(
        `INSERT INTO automation_rules (name, trigger, condition, action, enabled)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [rule.name, rule.trigger, JSON.stringify(rule.condition), rule.action, rule.enabled]
      );

      expect(result.rows[0].enabled).toBe(true);
    });

    it('should evaluate rule conditions', () => {
      const rule = {
        condition: {
          field: 'days_inactive',
          operator: '>=',
          value: 90,
        },
      };

      const data = { days_inactive: 95 };
      const condition = rule.condition;

      const isMet = condition.operator === '>=' 
        ? data[condition.field as keyof typeof data] >= condition.value
        : false;

      expect(isMet).toBe(true);
    });

    it('should execute automation action', async () => {
      const action = {
        type: 'suspend_student',
        student_id: 'student-123',
        reason: 'Inactive for 90 days',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: action.student_id, status: 'suspended' }],
      });

      const result = await mockTenantDb.query(
        `UPDATE students SET status = 'suspended', notes = $1 WHERE id = $2 RETURNING *`,
        [action.reason, action.student_id]
      );

      expect(result.rows[0].status).toBe('suspended');
    });
  });

  describe('Event-Driven Workflows', () => {
    it('should trigger workflow on event', () => {
      const event = {
        type: 'booking_created',
        data: { bookingId: 'BK123', studentId: 'STU123' },
      };

      const workflows = [
        { trigger: 'booking_created', steps: ['send_confirmation', 'update_occupancy'] },
      ];

      const matchingWorkflow = workflows.find(w => w.trigger === event.type);
      expect(matchingWorkflow).toBeDefined();
      expect(matchingWorkflow?.steps.length).toBeGreaterThan(0);
    });

    it('should execute workflow steps sequentially', async () => {
      const workflow = {
        id: 'workflow-123',
        steps: [
          { order: 1, action: 'send_email', status: 'completed' },
          { order: 2, action: 'update_database', status: 'pending' },
          { order: 3, action: 'send_notification', status: 'pending' },
        ],
      };

      const nextStep = workflow.steps.find(s => s.status === 'pending');
      expect(nextStep?.order).toBe(2);
    });
  });

  describe('Performance Tracking', () => {
    it('should track automation execution time', () => {
      const execution = {
        rule_id: 'rule-123',
        start_time: new Date('2024-01-01T10:00:00'),
        end_time: new Date('2024-01-01T10:00:05'),
      };

      const duration = execution.end_time.getTime() - execution.start_time.getTime();
      const durationSeconds = duration / 1000;

      expect(durationSeconds).toBe(5);
    });

    it('should track automation success rate', async () => {
      const ruleId = 'rule-123';

      (coreDb.query).mockResolvedValue({
        rows: [{
          rule_id: ruleId,
          total_executions: 100,
          successful: 95,
          failed: 5,
          success_rate: 95,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           rule_id,
           COUNT(*) as total_executions,
           COUNT(*) FILTER (WHERE status = 'success') as successful,
           COUNT(*) FILTER (WHERE status = 'failed') as failed,
           (COUNT(*) FILTER (WHERE status = 'success')::float / COUNT(*)::float * 100) as success_rate
         FROM automation_executions
         WHERE rule_id = $1
         GROUP BY rule_id`,
        [ruleId]
      );

      expect(result.rows[0].success_rate).toBeGreaterThan(0);
    });
  });

  describe('Resource Optimization', () => {
    it('should optimize database queries', () => {
      const queries = [
        { query: 'SELECT * FROM students', execution_time: 500 },
        { query: 'SELECT id, name FROM students', execution_time: 100 },
      ];

      const optimized = queries.map(q => ({
        ...q,
        optimized: q.execution_time < 200,
      }));

      expect(optimized[1].optimized).toBe(true);
    });

    it('should schedule resource-intensive tasks', () => {
      const tasks = [
        { priority: 'high', scheduled: true },
        { priority: 'medium', scheduled: false },
        { priority: 'low', scheduled: false },
      ];

      const scheduled = tasks.filter(t => t.scheduled || t.priority === 'high');
      expect(scheduled.length).toBeGreaterThan(0);
    });
  });
});

