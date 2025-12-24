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
  socket.on("createRoom", (user, res) => {
    try {
      const roomId = Math.random().toString(36).substring(2, 10);
      rooms[roomId] = {
        users: [{ id: user.id, name: user.name }],
      };
      rooms[roomId].host = user.id;
      rooms[roomId].estimations = {};
      rooms[roomId].cards = tempCards;
      socket.data = { roomId, name: user.name };
      socket.join(roomId);
      // socket.emit("roomCreated", { roomId });
      res({ success: true, roomId: roomId });
      console.log(`Room ${roomId} created by user ${user.name}`);
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("error", {
        message: "Failed to create room",
        error: error.message,
      });
      res({ error: "Error creating room" });
    }
  });

  socket.on("joinRoom", (user, res) => {
    if (!validateRoomExists(socket, user.roomId)) return;

    try {
      if (
        rooms[user.roomId].users.some((u) => u.name === user.name)
      ) {
        socket.emit("error", {
          message: "Username already taken in this room",
        });
        res({ success: false, error: "Username already taken in this room" });
        return;
      }
      if (
        rooms[user.roomId].users.some((u) => u.id === user.id)
      ) {
        socket.emit("error", { message: "User already in room" });
        res({ success: false, error: "User already in room" });
        return;
      }

      rooms[data.roomId].users.push({
        id: data.id,
        name: data.name,
      });
      socket.data = {
        roomId: data.roomId,
        id: data.id,
        name: data.name,
      };
      socket.join(data.roomId);
      socket
        .to(user.roomId)
        .emit("userJoined", { id: user.id, name: user.name });
      console.log(`User ${user.name} joined room ${user.roomId}`);
      res({ success: true });
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", {
        message: "Failed to join room",
        error: error.message,
      });
      res({ success: false, error: "Error joining room" });
    }
  });
}
