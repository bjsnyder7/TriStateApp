import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Assistant",
  description: "Your personal AI assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <div className="flex h-screen">
          {/* Sidebar */}
          <nav className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col p-4 gap-2 shrink-0">
            <div className="text-lg font-semibold text-white mb-4">Assistant</div>
            <a href="/" className="nav-link">Dashboard</a>
            <a href="/chat" className="nav-link">Chat</a>
            <a href="/projects" className="nav-link">Projects</a>
            <a href="/briefings" className="nav-link">Briefings</a>
            <a href="/settings" className="nav-link">Settings</a>
          </nav>
          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
