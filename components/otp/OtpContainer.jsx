"use client";
import { motion } from "framer-motion";
import OtpInputs from "./OtpInputs";
import StatusMessage from "@/components/common/StatusMessage";
import useOtpLogic from "./useOtpLogic";

export default function OtpContainer() {
  const {
    otp,
    timeLeft,
    message,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleSubmit,
    handleBackToLogin,
    inputRefs,
  } = useOtpLogic();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0e1116] via-[#14171d] to-[#1b1f27] flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md bg-[#13161c]/70 backdrop-blur-xl border border-[#2f333d] rounded-3xl p-8 shadow-xl"
        initial={{ rotateY: 180, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-semibold text-white mb-2">
          Enter Verification Code
        </h2>

        <p className="text-gray-400 text-sm mb-6">
          Please enter the 6-digit code sent to your email
        </p>

        {message.text && <StatusMessage message={message} />}

        <form onSubmit={handleSubmit} onPaste={handlePaste}>
          {/* OTP Inputs */}
          <OtpInputs
            otp={otp}
            inputRefs={inputRefs}
            handleChange={handleChange}
            handleKeyDown={handleKeyDown}
          />

          {/* Timer */}
          <p className="text-gray-400 text-sm mb-6 text-center">
            {timeLeft > 0 ? (
              <>
                Code expires in{" "}
                <span
                  className={
                    timeLeft <= 10
                      ? "text-yellow-400 font-medium"
                      : "text-gray-300"
                  }
                >
                  {timeLeft}s
                </span>
              </>
            ) : (
              <span className="text-red-400 font-medium">Code expired</span>
            )}
          </p>

          {/* Submit / Back */}
          {timeLeft > 0 ? (
            <motion.button
              type="submit"
              className="w-full bg-gray-100 hover:bg-white text-black py-3 rounded-xl font-medium transition-all active:scale-95"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              Verify OTP
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleBackToLogin}
              className="w-full bg-[#1b1f27] border border-[#2f333d] text-gray-200 py-3 rounded-xl hover:bg-[#222835] transition-all"
            >
              Back to Login
            </motion.button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
