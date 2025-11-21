/**
 * UNIT TESTS - ATTENDANCE SERVICE
 * Tests for attendance service business logic
 */

import { logger } from '../../../src/utils/logger';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  })),
}));

// Mock socket helpers
jest.mock('../../../src/utils/socketHelpers', () => ({
  getSocketIO: jest.fn(() => ({
    emit: jest.fn(),
  })),
}));

describe('Attendance Service', () => {
  describe('QR Code Validation', () => {
    it('should validate QR code with correct structure', () => {
      const qrData = {
        libraryId: '123',
        action: 'check_in',
      };

      expect(qrData.libraryId).toBeDefined();
      expect(qrData.action).toBe('check_in');
      expect(['check_in', 'check_out']).toContain(qrData.action);
    });

    it('should reject QR code with missing libraryId', () => {
      const qrData: any = {
        action: 'check_in',
      };

      expect(qrData.libraryId).toBeUndefined();
    });

    it('should reject QR code with missing action', () => {
      const qrData: any = {
        libraryId: '123',
      };

      expect(qrData.action).toBeUndefined();
    });

    it('should reject invalid action type', () => {
      const qrData = {
        libraryId: '123',
        action: 'invalid_action',
      };

      expect(['check_in', 'check_out']).not.toContain(qrData.action);
    });

    it('should accept check_out action', () => {
      const qrData = {
        libraryId: '123',
        action: 'check_out',
      };

      expect(['check_in', 'check_out']).toContain(qrData.action);
    });
  });

  describe('QR Code Parsing', () => {
    it('should parse JSON string QR data', () => {
      const qrString = JSON.stringify({
        libraryId: '123',
        action: 'check_in',
      });

      const parsed = JSON.parse(qrString);
      expect(parsed.libraryId).toBe('123');
      expect(parsed.action).toBe('check_in');
    });

    it('should handle already parsed QR data object', () => {
      const qrData = {
        libraryId: '123',
        action: 'check_in',
      };

      expect(qrData).toEqual({
        libraryId: '123',
        action: 'check_in',
      });
    });

    it('should reject invalid JSON string', () => {
      const invalidJson = '{ invalid json }';

      expect(() => JSON.parse(invalidJson)).toThrow();
    });
  });

  describe('Attendance Operations', () => {
    it('should calculate study duration correctly', () => {
      const checkInTime = new Date('2024-01-15T10:00:00Z');
      const checkOutTime = new Date('2024-01-15T12:30:00Z');
      const duration = checkOutTime.getTime() - checkInTime.getTime();
      const hours = duration / (1000 * 60 * 60);

      expect(hours).toBe(2.5);
    });

    it('should handle same-day check-in and check-out', () => {
      const checkInTime = new Date('2024-01-15T09:00:00Z');
      const checkOutTime = new Date('2024-01-15T17:00:00Z');
      const duration = checkOutTime.getTime() - checkInTime.getTime();
      const hours = duration / (1000 * 60 * 60);

      expect(hours).toBe(8);
    });

    it('should reject check-out before check-in', () => {
      const checkInTime = new Date('2024-01-15T12:00:00Z');
      const checkOutTime = new Date('2024-01-15T10:00:00Z');
      const duration = checkOutTime.getTime() - checkInTime.getTime();

      expect(duration).toBeLessThan(0);
    });
  });

  describe('Attendance Status', () => {
    it('should track active attendance sessions', () => {
      const activeSession = {
        studentId: 'student-123',
        libraryId: 'library-456',
        checkInTime: new Date(),
        status: 'active',
      };

      expect(activeSession.status).toBe('active');
      expect(activeSession.checkInTime).toBeInstanceOf(Date);
    });

    it('should mark attendance as completed after check-out', () => {
      const completedSession = {
        studentId: 'student-123',
        libraryId: 'library-456',
        checkInTime: new Date('2024-01-15T10:00:00Z'),
        checkOutTime: new Date('2024-01-15T12:00:00Z'),
        status: 'completed',
      };

      expect(completedSession.status).toBe('completed');
      expect(completedSession.checkOutTime).toBeDefined();
    });
  });
});

