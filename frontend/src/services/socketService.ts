// src/services/socketService.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const globalListeners: Record<string, Function[]> = {};

// Initialize and connect
export const connectSocket = (url = "http://localhost:3001"): Socket => {
  if (!socket) {
    // get token from localStorage (adjust key if you store it elsewhere)
    const token =
      localStorage.getItem("token") ?? localStorage.getItem("authToken") ?? "";

    console.log("Connecting socket with token:", token);

    // attach token in auth payload (preferred) or query
    socket = io(url, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
    });
  }
  return socket;
};

// Get socket instance
export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error("Socket not connected! Call connectSocket() first.");
  }
  return socket;
};

// Disconnect
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const onGlobalSocket = (event: string, callback: Function) => {
  if (!globalListeners[event]) globalListeners[event] = [];
  globalListeners[event].push(callback);
  return () => {
    globalListeners[event] = globalListeners[event].filter(
      (cb) => cb !== callback
    );
  };
};
