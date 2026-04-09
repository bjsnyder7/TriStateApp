import type { Metadata } from "next";
import StatCard from "@/components/dashboard/StatCard";
import ChartPlaceholder from "@/components/dashboard/ChartPlaceholder";
import ActivityTable from "@/components/dashboard/ActivityTable";

export const metadata: Metadata = {
  title: "Dashboard | TriStateApp",
};

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

const STAT_CARDS = [
  {
    label: "Total Users",
    value: "24,521",
    trend: { direction: "up" as const, label: "+8.2% vs last month" },
  },
  {
    label: "Monthly Revenue",
    value: "$48,390",
    trend: { direction: "up" as const, label: "+14.1% vs last month" },
  },
  {
    label: "Active Sessions",
    value: "1,243",
    trend: { direction: "down" as const, label: "-3.4% vs yesterday" },
  },
  {
    label: "Conversion Rate",
    value: "3.68%",
    trend: { direction: "neutral" as const, label: "Same as last week" },
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            trend={card.trend}
            icon={TrendUpIcon}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartPlaceholder
          title="Revenue Over Time"
          height="h-72"
          className="lg:col-span-2"
        />
        <ChartPlaceholder
          title="Traffic Sources"
          height="h-72"
          className="lg:col-span-1"
        />
      </div>

      {/* Activity Table */}
      <ActivityTable />
    </div>
  );
}
