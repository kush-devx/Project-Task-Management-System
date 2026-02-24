"use client";

import { useState } from "react";
import api from "../services/api";

interface Props {
  projectId: string;
  onTaskCreated: () => void;
}

export default function CreateTaskForm({ projectId, onTaskCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const improveWithAI = async () => {
    if (!description.trim()) return;

    try {
      setLoadingAI(true);

      const res = await api.post("/ai/improve", {
        text: description,
      });

      setDescription(res.data.improvedText);
    } catch {
      alert("AI failed");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/tasks", {
        projectId,
        title,
        description,
      });

      setTitle("");
      setDescription("");
      onTaskCreated();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Error creating task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Create New Task</h3>

      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <textarea
        placeholder="Task description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <div className="flex gap-3 mb-4">
        <button
          type="button"
          onClick={improveWithAI}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          {loadingAI ? "Improving..." : "Improve with AI"}
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}