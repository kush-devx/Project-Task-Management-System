"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        🚀 Collab Platform
      </h1>

      <button
        className="px-4 py-2 bg-red-500 text-white rounded"
        onClick={() => {
          logout();
          router.push("/login");
        }}
      >
        Logout
      </button>
    </nav>
  );
}