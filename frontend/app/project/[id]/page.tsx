"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../services/api";
import CreateTaskForm from "../../../components/CreateTaskForm";
import TaskBoard from "../../../components/TaskBoard";
import ProjectChat from "../../../components/ProjectChat";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    const res = await api.get(`/projects/${id}`);
    setProject(res.data);
  };

  const fetchTasks = async () => {
    const res = await api.get(`/tasks/${id}`);
    setTasks(res.data);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProject(), fetchTasks()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const generateTasksWithAI = async () => {
    try {
      const res = await api.post("/ai/generate-tasks", {
        description: project.description,
      });

      alert(res.data.tasks);
    } catch {
      alert("AI task generation failed");
    }
  };

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {loading && <p>Loading project...</p>}

      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 text-indigo-600 font-medium"
      >
        ← Back to Dashboard
      </button>

      {project && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-gray-600 mt-2">{project.description}</p>

          <button
            onClick={generateTasksWithAI}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
          >
            Generate Tasks with AI
          </button>

          <div className="mt-6">
            <p className="font-medium">Progress: {progress}%</p>
            <div className="w-full bg-gray-200 h-3 rounded mt-2">
              <div
                className="bg-green-500 h-3 rounded"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <CreateTaskForm
        projectId={id as string}
        onTaskCreated={fetchTasks}
      />

      {tasks.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <p className="text-gray-500">No tasks created yet</p>
        </div>
      ) : (
        <TaskBoard tasks={tasks} refreshTasks={fetchTasks} />
      )}

      <ProjectChat projectId={id as string} />
    </div>
  );
}