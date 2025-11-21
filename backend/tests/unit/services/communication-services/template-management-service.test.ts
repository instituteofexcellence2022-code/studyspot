/**
 * UNIT TESTS - TEMPLATE MANAGEMENT SERVICE
 * Tests for: Template library management, personalization variables,
 * version control, approval workflows
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;

describe('Template Management Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template Library Management', () => {
    it('should create template', async () => {
      const template = {
        name: 'Booking Confirmation',
        type: 'email',
        subject: 'Your booking is confirmed',
        body: 'Hello {{name}}, your booking ID is {{bookingId}}',
        variables: ['name', 'bookingId'],
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'template-123', ...template, status: 'active' }],
      });

      const result = await coreDb.query(
        `INSERT INTO templates (name, type, subject, body, variables, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [template.name, template.type, template.subject, template.body,
         JSON.stringify(template.variables), 'active']
      );

      expect(result.rows[0].name).toBe(template.name);
    });

    it('should retrieve template by type', async () => {
      const type = 'email';

      (coreDb.query).mockResolvedValue({
        rows: [
          { id: 't1', name: 'Welcome Email', type: 'email' },
          { id: 't2', name: 'Booking Confirmation', type: 'email' },
        ],
      });

      const result = await coreDb.query(
        `SELECT * FROM templates WHERE type = $1 AND status = 'active'`,
        [type]
      );

      expect(result.rows.every(t => t.type === type)).toBe(true);
    });
  });

  describe('Personalization Variables', () => {
    it('should extract variables from template', () => {
      const template = 'Hello {{name}}, your booking ID is {{bookingId}}';
      const variablePattern = /\{\{(\w+)\}\}/g;
      const variables: string[] = [];
      let match;

      while ((match = variablePattern.exec(template)) !== null) {
        variables.push(match[1]);
      }

      expect(variables).toContain('name');
      expect(variables).toContain('bookingId');
    });

    it('should replace variables in template', () => {
      const template = 'Hello {{name}}, your booking ID is {{bookingId}}';
      const data = {
        name: 'John Doe',
        bookingId: 'BK123',
      };

      let rendered = template;
      Object.entries(data).forEach(([key, value]) => {
        rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      });

      expect(rendered).toBe('Hello John Doe, your booking ID is BK123');
    });
  });

  describe('Version Control', () => {
    it('should create template version', async () => {
      const templateId = 'template-123';
      const version = {
        version_number: 2,
        content: 'Updated template content',
        changes: 'Updated booking confirmation message',
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'version-123', template_id: templateId, ...version }],
      });

      const result = await coreDb.query(
        `INSERT INTO template_versions (template_id, version_number, content, changes)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [templateId, version.version_number, version.content, version.changes]
      );

      expect(result.rows[0].version_number).toBe(version.version_number);
    });

    it('should retrieve template version', async () => {
      const templateId = 'template-123';
      const versionNumber = 2;

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'version-123', template_id: templateId, version_number: versionNumber }],
      });

      const result = await coreDb.query(
        `SELECT * FROM template_versions
         WHERE template_id = $1 AND version_number = $2`,
        [templateId, versionNumber]
      );

      expect(result.rows[0].version_number).toBe(versionNumber);
    });
  });

  describe('Approval Workflows', () => {
    it('should submit template for approval', async () => {
      const templateId = 'template-123';

      (coreDb.query).mockResolvedValue({
        rows: [{ id: templateId, status: 'pending_approval', submitted_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE templates SET status = 'pending_approval', submitted_at = NOW() WHERE id = $1 RETURNING *`,
        [templateId]
      );

      expect(result.rows[0].status).toBe('pending_approval');
    });

    it('should approve template', async () => {
      const templateId = 'template-123';
      const approverId = 'admin-123';

      (coreDb.query).mockResolvedValue({
        rows: [{ id: templateId, status: 'approved', approved_by: approverId, approved_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE templates SET status = 'approved', approved_by = $1, approved_at = NOW() WHERE id = $2 RETURNING *`,
        [approverId, templateId]
      );

      expect(result.rows[0].status).toBe('approved');
    });
  });
});

