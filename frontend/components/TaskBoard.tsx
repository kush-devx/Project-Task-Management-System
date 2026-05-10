"use client";

import { useState } from "react";
import axios from "axios";
import api from "../services/api";

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

interface Props {
  tasks: Task[];
  refreshTasks: () => void;
}

const columns = [
  { key: "todo", label: "To Do", accent: "bg-slate-500" },
  { key: "in-progress", label: "In Progress", accent: "bg-amber-500" },
  { key: "review", label: "Review", accent: "bg-sky-500" },
  { key: "completed", label: "Completed", accent: "bg-emerald-600" },
];

const priorityStyle: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function TaskBoard({ tasks, refreshTasks }: Props) {
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [actionTaskId, setActionTaskId] = useState<string | null>(null);

  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      setActionTaskId(taskId);
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      await refreshTasks();
    } catch (error: unknown) {
      alert(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to update task"
          : "Failed to update task"
      );
    } finally {
      setActionTaskId(null);
    }
  };

  const addComment = async (taskId: string) => {
    const text = commentDrafts[taskId]?.trim();
    if (!text) return;

    try {
      setActionTaskId(taskId);
      await api.post(`/tasks/${taskId}/comments`, { text });
      setCommentDrafts((prev) => ({ ...prev, [taskId]: "" }));
      await refreshTasks();
    } catch (error: unknown) {
      alert(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to add comment"
          : "Failed to add comment"
      );
    } finally {
      setActionTaskId(null);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setActionTaskId(taskId);
      await api.delete(`/tasks/${taskId}`);
      await refreshTasks();
    } catch (error: unknown) {
      alert(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to delete task"
          : "Failed to delete task"
      );
    } finally {
      setActionTaskId(null);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-4">
      {columns.map((column) => (
        <section key={column.key} className="section-card rounded-[1.75rem] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`status-dot ${column.accent}`} />
              <h3 className="text-lg font-semibold text-slate-900">{column.label}</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              {tasks.filter((task) => task.status === column.key).length}
            </span>
          </div>

          <div className="space-y-4">
            {tasks
              .filter((task) => task.status === column.key)
              .map((task) => (
                <article
                  key={task._id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">{task.title}</h4>
                      {task.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <button
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        priorityStyle[task.priority || "medium"]
                      }`}
                    >
                      {task.priority || "medium"}
                    </span>
                    {task.assignedTo?.name && (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {task.assignedTo.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Move task
                    </label>
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                      disabled={actionTaskId === task._id}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    >
                      {columns.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Discussion
                    </p>

                    <div className="mt-3 space-y-2">
                      {task.comments?.length ? (
                        task.comments.slice(-2).map((comment, index) => (
                          <div key={comment._id || index} className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs font-semibold text-slate-500">
                              {comment.user?.name || "Team member"}
                            </p>
                            <p className="mt-1 text-sm text-slate-700">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No comments yet.</p>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <input
                        value={commentDrafts[task._id] || ""}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({
                            ...prev,
                            [task._id]: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        placeholder="Add a comment"
                      />
                      <button
                        onClick={() => addComment(task._id)}
                        disabled={actionTaskId === task._id}
                        className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </article>
              ))}

            {tasks.every((task) => task.status !== column.key) && (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No tasks in {column.label.toLowerCase()}.
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
