"use client";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageList({ messages, bottomRef }) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`flex items-start gap-3 ${
            msg.sender === "user" ? "justify-end" : ""
          }`}
        >
          <div
            className={`rounded-2xl text-sm ${
              msg.sender === "user"
                ? "px-4 py-3 bg-[#4f5bff]/20 text-gray-100"
                : "py-3 text-gray-200"
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-300">{children}</em>
                ),
                p: ({ children }) => (
                  <p className="leading-relaxed">{children}</p>
                ),
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="px-1 py-0.5 bg-black/40 rounded text-xs font-mono">
                      {children}
                    </code>
                  ) : (
                    <div className="my-2 rounded-lg bg-[#0b0f1a] border border-white/10">
                      <pre className="p-3 overflow-x-auto text-xs leading-relaxed">
                        <code className="font-mono text-gray-200 whitespace-pre">
                          {children}
                        </code>
                      </pre>
                    </div>
                  ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        </motion.div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
