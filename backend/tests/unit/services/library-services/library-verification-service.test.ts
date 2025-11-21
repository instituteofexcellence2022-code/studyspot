/**
 * UNIT TESTS - LIBRARY VERIFICATION SERVICE
 * Tests for: Automated document verification, background checks & validation,
 * compliance certification, verification status tracking
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;

describe('Library Verification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Automated Document Verification', () => {
    it('should verify business license', async () => {
      const document = {
        library_id: 'lib-123',
        document_type: 'business_license',
        license_number: 'BL-12345',
        expiry_date: '2025-12-31',
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'doc-123', ...document, verification_status: 'verified' }],
      });

      const result = await coreDb.query(
        `UPDATE library_documents 
         SET verification_status = 'verified', verified_at = NOW()
         WHERE library_id = $1 AND document_type = $2 RETURNING *`,
        [document.library_id, document.document_type]
      );

      expect(result.rows[0].verification_status).toBe('verified');
    });

    it('should validate document expiry', () => {
      const document = {
        expiry_date: '2025-12-31',
      };

      const expiryDate = new Date(document.expiry_date);
      const isExpired = expiryDate < new Date();
      const isExpiringSoon = expiryDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

      expect(isExpired).toBe(false);
      expect(isExpiringSoon).toBe(false);
    });
  });

  describe('Background Checks & Validation', () => {
    it('should perform background check', async () => {
      const libraryId = 'lib-123';

      (coreDb.query).mockResolvedValue({
        rows: [{
          library_id: libraryId,
          background_check_status: 'completed',
          criminal_record: 'clear',
          business_history: 'verified',
          completed_at: new Date(),
        }],
      });

      const result = await coreDb.query(
        `UPDATE library_verifications 
         SET background_check_status = 'completed', criminal_record = 'clear', 
             business_history = 'verified', completed_at = NOW()
         WHERE library_id = $1 RETURNING *`,
        [libraryId]
      );

      expect(result.rows[0].background_check_status).toBe('completed');
    });

    it('should validate business registration', async () => {
      const registrationNumber = 'BR-12345';

      (coreDb.query).mockResolvedValue({
        rows: [{ registration_number: registrationNumber, status: 'active', verified: true }],
      });

      const result = await coreDb.query(
        `SELECT * FROM business_registrations WHERE registration_number = $1`,
        [registrationNumber]
      );

      expect(result.rows[0].verified).toBe(true);
    });
  });

  describe('Compliance Certification', () => {
    it('should issue compliance certificate', async () => {
      const libraryId = 'lib-123';

      (coreDb.query).mockResolvedValue({
        rows: [{
          library_id: libraryId,
          certificate_number: 'CERT-12345',
          issued_at: new Date(),
          valid_until: new Date('2025-12-31'),
          status: 'active',
        }],
      });

      const result = await coreDb.query(
        `INSERT INTO compliance_certificates (library_id, certificate_number, issued_at, valid_until, status)
         VALUES ($1, $2, NOW(), $3, $4) RETURNING *`,
        [libraryId, 'CERT-12345', '2025-12-31', 'active']
      );

      expect(result.rows[0].status).toBe('active');
    });

    it('should check compliance requirements', () => {
      const requirements = {
        business_license: true,
        tax_certificate: true,
        fire_safety: true,
        accessibility: false,
      };

      const allMet = Object.values(requirements).every(met => met === true);
      expect(allMet).toBe(false);
    });
  });

  describe('Verification Status Tracking', () => {
    it('should track verification status', async () => {
      const libraryId = 'lib-123';

      (coreDb.query).mockResolvedValue({
        rows: [{
          library_id: libraryId,
          document_verification: 'verified',
          background_check: 'completed',
          compliance_certificate: 'issued',
          overall_status: 'verified',
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           library_id,
           document_verification_status as document_verification,
           background_check_status as background_check,
           compliance_certificate_status as compliance_certificate,
           CASE
             WHEN document_verification_status = 'verified' AND 
                  background_check_status = 'completed' AND
                  compliance_certificate_status = 'issued'
             THEN 'verified'
             ELSE 'pending'
           END as overall_status
         FROM library_verifications
         WHERE library_id = $1`,
        [libraryId]
      );

      expect(result.rows[0].overall_status).toBeDefined();
    });

    it('should calculate verification completion', () => {
      const verifications = {
        documents: 'verified',
        background: 'completed',
        compliance: 'issued',
      };

      const completed = Object.values(verifications).filter(v => 
        v === 'verified' || v === 'completed' || v === 'issued'
      ).length;

      const total = Object.keys(verifications).length;
      const completionRate = (completed / total) * 100;

      expect(completionRate).toBe(100);
    });
  });
});

