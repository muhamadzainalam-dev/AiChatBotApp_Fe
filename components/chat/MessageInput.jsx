"use client";
import { useState, useRef } from "react";
import { Plus, Mic, Send } from "lucide-react";
import useVoiceRecognition from "./useVoiceRecognition";

export default function MessageInput({ onSend }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);
  const MAX_HEIGHT = 96;

  // Voice recognition hook
  const { isListening, toggleListening } = useVoiceRecognition(
    setInput,
    textareaRef,
    MAX_HEIGHT
  );

  // Auto-grow textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);

    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  // Send message on Enter
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim()) return;

      onSend(input);
      setInput("");

      textareaRef.current.style.height = "auto";
    }
  };

  // Send button click
  const send = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
    textareaRef.current.style.height = "auto";
  };

  return (
    <div className="flex items-center gap-3 pl-2 md:p-2">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKey}
        placeholder="Ask me anything..."
        rows={1}
        className="
          flex-1 w-full pl-3 resize-none bg-transparent
          text-gray-100 placeholder-gray-500 outline-none
          text-[15px] leading-6 min-h-[24px] max-h-[96px]
          overflow-y-auto transition-[height] duration-150 ease-out
          [scrollbar-width:none] [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      />

      {/* Mic Button */}
      <button
        onClick={toggleListening}
        className={`p-3 rounded-full border border-[#2f333d] shadow-sm transition-all
          ${
            isListening
              ? "bg-green-500 text-white"
              : "bg-[#1f232b] text-gray-400 hover:text-gray-200"
          }
        `}
      >
        <Mic size={20} />
      </button>

      {/* Send Button */}
      <button
        onClick={send}
        className="bg-gray-100 hover:bg-white text-black p-3 rounded-full active:scale-95 transition-all shadow-sm shrink-0"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
