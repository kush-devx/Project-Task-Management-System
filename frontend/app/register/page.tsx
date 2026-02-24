"use client";
import axios from "axios";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";

export default function RegisterPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role: "admin",
      });

      alert("Registration successful!");
      router.push("/login");
    } catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    alert(error.response?.data?.message || "Registration failed");
  } else {
    alert("Registration failed");
  }
}
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}