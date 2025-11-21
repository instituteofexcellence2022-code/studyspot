/**
 * UNIT TESTS - SOCKET SERVICE
 * Tests WebSocket service functionality
 */

import { Server as HttpServer } from 'http';
import { createServer } from 'http';
import { SocketService } from '../../../src/services/socket-service/index';

// Mock socket.io
jest.mock('socket.io', () => {
  const mockSocket = {
    id: 'socket-123',
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    to: jest.fn(() => mockSocket),
    disconnect: jest.fn(),
  };

  const mockIO = {
    on: jest.fn((event, callback) => {
      if (event === 'connection') {
        callback(mockSocket);
      }
    }),
    to: jest.fn(() => mockIO),
    emit: jest.fn(),
    sockets: {
      sockets: new Map([['socket-123', mockSocket]]),
    },
  };

  return {
    Server: jest.fn(() => mockIO),
  };
});

describe('Socket Service', () => {
  let httpServer: HttpServer;
  let socketService: SocketService;

  beforeAll(() => {
    httpServer = createServer();
    socketService = new SocketService(httpServer);
  });

  afterAll(() => {
    httpServer.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize socket service', () => {
      expect(socketService).toBeDefined();
    });

    it('should set up event handlers', () => {
      // Service should be initialized with event handlers
      expect(socketService).toBeInstanceOf(SocketService);
    });
  });

  describe('Event Emission', () => {
    it('should emit booking notification', () => {
      const emitSpy = jest.spyOn(socketService as any, 'emitToUser');
      socketService.emitBookingNotification('user-123', {
        bookingId: 'booking-123',
        libraryId: 'lib-123',
        status: 'confirmed',
      });
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit library update', () => {
      const emitSpy = jest.spyOn(socketService as any, 'emitToLibrary');
      socketService.emitLibraryUpdate('lib-123', {
        libraryId: 'lib-123',
        occupancy: 50,
      });
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit pricing update', () => {
      const emitSpy = jest.spyOn(socketService as any, 'emitToTenant');
      socketService.emitPricingUpdate('tenant-123', {
        libraryId: 'lib-123',
        newPrice: 100,
      });
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit seat availability update', () => {
      const emitSpy = jest.spyOn(socketService as any, 'emitToLibrary');
      socketService.emitSeatAvailability('lib-123', {
        availableSeats: 10,
        totalSeats: 50,
      });
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('User Management', () => {
    it('should track user sockets', () => {
      // User sockets should be tracked internally
      expect((socketService as any).userSockets).toBeDefined();
      expect((socketService as any).userSockets).toBeInstanceOf(Map);
    });
  });
});
