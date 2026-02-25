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

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-indigo-100 text-indigo-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-8 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          🚀 Project Dashboard
        </h1>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700">
            Your Workspace
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your academic collaboration projects efficiently.
          </p>
        </div>

        {/* Create Project */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
          <h3 className="text-lg font-semibold mb-4">
            ➕ Create New Project
          </h3>
          <CreateProjectForm onProjectCreated={fetchProjects} />
        </div>

        {/* Projects Section */}
        <div>
          <h2 className="text-xl font-semibold mb-6 text-gray-700">
            📂 Your Projects
          </h2>

          {loading && (
            <div className="text-gray-500 animate-pulse">
              Loading projects...
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="bg-white p-8 rounded-2xl shadow text-center">
              <p className="text-gray-500">
                No projects found.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Start by creating your first project above.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 hover:-translate-y-1"
                onClick={() => router.push(`/project/${project._id}`)}
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {project.title}
                </h3>

                <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                  {project.description}
                </p>

                <div className="mt-5 flex justify-between items-center">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusStyle(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>

                  {project.deadline && (
                    <span className="text-xs text-gray-400">
                      📅 {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}