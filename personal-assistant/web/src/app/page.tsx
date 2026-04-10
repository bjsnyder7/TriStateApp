"use client";

import { useEffect, useState } from "react";
import { api, type Briefing, type Project } from "@/lib/api";
import ReactMarkdown from "react-markdown";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.projects.list("active").catch(() => []),
      api.briefings.latest().catch(() => null),
    ]).then(([p, b]) => {
      setProjects(p as Project[]);
      setBriefing(b as Briefing | null);
      setLoading(false);
    });
  }, []);

  const generateBriefing = async () => {
    setLoading(true);
    try {
      const b = await api.briefings.generate();
      setBriefing(b);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Good morning</h1>
        <button onClick={generateBriefing} className="btn-primary">
          Generate Briefing
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Projects</h2>
          {projects.length === 0 ? (
            <div className="card text-sm text-gray-500">No active projects. <a href="/projects" className="text-indigo-400 hover:underline">Create one</a>.</div>
          ) : (
            projects.map((p) => (
              <a key={p.id} href={`/projects/${p.id}`} className="card block hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm text-white truncate">{p.name}</div>
                  <span className={`badge-${p.priority} shrink-0`}>{p.priority}</span>
                </div>
                {p.deadline && (
                  <div className="text-xs text-gray-500 mt-1">Due {p.deadline}</div>
                )}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {p.tags.map((t) => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </a>
            ))
          )}
        </div>

        {/* Briefing */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Latest Briefing</h2>
          {briefing ? (
            <div className="card prose prose-invert prose-sm max-w-none">
              <div className="text-xs text-gray-500 mb-3">
                {new Date(briefing.created_at).toLocaleString()}
              </div>
              <ReactMarkdown>{briefing.content_md}</ReactMarkdown>
            </div>
          ) : (
            <div className="card text-sm text-gray-500">
              No briefing yet. Click &quot;Generate Briefing&quot; to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
