"use client";
import { useState, useRef, useEffect } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import GlassChip from "./GlassChip";
import {
  Flower,
  Lightbulb,
  Image as ImageIcon,
  Search,
  Music,
  MoreHorizontal,
} from "lucide-react";
import UserMenu from "@/components/common/UserMenu";
import useSocket from "@/hooks/useSocket";
import { requestPushPermission } from "@/utils/pushNotifications";

export default function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  const [token, setToken] = useState(null);
  const [userdetails, setUserDetails] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [conversationId, setConversationId] = useState(null);

  const showNotification = (title, body) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/notification-icon.png", // optional
        badge: "/badge.png", // optional
      });
    }
  };

  // Socket setup
  useSocket(userdetails?.email, (data) => {
    // Show device/browser notification
    showNotification(`Reminder: ${data.title}`, data.description);

    // Add message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "bot",
        text: `Reminder: ${data.title} — ${data.description}`,
      },
    ]);
  });

  //  Scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //  Token
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  //  Conversation ID
  useEffect(() => {
    let storedConversationId = localStorage.getItem("conversationId");

    if (!storedConversationId) {
      storedConversationId = crypto.randomUUID();
      localStorage.setItem("conversationId", storedConversationId);
    }

    setConversationId(storedConversationId);
  }, []);

  //  Fetch user
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(
          "https://aichatbot-be-44hu.onrender.com/userdetails",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        const result = await res.json();
        setUserDetails(result.userDetails || null);
      } catch (err) {
        console.error("User fetch failed", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [token]);

  // Ask push notification permission
  useEffect(() => {
    if (!userdetails?.email) return;

    requestPushPermission(userdetails.email);
  }, [userdetails]);

  //  Load chat history
  useEffect(() => {
    if (!userdetails || !conversationId) return;

    const loadHistory = async () => {
      try {
        const res = await fetch(
          `https://aichatbot-be-44hu.onrender.com/history?email=${userdetails.email}&conversationId=${conversationId}`
        );

        const data = await res.json();

        if (data.success) {
          const formatted = data.messages.map((m, i) => ({
            id: i,
            text: m.content,
            sender: m.role === "user" ? "user" : "bot",
          }));

          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    loadHistory();
  }, [userdetails, conversationId]);

  //  Save message to DB
  const saveMessage = async (role, content) => {
    if (!userdetails || !conversationId) return;

    await fetch("https://aichatbot-be-44hu.onrender.com/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userdetails.email,
        conversationId,
        role,
        content,
      }),
    });
  };

  //  Send message
  const sendMessage = async (message) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    // Optimistic UI
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, sender: "user" },
    ]);

    await saveMessage("user", trimmed);

    try {
      const isReminder = /^set\b/i.test(trimmed);

      // Reminder flow
      if (isReminder) {
        if (!userdetails || loadingUser) {
          throw new Error("User not loaded yet");
        }

        const res = await fetch("/api/reminder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        const data = await res.json();
        if (data.error) throw new Error("Reminder parse failed");

        await fetch("https://aichatbot-be-44hu.onrender.com/addschedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userdetails.email,
            title: data.task_title,
            description: data.description,
            time_text: data.time_text,
          }),
        });

        const botReply =
          "Reminder created successfully. You can view, edit, or delete it in your Reminders.";

        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: botReply, sender: "bot" },
        ]);

        await saveMessage("assistant", botReply);
        return;
      }

      // Normal chat
      const payloadMessages = [
        {
          role: "system",
          content: `
You are a friendly, conversational AI assistant.
You remember details shared by the user (like their name) during this conversation.
Be natural, warm, and context-aware.
`,
        },
        ...messages.map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: trimmed },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      const data = await res.json();
      const reply = data.reply || data.message || "No response";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, text: reply, sender: "bot" },
      ]);

      await saveMessage("assistant", reply);
    } catch (err) {
      console.error(err);

      const errorMsg = "Something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 3, text: errorMsg, sender: "bot" },
      ]);

      await saveMessage("assistant", errorMsg);
    }
  };

  const clearChat = async () => {
    if (!userdetails || !conversationId) return;

    try {
      await fetch("https://aichatbot-be-44hu.onrender.com/clear-chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userdetails.email,
          conversationId,
        }),
      });

      // Clear UI
      setMessages([]);

      // Optional: start fresh conversation
      const newId = crypto.randomUUID();
      localStorage.setItem("conversationId", newId);
      setConversationId(newId);
    } catch (err) {
      console.error("Failed to clear chat", err);
    }
  };

  //  UI
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0e1116] via-[#14171d] to-[#1b1f27] relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex flex-col">
        <header className="flex justify-between items-center px-4 md:px-8 pt-6 pb-4">
          <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
            <Flower size={18} />
            <span>Assistant v0.0</span>
          </div>
          <UserMenu onClearChat={clearChat} />
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-14 pt-6 pb-40 scrollbar-hide">
          <MessageList messages={messages} bottomRef={bottomRef} />
        </div>

        <div className="fixed bottom-0 md:bottom-5 left-0 w-full px-4 md:px-14 pb-6 z-50">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1b1f27]/70 rounded-full md:rounded-[32px] border border-[#2f333d] backdrop-blur-xl p-3">
              <MessageInput onSend={sendMessage} />

              <div className="hidden md:flex flex-wrap gap-2 px-2 pb-1 mt-2">
                <GlassChip icon={Lightbulb} label="Deep Research" />
                <GlassChip icon={ImageIcon} label="Make an Image" />
                <GlassChip icon={Search} label="Search" />
                <GlassChip icon={Music} label="Create Music" />

                <div className="w-8 h-8 rounded-full bg-[#1f232b] border border-[#2f333d] flex items-center justify-center text-gray-300">
                  <MoreHorizontal size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
