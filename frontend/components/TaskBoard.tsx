"use client";

import api from "../services/api";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
}

interface Props {
  tasks: Task[];
  refreshTasks: () => void;
}

export default function TaskBoard({ tasks, refreshTasks }: Props) {

  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}/status`, {
        status: newStatus,
      });
      refreshTasks();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to update task");
    }
  };

  const statusColors: any = {
    todo: "border-gray-400",
    "in-progress": "border-yellow-500",
    completed: "border-green-500"
  };

  const renderColumn = (status: string, title: string) => {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <div
              key={task._id}
              className={`border-l-4 ${statusColors[task.status]} bg-gray-50 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition`}
            >
              <h4 className="font-semibold">{task.title}</h4>

              {task.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {task.description}
                </p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                  onClick={() => updateStatus(task._id, "todo")}
                >
                  Todo
                </button>

                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
                  onClick={() => updateStatus(task._id, "in-progress")}
                >
                  In Progress
                </button>

                <button
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                  onClick={() => updateStatus(task._id, "completed")}
                >
                  Completed
                </button>
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {renderColumn("todo", "Todo")}
      {renderColumn("in-progress", "In Progress")}
      {renderColumn("completed", "Completed")}
    </div>
  );
}