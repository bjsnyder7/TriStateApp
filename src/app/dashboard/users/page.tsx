import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users | TriStateApp",
};

export default function UsersPage() {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-lg text-slate-400">Users — coming soon</p>
    </div>
  );
}
