"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useUserIdentity() {
  const identityRouter = useRouter();

  const [identityToken, setIdentityToken] = useState(null);
  const [identityName, setIdentityName] = useState("");
  const [identityEmail, setIdentityEmail] = useState("");
  const [identityLoading, setIdentityLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      identityRouter.push("/screens/Auth");
      return;
    }
    setIdentityToken(storedToken);
  }, [identityRouter]);

  useEffect(() => {
    if (!identityToken) return;

    const fetchIdentity = async () => {
      try {
        const res = await fetch("http://localhost:8000/userdetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: identityToken }),
        });

        const result = await res.json();
        const user = result?.userDetails;

        setIdentityName(user?.name || "");
        setIdentityEmail(user?.email || "");
      } catch (err) {
        identityRouter.push("/screens/Auth");
      } finally {
        setIdentityLoading(false);
      }
    };

    fetchIdentity();
  }, [identityToken, identityRouter]);

  return {
    identityName,
    identityEmail,
    identityLoading,
  };
}
