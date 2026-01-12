import { getMessaging, getToken } from "firebase/messaging";
import { app } from "../lib/firebase";

export const requestPushPermission = async (email) => {
  try {
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (!token) return;

    await fetch("http://localhost:8000/savepushtoken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });
  } catch (err) {
    console.error("Push setup failed", err);
  }
};
