"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useUserIdentity } from "@/hooks/useUserIdentity";
import { Loader, CalendarCheck2, Trash2 } from "lucide-react";

export default function UserMenu({ onClearChat }) {
  const { identityName, identityEmail, identityLoading } = useUserIdentity();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (identityLoading) return <Loader className="text-white spin" />;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full border border-[#2d313a] bg-[#1f232b]
        shadow-sm flex items-center justify-center hover:bg-[#262b35]"
      >
        {!open ? (
          <div className="bg-[#e57373] w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
            {identityName?.charAt(0).toUpperCase()}
          </div>
        ) : (
          <span className="text-gray-300 text-xl font-bold">×</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-68 bg-[#14171d]/90 backdrop-blur-xl
            border border-[#2f333d] rounded-2xl shadow-xl z-50 px-4 py-3"
          >
            {/* Profile */}
            <Link href="/screens/Profile">
              <div
                className="flex items-center gap-3 pb-3 mb-2
              border-b border-[#2a2f38] cursor-pointer"
              >
                <div className="bg-[#e57373] w-9 h-9 rounded-full flex items-center justify-center font-bold text-white">
                  {identityName?.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="text-gray-200 text-sm font-semibold leading-tight truncate">
                    {identityName}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    @{identityEmail}
                  </p>
                </div>
              </div>
            </Link>

            {/* Menu Item */}
            <Link href="/screens/schedule">
              <div
                className="flex items-center gap-3 px-2 py-2
              rounded-xl cursor-pointer hover:bg-[#1f232b]"
              >
                <CalendarCheck2 className="w-4 h-4 text-gray-300" />
                <p className="text-gray-300 text-sm">Manage Schedule</p>
              </div>
            </Link>

            {/* Clear Chat */}
            <button
              onClick={() => {
                onClearChat();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-2 py-2 mt-1
  rounded-xl text-gray-300 text-sm hover:bg-[#1f232b]"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
