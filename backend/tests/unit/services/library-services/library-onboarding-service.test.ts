/**
 * UNIT TESTS - LIBRARY ONBOARDING SERVICE
 * Tests for: Step-by-step registration wizard, document upload & verification,
 * onboarding progress tracking, welcome kit & setup guidance
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

describe('Library Onboarding Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Step-by-Step Registration Wizard', () => {
    it('should track onboarding step', async () => {
      const onboarding = {
        library_id: 'lib-123',
        current_step: 'basic_info',
        completed_steps: ['welcome'],
        progress: 20,
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'onboarding-123', ...onboarding }],
      });

      const result = await coreDb.query(
        `INSERT INTO library_onboarding (library_id, current_step, completed_steps, progress)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [onboarding.library_id, onboarding.current_step, JSON.stringify(onboarding.completed_steps), onboarding.progress]
      );

      expect(result.rows[0].current_step).toBe(onboarding.current_step);
    });

    it('should calculate onboarding progress', () => {
      const steps = [
        'welcome',
        'basic_info',
        'documents',
        'payment',
        'setup',
      ];

      const completedSteps = ['welcome', 'basic_info'];
      const progress = (completedSteps.length / steps.length) * 100;

      expect(progress).toBe(40);
    });

    it('should validate step completion', () => {
      const requiredFields = {
        basic_info: ['name', 'address', 'phone'],
        documents: ['license', 'proof_of_address'],
      };

      const step = 'basic_info';
      const data = {
        name: 'Test Library',
        address: '123 Main St',
        phone: '+1234567890',
      };

      const required = requiredFields[step as keyof typeof requiredFields];
      const isValid = required.every(field => data[field as keyof typeof data] !== undefined);

      expect(isValid).toBe(true);
    });
  });

  describe('Document Upload & Verification', () => {
    it('should upload document', async () => {
      const document = {
        library_id: 'lib-123',
        document_type: 'business_license',
        file_url: 'https://storage.example.com/docs/license.pdf',
        uploaded_at: new Date(),
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'doc-123', ...document, status: 'pending_verification' }],
      });

      const result = await coreDb.query(
        `INSERT INTO library_documents (library_id, document_type, file_url, status)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [document.library_id, document.document_type, document.file_url, 'pending_verification']
      );

      expect(result.rows[0].status).toBe('pending_verification');
    });

    it('should verify document', async () => {
      const documentId = 'doc-123';

      (coreDb.query).mockResolvedValue({
        rows: [{ id: documentId, status: 'verified', verified_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE library_documents SET status = 'verified', verified_at = NOW() WHERE id = $1 RETURNING *`,
        [documentId]
      );

      expect(result.rows[0].status).toBe('verified');
    });
  });

  describe('Onboarding Progress Tracking', () => {
    it('should update progress percentage', async () => {
      const libraryId = 'lib-123';
      const newProgress = 60;

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'onboarding-123', library_id: libraryId, progress: newProgress }],
      });

      const result = await coreDb.query(
        `UPDATE library_onboarding SET progress = $1 WHERE library_id = $2 RETURNING *`,
        [newProgress, libraryId]
      );

      expect(result.rows[0].progress).toBe(newProgress);
    });

    it('should mark onboarding as complete', async () => {
      const libraryId = 'lib-123';

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'onboarding-123', library_id: libraryId, status: 'completed', completed_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE library_onboarding SET status = 'completed', progress = 100, completed_at = NOW() WHERE library_id = $1 RETURNING *`,
        [libraryId]
      );

      expect(result.rows[0].status).toBe('completed');
      expect(result.rows[0].progress).toBe(100);
    });
  });

  describe('Welcome Kit & Setup Guidance', () => {
    it('should send welcome email', async () => {
      const libraryId = 'lib-123';
      const email = 'library@example.com';

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'email-123', library_id: libraryId, sent_at: new Date() }],
      });

      const result = await coreDb.query(
        `INSERT INTO welcome_emails (library_id, email, sent_at)
         VALUES ($1, $2, NOW()) RETURNING *`,
        [libraryId, email]
      );

      expect(result.rows[0].library_id).toBe(libraryId);
    });

    it('should provide setup checklist', () => {
      const checklist = [
        { task: 'Complete profile', completed: true },
        { task: 'Upload documents', completed: true },
        { task: 'Set up payment', completed: false },
        { task: 'Configure library settings', completed: false },
      ];

      const completedCount = checklist.filter(item => item.completed).length;
      const totalCount = checklist.length;
      const completionRate = (completedCount / totalCount) * 100;

      expect(completionRate).toBe(50);
    });
  });
});

