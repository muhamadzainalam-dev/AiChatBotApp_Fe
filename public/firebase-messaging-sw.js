importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBfZTRa3GjtAr7YCWybVNWnh6nSKYi7V34",
  projectId: "aichatbot-lotaai",
  storageBucket: "aichatbot-lotaai.firebasestorage.app",
  messagingSenderId: "618100827904",
  appId: "1:618100827904:web:1230ceda1b8be285f275e5",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/notification-icon.png",
    badge: "/badge.png",

    // SOUND
    sound: "/alarm.mp3",

    // Persistent (doesn't auto close)
    requireInteraction: true,

    // High visibility
    vibrate: [300, 200, 300, 200, 300],

    data: {
      url: "/screens/schedule",
    },
  });
});
