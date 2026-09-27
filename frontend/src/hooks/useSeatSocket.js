import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSeatSocket = (eventId, onSeatsUpdated) => {
  const refresh = useCallback(() => {
    onSeatsUpdated?.();
  }, [onSeatsUpdated]);

  useEffect(() => {
    if (!eventId) return;

    const socket = io('/', { path: '/socket.io', transports: ['websocket', 'polling'] });
    socket.emit('joinEvent', eventId);
    socket.on('seatsUpdated', refresh);

    return () => {
      socket.emit('leaveEvent', eventId);
      socket.disconnect();
    };
  }, [eventId, refresh]);
};
