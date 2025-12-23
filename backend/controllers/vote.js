import { rooms, io } from "../io.js";
import { validateRoomExists } from "./common.js";

function result(socket, data, estimations) {
  const votes = new Map();
  for (const [userId, vote] of Object.entries(estimations)) {
    if (!votes.has(vote)) votes.set(vote, 1);
    else votes.set(vote, votes.get(vote) + 1);
  }

  socket.emit("estimationResult", { votes: Object.fromEntries(votes) });
  socket
    .to(data.roomId)
    .emit("estimationResult", { votes: Object.fromEntries(votes) });
}

export function voteController(socket) {
  socket.on("startVote", (data) => {
    try {
      if (!validateRoomExists(socket, data.roomId)) return;

      if (rooms[data.roomId].host !== data.userId) {
        socket.emit("error", { message: "Only the host can start vote" });
        return;
      }

      rooms[data.roomId].estimations = { revealed: false };

      io.to(data.roomId).emit("voteStarted");
      console.log(`Vote started in room ${data.roomId} by host ${data.userId}`);
    } catch (error) {
      console.error("Error in startVote:", error);
      socket.emit("error", {
        message: "Failed to start vote",
        error: error.message,
      });
    }
  });

  socket.on("vote", (data) => {
    try {
      if (!validateRoomExists(socket, data.roomId)) return;

      const hasRevealed = rooms[data.roomId].estimations.revealed;
      const hasVoted =
        rooms[data.roomId].estimations[data.userId] !== undefined;

      rooms[data.roomId].estimations[data.userId] = data.vote;

      if (!hasRevealed && !hasVoted)
        io.to(data.roomId).emit("userVoted", { userId: data.userId });
      if (hasRevealed) {
        io.to(data.roomId).emit("changeVote", {
          userId: data.userId,
          vote: data.vote,
        });
        result(socket, data, rooms[data.roomId].estimations);
      }

      console.log(`User ${data.userId} voted in room ${data.roomId}`);
    } catch (error) {
      console.error("Error in vote:", error);
      socket.emit("error", {
        message: "Failed to record vote",
        error: error.message,
      });
    }
  });

  socket.on("revealVotes", (data) => {
    try {
      if (!validateRoomExists(socket, data.roomId)) return;
      if (rooms[data.roomId].host !== data.userId) {
        socket.emit("error", { message: "Only the host can reveal votes" });
        return;
      }

      const estimations = rooms[data.roomId].estimations;
      io.to(data.roomId).emit("votesRevealed", { estimations });
      rooms[data.roomId].estimations.revealed = true;
      result(socket, data, rooms[data.roomId].estimations);
      console.log(
        `Votes revealed in room ${data.roomId} by host ${data.userId}`
      );
    } catch (error) {
      console.error("Error in revealVotes:", error);
      socket.emit("error", {
        message: "Failed to reveal votes",
        error: error.message,
      });
    }
  });
}
