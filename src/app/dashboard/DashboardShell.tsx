"use client";

import { createContext, useContext, useState } from "react";

type DashboardContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const DashboardContext = createContext<DashboardContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className="flex h-screen overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {children}
      </div>
    </DashboardContext.Provider>
  );
}
