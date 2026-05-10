"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const features = [
  "Role-based project collaboration for owners, managers, and contributors",
  "AI-assisted task breakdown and writing support for project teams",
  "Project chat, invitations, deadlines, and progress tracking in one place",
];

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen px-6 pb-16 pt-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
        <section className="flex-1">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-4 py-2 text-sm text-emerald-800 shadow-sm">
            <span className="status-dot bg-emerald-500" />
            Modern project collaboration workspace
          </div>

          <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-tight text-slate-900 md:text-6xl">
            Plan, manage, and deliver collaborative projects with clarity.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            ProjectFlow helps teams coordinate projects, assign work,
            review progress, and use AI thoughtfully to improve planning and execution.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              {user ? "Go to Dashboard" : "Create an Account"}
            </Link>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              {user ? "Open Workspace" : "Sign In"}
            </Link>
          </div>
        </section>

        <section className="glass-panel flex-1 rounded-[2rem] p-8">
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div
                key={feature}
                className="section-card rounded-3xl p-5"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                  Capability {index + 1}
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-900">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
