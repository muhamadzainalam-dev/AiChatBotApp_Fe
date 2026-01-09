"use client";
import { motion } from "framer-motion";

export default function OtpInputs({
  otp,
  inputRefs,
  handleChange,
  handleKeyDown,
}) {
  return (
    <div className="flex justify-between mb-6 gap-2">
      {otp.map((digit, i) => (
        <motion.input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          value={digit}
          maxLength={1}
          inputMode="numeric"
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-12 h-12 text-center text-gray-100 text-xl bg-[#1b1f27]/70 border border-[#2f333d] rounded-xl outline-none focus:ring-2 focus:ring-[#6b72ff]"
          whileFocus={{ scale: 1.1 }}
        />
      ))}
    </div>
  );
}
