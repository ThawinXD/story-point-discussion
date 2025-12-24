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
      socket.data = { roomId: roomId, name: user.name };
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

  socket.on("joinRoom", (data, res) => {
    if (!validateRoomExists(socket, data.roomId)) {
      res({ success: false, error: "Room does not exist" });
      return;
    }

    try {
      console.log("user", data.user);
      console.log("rooms[data.roomId].users", rooms[data.roomId].users);
      if (rooms[data.roomId].users.some((u) => u.id === data.user.id && u.name === data.user.name)) {
        socket.emit("error", { message: "User already in room" });
        res({ success: true, action: 1, error: "User already in room" });
        console.log(`User ${data.user.name} already in room ${data.roomId}`);
        return;
      }

      if (rooms[data.roomId].users.some((u) => u.name === data.user.name)) {
        socket.emit("error", {
          message: "Username already taken in this room",
        });
        res({ success: false, action: 0, error: "Username already taken in this room" });
        return;
      }

      if (rooms[data.roomId].users.some((u) => u.id === data.user.id)) {
        socket.emit("error", { message: "User already in room" });
        res({ success: false, error: "User already in room" });
        return;
      }

      rooms[data.roomId].users.push({
        id: data.user.id,
        name: data.user.name,
      });
      socket.data = {
        roomId: data.roomId,
        id: data.user.id,
        name: data.user.name,
      };
      socket.join(data.roomId);
      socket
        .to(data.roomId)
        .emit("userJoined", { id: data.user.id, name: data.user.name });
      console.log(`User ${data.user.name} joined room ${data.roomId}`);
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
