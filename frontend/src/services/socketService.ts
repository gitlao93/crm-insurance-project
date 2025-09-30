// src/services/socketService.js
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Initialize and connect
export const connectSocket = (url = "http://localhost:3001"): Socket => {
  if (!socket) {
    socket = io(url);

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
export const getSocket = () => {
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
