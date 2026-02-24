"use client";

import { useState } from "react";
import api from "../services/api";

interface Props {
  onProjectCreated: () => void;
}

export default function CreateProjectForm({ onProjectCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/projects", {
        title,
        description,
        deadline,
      });

      setTitle("");
      setDescription("");
      setDeadline("");
      onProjectCreated();
    } catch (error: any) {
  alert(
    error?.response?.data?.message ||
    "Error creating project"
  );
}
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <br />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <br />

      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <br />
      <br />

      <button type="submit">Create Project</button>
    </form>
  );
}