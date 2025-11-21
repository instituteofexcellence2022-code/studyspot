/**
 * UNIT TESTS - SOCKET HELPERS
 */

import {
  setSocketIO,
  getSocketIO,
  emitBookingCreated,
  emitBookingUpdated,
  emitBookingCancelled,
  emitBookingCheckIn,
  emitBookingCheckOut,
  emitLibraryCreated,
  emitLibraryUpdated,
  emitLibraryDeleted,
  emitPricingUpdated,
  emitSeatAvailability,
  sendNotification,
  broadcastToRole,
  getSocketStats,
} from '../../../src/utils/socketHelpers';

describe('Socket Helpers', () => {
  let mockIO: any;

  beforeEach(() => {
    mockIO = {
      to: jest.fn(() => mockIO),
      emit: jest.fn(),
      fetchSockets: jest.fn(),
    };
    setSocketIO(mockIO);
    jest.clearAllMocks();
  });

  describe('Socket IO Management', () => {
    it('should set and get socket IO instance', () => {
      const io = getSocketIO();
      expect(io).toBe(mockIO);
    });

    it('should return null if socket IO not set', () => {
      setSocketIO(null as any);
      const io = getSocketIO();
      expect(io).toBeNull();
    });
  });

  describe('Booking Events', () => {
    it('should emit booking created event', () => {
      const booking = { id: 'booking-123', libraryId: 'lib-123' };
      emitBookingCreated(booking);

      expect(mockIO.to).toHaveBeenCalledWith('role:library_owner');
      expect(mockIO.to).toHaveBeenCalledWith('role:staff');
      expect(mockIO.to).toHaveBeenCalledWith('role:front_desk');
      expect(mockIO.to).toHaveBeenCalledWith('library:lib-123');
      expect(mockIO.emit).toHaveBeenCalledWith('booking:created', booking);
    });

    it('should emit booking updated event', () => {
      const booking = { id: 'booking-123' };
      emitBookingUpdated(booking);

      expect(mockIO.emit).toHaveBeenCalledWith('booking:updated', booking);
    });

    it('should emit booking cancelled event', () => {
      const bookingId = 'booking-123';
      emitBookingCancelled(bookingId);

      expect(mockIO.emit).toHaveBeenCalledWith('booking:cancelled', {
        id: bookingId,
        booking: undefined,
      });
    });

    it('should emit booking check-in event', () => {
      const booking = { id: 'booking-123' };
      emitBookingCheckIn(booking);

      expect(mockIO.emit).toHaveBeenCalledWith('booking:checkin', booking);
    });

    it('should emit booking check-out event', () => {
      const booking = { id: 'booking-123' };
      emitBookingCheckOut(booking);

      expect(mockIO.emit).toHaveBeenCalledWith('booking:checkout', booking);
    });

    it('should not emit if socket IO is null', () => {
      setSocketIO(null as any);
      emitBookingCreated({ id: 'booking-123' });

      expect(mockIO.emit).not.toHaveBeenCalled();
    });
  });

  describe('Library Events', () => {
    it('should emit library created event', () => {
      const library = { id: 'lib-123' };
      emitLibraryCreated(library);

      expect(mockIO.to).toHaveBeenCalledWith('role:student');
      expect(mockIO.emit).toHaveBeenCalledWith('library:created', library);
    });

    it('should emit library updated event', () => {
      const library = { id: 'lib-123' };
      emitLibraryUpdated(library);

      expect(mockIO.emit).toHaveBeenCalledWith('library:updated', library);
    });

    it('should emit library deleted event', () => {
      const libraryId = 'lib-123';
      emitLibraryDeleted(libraryId);

      expect(mockIO.to).toHaveBeenCalledWith('role:student');
      expect(mockIO.emit).toHaveBeenCalledWith('library:deleted', { id: libraryId });
    });
  });

  describe('Pricing Events', () => {
    it('should emit pricing updated event', () => {
      const libraryId = 'lib-123';
      const pricing = { hourly: 50, daily: 300 };
      emitPricingUpdated(libraryId, pricing);

      expect(mockIO.to).toHaveBeenCalledWith('role:student');
      expect(mockIO.to).toHaveBeenCalledWith(`library:${libraryId}`);
      expect(mockIO.emit).toHaveBeenCalledWith('pricing:updated', expect.objectContaining({
        libraryId,
        pricing,
      }));
    });
  });

  describe('Seat Events', () => {
    it('should emit seat availability event', () => {
      const libraryId = 'lib-123';
      const seatId = 'seat-A1';
      emitSeatAvailability(libraryId, seatId, true);

      expect(mockIO.to).toHaveBeenCalledWith(`library:${libraryId}`);
      expect(mockIO.emit).toHaveBeenCalledWith('seat:availability', expect.objectContaining({
        seatId,
        available: true,
      }));
    });
  });

  describe('Notifications', () => {
    it('should send notification to user', () => {
      const userId = 'user-123';
      const notification = {
        type: 'info' as const,
        title: 'Test',
        message: 'Test message',
      };
      sendNotification(userId, notification);

      expect(mockIO.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIO.emit).toHaveBeenCalledWith('notification', notification);
    });

    it('should broadcast to role', () => {
      const role = 'student';
      const event = 'test-event';
      const data = { test: 'data' };
      broadcastToRole(role, event, data);

      expect(mockIO.to).toHaveBeenCalledWith(`role:${role}`);
      expect(mockIO.emit).toHaveBeenCalledWith(event, data);
    });
  });

  describe('Socket Stats', () => {
    it('should get socket statistics', async () => {
      const mockSockets = [
        {
          id: 'socket-1',
          rooms: new Set(['socket-1', 'role:student', 'library:lib-123']),
        },
        {
          id: 'socket-2',
          rooms: new Set(['socket-2', 'role:library_owner']),
        },
      ];

      mockIO.fetchSockets.mockResolvedValueOnce(mockSockets);

      const stats = await getSocketStats();

      expect(stats).toEqual({
        totalConnections: 2,
        activeRooms: ['role:student', 'library:lib-123', 'role:library_owner'],
        timestamp: expect.any(String),
      });
    });

    it('should return null if socket IO is null', async () => {
      setSocketIO(null as any);
      const stats = await getSocketStats();
      expect(stats).toBeNull();
    });
  });
});
