import { rooms } from "../io.js";
import { io } from "../server.js";
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
        users: [{ id: user.id, name: user.name, isVoted: false }],
      };
      rooms[roomId].host = user.id;
      rooms[roomId].estimations = new Map();
      rooms[roomId].cards = tempCards;
      rooms[roomId].revealed = false;
      rooms[roomId].resultCard = null;
      rooms[roomId].canVote = false;
      socket.data.roomId = roomId;
      socket.data.name = user.name;
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

    socket.data.name = data.user.name;

    try {
      if (
        rooms[data.roomId].users.some(
          (u) => u.id === data.user.id && u.name === data.user.name
        )
      ) {
        socket.emit("error", { message: "User already in room" });
        res({ success: true, action: 1, error: "User already in room" });
        console.log(`User ${data.user.name} already in room ${data.roomId}`);
        return;
      }

      if (rooms[data.roomId].users.some((u) => u.name === data.user.name)) {
        socket.emit("error", {
          message: "Username already taken in this room",
        });
        res({
          success: false,
          action: 0,
          error: "Username already taken in this room",
        });
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
        isVoted: false,
      });
      socket.data.roomId = data.roomId;
      socket.data.name = data.user.name;
      socket.join(data.roomId);
      socket
        .to(data.roomId)
        .emit("userJoined", { name: data.user.name, isVoted: false });
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

  socket.on("getRoomData", (roomId, res) => {
    if (!validateRoomExists(socket, roomId)) {
      res({ success: false, error: "Room does not exist" });
      return;
    }

    try {
      let estimations = [];
      if (rooms[roomId].estimations.length !== 0 && rooms[roomId].revealed) {
        estimations = Array.from(
          rooms[roomId].estimations,
          ([userId, vote]) => {
            const name =
              rooms[roomId].users.find((user) => user.id === userId)?.name ||
              "Unknown";
            return { name, vote };
          }
        );
      }

      // console.log("estimations", estimations);

      const room = rooms[roomId];
      let result = {
        roomId: roomId,
        users: room.users
          ? room.users.map((user) => {
              return { name: user.name, isVoted: user.isVoted };
            })
          : [],
        host:
          rooms[roomId].users.find((user) => user.id === room.host)?.name ||
          null,
        cards: room.cards,
        revealed: room.revealed,
        estimations: estimations,
        resultCard: room.resultCard,
        canVote: room.canVote,
      };
      res({ success: true, room: result });
    } catch (error) {
      console.error("Error getting room data:", error);
      socket.emit("error", {
        message: "Failed to get room data",
        error: error.message,
      });
      res({ success: false, error: "Error getting room data" });
    }
  });

  socket.on("kickUser", (name, res) => {
    const { roomId } = socket.data;
    if (!validateRoomExists(socket, roomId)) {
      res({ success: false, error: "Room does not exist" });
      return;
    }

    if (rooms[roomId].host !== socket.data.id) {
      socket.emit("error", { message: "Only the host can kick users" });
      res({ success: false, error: "Only the host can kick users" });
      return;
    }

    try {
      const userToKick = rooms[roomId].users.find((user) => user.name === name);
      if (!userToKick) {
        res({ success: false, error: "User not found in room" });
        return;
      }
      rooms[roomId].users = rooms[roomId].users.filter(
        (user) => user.name !== name
      );
      socket.to(roomId).emit("userKicked", { name: name });
      console.log(`User ${name} was kicked from room ${roomId}`);
      res({ success: true });
    } catch (error) {
      console.error("Error kicking user:", error);
      socket.emit("error", {
        message: "Failed to kick user",
        error: error.message,
      });
      res({ success: false, error: "Error kicking user" });
    }
  });

  socket.on("leaveRoom", (data, res) => {
    const { roomId, name, id } = socket.data;
    console.log(roomId, name, id);
    if (!validateRoomExists(socket, roomId)) {
      res({ success: false, error: "Room does not exist" });
      return;
    }
    try {
      socket.to(roomId).emit("userLeft", { name: name });
      console.log(`User ${name} left room ${roomId}`);
      socket.leave(roomId);
      rooms[roomId].users = rooms[roomId].users.filter(
        (user) => user.id !== id
      );
      
      if (rooms[roomId].host === id) {
        console.log("Host is leaving, closing room: ", roomId);
        io.to(roomId).emit("roomClosed");
        console.log(`Room ${roomId} closed as host left`);
        delete rooms[roomId];
      }
      else if (rooms[roomId].users.length === 0) {
        console.log("Last user left, deleting room: ", roomId);
        delete rooms[roomId];
      }
      res({ success: true });
    } catch (error) {
      console.error("Error leaving room:", error);
      socket.emit("error", {
        message: "Failed to leave room",
        error: error.message,
      });
      res({ success: false, error: "Error leaving room" });
    }
  });
}
