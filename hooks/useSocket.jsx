import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

export default function useSocket(email, onReminder) {
  useEffect(() => {
    if (!email) return;

    socket.emit("join", email);

    socket.on("reminder", onReminder);

    return () => {
      socket.off("reminder");
    };
  }, [email]);
}
