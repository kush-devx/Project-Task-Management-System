"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { authReady, login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authReady && user) {
      router.replace("/dashboard");
    }
  }, [authReady, router, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data.accessToken, response.data.user);
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Login failed. Please try again."
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-88px)] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-lg border border-blue-100 bg-blue-50 p-10 text-slate-800 shadow-xl lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-700">
            Secure Team Workflow
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight text-slate-900">
            Sign in to continue building your project collaboration workspace.
          </h1>
          <div className="mt-10 space-y-4 text-slate-600">
            <p>Track project milestones, assign ownership, and keep discussions in context.</p>
            <p>Use AI carefully to improve task descriptions and generate initial work breakdowns.</p>
            <p>Keep progress, deadlines, and team coordination easy to scan.</p>
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Welcome Back
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">Login</h2>
          <p className="mt-3 text-slate-600">
            Access your dashboard, project board, invitations, and team chat.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Enter your password"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Need an account?{" "}
            <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Create one here
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
