"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateProjectForm from "../../components/CreateProjectForm";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  deadline?: string;
  domain?: string;
  progress?: number;
  techStack?: string[];
  taskSummary?: {
    total: number;
    completed: number;
    todo: number;
    review: number;
    inProgress?: number;
    ["in-progress"]?: number;
  };
}

const statusStyle: Record<string, string> = {
  planning: "bg-slate-100 text-slate-700",
  "in-progress": "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  "on-hold": "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const router = useRouter();
  const { authReady, user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get("/projects");
      setProjects(response.data);
      setError("");
    } catch (error: unknown) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to load projects."
          : "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    fetchProjects();
  }, [authReady, router, user]);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;

    return projects.filter((project) =>
      [project.title, project.description, project.domain]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term))
    );
  }, [projects, search]);

  const dashboardStats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (project) => project.status === "in-progress"
    ).length;
    const completedTasks = projects.reduce(
      (sum, project) => sum + (project.taskSummary?.completed || 0),
      0
    );
    const pendingTasks = projects.reduce(
      (sum, project) =>
        sum +
        ((project.taskSummary?.total || 0) - (project.taskSummary?.completed || 0)),
      0
    );

    return { totalProjects, activeProjects, completedTasks, pendingTasks };
  }, [projects]);

  if (!authReady) {
    return <div className="px-6 py-12 text-slate-500">Preparing your workspace...</div>;
  }

  return (
    <main className="px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-[2rem] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-700">
              Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-900">
              Welcome back{user?.name ? `, ${user.name}` : ""}.
            </h1>
            <p className="mt-4 max-w-2xl text-slate-600">
              Monitor active work, keep team execution visible, and make delivery
              progress easier to understand.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total Projects", value: dashboardStats.totalProjects },
                { label: "Active Projects", value: dashboardStats.activeProjects },
                { label: "Tasks Completed", value: dashboardStats.completedTasks },
                { label: "Tasks Pending", value: dashboardStats.pendingTasks },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] bg-white/85 p-5 shadow-sm">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card rounded-[2rem] p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">
                  Quick Access
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Project actions
                </h2>
              </div>
              <Link
                href="/dashboard/invitations"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Review invites
              </Link>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <p>Create a project with domain, stack, and deadline details.</p>
              <p>Open a project to manage tasks, team members, discussion, and AI planning.</p>
              <p>Use progress and status indicators to make your demo easier to follow.</p>
            </div>
          </div>
        </section>

        <section className="section-card rounded-[2rem] p-8">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              New Workspace
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create a project</h2>
          </div>
          <CreateProjectForm onProjectCreated={fetchProjects} />
        </section>

        <section className="section-card rounded-[2rem] p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Portfolio View
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your projects</h2>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or domain"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 md:max-w-sm"
            />
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-[1.75rem] bg-slate-100" />
              ))}
            </div>
          ) : filteredProjects.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => {
                const totalTasks = project.taskSummary?.total || 0;
                const completedTasks = project.taskSummary?.completed || 0;
                const progress =
                  totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <article
                    key={project._id}
                    className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">{project.domain || "other"}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyle[project.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">
                      {project.description}
                    </p>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-emerald-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {(project.techStack || []).slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                      <span>
                        {totalTasks} tasks / {completedTasks} done
                      </span>
                      <span>
                        {project.deadline
                          ? new Date(project.deadline).toLocaleDateString()
                          : "No deadline"}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/project/${project._id}`)}
                    className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Open project workspace
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-lg font-semibold text-slate-800">No matching projects found</p>
              <p className="mt-2 text-sm text-slate-500">
                Try a different keyword or create a new project above.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
