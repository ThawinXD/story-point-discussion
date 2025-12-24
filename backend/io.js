import { roomController } from "./controllers/room.js";
import { voteController } from "./controllers/vote.js";
import { messageController } from "./controllers/sendMessage.js";
import { cardController } from "./controllers/editCard.js";

export const rooms = {};
export const users = new Map();

export function initializeSocketHandlers(io) {
  function cleanupSocket(socket) {
    const { roomId, userId } = socket.data || {};
    if (!roomId || !userId) return;

    const room = rooms[roomId];
    if (!room) return;

    const isHost = room.host === userId;
    room.users = (room.users || []).filter((user) => user.userId !== userId);
    if (room.estimations) {
      delete room.estimations[userId];
    }

    if (isHost) {
      io.to(roomId).emit("roomClosed");
      delete rooms[roomId];
    } else {
      socket.to(roomId).emit("userLeft", { userId });
      if (room.users.length === 0) {
        delete rooms[roomId];
      }
    }

    users.delete(socket.id);
  }

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    users.set(socket.id, {connectedAt: new Date()});

    roomController(socket);

    voteController(socket);

    messageController(socket);

    cardController(socket);

    socket.on("disconnect", () => {
      cleanupSocket(socket);
      console.log("User disconnected");
    });
  });
}
