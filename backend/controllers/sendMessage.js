import { rooms } from "../io.js";
import { io } from "../server.js";
import { validateRoomExists } from "./common.js";

export function messageController(socket) {
  socket.on("sendMessage", (data) => {
    if (!validateRoomExists(socket, data.roomId)) return;

    try {
      io.to(data.roomId).emit("newMessage", {
        name: data.name,
        message: data.message,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", {
        message: "Failed to send message",
        error: error.message,
      });
    }
  });
}
