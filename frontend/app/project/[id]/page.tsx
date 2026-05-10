"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CreateTaskForm from "../../../components/CreateTaskForm";
import ProjectChat from "../../../components/ProjectChat";
import ProjectSettingsPanel from "../../../components/ProjectSettingsPanel";
import TaskBoard from "../../../components/TaskBoard";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";

interface Member {
  user: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  role: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: { name: string } | null;
  comments?: Array<{ _id?: string; text: string; user?: { name: string } }>;
}

interface ProjectDetails {
  _id: string;
  title: string;
  description: string;
  status: string;
  deadline?: string;
  domain?: string;
  progress?: number;
  techStack?: string[];
  githubUrl?: string;
  currentUserRole?: string;
  members: Member[];
  taskSummary?: {
    total: number;
    todo: number;
    review: number;
    completed: number;
    ["in-progress"]: number;
  };
  tasks: Task[];
}

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { authReady, user } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [inviteQuery, setInviteQuery] = useState("");
  const [userResults, setUserResults] = useState<SearchUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState("");

  const fetchProject = useCallback(async () => {
    const response = await api.get(`/projects/${projectId}`);
    setProject(response.data);
    setTasks(response.data.tasks || []);
  }, [projectId]);

  const fetchTasks = useCallback(async () => {
    const response = await api.get(`/tasks/project/${projectId}`);
    setTasks(response.data);
  }, [projectId]);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        await fetchProject();
        setError("");
      } catch (error: unknown) {
        setError(
          axios.isAxiosError(error)
            ? error.response?.data?.message || "Failed to load project."
            : "Failed to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authReady, fetchProject, projectId, router, user]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!inviteQuery.trim() || project?.currentUserRole !== "owner") {
        setUserResults([]);
        return;
      }

      try {
        const response = await api.get(`/users?search=${encodeURIComponent(inviteQuery)}`);
        const memberIds = new Set(project.members.map((member) => member.user._id));
        setUserResults(
          response.data.filter((candidate: SearchUser) => !memberIds.has(candidate._id))
        );
      } catch {
        setUserResults([]);
      }
    };

    const timeout = setTimeout(searchUsers, 250);
    return () => clearTimeout(timeout);
  }, [inviteQuery, project]);

  const generateTasksWithAI = async () => {
    if (!project?.description) return;

    try {
      setAiLoading(true);
      await api.post("/ai/generate-tasks", {
        description: project.description,
        projectId,
      });
      await Promise.all([fetchProject(), fetchTasks()]);
    } catch (error: unknown) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "AI task generation failed."
          : "AI task generation failed."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      setInviteFeedback("Please choose a teammate to invite.");
      return;
    }

    try {
      setInviteLoading(true);
      setInviteFeedback("");
      await api.post("/invitations", {
        projectId,
        receiverId: selectedUserId,
        role: inviteRole,
        message: inviteMessage,
      });

      setInviteFeedback("Invitation sent successfully.");
      setSelectedUserId("");
      setInviteQuery("");
      setInviteMessage("");
      setUserResults([]);
    } catch (error: unknown) {
      setInviteFeedback(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to send invitation."
          : "Failed to send invitation."
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const progress = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "completed").length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [tasks]);

  if (!authReady || loading) {
    return <div className="px-6 py-12 text-slate-500">Loading project workspace...</div>;
  }

  if (error && !project) {
    return (
      <main className="px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-emerald-700">
            Back to dashboard
          </Link>
          {project?.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              View GitHub
            </a>
          )}
        </div>

        {project && (
          <>
            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="glass-panel rounded-[2rem] p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {project.currentUserRole}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {project.domain}
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {project.status}
                  </span>
                </div>

                <h1 className="mt-5 text-4xl font-semibold text-slate-900">{project.title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                  {project.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {(project.techStack || []).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] bg-white/85 p-5">
                    <p className="text-sm text-slate-500">Tasks</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{tasks.length}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-white/85 p-5">
                    <p className="text-sm text-slate-500">Members</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {project.members.length}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-white/85 p-5">
                    <p className="text-sm text-slate-500">Completion</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{progress}%</p>
                  </div>
                </div>
              </div>

              <div className="section-card rounded-[2rem] p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">
                      AI Support
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                      Generate a starter task set
                    </h2>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Turn your project description into a first-pass delivery plan, then refine it with your team.
                </p>

                <button
                  onClick={generateTasksWithAI}
                  disabled={aiLoading}
                  className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {aiLoading ? "Generating tasks..." : "Generate tasks with AI"}
                </button>

                <div className="mt-8">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                    <span>Project progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-emerald-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-8 text-sm text-slate-500">
                  Deadline:{" "}
                  <span className="font-semibold text-slate-700">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString()
                      : "Not set"}
                  </span>
                </div>
              </div>
            </section>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <CreateTaskForm
                projectId={projectId}
                onTaskCreated={async () => {
                  await Promise.all([fetchProject(), fetchTasks()]);
                }}
              />

              <ProjectSettingsPanel
                projectId={projectId}
                currentUserRole={project.currentUserRole}
                initialStatus={project.status}
                initialDeadline={project.deadline}
                initialProgress={project.progress}
                onProjectUpdated={fetchProject}
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <div className="section-card rounded-[1.75rem] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Team Members
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Project access</h2>

                <div className="mt-5 space-y-3">
                  {project.members.map((member) => (
                    <div
                      key={member.user._id}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{member.user.name}</p>
                        <p className="text-sm text-slate-500">{member.user.email}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>

                {project.currentUserRole === "owner" && (
                  <form onSubmit={sendInvitation} className="mt-6 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Search teammate
                      </label>
                      <input
                        value={inviteQuery}
                        onChange={(e) => setInviteQuery(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        placeholder="Search by name, email, or college"
                      />
                    </div>

                    {userResults.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        {userResults.map((candidate) => (
                          <button
                            type="button"
                            key={candidate._id}
                            onClick={() => {
                              setSelectedUserId(candidate._id);
                              setInviteQuery(`${candidate.name} (${candidate.email})`);
                              setUserResults([]);
                            }}
                            className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
                          >
                            <span>
                              <span className="block font-semibold text-slate-900">
                                {candidate.name}
                              </span>
                              <span className="block text-sm text-slate-500">
                                {candidate.email}
                              </span>
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              {candidate.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Invite role</span>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        >
                          <option value="member">member</option>
                          <option value="viewer">viewer</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Invite note</span>
                        <input
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          placeholder="Join us for backend integration"
                        />
                      </label>
                    </div>

                    {inviteFeedback && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        {inviteFeedback}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                    >
                      {inviteLoading ? "Sending invitation..." : "Send invitation"}
                    </button>
                  </form>
                )}
              </div>
            </section>

            <TaskBoard
              tasks={tasks}
              refreshTasks={async () => {
                await Promise.all([fetchProject(), fetchTasks()]);
              }}
            />

            <ProjectChat projectId={projectId} />
          </>
        )}
      </div>
    </main>
  );
}
