"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: any) {
  const { userToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userToken) {
      router.push("/login");
    }
  }, [userToken]);

  return children;
}