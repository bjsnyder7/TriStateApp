"use client";

import { useEffect, useState } from "react";
import { api, type Briefing } from "@/lib/api";
import ReactMarkdown from "react-markdown";

export default function BriefingsPage() {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [selected, setSelected] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.briefings.list().then(setBriefings).finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const b = await api.briefings.generate();
      setBriefings((prev) => [b, ...prev]);
      setSelected(b);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="w-72 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h1 className="font-semibold text-white">Briefings</h1>
          <button onClick={generate} disabled={generating} className="btn-primary text-xs py-1">
            {generating ? "..." : "+ Generate"}
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {briefings.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No briefings yet.</div>
          )}
          {briefings.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelected(b)}
              className={`w-full text-left p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${selected?.id === b.id ? "bg-gray-800" : ""}`}
            >
              <div className="text-sm font-medium text-white">
                {b.type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {new Date(b.created_at).toLocaleDateString()}
              </div>
              {!b.read_at && (
                <span className="inline-block mt-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded">New</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-xs text-gray-500 mb-4">
              {new Date(selected.created_at).toLocaleString()}
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{selected.content_md}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a briefing to read it
          </div>
        )}
      </div>
    </div>
  );
}
