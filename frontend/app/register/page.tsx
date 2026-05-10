"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const roleOptions = ["member", "manager", "admin"];

export default function RegisterPage() {
  const router = useRouter();
  const { authReady, user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
    college: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authReady && user) {
      router.replace("/dashboard");
    }
  }, [authReady, router, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", form);
      setSuccess("Account created successfully. You can now log in.");
      setTimeout(() => router.push("/login"), 900);
    } catch (error: unknown) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Registration failed. Please try again."
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-88px)] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-panel rounded-[2rem] p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-600">
            Join the Workspace
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">
            Register your project workspace account
          </h1>
          <p className="mt-4 text-slate-600">
            Create a profile for team collaboration, project leadership, or admin access.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Your full name"
                required
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="teammember@college.edu"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Role</span>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Department</span>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Computer Science"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">College</span>
              <input
                name="college"
                value={form.college}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Your institution name"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Login here
            </Link>
          </p>
        </section>

        <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-8 text-slate-800 shadow-xl md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-700">
            Why this platform
          </p>
          <div className="mt-8 space-y-5">
            <div className="rounded-3xl border border-emerald-100 bg-white p-5">
              <h2 className="text-2xl font-semibold">Complete project workflow</h2>
              <p className="mt-2 text-slate-600">
                Show structured authentication, project ownership, task control,
                and collaboration patterns that map directly to professional product expectations.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-white p-5">
              <h2 className="text-2xl font-semibold">Better presentation quality</h2>
              <p className="mt-2 text-slate-600">
                Cleaner information architecture and stronger status communication make
                your product easier to use and evaluate.
              </p>
            </div>
          </div>
        </section>
      </div>