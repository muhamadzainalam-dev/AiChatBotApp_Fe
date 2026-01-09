"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import verifyToken from "@/utils/verifyToken";

export default function Page() {
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    verifyToken(router);
  }, [router]);

  return <AuthForm />;
}
