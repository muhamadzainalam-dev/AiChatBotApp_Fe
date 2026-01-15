"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import SocialLogin from "./SocialLogin";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const router = useRouter();

  // Toggle between Login & Signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage({ text: "", type: "" });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const endpoint = isLogin ? "login" : "signup";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(
        `https://aichatbot-be-44hu.onrender.com/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          text: data.message || "Something went wrong",
          type: "error",
        });
        return;
      }

      // On success, save email and redirect to OTP
      localStorage.setItem("pendingEmail", email);
      setMessage({
        text: "OTP Sent To Your Email. Proceed To Verify.",
        type: "success",
      });
      setTimeout(() => router.push("/screens/OTP"), 1200);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Server error. Try again later.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0e1116] via-[#14171d] to-[#1b1f27] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#13161c]/70 backdrop-blur-xl border border-[#2f333d] rounded-3xl p-8 shadow-xl"
      >
        <h1 className="text-2xl font-semibold text-white mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          {isLogin
            ? "Login to continue your experience"
            : "Start your personalized experience"}
        </p>

        {/* Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-lg text-sm text-center border ${
              message.type === "success"
                ? "bg-green-500/10 text-green-400 border-green-400"
                : "bg-red-500/10 text-red-400 border-red-400"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Login/Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-[#1b1f27]/70 border border-[#2f333d] rounded-xl text-gray-100 placeholder-gray-500 outline-none"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-4 pr-4 py-3 bg-[#1b1f27]/70 border border-[#2f333d] rounded-xl text-gray-100 placeholder-gray-500 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-4 pr-4 py-3 bg-[#1b1f27]/70 border border-[#2f333d] rounded-xl text-gray-100 placeholder-gray-500 outline-none"
            required
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-white text-black py-3 rounded-xl font-medium transition-all active:scale-95"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#2f333d]"></div>
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-[#2f333d]"></div>
        </div>

        {/* Social Login */}
        <SocialLogin />

        {/* Toggle Mode */}
        <p className="text-gray-400 text-sm text-center mt-6">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={toggleMode}
                className="text-[#6b72ff] hover:underline cursor-pointer"
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={toggleMode}
                className="text-[#6b72ff] hover:underline cursor-pointer"
              >
                Login
              </span>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
