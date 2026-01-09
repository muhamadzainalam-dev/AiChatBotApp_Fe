"use client";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function SocialLogin() {
  const router = useRouter();

  // Send Google token to backend
  const sendUserInfo = async (tokenResponse) => {
    try {
      const res = await fetch("http://localhost:8000/googlelogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokenResponse),
      });

      const data = await res
        .json()
        .catch(() => ({ message: "Invalid response" }));

      if (!res.ok) return alert(data.message || "Verification failed");

      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: sendUserInfo,
    onError: () => console.log("Google login failed"),
  });

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Google Login */}
      <button
        onClick={handleGoogleLogin}
        className="w-full text-center py-3 rounded-xl font-medium bg-[#4285F4] text-white hover:bg-[#357ae8] transition-colors duration-200 shadow-md"
      >
        Continue with Google
      </button>

      {/* Facebook Login */}
      <button className="w-full text-center py-3 rounded-xl font-medium bg-[#1877F2] text-white hover:bg-[#145dbf] transition-colors duration-200 shadow-md">
        Continue with Facebook
      </button>
    </div>
  );
}
