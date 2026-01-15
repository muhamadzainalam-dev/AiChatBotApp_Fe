"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [bgColor, setBgColor] = useState("#666");
  const [uploading, setUploading] = useState(false);

  // Generate consistent color from string
  const stringToColor = (str) => {
    if (!str) return "#888";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 65%, 55%)`;
  };

  // Read token safely
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/screens/Auth");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  // Verify token
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await fetch(
          "https://aichatbot-be-44hu.onrender.com/tokenverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        if (!res.ok) {
          router.push("/screens/Auth");
        }
      } catch (err) {
        router.push("/screens/Auth");
      }
    };

    verifyToken();
  }, [token, router]);

  // Fetch user details
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(
          "https://aichatbot-be-44hu.onrender.com/userdetails",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        const result = await res.json();
        const user = result.userDetails;

        setData(user);
        setBgColor(stringToColor(user?.email || user?.name));

        if (result.imagePath?.imageURL) {
          setProfileImage(result.imagePath.imageURL);
        }
      } catch (err) {
        console.error("User fetch failed", err);
      }
    };

    fetchUser();
  }, [token]);

  // Upload profile image
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);
    formData.append("token", token);

    try {
      setUploading(true);
      const res = await fetch("https://aichatbot-be-44hu.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setProfileImage(result.imageURL);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      setPreviewImage(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/screens/Auth");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0e1116] via-[#14171d] to-[#1b1f27] flex items-center justify-center px-4">
      {data ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-[#13161c]/70 backdrop-blur-xl border border-[#2f333d] rounded-3xl p-8 shadow-xl text-gray-200"
        >
          {/* Title */}
          <div className="flex items-center gap-2 py-4 rounded-xl">
            <Link
              href={"/"}
              className="p-2 hover:bg-opacity-40 rounded-full transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              My Profile
            </h1>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {profileImage ? (
                <motion.img
                  src={previewImage || profileImage}
                  alt={data.name}
                  whileHover={{ scale: 1.05 }}
                  className="w-28 h-28 rounded-full object-cover border border-[#2f333d]"
                />
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-28 h-28 rounded-full flex items-center justify-center 
              text-3xl font-semibold text-white border border-[#2f333d]"
                  style={{ backgroundColor: bgColor }}
                >
                  {data.name?.charAt(0).toUpperCase()}
                </motion.div>
              )}

              {/* Edit Button */}
              <label className="absolute bottom-2 right-2 bg-white text-black p-2 rounded-full cursor-pointer shadow-md hover:scale-105 transition">
                <i className="fas fa-pencil-alt text-xs"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-gray-400 text-sm mt-3">
              {uploading ? "Uploading..." : "Change Photo"}
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-6">
            <div className="bg-[#1b1f27]/70 border border-[#2f333d] px-4 py-3 rounded-xl">
              <p className="text-gray-400 text-xs">Full Name</p>
              <p className="text-white text-sm">{data.name}</p>
            </div>

            <div className="bg-[#1b1f27]/70 border border-[#2f333d] px-4 py-3 rounded-xl">
              <p className="text-gray-400 text-xs">Email</p>
              <p className="text-white text-sm">{data.email}</p>
            </div>

            <div className="bg-[#1b1f27]/70 border border-[#2f333d] px-4 py-3 rounded-xl">
              <p className="text-gray-400 text-xs">Joined On</p>
              <p className="text-white text-sm">
                {data.join_Date
                  ? new Date(data.join_Date).toLocaleDateString("en-GB")
                  : "N/A"}
              </p>
            </div>

            <div className="bg-[#1b1f27]/70 border border-[#2f333d] px-4 py-3 rounded-xl">
              <p className="text-gray-400 text-xs">Subscribed</p>
              <p className="text-green-400 text-sm">Yes</p>
            </div>
          </div>

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition font-medium"
          >
            Logout
          </motion.button>
        </motion.div>
      ) : (
        <div className="text-gray-300 text-sm">Loading user data...</div>
      )}
    </div>
  );
}
