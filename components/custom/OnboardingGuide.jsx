"use client";
import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Settings2, User, Bot } from "lucide-react";

const steps = [
  {
    type: "founder",
    title: "Meet the Founder",
    icon: <User size={26} />,
    points: [
      "Built by a solo developer focused on real-life productivity problems.",
      "Inspired by daily struggles with reminders, focus, and time.",
      "This assistant is crafted to feel personal, simple, and useful.",
    ],
  },
  {
    title: "How to Use This App",
    icon: <ArrowRight size={26} />,
    points: [
      "Chat naturally — no commands or syntax needed.",
      "Set reminders like you talk to a person.",
      "Your conversations stay private and secure.",
    ],
  },
  {
    title: "What This App Does",
    icon: <Settings2 size={26} />,
    points: [
      "Creates smart reminders automatically.",
      "Notifies you even when the app is closed.",
      "Keeps your tasks and thoughts organized.",
    ],
  },
  {
    title: "How AI Helps You Daily",
    icon: <Bot size={26} />,
    points: [
      "Remembers things so your brain doesn’t have to.",
      "Acts like a calm personal assistant.",
      "Helps you focus on life — not managing apps.",
    ],
  },
];

export default function OnboardingGuide() {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_seen");
    if (!seen) {
      setShow(true);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const nextStep = () => {
    if (step === steps.length - 1) {
      localStorage.setItem("onboarding_seen", "true");
      setShow(false);
      document.body.style.overflow = "auto";
    } else {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (!show) return null;

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
      <div className="w-full max-w-md md:max-w-lg rounded-2xl border border-[#2f333d] bg-[#1b1f27]/90 backdrop-blur-xl shadow-2xl p-6 md:p-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 text-gray-200">
          <div className="p-2 rounded-xl bg-[#232732] border border-[#2f333d]">
            {current.icon}
          </div>
          <h2 className="text-lg md:text-xl font-semibold">{current.title}</h2>
        </div>

        {/* Founder Card */}
        {current.type === "founder" && (
          <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-[#232732]/60 border border-[#2f333d]">
            <img
              src="/developer.jpg"
              alt="Founder"
              className="w-14 h-14 rounded-full object-cover border border-[#2f333d]"
            />
            <div>
              <p className="text-sm font-medium text-gray-200">
                Muhammad Zain Alam
              </p>
              <p className="text-xs text-gray-400">
                Founder & Full-Stack Developer
              </p>
            </div>
          </div>
        )}

        {/* Points */}
        <ul className="space-y-3 text-sm md:text-base text-gray-300 leading-relaxed">
          {current.points.map((point, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Step {step + 1} of {steps.length}
          </span>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-1 rounded-full border border-[#2f333d] px-4 py-2 text-sm text-gray-300 hover:bg-[#232732]"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            )}

            <button
              onClick={nextStep}
              className="flex items-center gap-2 rounded-full bg-[#e57373] hover:bg-[#F63049] text-black font-medium px-5 py-2 transition"
            >
              {step === steps.length - 1 ? "Start Using App" : "Next"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
