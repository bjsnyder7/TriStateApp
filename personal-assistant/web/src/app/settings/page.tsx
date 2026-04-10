"use client";

export default function SettingsPage() {
  const integrations = [
    { name: "GitHub", key: "github", description: "Track repos, PRs, and issues", status: "Phase 2" },
    { name: "Google Calendar & Gmail", key: "google", description: "Calendar events and email summaries", status: "Phase 2" },
    { name: "Notion", key: "notion", description: "Read and write your notes", status: "Phase 2" },
    { name: "Tavily (Web Search)", key: "tavily", description: "Grounded research and news monitoring", status: "Phase 2" },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Integrations</h2>
        {integrations.map((i) => (
          <div key={i.key} className="card flex items-center justify-between">
            <div>
              <div className="font-medium text-white text-sm">{i.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{i.description}</div>
            </div>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{i.status}</span>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Research Topics</h2>
        <div className="card text-sm text-gray-500">
          Topic management coming in Phase 2. You&apos;ll be able to add Tech/AI, Business, Health, and custom topics.
        </div>
      </section>
    </div>
  );
}
