"use client";
import { motion } from "framer-motion";

export default function StatusMessage({ message }) {
  return (
    <motion.div
      className={`mb-4 p-3 rounded-lg text-sm text-center border ${
        message.type === "success"
          ? "bg-green-500/10 text-green-400 border-green-400"
          : "bg-red-500/10 text-red-400 border-red-400"
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {message.text}
    </motion.div>
  );
}
