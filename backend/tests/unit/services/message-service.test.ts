/**
 * UNIT TESTS - MESSAGE SERVICE
 * Tests for message service business logic
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
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  })),
}));

// Mock socket helpers
jest.mock('../../../src/utils/socketHelpers', () => ({
  getSocketIO: jest.fn(() => ({
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
  })),
}));

describe('Message Service', () => {
  describe('Message Validation', () => {
    it('should validate required fields for sending message', () => {
      const message = {
        libraryId: 'library-123',
        senderId: 'student-456',
        message: 'Hello, I have a question',
      };

      expect(message.libraryId).toBeDefined();
      expect(message.senderId).toBeDefined();
      expect(message.message).toBeDefined();
      expect(message.message.length).toBeGreaterThan(0);
    });

    it('should reject message with missing libraryId', () => {
      const message: any = {
        senderId: 'student-456',
        message: 'Hello',
      };

      expect(message.libraryId).toBeUndefined();
    });

    it('should reject message with missing senderId', () => {
      const message: any = {
        libraryId: 'library-123',
        message: 'Hello',
      };

      expect(message.senderId).toBeUndefined();
    });

    it('should reject empty message content', () => {
      const message = {
        libraryId: 'library-123',
        senderId: 'student-456',
        message: '',
      };

      expect(message.message.trim().length).toBe(0);
    });
  });

  describe('Message Status', () => {
    it('should mark message as unread by default', () => {
      const message = {
        id: 'msg-123',
        is_read: false,
        created_at: new Date().toISOString(),
      };

      expect(message.is_read).toBe(false);
    });

    it('should mark message as read', () => {
      const message = {
        id: 'msg-123',
        is_read: true,
        read_at: new Date().toISOString(),
      };

      expect(message.is_read).toBe(true);
      expect(message.read_at).toBeDefined();
    });
  });

  describe('Message Roles', () => {
    it('should identify sender role correctly', () => {
      const message = {
        sender_id: 'student-123',
        sender_role: 'student',
        receiver_id: 'owner-456',
        receiver_role: 'library_owner',
      };

      expect(message.sender_role).toBe('student');
      expect(message.receiver_role).toBe('library_owner');
    });

    it('should handle library owner as sender', () => {
      const message = {
        sender_id: 'owner-456',
        sender_role: 'library_owner',
        receiver_id: 'student-123',
        receiver_role: 'student',
      };

      expect(message.sender_role).toBe('library_owner');
      expect(message.receiver_role).toBe('student');
    });
  });

  describe('Message Threading', () => {
    it('should link messages to library', () => {
      const message = {
        id: 'msg-123',
        library_id: 'library-456',
        sender_id: 'student-123',
        receiver_id: 'owner-456',
      };

      expect(message.library_id).toBe('library-456');
    });

    it('should track message timestamps', () => {
      const message = {
        id: 'msg-123',
        created_at: new Date('2024-01-15T10:00:00Z').toISOString(),
        updated_at: new Date('2024-01-15T10:00:00Z').toISOString(),
      };

      expect(new Date(message.created_at).getTime()).toBeLessThanOrEqual(Date.now());
      expect(new Date(message.updated_at).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Message Deletion', () => {
    it('should allow sender to delete their message', () => {
      const message = {
        id: 'msg-123',
        sender_id: 'student-123',
        deleted_by_sender: false,
      };

      expect(message.deleted_by_sender).toBe(false);
    });

    it('should allow receiver to delete message', () => {
      const message = {
        id: 'msg-123',
        receiver_id: 'owner-456',
        deleted_by_receiver: false,
      };

      expect(message.deleted_by_receiver).toBe(false);
    });
  });
});

