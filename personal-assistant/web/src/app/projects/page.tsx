"use client";

import { useEffect, useState } from "react";
import { api, type Project } from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    api.projects.list().then(setProjects).finally(() => setLoading(false));
  }, []);

  const createProject = async () => {
    if (!name.trim()) return;
    const p = await api.projects.create({ name, priority });
    setProjects((prev) => [p, ...prev]);
    setName("");
    setShowForm(false);
  };

  const statusColor: Record<string, string> = {
    active: "badge-active",
    paused: "badge-paused",
    completed: "badge-low",
    archived: "badge-low",
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + New Project
        </button>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <input
            className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createProject()}
          />
          <div className="flex gap-2">
            {["critical", "high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${priority === p ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={createProject} className="btn-primary text-sm">Create</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {projects.length === 0 && (
          <div className="card text-sm text-gray-500">No projects yet. Create your first one!</div>
        )}
        {projects.map((p) => (
          <a key={p.id} href={`/projects/${p.id}`} className="card block hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-white">{p.name}</span>
              <div className="flex gap-2 items-center shrink-0">
                <span className={statusColor[p.status] || "badge-low"}>{p.status}</span>
                <span className={`badge-${p.priority}`}>{p.priority}</span>
              </div>
            </div>
            {p.description && (
              <p className="text-sm text-gray-400 mt-1 truncate">{p.description}</p>
            )}
            {p.deadline && (
              <p className="text-xs text-gray-500 mt-1">Deadline: {p.deadline}</p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
