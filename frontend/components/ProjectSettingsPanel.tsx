"use client";

import axios from "axios";
import { useState } from "react";
import api from "../services/api";

interface Props {
  projectId: string;
  currentUserRole?: string;
  initialStatus: string;
  initialDeadline?: string;
  initialProgress?: number;
  onProjectUpdated: () => Promise<void> | void;
}

const projectStatuses = [
  "planning",
  "in-progress",
  "completed",
  "on-hold",
  "cancelled",
];

export default function ProjectSettingsPanel({
  projectId,
  currentUserRole,
  initialStatus,
  initialDeadline,
  initialProgress = 0,
  onProjectUpdated,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [deadline, setDeadline] = useState(
    initialDeadline ? initialDeadline.slice(0, 10) : ""
  );
  const [progress, setProgress] = useState(initialProgress);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isOwner = currentUserRole === "owner";

  const saveProjectSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOwner) {
      setError("Only the project owner can update project settings.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      await api.put(`/projects/${projectId}`, {
        status,
        deadline: deadline || undefined,
        progress,
      });

      setMessage("Project settings updated.");
      await onProjectUpdated();
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to update project settings."
          : "Failed to update project settings."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-card rounded-lg p-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Project Controls
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">Status and timeline</h2>
      </div>

      <form onSubmit={saveProjectSettings} className="mt-5 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={!isOwner}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
          >
            {projectStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Deadline</span>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={!isOwner}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
            Progress
            <span className="font-semibold text-blue-700">{progress}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            disabled={!isOwner}
            className="w-full accent-blue-600 disabled:opacity-60"
          />
        </label>

        {!isOwner && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You can view project settings. Owner access is required to edit them.
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={!isOwner || loading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save project settings"}
        </button>
      </form>
    </section>
  );
}
