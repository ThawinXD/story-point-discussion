"use client";
import { useEffect, useState } from "react";

export default function RoomPage() {
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const readHash = () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      setRoomId(hash ? hash.substring(1) : null);
    };

    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  return (
    <div>
      <p>Room Page</p>
      {roomId ? (
        <p>Room ID: {roomId}</p>
      ) : (
        <p>No Room ID found in URL.</p>
      )}
    </div>
  );
}