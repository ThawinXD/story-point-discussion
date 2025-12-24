import { io } from "socket.io-client";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

const socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export default socket;