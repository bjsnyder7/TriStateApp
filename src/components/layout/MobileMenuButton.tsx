"use client";

import { useDashboard } from "@/app/dashboard/DashboardShell";

export default function MobileMenuButton() {
  const { setSidebarOpen } = useDashboard();

  return (
    <button
      type="button"
      className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
      onClick={() => setSidebarOpen(true)}
      aria-label="Open sidebar"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
