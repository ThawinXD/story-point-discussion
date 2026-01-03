import { rooms } from "../io.js";
import { io } from "../server.js";
import { validateRoomExists } from "./common.js";

export function cardController(socket) {
  socket.on("updateCards", (data, res) => {
    if (!validateRoomExists(socket, data.roomId)) return;

    try {
      if (data.cards.findIndex((card) => card == null || card === "") !== -1) {
        socket.emit("error", { message: "Cards cannot be empty" });
        res({ success: false, error: "Cards cannot be empty" });
        return;
      }
      
      // console.log("Updating cards:", data.cards);
      console.log("Updating cards in room:", data.roomId);
      rooms[data.roomId].cards = data.cards;;
      socket.to(data.roomId).emit("cardsUpdated", { cards: data.cards });
      res({ success: true });
    }
    catch (error) {
      console.error("Error updating cards:", error);
      socket.emit("error", {
        message: "Failed to update cards",
        error: error.message,
      });
      res({ success: false, error: "Error updating cards" });
    }
  });

  socket.on("getCards", (data, res) => {
    try {
      if (!validateRoomExists(socket, data.roomId)) {
        res({ success: false, error: "Room does not exist" });
        return;
      }
      res({ success: true, cards: rooms[data.roomId].cards });
    } catch (error) {
      console.error("Error in getCards:", error);
      socket.emit("error", {
        message: "Failed to get cards",
        error: error.message,
      });
      res({ success: false, error: "Failed to get cards" });
    }
  });
}
