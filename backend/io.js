import { Server } from "socket.io";
import { server } from "./server.js";
import { roomController } from "./controllers/room.js";
import { voteController } from "./controllers/vote.js";
import { messageController } from "./controllers/sendMessage.js";

const io = new Server(server);
export const rooms = {};

function cleanupSocket(socket) {
  const { roomId, userId } = socket.data || {};
  if (!roomId || !userId) return;

  const room = rooms[roomId];
  if (!room) return;

  const isHost = room.host === userId;
  room.users = (room.users || []).filter(user => user.userId !== userId);
  if (room.estimations) {
    delete room.estimations[userId];
  }

  if (isHost) {
    io.to(roomId).emit('roomClosed');
    delete rooms[roomId];
  } else {
    socket.to(roomId).emit('userLeft', { userId });
    if (room.users.length === 0) {
      delete rooms[roomId];
    }
  }
}

io.on('connection', (socket) => {
  console.log('A user connected');

  roomController(socket);

  voteController(socket);

  messageController(socket);

  socket.on('disconnect', () => {
    cleanupSocket(socket);
    console.log('User disconnected');
  });
});

export { io };