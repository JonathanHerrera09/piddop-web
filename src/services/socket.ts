import { io, type Socket } from "socket.io-client";
import { getApiUrl, getSocketUrl } from "@/lib/env";

export function createWebSocketClient(accessToken: string): Socket {
  const configuredUrl = getSocketUrl();
  const socketUrl = configuredUrl || getApiUrl().replace(/\/api\/v\d+\/?$/, "");
  return io(socketUrl, { auth: { token: accessToken }, transports: ["websocket", "polling"] });
}
