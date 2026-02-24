"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import CreateProjectForm from "../../components/CreateProjectForm";

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  deadline?: string;
}

export default function DashboardPage() {
  const { userToken } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userToken) {
      router.push("/login");
    } else {
      fetchProjects();
    }
  }, [userToken]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <CreateProjectForm onProjectCreated={fetchProjects} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>

        {loading && <p>Loading projects...</p>}

        {projects.length === 0 && !loading && (
          <p className="text-gray-500">No projects found</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg cursor-pointer transition"
              onClick={() => router.push(`/project/${project._id}`)}
            >
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <p className="text-sm text-gray-600 mt-2">
                {project.description}
              </p>

              <div className="mt-4">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}