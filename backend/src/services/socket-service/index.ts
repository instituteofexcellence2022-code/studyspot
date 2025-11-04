/**
 * 🔴 REAL-TIME WEBSOCKET SERVICE
 * 
 * Enables real-time bidirectional communication between:
 * - Student Portal
 * - Owner Portal
 * - Admin Portal
 * 
 * Features:
 * - Instant booking notifications
 * - Live pricing updates
 * - Real-time library changes
 * - Live seat availability
 */

import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

interface SocketUser {
  userId?: string;
  role?: string;
  tenantId?: string;
}

export class SocketService {
  private io: Server;
  private userSockets: Map<string, Socket> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'https://studyspot-librarys.vercel.app',
          'https://studyspot-student.vercel.app',
          'https://main.studyspot-student.pages.dev',
          'https://studyspot-student.pages.dev',
          /\.vercel\.app$/,
          /\.pages\.dev$/,
        ],
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();
    console.log('✅ WebSocket Service initialized');
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      
      const socketUser: SocketUser = {};

      // Handle user authentication
      socket.on('authenticate', (data: { userId: string; role: string; tenantId?: string }) => {
        socketUser.userId = data.userId;
        socketUser.role = data.role;
        socketUser.tenantId = data.tenantId;
        
        this.userSockets.set(data.userId, socket);
        
        console.log(`✅ User authenticated: ${data.userId} (${data.role})`);
      });

      // Join role-based room
      socket.on('join:role', (role: string) => {
        socket.join(`role:${role}`);
        socketUser.role = role;
        console.log(`👤 ${socket.id} joined room: role:${role}`);
      });

      // Join library-specific room
      socket.on('join:library', (libraryId: string) => {
        socket.join(`library:${libraryId}`);
        console.log(`🏢 ${socket.id} joined room: library:${libraryId}`);
      });

      // Join tenant-specific room
      socket.on('join:tenant', (tenantId: string) => {
        socket.join(`tenant:${tenantId}`);
        socketUser.tenantId = tenantId;
        console.log(`🏛️ ${socket.id} joined room: tenant:${tenantId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        if (socketUser.userId) {
          this.userSockets.delete(socketUser.userId);
        }
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });

      // Heartbeat for connection monitoring
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  // ============================================
  // BOOKING EVENTS
  // ============================================

  /**
   * Emit when a new booking is created
   * Notifies: Library owners, staff
   */
  public emitBookingCreated(booking: any) {
    console.log('📢 Emitting booking:created', booking.id);
    
    // Notify all library owners and staff
    this.io.to('role:library_owner').emit('booking:created', booking);
    this.io.to('role:staff').emit('booking:created', booking);
    this.io.to('role:front_desk').emit('booking:created', booking);
    
    // Notify specific library room
    if (booking.libraryId) {
      this.io.to(`library:${booking.libraryId}`).emit('booking:created', booking);
    }

    // Notify specific tenant
    if (booking.tenantId) {
      this.io.to(`tenant:${booking.tenantId}`).emit('booking:created', booking);
    }
  }

  /**
   * Emit when a booking is updated
   * Notifies: Everyone involved
   */
  public emitBookingUpdated(booking: any) {
    console.log('📢 Emitting booking:updated', booking.id);
    
    // Broadcast to everyone
    this.io.emit('booking:updated', booking);

    // Notify the student specifically
    if (booking.studentId && this.userSockets.has(booking.studentId)) {
      const studentSocket = this.userSockets.get(booking.studentId);
      studentSocket?.emit('booking:updated', booking);
    }
  }

  /**
   * Emit when a booking is cancelled
   * Notifies: Owners and the student
   */
  public emitBookingCancelled(bookingId: string, booking: any) {
    console.log('📢 Emitting booking:cancelled', bookingId);
    
    this.io.emit('booking:cancelled', { id: bookingId, booking });
    
    // Notify student
    if (booking.studentId && this.userSockets.has(booking.studentId)) {
      const studentSocket = this.userSockets.get(booking.studentId);
      studentSocket?.emit('booking:cancelled', { id: bookingId, booking });
    }
  }

  /**
   * Emit when a student is checked in
   * Notifies: The student
   */
  public emitBookingCheckIn(booking: any) {
    console.log('📢 Emitting booking:checkin', booking.id);
    
    this.io.emit('booking:checkin', booking);
    
    // Notify student specifically
    if (booking.studentId && this.userSockets.has(booking.studentId)) {
      const studentSocket = this.userSockets.get(booking.studentId);
      studentSocket?.emit('booking:checkin', {
        bookingId: booking.id,
        message: 'You have been checked in!',
        booking,
      });
    }
  }

  /**
   * Emit when a student is checked out
   * Notifies: The student
   */
  public emitBookingCheckOut(booking: any) {
    console.log('📢 Emitting booking:checkout', booking.id);
    
    this.io.emit('booking:checkout', booking);
    
    // Notify student
    if (booking.studentId && this.userSockets.has(booking.studentId)) {
      const studentSocket = this.userSockets.get(booking.studentId);
      studentSocket?.emit('booking:checkout', {
        bookingId: booking.id,
        message: 'You have been checked out!',
        booking,
      });
    }
  }

  // ============================================
  // LIBRARY EVENTS
  // ============================================

  /**
   * Emit when a new library is created
   * Notifies: All students
   */
  public emitLibraryCreated(library: any) {
    console.log('📢 Emitting library:created', library.id);
    
    this.io.to('role:student').emit('library:created', library);
  }

  /**
   * Emit when a library is updated
   * Notifies: All students and owners
   */
  public emitLibraryUpdated(library: any) {
    console.log('📢 Emitting library:updated', library.id);
    
    this.io.emit('library:updated', library);
  }

  /**
   * Emit when a library is deleted
   * Notifies: All students
   */
  public emitLibraryDeleted(libraryId: string) {
    console.log('📢 Emitting library:deleted', libraryId);
    
    this.io.to('role:student').emit('library:deleted', { id: libraryId });
  }

  // ============================================
  // PRICING EVENTS
  // ============================================

  /**
   * Emit when pricing/fee plans are updated
   * Notifies: All students
   */
  public emitPricingUpdated(libraryId: string, pricing: any) {
    console.log('📢 Emitting pricing:updated', libraryId);
    
    this.io.to('role:student').emit('pricing:updated', {
      libraryId,
      pricing,
    });
    
    this.io.to(`library:${libraryId}`).emit('pricing:updated', {
      libraryId,
      pricing,
    });
  }

  // ============================================
  // SEAT EVENTS
  // ============================================

  /**
   * Emit when seat availability changes
   * Notifies: Everyone in that library room
   */
  public emitSeatAvailability(libraryId: string, seatId: string, available: boolean) {
    console.log('📢 Emitting seat:availability', seatId, available);
    
    this.io.to(`library:${libraryId}`).emit('seat:availability', {
      seatId,
      available,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit batch seat availability updates
   */
  public emitBatchSeatAvailability(libraryId: string, seats: Array<{ id: string; available: boolean }>) {
    console.log('📢 Emitting batch seat:availability', seats.length, 'seats');
    
    this.io.to(`library:${libraryId}`).emit('seats:availability:batch', {
      seats,
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================
  // NOTIFICATION EVENTS
  // ============================================

  /**
   * Send notification to specific user
   */
  public sendNotification(userId: string, notification: {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    data?: any;
  }) {
    console.log('📢 Sending notification to user:', userId);
    
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit('notification', notification);
    }
  }

  /**
   * Broadcast notification to role
   */
  public broadcastToRole(role: string, event: string, data: any) {
    console.log(`📢 Broadcasting ${event} to role:${role}`);
    this.io.to(`role:${role}`).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcast(event: string, data: any) {
    console.log(`📢 Broadcasting ${event} to all`);
    this.io.emit(event, data);
  }

  // ============================================
  // CONNECTION STATS
  // ============================================

  /**
   * Get connection statistics
   */
  public async getStats() {
    const sockets = await this.io.fetchSockets();
    return {
      totalConnections: sockets.length,
      connectedUsers: this.userSockets.size,
      rooms: await this.getRooms(),
    };
  }

  private async getRooms() {
    const sockets = await this.io.fetchSockets();
    const rooms = new Set<string>();
    
    sockets.forEach((socket) => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          rooms.add(room);
        }
      });
    });
    
    return Array.from(rooms);
  }

  /**
   * Get Socket.io instance for advanced usage
   */
  public getIO(): Server {
    return this.io;
  }
}

// Singleton instance
export let socketService: SocketService | null = null;

/**
 * Initialize the Socket Service
 */
export function initializeSocketService(httpServer: HttpServer): SocketService {
  if (socketService) {
    console.log('⚠️ Socket Service already initialized');
    return socketService;
  }

  socketService = new SocketService(httpServer);
  console.log('✅ Socket Service initialized successfully');
  return socketService;
}

/**
 * Get the Socket Service instance
 */
export function getSocketService(): SocketService {
  if (!socketService) {
    throw new Error('Socket Service not initialized. Call initializeSocketService first.');
  }
  return socketService;
}

