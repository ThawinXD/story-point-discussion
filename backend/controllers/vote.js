import { rooms } from "../io.js";
import { io } from "../server.js";
import { validateRoomExists } from "./common.js";

function result(socket, data, estimations) {
  const votes = new Map();
  for (const [id, vote] of estimations.entries()) {
    if (!votes.has(vote)) votes.set(vote, 1);
    else votes.set(vote, votes.get(vote) + 1);
  }

  const sortedVotes = Array.from(votes.entries()).sort((a, b) => b[1] - a[1]);

  // socket.emit("estimationResult", { votes: Object.fromEntries(votes) });
  rooms[data.roomId].resultCard = sortedVotes;
  io.to(data.roomId).emit("voteResult", {
    votes: sortedVotes,
  });
  // console.log(sortedVotes);
}

export function voteController(socket) {
  socket.on("startVote", (data, res) => {
    try {
      if (!validateRoomExists(socket, data.roomId)) {
        res({ success: false, error: "Room does not exist" });
        return;
      }

      if (rooms[data.roomId].host !== data.user.id) {
        socket.emit("error", { message: "Only the host can start vote" });
        return;
      }

      rooms[data.roomId].estimations = new Map();
      rooms[data.roomId].revealed = false;
      rooms[data.roomId].canVote = true;

      io.to(data.roomId).emit("voteStarted");
      res({ success: true });
      console.log(
        `Vote started in room ${data.roomId} by host ${data.user.id}`
      );
    } catch (error) {
      console.error("Error in startVote:", error);
      socket.emit("error", {
        message: "Failed to start vote",
        error: error.message,
      });
      res({ success: false, error: "Failed to start vote" });
    }
  });

  socket.on("vote", (data, res) => {
    try {
      if (!validateRoomExists(socket, data.roomId)) {
        res({ success: false, error: "Room does not exist" });
        return;
      }
      if (!rooms[data.roomId].canVote) {
        res({ success: false, error: "Voting is not allowed at this time" });
        return;
      }
      if (data.vote === null || data.vote === undefined) {
        res({ success: false, error: "Invalid vote value" });
        return;
      }

      const hasRevealed = rooms[data.roomId].revealed;
      const hasVoted =
        rooms[data.roomId].estimations.get(data.user.id) !== undefined;

      rooms[data.roomId].users.find(user => user.id === data.user.id).isVoted = true;
      rooms[data.roomId].estimations.set(data.user.id, data.vote);
      if (!hasRevealed && !hasVoted)
        socket.to(data.roomId).emit("userVoted", { name: data.user.name });
      if (hasRevealed) {
        socket.to(data.roomId).emit("changeVoted", {
          user: {
            name: data.user.name,
            isVoted: true,
          },
          vote: data.vote,
        });
        result(socket, data, rooms[data.roomId].estimations);
      }

      console.log(`User ${data.user.id} voted in room ${data.roomId}`);
      res({ success: true });
    } catch (error) {
      console.error("Error in vote:", error);
      socket.emit("error", {
        message: "Failed to record vote",
        error: error.message,
      });
      res({ success: false, error: "Failed to record vote" });
    }
  });

  socket.on("revealVotes", (data, res) => {
    try {
      if (!validateRoomExists(socket, data.roomId)) {
        res({ success: false, error: "Room does not exist" });
        return;
      }
      if (rooms[data.roomId].host !== data.user.id) {
        socket.emit("error", { message: "Only the host can reveal votes" });
        return;
      }

      let estimations = [];
      for (const [userId, vote] of rooms[data.roomId].estimations.entries()) {
        const name =
          rooms[data.roomId].users.find((user) => user.id === userId)?.name ||
          "Unknown";
        estimations.push({ name, vote });
      }
      console.log(estimations);

      io.to(data.roomId).emit("voteReviewed", estimations);
      rooms[data.roomId].revealed = true;
      result(socket, data, rooms[data.roomId].estimations);
      console.log(
        `Votes revealed in room ${data.roomId} by host ${data.user.id}`
      );

      res({ success: true });
    } catch (error) {
      console.error("Error in revealVotes:", error);
      socket.emit("error", {
        message: "Failed to reveal votes",
        error: error.message,
      });
      res({ success: false, error: "Failed to reveal votes" });
    }
  });

  socket.on("resetVote", (data, res) => {
    try {
      if (!validateRoomExists(socket, data.roomId)) {
        res({ success: false, error: "Room does not exist" });
        return;
      }
      if (rooms[data.roomId].host !== data.user.id) {
        socket.emit("error", { message: "Only the host can reset vote" });
        return;
      }
      rooms[data.roomId].users.forEach((user) => {
        user.isVoted = false;
      });
      rooms[data.roomId].estimations = new Map();
      rooms[data.roomId].revealed = false;
      rooms[data.roomId].canVote = false;
      io.to(data.roomId).emit("voteReset");
      console.log(`Vote reset in room ${data.roomId} by host ${data.user.id}`);
      res({ success: true });
    } catch (error) {
      console.error("Error in resetVote:", error);
      socket.emit("error", {
        message: "Failed to reset vote",
        error: error.message,
      });
      res({ success: false, error: "Failed to reset vote" });
    }
  });
}
