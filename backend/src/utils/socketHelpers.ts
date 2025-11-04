/**
 * Socket Helper Functions
 * Easy-to-use functions to emit real-time events from anywhere in the backend
 */

import type { Server as SocketIOServer } from 'socket.io';

// Store the Socket.io instance globally
let io: SocketIOServer | null = null;

export function setSocketIO(ioInstance: SocketIOServer) {
  io = ioInstance;
  console.log('✅ Socket.io instance registered globally');
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

// ============================================
// BOOKING EVENTS
// ============================================

export function emitBookingCreated(booking: any) {
  if (!io) return;
  
  console.log('📢 [Socket] booking:created', booking.id);
  
  // Notify owners and staff
  io.to('role:library_owner').emit('booking:created', booking);
  io.to('role:staff').emit('booking:created', booking);
  io.to('role:front_desk').emit('booking:created', booking);
  
  // Notify library-specific room
  if (booking.libraryId) {
    io.to(`library:${booking.libraryId}`).emit('booking:created', booking);
  }
}

export function emitBookingUpdated(booking: any) {
  if (!io) return;
  
  console.log('📢 [Socket] booking:updated', booking.id);
  io.emit('booking:updated', booking);
}

export function emitBookingCancelled(bookingId: string, booking?: any) {
  if (!io) return;
  
  console.log('📢 [Socket] booking:cancelled', bookingId);
  io.emit('booking:cancelled', { id: bookingId, booking });
}

export function emitBookingCheckIn(booking: any) {
  if (!io) return;
  
  console.log('📢 [Socket] booking:checkin', booking.id);
  io.emit('booking:checkin', booking);
}

export function emitBookingCheckOut(booking: any) {
  if (!io) return;
  
  console.log('📢 [Socket] booking:checkout', booking.id);
  io.emit('booking:checkout', booking);
}

// ============================================
// LIBRARY EVENTS
// ============================================

export function emitLibraryCreated(library: any) {
  if (!io) return;
  
  console.log('📢 [Socket] library:created', library.id);
  io.to('role:student').emit('library:created', library);
}

export function emitLibraryUpdated(library: any) {
  if (!io) return;
  
  console.log('📢 [Socket] library:updated', library.id);
  io.emit('library:updated', library);
}

export function emitLibraryDeleted(libraryId: string) {
  if (!io) return;
  
  console.log('📢 [Socket] library:deleted', libraryId);
  io.to('role:student').emit('library:deleted', { id: libraryId });
}

// ============================================
// PRICING EVENTS
// ============================================

export function emitPricingUpdated(libraryId: string, pricing: any) {
  if (!io) return;
  
  console.log('📢 [Socket] pricing:updated', libraryId);
  
  io.to('role:student').emit('pricing:updated', {
    libraryId,
    pricing,
    timestamp: new Date().toISOString(),
  });
  
  io.to(`library:${libraryId}`).emit('pricing:updated', {
    libraryId,
    pricing,
    timestamp: new Date().toISOString(),
  });
}

// ============================================
// SEAT EVENTS
// ============================================

export function emitSeatAvailability(libraryId: string, seatId: string, available: boolean) {
  if (!io) return;
  
  console.log('📢 [Socket] seat:availability', seatId, available);
  
  io.to(`library:${libraryId}`).emit('seat:availability', {
    seatId,
    available,
    timestamp: new Date().toISOString(),
  });
}

// ============================================
// GENERIC NOTIFICATION
// ============================================

export function sendNotification(userId: string, notification: {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
}) {
  if (!io) return;
  
  console.log('📢 [Socket] Notification to user:', userId);
  
  // Send to all sockets of this user
  io.to(`user:${userId}`).emit('notification', notification);
}

export function broadcastToRole(role: string, event: string, data: any) {
  if (!io) return;
  
  console.log(`📢 [Socket] Broadcasting ${event} to role:${role}`);
  io.to(`role:${role}`).emit(event, data);
}

// ============================================
// CONNECTION STATS
// ============================================

export async function getSocketStats() {
  if (!io) return null;
  
  const sockets = await io.fetchSockets();
  const rooms = new Set<string>();
  
  sockets.forEach((socket) => {
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        rooms.add(room);
      }
    });
  });
  
  return {
    totalConnections: sockets.length,
    activeRooms: Array.from(rooms),
    timestamp: new Date().toISOString(),
  };
}

