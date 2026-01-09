"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function useOtpLogic() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [email, setEmail] = useState(null);

  const inputRefs = useRef([]);
  const router = useRouter();

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/");

    const savedEmail = localStorage.getItem("pendingEmail");
    if (!savedEmail) router.push("/screens/Auth");
    else setEmail(savedEmail);
  }, [router]);

  // Focus first box
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft === 0) return;

    const t = setInterval(() => {
      setTimeLeft((x) => (x > 0 ? x - 1 : 0));
    }, 1000);

    return () => clearInterval(t);
  }, [timeLeft]);

  // Input typing
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = "";
      } else if (index > 0) {
        newOtp[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }

      setOtp(newOtp);
    }

    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();

    if (e.key === "ArrowRight" && index < 5)
      inputRefs.current[index + 1]?.focus();
  };

  // Paste full OTP
  const handlePaste = (e) => {
    e.preventDefault();

    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!paste) return;

    const newOtp = paste.split("");
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);

    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  // Submit verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const entered = otp.join("");

    if (entered.length < 6) {
      setMessage({ text: "Please enter all 6 digits", type: "error" });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, OTP: entered }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          text: data.message || "Verification failed",
          type: "error",
        });
        return;
      }

      localStorage.removeItem("pendingEmail");
      localStorage.setItem("token", data.token);

      setMessage({ text: "OTP verified successfully!", type: "success" });

      setTimeout(() => router.push("/"), 1500);
    } catch {
      setMessage({
        text: "Server error. Please try again later.",
        type: "error",
      });
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("pendingEmail");
    router.push("/auth");
  };

  return {
    otp,
    timeLeft,
    message,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleSubmit,
    handleBackToLogin,
    inputRefs,
  };
}
