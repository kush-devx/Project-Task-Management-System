"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/invitations", label: "Invitations" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { authReady, inviteCount, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[#f5f7f4]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          className="text-left"
          onClick={() => router.push(user ? "/dashboard" : "/")}
        >
          <div className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
            ProjectFlow
          </div>
          <div className="text-xl font-semibold text-slate-900">
            Project Collaboration
          </div>
        </button>

        <div className="hidden items-center gap-3 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname === link.href
                  ? "bg-blue-100 text-blue-800"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {authReady && user ? (
            <>
              <button
                className="relative rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                onClick={() => router.push("/dashboard/invitations")}
              >
                Invitations
                {inviteCount > 0 && (
                  <span className="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-slate-900">
                    {inviteCount}
                  </span>
                )}
              </button>

              <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 sm:block">
                <span className="font-semibold text-slate-900">{user.name}</span>
                <span className="mx-2 text-slate-300">/</span>
                {user.role}
              </div>

              <button
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
