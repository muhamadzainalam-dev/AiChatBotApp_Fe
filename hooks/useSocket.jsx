import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://aichatbot-be-44hu.onrender.com");

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
