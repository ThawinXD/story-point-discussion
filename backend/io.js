import { roomController } from "./controllers/room.js";
import { voteController } from "./controllers/vote.js";
import { messageController } from "./controllers/sendMessage.js";
import { cardController } from "./controllers/editCard.js";

export const rooms = {};
export const users = new Map();

export function initializeSocketHandlers(io) {
  function cleanupSocket(socket) {
    const { roomId, userId, userName } = { roomId: socket.data.roomId, userId: socket.id, userName: socket.data.name };
    if (!userId) return;
    users.delete(socket.id);

    const room = rooms[roomId];
    if (!room) {
      console.log(`Room ${roomId} not found during cleanup`);
      return;
    }

    const isHost = room.host === userId;
    room.users = (room.users || []).filter((user) => user.userId !== userId);
    if (room.estimations && room.estimations[userId]) {
      delete room.estimations[userId];
    }

    if (isHost) {
      io.to(roomId).emit("roomClosed");
      console.log(`Room ${roomId} closed as host disconnected`);
      delete rooms[roomId];
    } else {
      socket.to(roomId).emit("userLeft", { userName });
      if (room.users.length === 0) {
        delete rooms[roomId];
      }
    }

  }

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    users.set(socket.id, {connectedAt: new Date()});
    socket.data.id = socket.id;

    roomController(socket);

    voteController(socket);

    messageController(socket);

    cardController(socket);

    socket.on("disconnect", () => {
      console.log(`user ${socket.data.name} disconnected`);
      cleanupSocket(socket);
    });
  });
}
