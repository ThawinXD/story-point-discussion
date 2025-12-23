import { rooms } from "../io.js";
import { validateRoomExists } from "./common.js";

const tempCards = [
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "34",
  "55",
  "89",
  "?",
  "☕",
];

export function roomController(socket) {
  socket.on("createRoom", (data) => {
    try {
      const roomId = Math.random().toString(36).substring(2, 10);
      rooms[roomId] = {
        users: [{ userId: data.userId, userName: data.userName }],
      };
      rooms[roomId].host = data.userId;
      rooms[roomId].estimations = {};
      rooms[roomId].cards = tempCards;
      socket.data = { roomId, userId: data.userId, userName: data.userName };
      socket.join(roomId);
      socket.emit("roomCreated", { roomId });
      console.log(`Room ${roomId} created by user ${data.userName}`);
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("error", {
        message: "Failed to create room",
        error: error.message,
      });
    }
  });

  socket.on("joinRoom", (data) => {
    if (!validateRoomExists(socket, data.roomId)) return;

    try {
      if (
        rooms[data.roomId].users.some((user) => user.userName === data.userName)
      ) {
        socket.emit("error", {
          message: "Username already taken in this room",
        });
        return;
      }
      if (
        rooms[data.roomId].users.some((user) => user.userId === data.userId)
      ) {
        socket.emit("error", { message: "User already in room" });
        return;
      }

      rooms[data.roomId].users.push({
        userId: data.userId,
        userName: data.userName,
      });
      socket.data = {
        roomId: data.roomId,
        userId: data.userId,
        userName: data.userName,
      };
      socket.join(data.roomId);
      socket
        .to(data.roomId)
        .emit("userJoined", { userId: data.userId, userName: data.userName });
      console.log(`User ${data.userName} joined room ${data.roomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", {
        message: "Failed to join room",
        error: error.message,
      });
    }
  });
}
