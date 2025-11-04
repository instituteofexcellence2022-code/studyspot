/**
 * 🔴 REAL-TIME WEBSOCKET HOOK - OWNER PORTAL
 * 
 * Connects Owner Portal to WebSocket server for real-time updates
 * 
 * Features:
 * - Auto-reconnection
 * - Role-based rooms (library_owner, staff, etc.)
 * - Connection status tracking
 * - Automatic cleanup
 * 
 * Usage:
 * ```tsx
 * const socket = useSocket('library_owner');
 * 
 * useEffect(() => {
 *   if (!socket) return;
 *   
 *   socket.on('booking:created', (booking) => {
 *     console.log('New booking:', booking);
 *   });
 *   
 *   return () => {
 *     socket.off('booking:created');
 *   };
 * }, [socket]);
 * ```
 */

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../constants';

const SOCKET_URL = process.env.REACT_APP_API_URL || API_CONFIG.BASE_URL || 'https://studyspot-api.onrender.com';

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
}

export function useSocket(role: string = 'library_owner'): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get auth token
    const token = localStorage.getItem('auth_token') || localStorage.getItem('studyspot_token');

    // Initialize Socket.io connection
    console.log('🔌 [Owner Portal] Initializing WebSocket connection to:', SOCKET_URL);
    
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], // Auto-fallback
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    // Connection successful
    socket.on('connect', () => {
      console.log('✅ [Owner Portal] WebSocket connected:', socket.id);
      setConnected(true);
      setError(null);
      
      // Join role-based room
      socket.emit('join:role', role);
      console.log(`👤 [Owner Portal] Joined room: role:${role}`);
    });

    // Connection error
    socket.on('connect_error', (err) => {
      console.error('❌ [Owner Portal] WebSocket connection error:', err.message);
      setConnected(false);
      setError(err.message);
    });

    // Disconnected
    socket.on('disconnect', (reason) => {
      console.log('🔌 [Owner Portal] WebSocket disconnected:', reason);
      setConnected(false);
      
      // Auto-reconnect for certain reasons
      if (reason === 'io server disconnect') {
        // Server forced disconnect, reconnect manually
        socket.connect();
      }
    });

    // Reconnection attempt
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 [Owner Portal] Reconnection attempt ${attemptNumber}...`);
    });

    // Reconnection successful
    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ [Owner Portal] Reconnected after ${attemptNumber} attempts`);
      setConnected(true);
      setError(null);
      
      // Re-join rooms
      socket.emit('join:role', role);
    });

    // Reconnection failed
    socket.on('reconnect_failed', () => {
      console.error('❌ [Owner Portal] Reconnection failed after maximum attempts');
      setError('Failed to reconnect to server');
    });

    // Heartbeat response
    socket.on('pong', (data) => {
      console.log('💓 [Owner Portal] Pong received:', data);
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 [Owner Portal] Cleaning up WebSocket connection');
      if (socket.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [role]);

  return {
    socket: socketRef.current,
    connected,
    error,
  };
}

/**
 * Hook for library-specific real-time updates
 */
export function useLibrarySocket(libraryId: string): UseSocketReturn {
  const { socket, connected, error } = useSocket('library_owner');

  useEffect(() => {
    if (socket && connected && libraryId) {
      console.log(`🏢 [Owner Portal] Joining library room: ${libraryId}`);
      socket.emit('join:library', libraryId);
    }
  }, [socket, connected, libraryId]);

  return { socket, connected, error };
}

/**
 * Send a test ping to check connection
 */
export function pingSocket(socket: Socket | null): void {
  if (socket && socket.connected) {
    socket.emit('ping');
    console.log('📡 [Owner Portal] Ping sent to server');
  }
}

