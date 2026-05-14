import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') || '' },
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
    });
  }
  return socketInstance;
}

export function resetSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function useSocket() {
  const socket = useRef(null);

  useEffect(() => {
    const s = getSocket();
    socket.current = s;
    if (!s.connected) {
      s.auth = { token: localStorage.getItem('token') || '' };
      s.connect();
    }
    return () => {};
  }, []);

  const emit = useCallback((event, data) => {
    if (socket.current?.connected) socket.current.emit(event, data);
  }, []);

  const on = useCallback((event, cb) => {
    const s = getSocket();
    s.on(event, cb);
    return () => s.off(event, cb);
  }, []);

  const off = useCallback((event, cb) => {
    getSocket().off(event, cb);
  }, []);

  return { socket: socket.current || getSocket(), emit, on, off };
}
