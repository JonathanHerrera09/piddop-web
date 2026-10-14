import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/services/http';

function getSocketUrl() {
  return API_URL.replace(/\/api\/v\d+\/?$/, '');
}

export function createWebSocketClient(accessToken: string): Socket {
  return io(getSocketUrl(), {
    auth: { token: accessToken },
    transports: ['websocket', 'polling']
  });
}
