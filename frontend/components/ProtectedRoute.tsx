"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authReady, userToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authReady && !userToken) {
      router.push("/login");
    }
  }, [authReady, router, userToken]);

  if (!authReady || !userToken) return null;

  return <>{children}</>;
}
