"use client";

import { useState } from "react";
import axios from "axios";
import api from "../services/api";

interface Props {
  onProjectCreated: () => void;
}

const domainOptions = [
  "web",
  "mobile",
  "ml",
  "data-science",
  "iot",
  "blockchain",
  "ar-vr",
  "other",
];

export default function CreateProjectForm({ onProjectCreated }: Props) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    domain: "web",
    techStack: "",
    githubUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await api.post("/projects", {
        ...form,
        techStack: form.techStack
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setForm({
        title: "",
        description: "",
        deadline: "",
        domain: "web",
        techStack: "",
        githubUrl: "",
      });
      setMessage("Project created successfully.");
      onProjectCreated();
    } catch (error: unknown) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Error creating project"
          : "Error creating project"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-700">Project title</span>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          placeholder="Team collaboration workspace"
          required
        />
      </label>

      <label className="block md:col-span-2">
        <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          placeholder="Describe the project problem, user goals, and core deliverables."
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Domain</span>
        <select
          name="domain"
          value={form.domain}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          {domainOptions.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Deadline</span>
        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Tech stack</span>
        <input
          type="text"
          name="techStack"
          value={form.techStack}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          placeholder="Next.js, Node.js, MongoDB"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">GitHub URL</span>
        <input
          type="url"
          name="githubUrl"
          value={form.githubUrl}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          placeholder="https://github.com/username/repo"
        />
      </label>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 md:col-span-2">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
      >
        {loading ? "Creating project..." : "Create Project"}
      </button>
    </form>
  );
}
