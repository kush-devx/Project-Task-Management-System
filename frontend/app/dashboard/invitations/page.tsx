"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

interface Invite {
  _id: string;
  role: string;
  expiresAt: string;
  project: {
    _id: string;
    title: string;
    description: string;
    status?: string;
  };
  sender: {
    name: string;
    email: string;
    role?: string;
  };
}

export default function InvitationsPage() {
  const router = useRouter();
  const { authReady, refreshInviteCount, user } = useAuth();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/invitations/received");
      setInvites(response.data);
      setError("");
      await refreshInviteCount();
    } catch (error: unknown) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to fetch invitations."
          : "Failed to fetch invitations."
      );
    } finally {
      setLoading(false);
    }
  }, [refreshInviteCount]);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    fetchInvites();
  }, [authReady, fetchInvites, router, user]);

  const handleAction = async (inviteId: string, action: "accept" | "reject") => {
    try {
      setActionId(inviteId);
      await api.put(`/invitations/${inviteId}/${action}`);
      setInvites((prev) => prev.filter((invite) => invite._id !== inviteId));
      await refreshInviteCount();
    } catch (error: unknown) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || `Failed to ${action} invitation.`
          : `Failed to ${action} invitation.`
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-600">
            Collaboration Queue
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">
            Pending project invitations
          </h1>
          <p className="mt-4 text-slate-600">
            Review incoming invites, accept team access, or decline projects that do not match your role.
          </p>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-[1.75rem] bg-slate-100" />
            ))}
          </div>
        ) : invites.length ? (
          <div className="mt-6 space-y-5">
            {invites.map((invite) => (
              <article
                key={invite._id}
                className="section-card rounded-[1.75rem] p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-slate-900">
                        {invite.project.title}
                      </h2>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {invite.role}
                      </span>
                    </div>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                      {invite.project.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                      <span>From {invite.sender.name}</span>
                      <span>{invite.sender.email}</span>
                      <span>
                        Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleAction(invite._id, "accept")}
                      disabled={actionId === invite._id}
                      className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(invite._id, "reject")}
                      disabled={actionId === invite._id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => router.push(`/project/${invite.project._id}`)}
                      className="rounded-2xl border border-blue-600 bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Open project
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="section-card mt-6 rounded-[1.75rem] p-10 text-center">
            <p className="text-lg font-semibold text-slate-800">No pending invitations</p>
            <p className="mt-2 text-sm text-slate-500">
              When a project owner invites you, it will appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
