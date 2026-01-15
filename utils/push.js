import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBfZTRa3GjtAr7YCWybVNWnh6nSKYi7V34",
  projectId: "aichatbot-lotaai",
  storageBucket: "aichatbot-lotaai.firebasestorage.app",
  messagingSenderId: "618100827904",
  appId: "1:618100827904:web:1230ceda1b8be285f275e5",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestPushPermission = async (email) => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: "YOUR_VAPID_KEY",
  });

  if (!token) return;

  // Send token to backend
  await fetch("https://aichatbot-be-44hu.onrender.com/savepushtoken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });
};
