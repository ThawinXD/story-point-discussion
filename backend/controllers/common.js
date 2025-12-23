import { rooms } from "../io.js";

export function validateRoomExists(socket, roomId) {
  if (!rooms[roomId]) {
    socket.emit("error", { message: "Room not found" });
    return false;
  }
  return true;
}
